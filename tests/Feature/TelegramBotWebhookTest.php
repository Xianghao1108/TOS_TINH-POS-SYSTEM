<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TelegramBotWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Configure test configurations for Telegram
        config([
            'services.telegram.bot_token' => '999999999:AAFhilS_test_token',
            'services.telegram.chat_id' => '123456789',
        ]);
    }

    public function test_handle_start_command()
    {
        Http::fake([
            'https://api.telegram.org/bot*' => Http::response(['ok' => true], 200),
        ]);

        $payload = [
            'update_id' => 123456,
            'message' => [
                'message_id' => 1,
                'chat' => ['id' => 987654321, 'type' => 'private'],
                'text' => '/start',
                'from' => [
                    'id' => 987654321,
                    'username' => 'test_user',
                    'first_name' => 'Test',
                ],
            ],
        ];

        $response = $this->postJson('/api/send/telegram', $payload);

        $response->assertStatus(200);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage') &&
                   $request['chat_id'] === 987654321 &&
                   str_contains($request['text'], 'Welcome! @test_user');
        });
    }

    public function test_handle_echo_message()
    {
        Http::fake([
            'https://api.telegram.org/bot*' => Http::response(['ok' => true], 200),
        ]);

        $payload = [
            'update_id' => 123457,
            'message' => [
                'message_id' => 2,
                'chat' => ['id' => 987654321, 'type' => 'private'],
                'text' => 'Hello World!',
                'from' => [
                    'id' => 987654321,
                ],
            ],
        ];

        $response = $this->postJson('/api/send/telegram', $payload);

        $response->assertStatus(200);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage') &&
                   $request['chat_id'] === 987654321 &&
                   $request['text'] === 'Hello World!';
        });
    }

    public function test_handle_contact_form_reply_parses_regex_and_sends_email()
    {
        Http::fake([
            'https://api.telegram.org/bot*' => Http::response(['ok' => true], 200),
        ]);

        $payload = [
            'update_id' => 123458,
            'message' => [
                'message_id' => 42,
                'chat' => ['id' => 987654321, 'type' => 'private'],
                'text' => 'This is the reply text to send via email',
                'reply_to_message' => [
                    'message_id' => 41,
                    'text' => "👤 Name: Alice Dev\n📧 Email: alice@example.com\n🏷️ Subject: Inquiry about product stock",
                ],
            ],
        ];

        $response = $this->postJson('/api/telegram-webhook', $payload);

        $response->assertStatus(200);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage') &&
                   $request['chat_id'] === 987654321 &&
                   str_contains($request['text'], 'Reply Sent via Email') &&
                   str_contains($request['text'], 'Alice Dev') &&
                   str_contains($request['text'], 'alice@example.com');
        });
    }
}
