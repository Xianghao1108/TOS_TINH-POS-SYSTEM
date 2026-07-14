<?php

namespace App\Services\Notification;

use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramNotificationService implements INotificationService
{
    /**
     * Send payment success notification.
     */
    public function sendPaymentSuccessNotification(Payment $payment): bool
    {
        // 1. Get configurations: check Setting table first, fall back to services config
        $botToken = Setting::get('telegram_bot_token', config('services.telegram.bot_token'));
        $chatId = Setting::get('telegram_chat_id', config('services.telegram.chat_id'));

        if (empty($botToken) || empty($chatId)) {
            Log::warning('Telegram notification skipped: Telegram Bot Token or Chat ID is not configured.');

            return false;
        }

        $order = $payment->order;
        if (! $order) {
            Log::error('Telegram notification failed: Payment record has no associated order.');

            return false;
        }

        // Retrieve the first invoice related to this order
        $invoice = $order->invoices()->first();
        $invoiceNumber = $invoice
            ? '#INV-'.str_pad((string) $invoice->id, 5, '0', STR_PAD_LEFT)
            : 'N/A';

        $orderNumber = $order->order_number ?? 'N/A';

        // Format amount: prefix '$' for USD, suffix ' KHR' for KHR
        $paymentAmount = ($payment->currency === 'KHR')
            ? number_format($payment->amount, 0).' KHR'
            : '$'.number_format($payment->amount, 2);

        $paymentMethod = 'Bakong KHQR';
        $transactionId = $payment->transaction_id ?? 'N/A';
        $paymentTime = $payment->paid_at ?? now()->toDateTimeString();

        // 2. Compose markdown message
        $message = "🔔 *Payment Received!*\n\n"
            ."• *Order Number*: `{$orderNumber}`\n"
            ."• *Invoice Number*: `{$invoiceNumber}`\n"
            ."• *Payment Amount*: `{$paymentAmount}`\n"
            ."• *Payment Method*: `{$paymentMethod}`\n"
            ."• *Transaction ID*: `{$transactionId}`\n"
            ."• *Payment Time*: `{$paymentTime}`\n"
            .'• *Status*: `Successful`';

        // 3. Send HTTP request to Telegram Bot API
        try {
            $response = Http::timeout(5)->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
            ]);

            if ($response->successful()) {
                Log::info("Telegram notification sent successfully for Order {$orderNumber}");

                return true;
            }

            Log::error("Telegram notification failed for Order {$orderNumber}. API Response: ".$response->body());

            return false;
        } catch (\Exception $e) {
            Log::error("Telegram notification failed for Order {$orderNumber}. Exception: ".$e->getMessage());

            return false;
        }
    }
}
