<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use App\Models\Category;
use App\Models\Size;
use App\Models\Unit;
use App\Models\Maker;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Order;
use App\Models\Payment;
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

    public function test_non_admin_cannot_access_settings_page()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->get('/settings');
        
        $response->assertStatus(403);
    }

    public function test_admin_can_access_settings_page()
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $user = User::factory()->create();
        $user->assignRole('Admin');

        $response = $this->actingAs($user)->get('/settings');
        
        $response->assertStatus(200);
    }

    public function test_cashier_cannot_write_products_or_invoices()
    {
        $cashier = User::factory()->create(); // Cashier does not have Admin role

        // Attempting to post to products.store should be aborted with 403
        $this->actingAs($cashier)->post(route('products.store'), [
            'product_title' => 'Sneaky product',
            'product_price' => 10.00,
        ])->assertStatus(403);

        // Attempting to post to invoices.store should be aborted with 403
        $this->actingAs($cashier)->post(route('invoices.store'), [
            'customer_id' => 1,
            'payment_method' => 'cash',
            'order_ids' => [1],
        ])->assertStatus(403);
    }

    public function test_invoice_creation_recalculates_totals_and_ignores_client_input()
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $customer = \App\Models\Customer::create([
            'username' => 'Jane Client',
            'email' => 'jane@example.com',
            'phone' => '099999999',
        ]);

        $size = Size::create(['size_title' => 'L', 'username' => $admin->name]);
        $unit = Unit::create(['unit_title' => 'kg', 'username' => $admin->name]);
        $maker = Maker::create(['maker_title' => 'Factory B', 'username' => $admin->name]);
        $brand = Brand::create(['brand_title' => 'Brand B', 'maker_id' => $maker->id, 'username' => $admin->name]);
        $category = Category::create(['name' => 'Food', 'username' => $admin->name, 'view_order' => 1, 'status' => 1]);

        // Product database price is 5.00
        $product = Product::create([
            'size_id' => $size->id,
            'unit_id' => $unit->id,
            'maker_id' => $maker->id,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'product_code' => 'P002',
            'product_title' => 'Apples',
            'product_price' => 5.00,
            'product_stock' => 10,
            'product_status' => 1,
            'user_id' => $admin->id,
        ]);

        $order = Order::create([
            'customer_id' => $customer->id,
            'staff_id' => $admin->id,
            'subtotal' => 10.00,
            'discount' => 0.00,
            'total' => 10.00,
            'total_amount' => 10.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 10.00,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_code' => $product->product_code,
            'product_title' => $product->product_title,
            'product_price' => $product->product_price,
            'quantity' => 2, // 2 * 5.00 = 10.00
        ]);

        // Submit client-injected staff_id = 999, total = 999.99, status = 1 (Paid)
        $response = $this->actingAs($admin)->post(route('invoices.store'), [
            'customer_id' => $customer->id,
            'staff_id' => 999,
            'status' => 1,
            'payment_method' => 'cash',
            'total' => 999.99,
            'order_ids' => [$order->id],
        ]);

        $response->assertRedirect();

        // Database should record the admin's staff_id, calculated total of 10.00, and forced unpaid status 2
        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'staff_id' => $admin->id,
            'total' => 10.00,
            'status' => 2,
            'payment_method' => 'cash',
        ]);
    }

    public function test_webhook_payment_is_concurrency_safe_and_idempotent()
    {
        $user = User::factory()->create();
        $customer = \App\Models\Customer::create([
            'username' => 'Concurrency Customer',
            'email' => 'concur@example.com',
            'phone' => '077777777',
        ]);
        $order = Order::create([
            'order_number' => 'INV-CONCURRENCY-101',
            'customer_id' => $customer->id,
            'staff_id' => $user->id,
            'subtotal' => 10.00,
            'discount' => 0.00,
            'total' => 10.00,
            'total_amount' => 10.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 0.00,
        ]);



        $payment = \App\Models\Payment::create([
            'order_id' => $order->id,
            'amount' => 10.00,
            'currency' => 'USD',
            'khqr_md5' => 'concurrency_md5_test_hash',
            'payment_status' => 'pending',
        ]);

        // First webhook simulation request succeeds and changes status to paid
        $response1 = $this->actingAs($user)->postJson('/api/payment-webhook', [
            'md5' => 'concurrency_md5_test_hash',
            'status' => 'paid',
            'transaction_id' => 'TXN-CONC-123',
        ]);

        $response1->assertStatus(200);
        $response1->assertJsonFragment(['payment_status' => 'paid']);

        // Second duplicate webhook request hit concurrently returns idempotent response without failing or repeating
        $response2 = $this->actingAs($user)->postJson('/api/payment-webhook', [
            'md5' => 'concurrency_md5_test_hash',
            'status' => 'paid',
            'transaction_id' => 'TXN-CONC-123',
        ]);

        $response2->assertStatus(200);
        $response2->assertJsonFragment([
            'success' => true,
            'message' => 'Payment already processed (Idempotent response).',
            'payment_status' => 'paid'
        ]);
    }
}


