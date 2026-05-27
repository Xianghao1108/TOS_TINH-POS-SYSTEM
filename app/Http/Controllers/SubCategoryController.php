<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubCategory;
use App\Models\Category;
use Inertia\Inertia;

class SubCategoryController extends Controller
{
    //
    public function index(){
        return Inertia::render('SubCategories/Index',[
            'subCategories'=> SubCategory::with('category')->get(),
            'categories'=> Category::all()
        ]);
    }
    public function store(Request $request)
    {
        // 1. Validate the incoming data from your React form
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'username'    => 'required|string|max:255',
        ]);

        // 2. Add system data (who created it, and set it to active)
        $validated['status']  = 1;            // 1 = Active

        /* * IMPORTANT NOTE: 
         * Earlier, your UML diagram called the column `sub_category_title`. 
         * If your database uses `sub_category_title` but your React form sends `name`, 
         * you must map it like this before saving:
         * * $validated['sub_category_title'] = $validated['name'];
         * unset($validated['name']);
         */

        // 3. Save to the database
        SubCategory::create($validated);

        // 4. Redirect back to the page (Inertia handles this smoothly without refreshing)
        return redirect()->route('sub-categories.index')
            ->with('message', 'Sub Category added successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'username'    => 'required|string|max:255',
        ]);

        $subCategory = SubCategory::findOrFail($id);
        $subCategory->update($validated);

        return redirect()->route('sub-categories.index')
            ->with('message', 'Sub Category updated successfully!');
    }

    public function destroy($id)
    {
        $subCategory = SubCategory::findOrFail($id);
        $subCategory->delete();

        return redirect()->route('sub-categories.index')
            ->with('message', 'Sub Category deleted successfully!');
    }
}
