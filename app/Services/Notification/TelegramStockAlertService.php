<?php

namespace App\Services\Notification;

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramStockAlertService
{
    private const LOW_STOCK_THRESHOLD = 5;

    public function sendLowStockAlert(Product $product, int $threshold = self::LOW_STOCK_THRESHOLD): bool
    {
        $currentStock = (int) $product->product_stock;

        if ($currentStock > $threshold) {
            return false;
        }

        $botToken = config('services.telegram_stock.bot_token');
        $chatId = config('services.telegram_stock.chat_id');

        if (empty($botToken) || empty($chatId)) {
            Log::warning('Telegram stock alert skipped: Telegram Stock Bot Token or Chat ID is not configured.');

            return false;
        }

        $productName = str_replace(['*', '_', '`'], '', (string) ($product->product_title ?? 'Unknown Product'));
        $sku = str_replace(['*', '_', '`'], '', (string) ($product->product_code ?? 'N/A'));
        $categoryName = str_replace(['*', '_', '`'], '', (string) ($product->category->name ?? 'N/A'));
        $productId = (int) $product->id;
        $detectedTime = now()->setTimezone('Asia/Phnom_Penh')->format('d M Y • h:i A');

        $message = "🚨 *LOW INVENTORY ALERT*\n\n"
            ."⚠️ One or more products are running low on stock.\n\n"
            ."━━━━━━━━━━━━━━━━━━\n\n"
            ."📦 Product: *{$productName}*\n"
            ."🏷️ SKU: {$sku}\n"
            ."📂 Category: {$categoryName}\n"
            ."📊 Remaining Stock: *{$currentStock}*\n"
            ."🔴 Minimum Stock: {$threshold}\n\n"
            ."━━━━━━━━━━━━━━━━━━\n\n"
            ."⏰ Detected: {$detectedTime}\n\n"
            .'💡 Please restock this item as soon as possible to avoid stock shortages.';

        try {
            $response = Http::timeout(5)
                ->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => $message,
                    'parse_mode' => 'Markdown',
                    'disable_web_page_preview' => true,
                ]);

            if ($response->successful()) {
                Log::info('Telegram stock alert sent successfully.', [
                    'product_id' => $productId,
                    'product_code' => $sku,
                    'remaining_stock' => $currentStock,
                ]);

                return true;
            }

            Log::error('Telegram stock alert failed with non-200 response.', [
                'product_id' => $productId,
                'product_code' => $sku,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Telegram stock alert exception.', [
                'product_id' => $productId,
                'product_code' => $sku,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
