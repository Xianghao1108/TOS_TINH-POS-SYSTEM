<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;

class RolesController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::latest();

        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $roles = $query->paginate(10)->appends(request()->query());

        return Inertia::render('Roles/Index', [
            'roles' => $roles
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();

        return Inertia::render('Roles/CreateEdit', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
           'name' => 'required|min:3|unique:roles,name',
           'permissions' => 'nullable|array',
           'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $role = Role::create(['name' => $validated['name']]);

        if (!empty($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->pluck('name');
            $role->syncPermissions($permissions);
        }

        return to_route('roles.index')->with("success", "Role added successfully");
    }

    public function edit($id)
    {
        $role = Role::with(['permissions'])->find($id);

        $permissions = Permission::all();

        return Inertia::render('Roles/CreateEdit', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|min:3|unique:roles,name,' . $id,
            'permissions' => 'nullable|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $role = Role::findById($id);
        $role->name = $validated['name'];
        $role->save();

        $permissions = [];
        if (!empty($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->pluck('name');
        }
        $role->syncPermissions($permissions);

        return to_route('roles.index')->with("success", "Role updated successfully");
    }

    public function destroy($id)
    {
        $role = Role::findById($id);

        $role->delete();

        return to_route('roles.index')->with("success", "Role Deleted successfully");
    }
}
