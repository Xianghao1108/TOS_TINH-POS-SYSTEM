<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display the settings index page.
     */
    public function index()
    {
        $telegramBotToken = Setting::get('telegram_bot_token', config('services.telegram.bot_token'));
        $telegramChatId = Setting::get('telegram_chat_id', config('services.telegram.chat_id'));
        $telegramReportBotToken = Setting::get('telegram_report_bot_token', config('services.telegram_report.bot_token'));
        $telegramReportChatId = Setting::get('telegram_report_chat_id', config('services.telegram_report.chat_id'));
        $telegramSecretToken = Setting::get('telegram_secret_token') ?: config('services.telegram.secret_token') ?: env('TELEGRAM_SECRET_TOKEN', '');

        $settings = [
            'store_name' => Setting::get('store_name', 'Tos Tinh Mart'),
            'store_address' => Setting::get('store_address', 'Phnom Penh, Cambodia'),
            'store_email' => Setting::get('store_email', 'contact@tostinh.com'),
            'store_phone' => Setting::get('store_phone', '+855 12 345 678'),
            'currency_symbol' => Setting::get('currency_symbol', '$'),
            'tax_rate' => Setting::get('tax_rate', '10.00'),
            'receipt_header' => Setting::get('receipt_header', 'Thank you for shopping with us!'),
            'receipt_footer' => Setting::get('receipt_footer', 'Please come again!'),
            'low_stock_alerts' => Setting::get('low_stock_alerts', '1'),
            'low_stock_threshold' => Setting::get('low_stock_threshold', '5'),
            'default_checkout_role' => Setting::get('default_checkout_role', '1'),
            'theme_mode' => Setting::get('theme_mode', 'light'),

            // Safely nested configuration parameters
            'telegram' => [
                'bot_token' => $this->maskString($telegramBotToken, 7, 4),
                'chat_id' => $this->maskString($telegramChatId, 3, 3),
                'report_bot_token' => $this->maskString($telegramReportBotToken, 7, 4),
                'report_chat_id' => $this->maskString($telegramReportChatId, 3, 3),
                'secret_token_status' => ! empty($telegramSecretToken) ? 'Configured (Hidden)' : 'Not Configured',
            ],
        ];

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Helper to mask sensitive values securely.
     */
    private function maskString($string, $startLength = 7, $endLength = 4)
    {
        if (empty($string) || $string === 'your_telegram_bot_token' || $string === 'your_telegram_chat_id') {
            return '';
        }
        $length = strlen($string);
        if ($length > ($startLength + $endLength + 2)) {
            $start = substr($string, 0, $startLength);
            $end = substr($string, -$endLength);

            return $start.str_repeat('•', 12).$end;
        }

        return str_repeat('•', 12);
    }

    /**
     * Update configuration settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_address' => 'nullable|string',
            'store_email' => 'required|email|max:255',
            'store_phone' => 'required|string|max:50',
            'currency_symbol' => 'required|string|max:10',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'receipt_header' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
            'low_stock_alerts' => 'required|in:0,1',
            'low_stock_threshold' => 'required|integer|min:0',
            'default_checkout_role' => 'required|in:1,2',
            'theme_mode' => 'required|in:light,dark',
            'telegram_bot_token' => 'nullable|string|max:255',
            'telegram_chat_id' => 'nullable|string|max:255',
            'telegram_report_bot_token' => 'nullable|string|max:255',
            'telegram_report_chat_id' => 'nullable|string|max:255',
            'telegram_secret_token' => 'nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            // Avoid overwriting credentials with masked placeholders or status labels from client submission
            if (in_array($key, ['telegram_bot_token', 'telegram_chat_id', 'telegram_report_bot_token', 'telegram_report_chat_id', 'telegram_secret_token'])) {
                if ($value !== null && (str_contains($value, '•') || $value === 'Configured (Hidden)')) {
                    continue;
                }
            }
            Setting::set($key, (string) ($value ?? ''));
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Retrieve safely masked Telegram settings and bot info.
     */
    public function getTelegramSettings()
    {
        $token = Setting::get('telegram_bot_token')
            ?: config('services.telegram.bot_token')
            ?: env('TELEGRAM_BOT_TOKEN', '');

        $maskedToken = 'Not Configured';
        $botName = 'Unknown Bot';

        if (! empty($token)) {
            $length = strlen($token);
            if ($length > 11) {
                $start = substr($token, 0, 7);
                $end = substr($token, -4);
                $maskedToken = $start.str_repeat('•', 12).$end;
            } else {
                $maskedToken = str_repeat('•', 12);
            }

            if ($token !== 'your_telegram_bot_token') {
                try {
                    $response = Http::timeout(3)->get("https://api.telegram.org/bot{$token}/getMe");
                    if ($response->successful()) {
                        $botName = '@'.($response->json('result.username') ?? 'TelegramBot');
                    } else {
                        $botName = 'Unknown (Invalid API Token)';
                    }
                } catch (\Exception $e) {
                    $botName = 'Telegram Bot API Offline/Unreachable';
                }
            }
        }

        return response()->json([
            'masked_token' => $maskedToken,
            'bot_name' => $botName,
        ]);
    }

    /**
     * Update the Telegram Bot Token.
     */
    public function updateTelegramSettings(Request $request)
    {
        $request->validate([
            'telegram_bot_token' => 'nullable|string|regex:/^[0-9]+:[a-zA-Z0-9_-]+$/|max:255',
        ]);

        $newToken = $request->input('telegram_bot_token');

        if (! empty($newToken)) {
            Setting::set('telegram_bot_token', $newToken);

            return response()->json([
                'success' => true,
                'message' => 'Telegram Bot Token updated successfully. Active token masked.',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token input was empty. Existing Telegram configurations maintained.',
        ]);
    }
}
