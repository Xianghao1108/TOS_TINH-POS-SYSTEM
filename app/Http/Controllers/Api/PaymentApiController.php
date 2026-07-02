<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\Invoice;
use App\Services\KhqrService;
use App\Services\Notification\INotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentApiController extends Controller
{
    protected KhqrService $khqrService;
    protected INotificationService $notificationService;

    public function __construct(KhqrService $khqrService, INotificationService $notificationService)
    {
        $this->khqrService = $khqrService;
        $this->notificationService = $notificationService;
    }

    /**
     * Create checkout order and generate KHQR code.
     */
    public function createPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'currency' => ['required', 'string', 'in:USD,KHR'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $currency = $validated['currency'];
        $items = $validated['items'];

        try {
            $response = DB::transaction(function () use ($currency, $items, $validated, $request) {
                $subtotalUsd = 0;
                $orderItemsData = [];

                // 1. Process items and calculate USD subtotal
                foreach ($items as $itemInput) {
                    $product = Product::query()
                        ->whereKey($itemInput['id'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ((int) $product->product_status !== 1) {
                        throw new \Exception("Product {$product->product_title} is not available for sale.");
                    }

                    if ((int) $product->product_stock < (int) $itemInput['quantity']) {
                        throw new \Exception("Insufficient stock for {$product->product_title}. Available: {$product->product_stock}.");
                    }

                    $lineTotal = (float) $product->product_price * (int) $itemInput['quantity'];
                    $subtotalUsd += $lineTotal;

                    // Save data for order items creation
                    $orderItemsData[] = [
                        'product_id' => $product->id,
                        'product_code' => $product->product_code,
                        'product_title' => $product->product_title,
                        'product_price' => $product->product_price,
                        'quantity' => $itemInput['quantity'],
                        'product' => $product // reference to decrement later
                    ];
                }

                // 2. Perform currency conversion if KHR
                // Exchange rate: 1 USD = 4100 KHR
                $exchangeRate = 4100;
                if ($currency === 'KHR') {
                    $totalAmount = round($subtotalUsd * $exchangeRate);
                } else {
                    $totalAmount = $subtotalUsd;
                }

                // 3. Determine Staff ID (fall back to first user if API call is unauthenticated)
                $staffId = auth()->user()?->id ?? User::first()?->id ?? 1;

                // 4. Generate unique order number: ORD-YYYYMMDD-XXXXXX
                $dateStr = date('Ymd');
                $randomStr = str_pad((string) mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $orderNumber = "ORD-{$dateStr}-{$randomStr}";

                // 5. Create Order record
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $validated['customer_id'] ?? null,
                    'staff_id' => $staffId,
                    'subtotal' => $totalAmount,
                    'discount' => 0.00,
                    'total' => $totalAmount,
                    'total_amount' => $totalAmount,
                    'currency' => $currency,
                    'status' => 'pending',
                    'total_payment' => 0.00,
                ]);

                // 6. Create Order Items & Decrement Stock
                foreach ($orderItemsData as $itemData) {
                    $order->items()->create([
                        'product_id' => $itemData['product_id'],
                        'product_code' => $itemData['product_code'],
                        'product_title' => $itemData['product_title'],
                        'product_price' => $itemData['product_price'],
                        'quantity' => $itemData['quantity'],
                    ]);

                    $itemData['product']->decrement('product_stock', $itemData['quantity']);
                }

                // 7. Generate KHQR payload
                $bakongAccountId = config('services.bakong.account_id')
                    ?: config('services.bakong.merchant_id')
                    ?: ($currency === 'KHR' ? 'tos_tinh_store@khr' : 'tos_tinh_store@usd');
                $merchantName = config('services.bakong.merchant_name', 'TOS TINH Store');
                $merchantCity = config('services.bakong.merchant_city', 'Phnom Penh');
                $expirySeconds = 600; // 10 minutes

                $khqrData = $this->khqrService->generate(
                    $bakongAccountId,
                    $merchantName,
                    $merchantCity,
                    $orderNumber,
                    (float) $totalAmount,
                    $currency,
                    $expirySeconds
                );

                // 8. Create Payment Record
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'amount' => $totalAmount,
                    'currency' => $currency,
                    'khqr_md5' => $khqrData['md5_hash'],
                    'payment_status' => 'pending',
                ]);

                return [
                    'payment_id' => $payment->id,
                    'order_number' => $orderNumber,
                    'amount' => $totalAmount,
                    'currency' => $currency,
                    'qr_image' => $khqrData['qr_image_url'],
                    'qr_string' => $khqrData['qr_string'],
                    'md5' => $khqrData['md5_hash'],
                    'expiry_ms' => $khqrData['expiry_ms'],
                ];
            });

            return response()->json($response, 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to initiate payment.',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get payment status.
     */
    public function getPaymentStatus(int $paymentId): JsonResponse
    {
        $payment = Payment::with(['order', 'order.items'])->find($paymentId);

        if (!$payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        // If pending, first check with Bakong API to see if it is paid
        if ($payment->payment_status === 'pending') {
            $apiResult = $this->khqrService->checkTransaction($payment->khqr_md5);

            if ($apiResult && isset($apiResult['error'])) {
                return response()->json([
                    'payment_status' => $payment->payment_status,
                    'order_status' => $payment->order->status,
                    'verification_status' => $apiResult['error'],
                    'verification_message' => $apiResult['message'] ?? 'Bakong verification is currently unavailable.',
                ]);
            }

            if ($apiResult && isset($apiResult['responseCode']) && (int)$apiResult['responseCode'] === 0) {
                // Payment was completed successfully!
                $txData = $apiResult['data'] ?? [];
                $transactionId = $txData['hash'] ?? 'TXN-' . strtoupper(uniqid());
                $paidAt = isset($txData['createdDateMs']) ? date('Y-m-d H:i:s', $txData['createdDateMs'] / 1000) : now();

                DB::transaction(function () use ($payment, $transactionId, $paidAt) {
                    $payment->update([
                        'payment_status' => 'paid',
                        'transaction_id' => $transactionId,
                        'paid_at' => $paidAt,
                    ]);

                    $order = $payment->order;
                    $order->update([
                        'status' => 'paid',
                        'total_payment' => $payment->amount
                    ]);

                    // Automatically generate a paid Invoice for this completed sale
                    $invoice = Invoice::create([
                        'customer_id' => $order->customer_id,
                        'staff_id' => $order->staff_id,
                        'total' => $order->total,
                        'status' => 1, // 1 = Paid
                        'payment_method' => 'qr',
                    ]);

                    $invoice->orders()->attach($order->id, [
                        'total' => $order->total,
                    ]);
                });

                $payment->refresh();

                // Dispatch Telegram notification asynchronously after response is sent
                $cacheKey = 'telegram_sent_' . $payment->id;
                if (\Illuminate\Support\Facades\Cache::add($cacheKey, true, 1800)) {
                    \App\Jobs\SendTelegramNotificationJob::dispatch($payment)->afterResponse();
                }
            } else {
                // Otherwise, check if expired
                if ($payment->created_at->addMinutes(10)->isPast()) {
                    DB::transaction(function () use ($payment) {
                        $payment->update(['payment_status' => 'failed']);
                        $payment->order->update(['status' => 'expired']);
                        
                        // Revert inventory stock
                        foreach ($payment->order->items as $item) {
                            $product = Product::find($item->product_id);
                            if ($product) {
                                $product->increment('product_stock', $item->quantity);
                            }
                        }
                    });

                    $payment->refresh();
                }
            }
        }

        return response()->json([
            'payment_status' => $payment->payment_status,
            'order_status' => $payment->order->status,
        ]);
    }

    /**
     * Payment webhook handler (supports real Bakong callbacks and debug simulation).
     */
    public function simulateWebhook(Request $request): JsonResponse
    {
        $invoiceNumber = $request->input('invoice_number');
        $status = $request->input('status') ?? 'paid';

        if (!empty($invoiceNumber)) {
            // --- 1. Real Bakong Webhook Callback Path ---
            $validated = $request->validate([
                'invoice_number' => ['required', 'string'],
                'amount' => ['required', 'numeric'],
                'currency' => ['required', 'string', 'in:USD,KHR'],
                'status' => ['required', 'string', 'in:paid,failed'],
                'md5' => ['required', 'string'],
                'transaction_id' => ['nullable', 'string'],
                'paid_at' => ['nullable', 'string'],
            ]);

            $amount = $validated['amount'];
            $currency = $validated['currency'];
            $receivedMd5 = $validated['md5'];

            // Verify webhook MD5 signature to ensure authenticity
            $secretKey = config('services.bakong.secret', 'bakong_secret_passphrase_123');
            $amountFormatted = number_format((float) $amount, 2, '.', '');
            $expectedMd5 = md5($invoiceNumber . $amountFormatted . $currency . $status . $secretKey);

            if ($receivedMd5 !== $expectedMd5) {
                Log::warning("Bakong webhook signature mismatch. Invoice: {$invoiceNumber}");
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid signature verification failed'
                ], 400);
            }

            // Find the order matching this invoice_number (in our system, order_number is stored as tag 62.01)
            $order = Order::where('order_number', $invoiceNumber)->first();
            if (!$order) {
                return response()->json(['message' => 'Order not found for specified invoice number.'], 404);
            }

            // Get associated payment
            $payment = Payment::where('order_id', $order->id)->where('payment_status', 'pending')->first();
            if (!$payment) {
                return response()->json(['message' => 'Pending payment not found for this order.'], 404);
            }
        } else {
            // --- 2. Debug Simulation Path ---
            $validated = $request->validate([
                'md5' => ['required', 'string'],
                'status' => ['nullable', 'string', 'in:paid,failed'],
                'transaction_id' => ['nullable', 'string'],
                'paid_at' => ['nullable', 'string'],
            ]);

            $md5 = $validated['md5'];
            $payment = Payment::where('khqr_md5', $md5)->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found with specified MD5 hash.'], 404);
            }

            if ($payment->payment_status !== 'pending') {
                return response()->json([
                    'message' => "Payment is already marked as {$payment->payment_status}.",
                    'payment_status' => $payment->payment_status
                ]);
            }
        }

        try {
            DB::transaction(function () use ($payment, $validated, $status) {
                if ($status === 'paid') {
                    $transactionId = $validated['transaction_id'] ?? 'TXN-' . strtoupper(uniqid());
                    $paidAt = $validated['paid_at'] ?? now();

                    // Update payment
                    $payment->update([
                        'payment_status' => 'paid',
                        'transaction_id' => $transactionId,
                        'paid_at' => $paidAt,
                    ]);

                    // Update order
                    $order = $payment->order;
                    $order->update([
                        'status' => 'paid',
                        'total_payment' => $payment->amount
                    ]);

                    // Automatically generate a paid Invoice for this completed sale
                    $invoice = Invoice::create([
                        'customer_id' => $order->customer_id,
                        'staff_id' => $order->staff_id,
                        'total' => $order->total,
                        'status' => 1, // 1 = Paid
                        'payment_method' => 'qr',
                    ]);

                    $invoice->orders()->attach($order->id, [
                        'total' => $order->total,
                    ]);
                } else {
                    // Update payment to failed
                    $payment->update([
                        'payment_status' => 'failed',
                    ]);

                    // Update order to expired
                    $order = $payment->order;
                    $order->update([
                        'status' => 'expired',
                    ]);

                    // Revert inventory stock
                    foreach ($order->items as $item) {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->increment('product_stock', $item->quantity);
                        }
                    }
                }
            });

            if ($status === 'paid') {
                $payment->refresh();

                // Dispatch Telegram notification asynchronously after response is sent
                $cacheKey = 'telegram_sent_' . $payment->id;
                if (\Illuminate\Support\Facades\Cache::add($cacheKey, true, 1800)) {
                    \App\Jobs\SendTelegramNotificationJob::dispatch($payment)->afterResponse();
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment successfully updated.',
                'payment_status' => $status
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process webhook.',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Production Bakong Webhook Callback Handler.
     */
    public function bakongWebhook(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_number' => ['required', 'string'],
            'amount' => ['required', 'numeric'],
            'currency' => ['required', 'string', 'in:USD,KHR'],
            'status' => ['required', 'string', 'in:paid,failed'],
            'md5' => ['required', 'string'],
            'transaction_id' => ['nullable', 'string'],
            'paid_at' => ['nullable', 'string'],
        ]);

        $invoiceNumber = $validated['invoice_number'];
        $amount = $validated['amount'];
        $currency = $validated['currency'];
        $status = $validated['status'];
        $receivedMd5 = $validated['md5'];

        // Verify webhook MD5 signature to ensure authenticity
        $secretKey = config('services.bakong.secret', 'bakong_secret_passphrase_123');
        $amountFormatted = number_format((float) $amount, 2, '.', '');
        $expectedMd5 = md5($invoiceNumber . $amountFormatted . $currency . $status . $secretKey);

        if ($receivedMd5 !== $expectedMd5) {
            Log::warning("Bakong production webhook signature mismatch. Invoice: {$invoiceNumber}");
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature verification failed'
            ], 400);
        }

        // Find the order matching this invoice_number (stored as tag 62.01)
        $order = Order::where('order_number', $invoiceNumber)->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found for specified invoice number.'], 404);
        }

        // Get associated payment
        $payment = Payment::where('order_id', $order->id)->where('payment_status', 'pending')->first();
        if (!$payment) {
            return response()->json(['message' => 'Pending payment not found for this order.'], 404);
        }

        try {
            DB::transaction(function () use ($payment, $validated, $status) {
                if ($status === 'paid') {
                    $transactionId = $validated['transaction_id'] ?? 'TXN-' . strtoupper(uniqid());
                    $paidAt = $validated['paid_at'] ?? now();

                    // Update payment status in database
                    $payment->update([
                        'payment_status' => 'paid',
                        'transaction_id' => $transactionId,
                        'paid_at' => $paidAt,
                    ]);

                    // Update order status
                    $order = $payment->order;
                    $order->update([
                        'status' => 'paid',
                        'total_payment' => $payment->amount
                    ]);

                    // Automatically generate a paid Invoice for this completed sale
                    $invoice = Invoice::create([
                        'customer_id' => $order->customer_id,
                        'staff_id' => $order->staff_id,
                        'total' => $order->total,
                        'status' => 1, // 1 = Paid
                        'payment_method' => 'qr',
                    ]);

                    $invoice->orders()->attach($order->id, [
                        'total' => $order->total,
                    ]);
                } else {
                    // Update payment to failed
                    $payment->update(['payment_status' => 'failed']);

                    // Update order to expired
                    $order = $payment->order;
                    $order->update(['status' => 'expired']);

                    // Revert inventory stock
                    foreach ($order->items as $item) {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->increment('product_stock', $item->quantity);
                        }
                    }
                }
            });

            if ($status === 'paid') {
                $payment->refresh();

                // Dispatch Telegram notification asynchronously
                $cacheKey = 'telegram_sent_' . $payment->id;
                if (\Illuminate\Support\Facades\Cache::add($cacheKey, true, 1800)) {
                    \App\Jobs\SendTelegramNotificationJob::dispatch($payment)->afterResponse();
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Bakong production webhook processed successfully.',
                'payment_status' => $status
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process production webhook.',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
