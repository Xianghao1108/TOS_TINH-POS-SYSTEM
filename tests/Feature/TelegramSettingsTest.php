<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelegramSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_retrieve_masked_telegram_settings()
    {
        $user = User::factory()->create();
        Setting::set('telegram_bot_token', '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ');

        $response = $this->actingAs($user)->getJson('/api/settings/telegram');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'masked_token',
            'bot_name',
        ]);
        
        $data = $response->json();
        // First 7 characters is "1234567"
        // Last 4 characters is "wxyZ"
        $this->assertStringStartsWith('1234567', $data['masked_token']);
        $this->assertStringEndsWith('wxyZ', $data['masked_token']);
        $this->assertStringContainsString('••••••••••••', $data['masked_token']);
    }

    public function test_unauthenticated_user_cannot_retrieve_telegram_settings()
    {
        $response = $this->getJson('/api/settings/telegram');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_update_telegram_token()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/settings/telegram/update', [
            'telegram_bot_token' => '987654321:XYZabc12345XYZabc12345XYZabc123',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Telegram Bot Token updated successfully. Active token masked.',
        ]);

        $this->assertEquals('987654321:XYZabc12345XYZabc12345XYZabc123', Setting::get('telegram_bot_token'));
    }

    public function test_updating_with_empty_token_retains_existing_token()
    {
        $user = User::factory()->create();
        Setting::set('telegram_bot_token', '123456789:existing_token');

        $response = $this->actingAs($user)->postJson('/api/settings/telegram/update', [
            'telegram_bot_token' => '',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Token input was empty. Existing Telegram configurations maintained.',
        ]);

        $this->assertEquals('123456789:existing_token', Setting::get('telegram_bot_token'));
    }

    public function test_invalid_token_format_fails_validation()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/settings/telegram/update', [
            'telegram_bot_token' => 'invalid_format_without_colon',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['telegram_bot_token']);
    }
}
