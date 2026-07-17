<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Maker;
use App\Models\Product;
use App\Models\Size;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private $size, $unit, $maker, $brand, $category;

    protected function setUp(): void
    {
        parent::setUp();
        
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $this->user = User::factory()->create();
        $this->user->assignRole('Admin');

        $this->size = Size::create(['size_title' => 'M', 'username' => $this->user->name]);
        $this->unit = Unit::create(['unit_title' => 'pcs', 'username' => $this->user->name]);
        $this->maker = Maker::create(['maker_title' => 'Factory A', 'username' => $this->user->name]);
        $this->brand = Brand::create(['brand_title' => 'Brand A', 'maker_id' => $this->maker->id, 'username' => $this->user->name]);
        $this->category = Category::create(['name' => 'Beverages', 'username' => $this->user->name, 'view_order' => 1, 'status' => 1]);
    }

    public function test_can_store_product(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('products.store'), [
                'product_title' => 'New Product',
                'product_code' => 'P12345',
                'product_price' => 12.50,
                'product_stock' => 50,
                'product_status' => '1',
                'category_id' => $this->category->id,
                'size_id' => $this->size->id,
                'unit_id' => $this->unit->id,
                'maker_id' => $this->maker->id,
                'brand_id' => $this->brand->id,
                'product_description' => 'Test description',
                'user_id' => $this->user->id,
                'images' => [
                    \Illuminate\Http\UploadedFile::fake()->create('product1.jpg', 100, 'image/jpeg')
                ]
            ]);

        $response->assertStatus(302); // Redirect back
        $this->assertDatabaseHas('products', [
            'product_title' => 'New Product',
            'product_code' => 'P12345',
        ]);
    }

    public function test_store_fails_when_images_contains_empty_string(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('products.store'), [
                'product_title' => 'New Product Empty Image',
                'product_code' => 'P12345-empty-image',
                'product_price' => 12.50,
                'product_stock' => 50,
                'product_status' => '1',
                'category_id' => $this->category->id,
                'size_id' => $this->size->id,
                'unit_id' => $this->unit->id,
                'maker_id' => $this->maker->id,
                'brand_id' => $this->brand->id,
                'product_description' => 'Test description',
                'user_id' => $this->user->id,
                'images' => ['']
            ]);

        $response->assertStatus(302); // Redirect back
        $this->assertDatabaseHas('products', [
            'product_title' => 'New Product Empty Image',
            'product_code' => 'P12345-empty-image',
        ]);
    }

    public function test_can_update_product(): void
    {
        $product = Product::create([
            'size_id' => $this->size->id,
            'unit_id' => $this->unit->id,
            'maker_id' => $this->maker->id,
            'brand_id' => $this->brand->id,
            'category_id' => $this->category->id,
            'product_code' => 'P9999',
            'product_title' => 'Old Product',
            'product_price' => 10.00,
            'product_stock' => 20,
            'product_status' => 1,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->patch(route('products.update', $product->id), [
                'product_title' => 'Updated Product',
                'product_code' => 'P9999-new',
                'product_price' => 15.00,
                'product_stock' => 30,
                'product_status' => '1',
                'category_id' => $this->category->id,
                'size_id' => $this->size->id,
                'unit_id' => $this->unit->id,
                'maker_id' => $this->maker->id,
                'brand_id' => $this->brand->id,
                'product_description' => 'Updated description',
                'user_id' => $this->user->id,
            ]);

        $response->assertStatus(302); // Redirect back
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'product_title' => 'Updated Product',
            'product_code' => 'P9999-new',
        ]);
    }
}
