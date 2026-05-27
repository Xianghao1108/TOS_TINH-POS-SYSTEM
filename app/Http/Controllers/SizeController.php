<?php

namespace App\Http\Controllers;

use App\Models\Size;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SizeController extends Controller
{
    /**
     * List and Search Sizes
     */
    public function index(Request $request)
    {
        $query = Size::query();

        if ($request->has('search') && $request->search != '') {
            $query->where('size_title', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('Size/Index', [
            'sizes' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only('search')
        ]);
    }

    /**
     * Add Size
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'size_title' => 'required|string|max:255|unique:sizes,size_title',
            'username' => 'required|string|max:255'
        ]);

        Size::create($validated);

        return redirect()->back()->with('success', 'Size added successfully.');
    }

    /**
     * Update/Edit Size
     */
    public function update(Request $request, Size $size)
    {
        $validated = $request->validate([
            'size_title' => 'required|string|max:255|unique:sizes,size_title,' . $size->id,
            'username' => 'required|string|max:255'
        ]);

        $size->update($validated);

        return redirect()->back()->with('success', 'Size updated successfully.');
    }

    /**
     * Delete Size
     */
    public function destroy(Size $size)
    {
        $size->delete();

        return redirect()->back()->with('success', 'Size deleted successfully.');
    }

    /**
     * Check if Size exists (API for React live validation)
     */
    public function checkExistSize(Request $request)
    {
        $exists = Size::where('size_title', $request->size_title)->exists();
        
        return response()->json(['exists' => $exists]);
    }
}
