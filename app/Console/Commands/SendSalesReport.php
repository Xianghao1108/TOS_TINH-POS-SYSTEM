<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendSalesReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:send-report {--manual : Whether this sync was triggered manually}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate daily sales metrics and push summary message to Telegram Bot';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $dateFormatted = $today->format('d F Y'); // e.g. 07 July 2026

        // Calculate today's sales metrics from paid invoices (status = 1)
        $totalSales = (float) Invoice::whereDate('created_at', $today)
            ->where('status', 1)
            ->sum('total');

        $totalOrders = Invoice::whereDate('created_at', $today)
            ->where('status', 1)
            ->count();

        // Customers Served: unique customer_id (excluding null) + count of null customer_id invoices (walk-ins)
        $customersWithId = Invoice::whereDate('created_at', $today)
            ->where('status', 1)
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $walkInCustomers = Invoice::whereDate('created_at', $today)
            ->where('status', 1)
            ->whereNull('customer_id')
            ->count();

        $customersServed = $customersWithId + $walkInCustomers;

        // Cash Payments: sum of total for paid invoices where payment_method is cash
        $cashPayments = (float) Invoice::whereDate('created_at', $today)
            ->where('status', 1)
            ->where('payment_method', 'cash')
            ->sum('total');

        // KHQR Payments: sum of total for paid invoices where payment_method is qr
        $khqrPayments = (float) Invoice::whereDate('created_at', $today)
            ->where('status', 1)
            ->where('payment_method', 'qr')
            ->sum('total');

        // Items Sold: total items sold today in paid invoices
        $itemsSold = (int) \App\Models\OrderItem::whereHas('order.invoices', function ($query) use ($today) {
            $query->whereDate('invoices.created_at', $today)
                  ->where('invoices.status', 1);
        })->sum('quantity');

        // Get global configurations
        $currencySymbol = Setting::get('currency_symbol', '$');
        $botToken = Setting::get('telegram_report_bot_token', config('services.telegram_report.bot_token'));
        $chatId = Setting::get('telegram_report_chat_id', config('services.telegram_report.chat_id'));

        if (empty($botToken) || empty($chatId)) {
            $this->error('Telegram bot settings are not configured.');
            Log::warning('Telegram Daily Sales Report skipped: Bot Token or Chat ID is not configured.');
            return 1;
        }

        // Format helper: formats currency based on the global symbol
        $formatAmount = function ($amount) use ($currencySymbol) {
            return ($currencySymbol === '$') 
                ? '$' . number_format($amount, 2) 
                : number_format($amount, 0) . ' ' . $currencySymbol;
        };

        $salesFormatted = $formatAmount($totalSales);
        $cashFormatted = $formatAmount($cashPayments);
        $khqrFormatted = $formatAmount($khqrPayments);

        // Compose Markdown Message with new styling requested by user
        $message = "📊 *Daily Sales Report*\n\n"
            . "📅 *Date:* `{$dateFormatted}`\n\n"
            . "💰 *Total Sales:* `{$salesFormatted}`\n"
            . "🧾 *Total Orders:* `{$totalOrders}`\n"
            . "👥 *Customers Served:* `{$customersServed}`\n"
            . "💳 *Cash Payments:* `{$cashFormatted}`\n"
            . "📱 *KHQR Payments:* `{$khqrFormatted}`\n\n\n"
            . "📦 *Items Sold:* `{$itemsSold}`\n\n\n"
            . "✅ End of daily sales report.";

        // Send HTTP request to Telegram API
        try {
            $response = Http::timeout(10)->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
            ]);

            if ($response->successful()) {
                $this->info("Sales report successfully sent to Telegram.");
                Log::info("Daily sales report sent via Telegram successfully.");
                return 0;
            }

            $this->error("Failed to send message: " . $response->body());
            Log::error("Failed to send Telegram daily sales report: " . $response->body());
            return 1;
        } catch (\Exception $e) {
            $this->error("Exception occurred: " . $e->getMessage());
            Log::error("Failed to send Telegram daily sales report. Exception: " . $e->getMessage());
            return 1;
        }
    }
}
