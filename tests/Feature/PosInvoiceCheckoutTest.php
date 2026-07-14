<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Maker;
use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\Product;
use App\Models\Size;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosInvoiceCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function createRelations(User $user)
    {
        $size = Size::create(['size_title' => 'M', 'username' => $user->name]);
        $unit = Unit::create(['unit_title' => 'Pcs', 'username' => $user->name]);
        $maker = Maker::create(['maker_title' => 'Factory', 'username' => $user->name]);
        $brand = Brand::create(['brand_title' => 'Brand', 'maker_id' => $maker->id, 'username' => $user->name]);
        $category = Category::create(['name' => 'General', 'username' => $user->name, 'view_order' => 1, 'status' => 1]);

        return compact('size', 'unit', 'maker', 'brand', 'category');
    }

    public function test_guest_cannot_checkout()
    {
        $response = $this->postJson('/api/invoices/checkout', [
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => 1, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_staff_can_checkout_successfully()
    {
        $user = User::factory()->create();
        $relations = $this->createRelations($user);

        $product = Product::create([
            'size_id' => $relations['size']->id,
            'unit_id' => $relations['unit']->id,
            'maker_id' => $relations['maker']->id,
            'brand_id' => $relations['brand']->id,
            'category_id' => $relations['category']->id,
            'product_title' => 'Secure Coding Guide',
            'product_price' => 25.00,
            'product_stock' => 10,
            'product_status' => 1,
            'user_id' => $user->id,
            'product_code' => 'PROD-SEC-101',
            'product_barcode' => '1234567890',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/invoices/checkout', [
            'payment_method' => 'cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('success', true);

        $invoice = PosInvoice::first();
        $this->assertNotNull($invoice);
        $this->assertEquals($user->id, $invoice->staff_id);
        $this->assertEquals(50.00, $invoice->total_amount);
        $this->assertEquals('cash', $invoice->payment_method);
        $this->assertEquals('paid', $invoice->status);

        // Verify stock decremented
        $product->refresh();
        $this->assertEquals(8, $product->product_stock);

        // Verify line item snapshot
        $item = PosInvoiceItem::first();
        $this->assertNotNull($item);
        $this->assertEquals($product->id, $item->product_id);
        $this->assertEquals(2, $item->quantity);
        $this->assertEquals(25.00, $item->unit_price);
    }

    public function test_insufficient_stock_fails_checkout()
    {
        $user = User::factory()->create();
        $relations = $this->createRelations($user);

        $product = Product::create([
            'size_id' => $relations['size']->id,
            'unit_id' => $relations['unit']->id,
            'maker_id' => $relations['maker']->id,
            'brand_id' => $relations['brand']->id,
            'category_id' => $relations['category']->id,
            'product_title' => 'Limited Edition Tee',
            'product_price' => 15.00,
            'product_stock' => 1,
            'product_status' => 1,
            'user_id' => $user->id,
            'product_code' => 'PROD-TEE-202',
            'product_barcode' => '0987654321',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/invoices/checkout', [
            'payment_method' => 'aba_qr',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
        $response->assertJsonFragment([
            'message' => 'Insufficient stock for product: Limited Edition Tee. Available: 1. Requested: 2',
        ]);

        // Verify stock was not changed
        $product->refresh();
        $this->assertEquals(1, $product->product_stock);

        // Verify no invoice created
        $this->assertEquals(0, PosInvoice::count());
    }
}
