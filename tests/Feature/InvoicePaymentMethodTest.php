<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Maker;
use App\Models\Brand;
use App\Models\Order;
use App\Models\Product;
use App\Models\Size;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoicePaymentMethodTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_invoice_store_persists_payment_method()
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $user = User::factory()->create();
        $user->assignRole('Admin');
        $customer = Customer::create([
            'username' => 'Jane Customer',
            'email' => 'jane.customer@example.com',
            'phone' => '012345678',
        ]);

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

        $order = Order::create([
            'customer_id' => $customer->id,
            'staff_id' => $user->id,
            'subtotal' => 3.00,
            'discount' => 0.00,
            'total' => 3.00,
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
            'total_payment' => 3.00,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_code' => $product->product_code,
            'product_title' => $product->product_title,
            'product_price' => $product->product_price,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)->post(route('invoices.store'), [
            'customer_id' => $customer->id,
            'staff_id' => $user->id,
            'status' => 1, // Will be ignored by the secure controller logic
            'payment_method' => 'card',
            'total' => 3.00,
            'order_ids' => [$order->id],
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'staff_id' => $user->id,
            'total' => 3.00,
            'status' => 2, // Server forces secure initial payment state status (2 = Unpaid/Pending)
            'payment_method' => 'card',
        ]);

        $this->assertDatabaseHas('invoice_orders', [
            'order_id' => $order->id,
        ]);
    }
}