<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\PosInvoice;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['customer', 'staff', 'orders']);

        // Search tracking logic (by Invoice ID)
        if ($request->has('search') && $request->search != '') {
            $query->where('id', 'like', '%'.$request->search.'%');
        }

        $invoices = $query->latest()->paginate(15)->withQueryString();
        $customers = Customer::orderBy('username')->get();

        // Fetch any orders that do not belong to an invoice yet
        $pendingOrders = Order::with(['customer', 'staff'])
            ->whereDoesntHave('invoices')
            ->latest()
            ->get();

        $users = User::orderBy('name')->get();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'customers' => $customers,
            'pendingOrders' => $pendingOrders,
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'payment_method' => ['required', 'in:cash,qr,khqr,aba_qr,card'],
            'order_ids' => ['required', 'array', 'min:1'],
            'order_ids.*' => ['exists:orders,id'],
        ]);

        // Derive staff_id directly from the authenticated session
        $staffId = $request->user()->id;

        // Force secure initial payment state status (2 = Unpaid/Pending)
        $status = 2;

        $calculatedTotal = 0;

        DB::transaction(function () use ($validated, $staffId, $status, &$calculatedTotal) {
            // Loop through order_ids to verify product unit prices in the database and calculate total
            foreach ($validated['order_ids'] as $orderId) {
                $order = Order::with('items.product')->findOrFail($orderId);
                $orderTotal = 0;
                foreach ($order->items as $item) {
                    // Query the verified database unit price of the product
                    $product = $item->product ?: Product::find($item->product_id);
                    $dbPrice = $product ? $product->product_price : $item->product_price;
                    $orderTotal += $dbPrice * $item->quantity;
                }
                $calculatedTotal += $orderTotal;
            }

            $invoice = Invoice::create([
                'customer_id' => $validated['customer_id'],
                'staff_id' => $staffId,
                'total' => $calculatedTotal,
                'status' => $status,
                'payment_method' => $validated['payment_method'],
            ]);

            foreach ($validated['order_ids'] as $orderId) {
                $order = Order::findOrFail($orderId);
                $invoice->orders()->attach($order->id, [
                    'total' => $order->total,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Invoice created successfully.');
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'customer_id' => ['sometimes', 'nullable', 'exists:customers,id'],
            'status' => ['required', 'in:1,2'],
            'payment_method' => ['sometimes', 'required', 'in:cash,qr,khqr,aba_qr,card'],
            'order_ids' => ['sometimes', 'required', 'array'],
            'order_ids.*' => ['exists:orders,id'],
        ]);

        DB::transaction(function () use ($invoice, $validated) {
            $updateData = ['status' => $validated['status']];

            if (isset($validated['customer_id'])) {
                $updateData['customer_id'] = $validated['customer_id'];
            }
            if (isset($validated['payment_method'])) {
                $updateData['payment_method'] = $validated['payment_method'];
            }

            if (isset($validated['order_ids'])) {
                $syncData = [];
                $calculatedTotal = 0;
                foreach ($validated['order_ids'] as $orderId) {
                    $order = Order::with('items.product')->findOrFail($orderId);

                    // Sum up database-backed prices for the synced orders
                    $orderTotal = 0;
                    foreach ($order->items as $item) {
                        $product = $item->product ?: Product::find($item->product_id);
                        $dbPrice = $product ? $product->product_price : $item->product_price;
                        $orderTotal += $dbPrice * $item->quantity;
                    }

                    $syncData[$order->id] = ['total' => $order->total];
                    $calculatedTotal += $orderTotal;
                }
                $updateData['total'] = $calculatedTotal;

                $invoice->update($updateData);
                $invoice->orders()->sync($syncData);
            } else {
                $invoice->update($updateData);
            }
        });

        return redirect()->back()->with('success', 'Invoice updated successfully.');
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return redirect()->back()->with('success', 'Invoice deleted successfully.');
    }

    /**
     * Complete POS checkout and generate secure server-calculated invoice.
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'in:cash,aba_qr'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated, $request) {
                $staffId = $request->user()->id;
                $totalAmount = 0;
                $invoiceItems = [];

                // 1. Process items, verify stock, and calculate server-side totals
                foreach ($validated['items'] as $itemData) {
                    // Query product with a lock to prevent concurrent stock-outs
                    $product = Product::lockForUpdate()->findOrFail($itemData['product_id']);

                    if ($product->product_stock < $itemData['quantity']) {
                        throw new \Exception("Insufficient stock for product: {$product->product_title}. Available: {$product->product_stock}. Requested: {$itemData['quantity']}");
                    }

                    // Decrement product inventory count
                    $product->decrement('product_stock', $itemData['quantity']);

                    $itemTotal = $product->product_price * $itemData['quantity'];
                    $totalAmount += $itemTotal;

                    $invoiceItems[] = [
                        'product_id' => $product->id,
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $product->product_price, // snapshot price
                    ];
                }

                // 2. Auto-generate sequential invoice number
                $invoiceNumber = PosInvoice::generateInvoiceNumber();

                // 3. Create invoice header record
                $invoice = PosInvoice::create([
                    'invoice_number' => $invoiceNumber,
                    'staff_id' => $staffId,
                    'total_amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'status' => 'paid', // Initial payment state (paid since it was checkout completed)
                ]);

                // 4. Create invoice line items snap-shot
                foreach ($invoiceItems as $item) {
                    $invoice->items()->create($item);
                }

                return $invoice;
            });

            return response()->json([
                'success' => true,
                'message' => 'Checkout completed successfully.',
                'invoice' => $invoice->load('items.product'),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get details of the specified invoice for AJAX preview.
     */
    public function details(Invoice $invoice)
    {
        $invoice->load(['customer', 'staff', 'orders.items.product']);

        $settings = [
            'store_name' => Setting::get('store_name', 'Tos Tinh Mart'),
            'store_address' => Setting::get('store_address', 'Phnom Penh, Cambodia'),
            'store_phone' => Setting::get('store_phone', '+855 12 345 678'),
            'store_email' => Setting::get('store_email', 'contact@tostinh.com'),
            'currency_symbol' => Setting::get('currency_symbol', '$'),
            'tax_rate' => floatval(Setting::get('tax_rate', '10.00')),
        ];

        return response()->json([
            'invoice' => $invoice,
            'settings' => $settings,
        ]);
    }

    /**
     * Download the specified invoice as PDF.
     */
    public function downloadPdf(Invoice $invoice)
    {
        $invoice->load(['customer', 'staff', 'orders.items.product']);

        $currency = Setting::get('currency_symbol', '$');
        $taxRate = floatval(Setting::get('tax_rate', '10.00'));

        $subtotal = 0;
        $discount = 0;
        $items = collect();

        foreach ($invoice->orders as $order) {
            $subtotal += floatval($order->subtotal);
            $discount += floatval($order->discount);

            foreach ($order->items as $item) {
                $items->push([
                    'product_title' => $item->product_title,
                    'product_code' => $item->product_code,
                    'quantity' => intval($item->quantity),
                    'product_price' => floatval($item->product_price),
                    'subtotal' => floatval($item->quantity * $item->product_price),
                ]);
            }
        }

        // Consolidated items by product code or title to display a clean line listing
        $consolidatedItems = $items->groupBy(function ($item) {
            return $item['product_code'] ?: $item['product_title'];
        })->map(function ($group) {
            return [
                'product_title' => $group->first()['product_title'],
                'product_code' => $group->first()['product_code'],
                'quantity' => $group->sum('quantity'),
                'product_price' => $group->first()['product_price'],
                'subtotal' => $group->sum('subtotal'),
            ];
        })->values();

        $grandTotal = floatval($invoice->total);

        // Calculate tax as inclusive VAT matching base amount
        if ($taxRate > 0) {
            $taxAmount = $grandTotal * ($taxRate / (100 + $taxRate));
            $netAmount = $grandTotal - $taxAmount;
        } else {
            $taxAmount = 0;
            $netAmount = $grandTotal;
        }

        // Format Payment Method nicely
        $paymentLabel = 'Unknown';
        $cleanMethod = strtolower(trim($invoice->payment_method ?? ''));
        switch ($cleanMethod) {
            case 'cash':
                $paymentLabel = 'Cash';
                break;
            case 'qr':
                $paymentLabel = 'QR';
                break;
            case 'khqr':
                $paymentLabel = 'KHQR';
                break;
            case 'aba_qr':
            case 'aba':
                $paymentLabel = 'ABA QR';
                break;
            case 'card':
                $paymentLabel = 'Card';
                break;
            default:
                if (! empty($cleanMethod)) {
                    $paymentLabel = ucwords(str_replace('_', ' ', $cleanMethod));
                }
                break;
        }

        $logoExists = file_exists(public_path('images/TOS TINH NOBG.png')) && extension_loaded('gd');

        $pdf = Pdf::loadView('invoices.pdf', compact(
            'invoice',
            'consolidatedItems',
            'subtotal',
            'discount',
            'taxRate',
            'taxAmount',
            'netAmount',
            'grandTotal',
            'paymentLabel',
            'currency',
            'logoExists'
        ));

        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('invoice-'.sprintf('%05d', $invoice->id).'.pdf');
    }
}
