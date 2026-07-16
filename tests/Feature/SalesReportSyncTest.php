<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SalesReportSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Configure test configurations for Telegram Report in config
        config([
            'services.telegram_report.bot_token' => '123456789:ABCdef_test_token',
            'services.telegram_report.chat_id' => '987654321',
        ]);

        // Also save to settings table as model gets preference
        Setting::set('telegram_report_bot_token', '123456789:ABCdef_test_token');
        Setting::set('telegram_report_chat_id', '987654321');
        Setting::set('currency_symbol', '$');
    }

    public function test_api_manually_triggers_sales_report_to_telegram()
    {
        Http::fake([
            'https://api.telegram.org/bot*' => Http::response(['ok' => true], 200),
        ]);

        $user = User::factory()->create();

        // Create 2 paid invoices today
        Invoice::create([
            'customer_id' => null,
            'staff_id' => $user->id,
            'total' => 120.50,
            'status' => 1, // Paid
        ]);

        Invoice::create([
            'customer_id' => null,
            'staff_id' => $user->id,
            'total' => 80.00,
            'status' => 1, // Paid
        ]);

        // Create 1 unpaid invoice today (should not be counted in revenue)
        Invoice::create([
            'customer_id' => null,
            'staff_id' => $user->id,
            'total' => 500.00,
            'status' => 2, // Unpaid
        ]);

        // Trigger manual sync
        $response = $this->actingAs($user)->postJson('/api/reports/trigger-now');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Daily sales report sent to Telegram successfully.',
        ]);

        // Assert HTTP call to Telegram was sent with correct statistics
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage') &&
                   $request['chat_id'] === '987654321' &&
                   $request['parse_mode'] === 'Markdown' &&
                   str_contains($request['text'], 'Daily Sales Report') &&
                   str_contains($request['text'], 'Total Orders:* `2`') &&
                   str_contains($request['text'], 'Total Sales:* `$200.50`') &&
                   str_contains($request['text'], 'End of daily sales report.');
        });
    }

    public function test_artisan_command_sends_automated_report_type()
    {
        Http::fake([
            'https://api.telegram.org/bot*' => Http::response(['ok' => true], 200),
        ]);

        $user = User::factory()->create();

        // Create a paid invoice today
        Invoice::create([
            'customer_id' => null,
            'staff_id' => $user->id,
            'total' => 150.00,
            'status' => 1, // Paid
        ]);

        // Call the Artisan command directly (simulating automated cron trigger)
        $exitCode = Artisan::call('sales:send-report');

        $this->assertEquals(0, $exitCode);

        // Assert HTTP call to Telegram was sent with cron trigger type label
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'sendMessage') &&
                   $request['chat_id'] === '987654321' &&
                   $request['parse_mode'] === 'Markdown' &&
                   str_contains($request['text'], 'Daily Sales Report') &&
                   str_contains($request['text'], 'Total Orders:* `1`') &&
                   str_contains($request['text'], 'Total Sales:* `$150.00`') &&
                   str_contains($request['text'], 'End of daily sales report.');
        });
    }

    public function test_settings_page_receives_masked_telegram_report_settings()
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $user = User::factory()->create();
        $user->assignRole('Admin');

        Setting::set('telegram_report_bot_token', '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ');
        Setting::set('telegram_report_chat_id', '987654321');

        $response = $this->actingAs($user)->get('/settings');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/Index')
            ->has('settings.telegram.report_bot_token')
            ->has('settings.telegram.report_chat_id')
        );

        $settings = $response->original->getData()['page']['props']['settings'];
        $this->assertStringStartsWith('1234567', $settings['telegram']['report_bot_token']);
        $this->assertStringEndsWith('wxyZ', $settings['telegram']['report_bot_token']);
        $this->assertStringContainsString('••••••••••••', $settings['telegram']['report_bot_token']);
        $this->assertStringStartsWith('987', $settings['telegram']['report_chat_id']);
        $this->assertStringEndsWith('321', $settings['telegram']['report_chat_id']);
    }

    public function test_update_sales_report_settings_individually()
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $user = User::factory()->create();
        $user->assignRole('Admin');

        $response = $this->actingAs($user)->post('/settings', [
            'telegram_report_bot_token' => '111111111:new_report_bot_token_format',
            'telegram_report_chat_id' => '222222222',
        ]);

        $response->assertRedirect();
        $this->assertEquals('111111111:new_report_bot_token_format', Setting::get('telegram_report_bot_token'));
        $this->assertEquals('222222222', Setting::get('telegram_report_chat_id'));
    }

    public function test_api_trigger_now_fails_when_settings_are_empty()
    {
        $user = User::factory()->create();

        // Clear settings
        Setting::set('telegram_report_bot_token', '');
        Setting::set('telegram_report_chat_id', '');

        // Clear config defaults
        config([
            'services.telegram_report.bot_token' => '',
            'services.telegram_report.chat_id' => '',
        ]);

        $response = $this->actingAs($user)->postJson('/api/reports/trigger-now');

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Telegram bot settings are not configured.',
        ]);
    }
}
