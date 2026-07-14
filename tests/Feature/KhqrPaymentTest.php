<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Maker;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Size;
use App\Models\Unit;
use App\Models\User;
use App\Services\Notification\INotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class KhqrPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_payment_and_generate_khqr()
    {
        $user = User::factory()->create();

        $size = Size::create(['size_title' => 'M', 'username' => $user->name]);
        $unit = Unit::create(['unit_title' => 'pcs', 'username' => $user->name]);
        $maker = Maker::create(['maker_title' => 'Factory A', 'username' => $user->name]);
        $brand = Brand::create(['brand_title' => 'Brand A', 'maker_id' => $maker->id, 'username' => $user->name]);
        $category = Category::create(['name' => 'Beverages', 'username' => $user->name, 'view_order' => 1, 'status' => 1]);

        $product = Product::create([
            'size_id' => $size->id,
            'unit_id' => $unit->id,
            'maker_id' => $maker->id,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'product_code' => 'P001',
            'product_title' => 'Test Water',
            'product_price' => 1.50,
            'product_stock' => 10,
            'product_status' => 1,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->postJson('/api/create-payment', [
            'currency' => 'USD',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201)

            ->assertJsonStructure([
                'payment_id',
                'order_number',
                'amount',
                'currency',
                'qr_image',
                'md5',
                'expiry_ms',
            ]);

        $this->assertDatabaseHas('orders', [
            'order_number' => $response->json('order_number'),
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('payments', [
            'id' => $response->json('payment_id'),
            'amount' => 3.00,
            'currency' => 'USD',
            'payment_status' => 'pending',
        ]);

        $this->assertEquals(8, $product->fresh()->product_stock);
    }

    public function test_can_generate_corporate_khqr_with_tag_30()
    {
        $user = User::factory()->create();

        $size = Size::create(['size_title' => 'M', 'username' => $user->name]);
        $unit = Unit::create(['unit_title' => 'pcs', 'username' => $user->name]);
        $maker = Maker::create(['maker_title' => 'Factory A', 'username' => $user->name]);
        $brand = Brand::create(['brand_title' => 'Brand A', 'maker_id' => $maker->id, 'username' => $user->name]);
        $category = Category::create(['name' => 'Beverages', 'username' => $user->name, 'view_order' => 1, 'status' => 1]);

        $product = Product::create([
            'size_id' => $size->id,
            'unit_id' => $unit->id,
            'maker_id' => $maker->id,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'product_code' => 'P001',
            'product_title' => 'Test Water',
            'product_price' => 1.50,
            'product_stock' => 10,
            'product_status' => 1,
            'user_id' => $user->id,
        ]);

        config([
            'services.bakong.merchant_id' => '190982590',
            'services.bakong.acquiring_bank' => 'Wing Bank',
            'services.bakong.account_id' => 'seanghav_tuon@bkrt',
        ]);

        $response = $this->actingAs($user)->postJson('/api/create-payment', [
            'currency' => 'USD',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201);
        $qrString = $response->json('qr_string');

        // Check if QR contains Tag 30 representation: 30480018seanghav_tuon@bkrt01091909825900209Wing Bank
        $this->assertStringContainsString('30480018seanghav_tuon@bkrt01091909825900209Wing Bank', $qrString);
    }

    public function test_uses_merchant_id_as_bakong_account_fallback_when_account_id_missing()
    {
        $user = User::factory()->create();

        $size = Size::create(['size_title' => 'M', 'username' => $user->name]);
        $unit = Unit::create(['unit_title' => 'pcs', 'username' => $user->name]);
        $maker = Maker::create(['maker_title' => 'Factory A', 'username' => $user->name]);
        $brand = Brand::create(['brand_title' => 'Brand A', 'maker_id' => $maker->id, 'username' => $user->name]);
        $category = Category::create(['name' => 'Beverages', 'username' => $user->name, 'view_order' => 1, 'status' => 1]);

        $product = Product::create([
            'size_id' => $size->id,
            'unit_id' => $unit->id,
            'maker_id' => $maker->id,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'product_code' => 'P001',
            'product_title' => 'Test Water',
            'product_price' => 1.50,
            'product_stock' => 10,
            'product_status' => 1,
            'user_id' => $user->id,
        ]);

        config([
            'services.bakong.account_id' => null,
            'services.bakong.merchant_id' => 'fallback_account@bkrt',
        ]);

        $response = $this->actingAs($user)->postJson('/api/create-payment', [
            'currency' => 'USD',
            'items' => [
                [
                    'id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertStringContainsString('fallback_account@bkrt', $response->json('qr_string'));
    }

    public function test_can_check_payment_status()
    {
        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'ORD-123',
            'staff_id' => $user->id,
            'subtotal' => 3.00,
            'discount' => 0.00,
            'total' => 3.00,
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 0.00,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => 3.00,
            'currency' => 'USD',
            'khqr_md5' => 'some_md5',
            'payment_status' => 'pending',
        ]);

        $response = $this->getJson("/api/payment-status/{$payment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'payment_status' => 'pending',
                'order_status' => 'pending',
            ]);
    }

    public function test_check_payment_status_updates_to_paid_on_successful_api_response()
    {
        config([
            'services.bakong.api_url' => 'https://sit-api-bakong.nbc.org.kh/',
            'services.bakong.api_email' => 'test@example.com',
        ]);

        Http::fake([
            'https://sit-api-bakong.nbc.org.kh/v1/renew_token' => Http::response([
                'data' => [
                    'token' => 'dummy_token',
                ],
                'responseCode' => 0,
                'responseMessage' => 'Token has been issued',
            ], 200),
            'https://sit-api-bakong.nbc.org.kh/v1/check_transaction_by_md5' => Http::response([
                'responseCode' => 0,
                'responseMessage' => 'Success',
                'data' => [
                    'hash' => 'TXN-FAKE-123',
                    'createdDateMs' => 1718873600000,
                ],
            ], 200),
        ]);

        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'ORD-123',
            'staff_id' => $user->id,
            'subtotal' => 3.00,
            'discount' => 0.00,
            'total' => 3.00,
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 0.00,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => 3.00,
            'currency' => 'USD',
            'khqr_md5' => 'some_md5',
            'payment_status' => 'pending',
        ]);

        $response = $this->getJson("/api/payment-status/{$payment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'payment_status' => 'paid',
                'order_status' => 'paid',
            ]);

        $this->assertEquals('paid', $payment->fresh()->payment_status);
        $this->assertEquals('paid', $order->fresh()->status);
        $this->assertEquals('TXN-FAKE-123', $payment->fresh()->transaction_id);
        $this->assertDatabaseHas('invoices', [
            'total' => 3.00,
            'status' => 1,
            'payment_method' => 'qr',
        ]);
    }

    public function test_can_simulate_webhook_payment()
    {
        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'ORD-123',
            'staff_id' => $user->id,
            'subtotal' => 3.00,
            'discount' => 0.00,
            'total' => 3.00,
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 0.00,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => 3.00,
            'currency' => 'USD',
            'khqr_md5' => 'some_md5',
            'payment_status' => 'pending',
        ]);

        $response = $this->postJson('/api/payment-webhook', [
            'md5' => 'some_md5',
            'transaction_id' => 'TXN-ABC-123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'payment_status' => 'paid',
            ]);

        $this->assertEquals('paid', $payment->fresh()->payment_status);
        $this->assertEquals('paid', $order->fresh()->status);
        $this->assertDatabaseHas('invoices', [
            'total' => 3.00,
            'status' => 1, 'payment_method' => 'qr',
        ]);
    }

    public function test_payment_success_triggers_telegram_notification()
    {
        $notificationMock = $this->mock(INotificationService::class, function ($mock) {
            $mock->shouldReceive('sendPaymentSuccessNotification')
                ->once()
                ->andReturn(true);
        });

        config([
            'services.bakong.api_url' => 'https://sit-api-bakong.nbc.org.kh/',
            'services.bakong.api_email' => 'test@example.com',
        ]);

        Http::fake([
            'https://sit-api-bakong.nbc.org.kh/v1/renew_token' => Http::response([
                'data' => [
                    'token' => 'dummy_token',
                ],
                'responseCode' => 0,
                'responseMessage' => 'Token has been issued',
            ], 200),
            'https://sit-api-bakong.nbc.org.kh/v1/check_transaction_by_md5' => Http::response([
                'responseCode' => 0,
                'responseMessage' => 'Success',
                'data' => [
                    'hash' => 'TXN-FAKE-123',
                    'createdDateMs' => 1718873600000,
                ],
            ], 200),
        ]);

        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'ORD-123',
            'staff_id' => $user->id,
            'subtotal' => 3.00,
            'discount' => 0.00,
            'total' => 3.00,
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 0.00,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => 3.00,
            'currency' => 'USD',
            'khqr_md5' => 'some_md5',
            'payment_status' => 'pending',
        ]);

        $response = $this->getJson("/api/payment-status/{$payment->id}");

        $response->assertStatus(200);
    }

    public function test_check_payment_status_surfaces_bakong_auth_failure()
    {
        config([
            'services.bakong.api_url' => 'https://api-bakong.nbc.gov.kh/',
            'services.bakong.api_email' => 'unregistered@example.com', 'services.bakong.api_token' => null,
        ]);

        Cache::forget('bakong_access_token');

        Http::fake([
            'https://api-bakong.nbc.gov.kh/v1/renew_token' => Http::response([
                'responseCode' => 1,
                'responseMessage' => 'Not registered yet',
                'errorCode' => 10,
                'data' => null,
            ], 200),
        ]);

        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'ORD-321',
            'staff_id' => $user->id,
            'subtotal' => 3.00,
            'discount' => 0.00,
            'total' => 3.00,
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 0.00,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => 3.00,
            'currency' => 'USD',
            'khqr_md5' => 'some_md5',
            'payment_status' => 'pending',
        ]);

        $response = $this->getJson("/api/payment-status/{$payment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'payment_status' => 'pending',
                'order_status' => 'pending',
                'verification_status' => 'bakong_auth_failed',
            ]);

        $this->assertEquals('pending', $payment->fresh()->payment_status);
        $this->assertEquals('pending', $order->fresh()->status);
    }
}
