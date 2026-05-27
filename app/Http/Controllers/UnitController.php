<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitController extends Controller
{
    /**
     * listUnit & searchUnit
     */
    public function index(Request $request)
    {
        $query = Unit::query();

        // searchUnit logic
        if ($request->has('search') && $request->search != '') {
            $query->where('unit_title', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('Units/Index', [
            'units' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only('search')
        ]);
    }

    /**
     * addUnit
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_title' => 'required|string|max:255|unique:units,unit_title',
            'username' => 'required|string|max:255'
        ]);

        Unit::create($validated);

        return redirect()->back()->with('success', 'Unit added successfully.');
    }

    /**
     * UpdateUnit / editUnit
     */
    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            // Ignore current unit ID to avoid unique validation errors on itself
            'unit_title' => 'required|string|max:255|unique:units,unit_title,' . $unit->id,
            'username' => 'required|string|max:255'
        ]);

        $unit->update($validated);

        return redirect()->back()->with('success', 'Unit updated successfully.');
    }

    /**
     * DeleteUnit
     */
    public function destroy(Unit $unit)
    {
        $unit->delete();

        return redirect()->back()->with('success', 'Unit deleted successfully.');
    }

    /**
     * checkExistUnit
     * Useful for an API/Axios call from React to validate before form submission
     */
    public function checkExistUnit(Request $request)
    {
        $exists = Unit::where('unit_title', $request->unit_title)->exists();
        
        return response()->json(['exists' => $exists]);
    }
}
