<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Maker;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        // Start query and eager load the Maker relationship
        $query = Brand::with('maker');

        if ($request->has('search') && $request->search != '') {
            $query->where('brand_title', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('Brands/Index', [
            'brands' => $query->latest()->paginate(10)->withQueryString(),
            'makers' => Maker::all(), // Needed for the Add/Edit dropdown
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_title' => 'required|string|max:255|unique:brands,brand_title',
            'maker_id' => 'required|exists:makers,id',
            'username' => 'required|string|max:255'
        ]);

        Brand::create($validated);

        return redirect()->back()->with('success', 'Brand added successfully.');
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'brand_title' => 'required|string|max:255|unique:brands,brand_title,' . $brand->id,
            'maker_id' => 'required|exists:makers,id',
            'username' => 'required|string|max:255'
        ]);

        $brand->update($validated);

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();

        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }

    public function checkExistBrand(Request $request)
    {
        $exists = Brand::where('brand_title', $request->brand_title)->exists();
        
        return response()->json(['exists' => $exists]);
    }
}
