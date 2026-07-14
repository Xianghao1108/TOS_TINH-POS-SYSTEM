<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Product;
use App\Services\Notification\TelegramStockAlertService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private readonly TelegramStockAlertService $telegramStockAlertService
    ) {}

    /**
     * Display the POS checkout terminal.
     */
    public function index(): Response
    {
        $products = Product::query()
            ->with(['category:id,name', 'images'])
            ->where('product_status', 1)
            ->where('product_stock', '>', 0)
            ->orderBy('product_title')
            ->get(['id', 'product_code', 'product_title', 'product_price', 'product_stock', 'category_id']);

        $customers = Customer::orderBy('username')->get(['id', 'username', 'phone']);

        return Inertia::render('Payments/Index', [
            'products' => $products,
            'customers' => $customers,
        ]);
    }

    /**
     * Store a finalized POS checkout transaction.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'payment_method' => ['required', 'in:cash'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'total_payment' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $lowStockProductIds = [];

        DB::transaction(function () use ($validated, $request, &$lowStockProductIds) {
            $items = collect($validated['items']);
            $subtotal = 0;

            $order = Order::create([
                'staff_id' => $request->user()->id,
                'customer_id' => $validated['customer_id'] ?? null,
                'subtotal' => 0,
                'discount' => $validated['discount'],
                'total' => 0,
                'total_payment' => $validated['total_payment'],
                'payment_method' => $validated['payment_method'],
            ]);

            foreach ($items as $item) {
                $product = Product::query()
                    ->whereKey($item['product_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ((int) $product->product_status !== 1) {
                    throw ValidationException::withMessages([
                        'items' => "{$product->product_title} is not available for sale.",
                    ]);
                }

                if ((int) $product->product_stock < (int) $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for {$product->product_title}. Available: {$product->product_stock}.",
                    ]);
                }

                $lineTotal = (float) $product->product_price * (int) $item['quantity'];
                $subtotal += $lineTotal;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_code' => $product->product_code,
                    'product_title' => $product->product_title,
                    'product_price' => $product->product_price,
                    'quantity' => $item['quantity'],
                ]);

                $remainingStock = (int) $product->product_stock - (int) $item['quantity'];
                $product->decrement('product_stock', $item['quantity']);

                if ($remainingStock <= 5) {
                    $lowStockProductIds[$product->id] = true;
                }
            }

            $discount = min((float) $validated['discount'], $subtotal);
            $total = max($subtotal - $discount, 0);

            if ((float) $validated['total_payment'] < $total) {
                throw ValidationException::withMessages([
                    'total_payment' => 'Received payment must be greater than or equal to the grand total.',
                ]);
            }

            $order->update([
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
            ]);

            // Automatically generate a paid Invoice for this completed sale
            $invoice = Invoice::create([
                'customer_id' => $validated['customer_id'] ?? null,
                'staff_id' => $request->user()->id,
                'total' => $total,
                'status' => 1, // 1 = Paid
                'payment_method' => $validated['payment_method'],
            ]);

            $invoice->orders()->attach($order->id, [
                'total' => $total,
            ]);
        });

        foreach (array_keys($lowStockProductIds) as $productId) {
            $product = Product::find($productId);

            if ($product) {
                $this->telegramStockAlertService->sendLowStockAlert($product);
            }
        }

        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }
}
