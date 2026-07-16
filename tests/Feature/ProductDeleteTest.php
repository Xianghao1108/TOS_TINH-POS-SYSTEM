<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Maker;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Size;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductDeleteTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $this->user = User::factory()->create();
        $this->user->assignRole('Admin');

        $size = Size::create(['size_title' => 'M', 'username' => $this->user->name]);
        $unit = Unit::create(['unit_title' => 'pcs', 'username' => $this->user->name]);
        $maker = Maker::create(['maker_title' => 'Factory A', 'username' => $this->user->name]);
        $brand = Brand::create(['brand_title' => 'Brand A', 'maker_id' => $maker->id, 'username' => $this->user->name]);
        $category = Category::create(['name' => 'Beverages', 'username' => $this->user->name, 'view_order' => 1, 'status' => 1]);

        $this->product = Product::create([
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
            'user_id' => $this->user->id,
        ]);
    }

    public function test_can_delete_product_when_no_dependencies(): void
    {
        $response = $this->actingAs($this->user)
            ->delete(route('products.destroy', $this->product->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('products', ['id' => $this->product->id]);
    }

    public function test_deleting_product_with_orders_fails_or_is_handled(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-12345',
            'customer_id' => null,
            'staff_id' => $this->user->id,
            'subtotal' => 3.00,
            'discount' => 0.00,
            'total' => 3.00,
            'total_payment' => 3.00,
            'total_amount' => 3.00,
            'currency' => 'USD',
            'status' => 'pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_code' => $this->product->product_code,
            'product_title' => $this->product->product_title,
            'product_price' => $this->product->product_price,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('products.destroy', $this->product->id));

        $response->assertRedirect();
        $response->assertSessionHasErrors(['error']);
        $this->assertDatabaseHas('products', ['id' => $this->product->id]);
    }
}
