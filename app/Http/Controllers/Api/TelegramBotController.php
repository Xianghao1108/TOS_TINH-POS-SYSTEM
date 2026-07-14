<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramBotController extends Controller
{
    /**
     * Handles /api/telegram-webhook updates (Contact Form Replier)
     */
    public function handleWebhook(Request $request)
    {
        $body = $request->all();

        // Process asynchronously after the HTTP response has been sent to Telegram
        dispatch(function () use ($body) {
            $this->processContactFormReply($body);
        })->afterResponse();

        return response('OK', 200);
    }

    /**
     * Handles /api/send/telegram updates (Original bot command echo)
     */
    public function handleOriginalBotCommands(Request $request)
    {
        $body = $request->all();

        // Process asynchronously after the HTTP response has been sent to Telegram
        dispatch(function () use ($body) {
            $this->processOriginalBotCommands($body);
        })->afterResponse();

        return response('OK', 200);
    }

    /**
     * Process contact form reply logic.
     */
    protected function processContactFormReply(array $body)
    {
        $message = $body['message'] ?? null;
        if (! $message) {
            Log::info('[Telegram Bot] No message found in update.');

            return;
        }

        $chatId = $message['chat']['id'] ?? null;
        $replyText = $message['text'] ?? null;
        $replyToMessage = $message['reply_to_message'] ?? null;

        if (! $chatId) {
            Log::error('[Telegram Bot] Missing chat ID.');

            return;
        }

        if (! $replyText) {
            Log::info('[Telegram Bot] Reply has no text content.');

            return;
        }

        // 1. Verify this message is a reply to another message (the contact form)
        if (! $replyToMessage) {
            Log::info('[Telegram Bot] Message is not a reply to another message. Ignoring.');

            return;
        }

        $parentText = $replyToMessage['text'] ?? '';

        // 2. Parse fields from parent message using regexes
        $emailRegex = '/📧 Email:\s*([^\n\r]+)/';
        $nameRegex = '/👤 Name:\s*([^\n\r]+)/';
        $subjectRegex = '/🏷️ Subject:\s*([^\n\r]+)/';

        preg_match($emailRegex, $parentText, $emailMatches);
        preg_match($nameRegex, $parentText, $nameMatches);
        preg_match($subjectRegex, $parentText, $subjectMatches);

        $email = isset($emailMatches[1]) ? trim($emailMatches[1]) : null;
        $name = isset($nameMatches[1]) ? trim($nameMatches[1]) : null;
        $subject = isset($subjectMatches[1]) ? trim($subjectMatches[1]) : null;

        // 3. If fields cannot be extracted, log a warning
        if (! $email || ! $name || ! $subject) {
            Log::warning('[Telegram Bot] Could not parse email, name, or subject from the contact form message. Parent text: '.$parentText);

            return;
        }

        Log::info("[Telegram Bot] Successfully parsed fields: Name=\"{$name}\", Email=\"{$email}\", Subject=\"{$subject}\"");

        // 4. Send the mock email
        $this->sendMockEmail($email, $name, $subject, $replyText);

        // 5. Send confirmation back to the Telegram chat
        $token = Setting::get('telegram_bot_token', config('services.telegram.bot_token'));
        if (empty($token) || $token === '8631035259:AAFhilS_4xyF0gg3sNBrQqucVbP6gzmNfMg') {
            Log::warning('[Telegram Bot] TELEGRAM_BOT_TOKEN is not configured or is default. Skipping confirmation message.');

            return;
        }

        $confirmationText = "📬 *Reply Sent via Email!*\n\n".
                            "👤 *To*: {$name} (<{$email}>)\n".
                            "🏷️ *Subject*: Re: {$subject}\n\n".
                            '💬 *Message forwarded successfully.*';

        try {
            Http::timeout(5)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $confirmationText,
                'parse_mode' => 'Markdown',
                'reply_to_message_id' => $message['message_id'],
            ]);
            Log::info("[Telegram Bot] Sent confirmation back to Telegram chat: {$chatId}");
        } catch (\Exception $e) {
            Log::error('[Telegram Bot] Failed to send Telegram confirmation. Error: '.$e->getMessage());
        }
    }

    /**
     * Send Mock Email simulation.
     */
    protected function sendMockEmail(string $to, string $name, string $subject, string $body)
    {
        Log::channel('single')->info('--------------------------------------------------');
        Log::channel('single')->info('📧 [MOCK EMAIL SERVICE] Sending outbound email...');
        Log::channel('single')->info("To:       {$name} <{$to}>");
        Log::channel('single')->info("Subject:  Re: {$subject}");
        Log::channel('single')->info("Message:  {$body}");
        Log::channel('single')->info('--------------------------------------------------');
    }

    /**
     * Process original bot commands (/start and echo text).
     */
    protected function processOriginalBotCommands(array $body)
    {
        $message = $body['message'] ?? null;
        if (! $message || ! isset($message['chat']['id']) || ! isset($message['text'])) {
            return;
        }

        $chatId = $message['chat']['id'];
        $text = trim($message['text']);
        $token = Setting::get('telegram_bot_token', config('services.telegram.bot_token'));

        if (empty($token) || $token === 'your_telegram_bot_token') {
            Log::warning('[Telegram Bot Original] Bot token not configured.');

            return;
        }

        try {
            if ($text === '/start') {
                $fromUser = $message['from'] ?? null;
                $greetingName = 'user';

                if (isset($fromUser['username'])) {
                    $greetingName = '@'.$fromUser['username'];
                } elseif (isset($fromUser['first_name'])) {
                    $greetingName = $fromUser['first_name'];
                }

                Http::timeout(5)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => "Welcome! {$greetingName}, your message was received.",
                ]);
            } else {
                Http::timeout(5)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => $text,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('[Telegram Bot Original] Error: '.$e->getMessage());
        }
    }
}
