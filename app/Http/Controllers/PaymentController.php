<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
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
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'total_payment' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $items = collect($validated['items']);
            $subtotal = 0;

            $order = Order::create([
                'staff_id' => $request->user()->id,
                'customer_id' => $validated['customer_id'] ?? null,
                'subtotal' => 0,
                'discount' => $validated['discount'],
                'total' => 0,
                'total_payment' => $validated['total_payment'],
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

                $product->decrement('product_stock', $item['quantity']);
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
        });

        return redirect()->route('orders.index')->with('success', 'Order created successfully.');
    }
}
