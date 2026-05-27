<?php

namespace App\Http\Controllers;

use App\Models\Maker;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MakerController extends Controller
{
    public function index(Request $request)
    {
        $query = Maker::query();

        if ($request->has('search') && $request->search != '') {
            $query->where('maker_title', 'like', '%' . $request->search . '%');
        }

        // Adjust the path below if you place the React file in an 'Inventory' subfolder
        return Inertia::render('Makers/Index', [
            'makers' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'maker_title' => 'required|string|max:255|unique:makers,maker_title',
            'username' => 'required|string|max:255'
        ]);

        Maker::create($validated);

        return redirect()->back()->with('success', 'Maker added successfully.');
    }

    public function update(Request $request, Maker $maker)
    {
        $validated = $request->validate([
            'maker_title' => 'required|string|max:255|unique:makers,maker_title,' . $maker->id,
            'username' => 'required|string|max:255'
        ]);

        $maker->update($validated);

        return redirect()->back()->with('success', 'Maker updated successfully.');
    }

    public function destroy(Maker $maker)
    {
        $maker->delete();

        return redirect()->back()->with('success', 'Maker deleted successfully.');
    }

    public function checkExistMaker(Request $request)
    {
        $exists = Maker::where('maker_title', $request->maker_title)->exists();
        
        return response()->json(['exists' => $exists]);
    }
}
