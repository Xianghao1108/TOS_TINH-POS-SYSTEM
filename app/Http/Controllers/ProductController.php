<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Category;
use App\Models\Size;
use App\Models\Unit;
use App\Models\Maker;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Eager load the new images collection alongside parameters
        $query = Product::with(['category', 'size', 'unit', 'maker', 'brand', 'images']);

        if ($request->has('search') && $request->search != '') {
            $query->where('product_title', 'like', '%' . $request->search . '%')
                  ->orWhere('product_code', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('Products/Index', [
            'products' => $query->latest()->paginate(10)->withQueryString(),
            'categories' => Category::all(),
            'sizes' => Size::all(),
            'units' => Unit::all(),
            'makers' => Maker::all(),
            'brands' => Brand::all(),
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_title' => 'required|string|max:255',
            'product_code' => 'required|string|max:255|unique:products,product_code',
            'product_price' => 'required|numeric|min:0',
            'product_stock' => 'required|integer|min:0',
            'product_status' => 'required|in:1,2',
            'category_id' => 'required|exists:categories,id',
            'size_id' => 'required|exists:sizes,id',
            'unit_id' => 'required|exists:units,id',
            'maker_id' => 'required|exists:makers,id',
            'brand_id' => 'required|exists:brands,id',
            'product_description' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048' // Validate files block
        ]);

        $product = Product::create($validated);

        // Process file storage if uploads exist
        if ($request->hasFile('images')) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete('products/' . $image->product_image_title);
                $image->delete();
            }

            foreach ($request->file('images') as $file) {
                $fileSize = $file->getSize();
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '_' . uniqid() . '.' . $extension;

                // Save image safely to storage/app/public/products
                $file->storeAs('products', $filename, 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'product_image_title' => $filename,
                    'product_image_size' => $this->formatBytes($fileSize),
                    'product_image_extension' => $extension
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product)
    {
        // Inertia multipart patch request compatibility handler
        $validated = $request->validate([
            'product_title' => 'required|string|max:255',
            'product_code' => 'required|string|max:255|unique:products,product_code,' . $product->id,
            'product_price' => 'required|numeric|min:0',
            'product_stock' => 'required|integer|min:0',
            'product_status' => 'required|in:1,2',
            'category_id' => 'required|exists:categories,id',
            'size_id' => 'required|exists:sizes,id',
            'unit_id' => 'required|exists:units,id',
            'maker_id' => 'required|exists:makers,id',
            'brand_id' => 'required|exists:brands,id',
            'product_description' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $product->update($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $fileSize = $file->getSize();
                $extension = $file->getClientOriginalExtension();
                $filename = time() . '_' . uniqid() . '.' . $extension;

                $file->storeAs('products', $filename, 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'product_image_title' => $filename,
                    'product_image_size' => $this->formatBytes($fileSize),
                    'product_image_extension' => $extension
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    // Individual file delete action handler mapping
    public function destroyImage($id)
    {
        $image = ProductImage::findOrFail($id);
        
        // Remove file from disk
        Storage::disk('public')->delete('products/' . $image->product_image_title);
        $image->delete();

        return redirect()->back()->with('success', 'Image removed.');
    }

    public function destroy(Product $product)
    {
        // Automatically drop related storage photos via cascade logic
        foreach ($product->images as $image) {
            Storage::disk('public')->delete('products/' . $image->product_image_title);
        }
        
        $product->delete();
        return redirect()->back()->with('success', 'Product deleted successfully.');
    }

    public function checkExistProduct(Request $request)
    {
        $exists = Product::where('product_code', $request->product_code)->exists();
        return response()->json(['exists' => $exists]);
    }

    private function formatBytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB');
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
