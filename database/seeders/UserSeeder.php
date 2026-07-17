<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- Admin Role: all permissions ---
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $allPermissions = Permission::pluck('id', 'id')->all();
        $adminRole->syncPermissions($allPermissions);

        $adminUser = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'admin',
                'password' => Hash::make('123456'),
            ]
        );
        $adminUser->syncRoles([$adminRole->id]);

        $seanghavtounUser = User::firstOrCreate(
            ['email' => 'seanghavtoun@gmail.com'],
            [
                'name' => 'seanghavtoun',
                'password' => Hash::make('123456'),
            ]
        );
        $seanghavtounUser->syncRoles([$adminRole->id]);

        // --- Staff Role: POS + product/category/inventory/orders/invoices management ---
        $staffRole = Role::firstOrCreate(['name' => 'Staff']);
        $staffPermissions = Permission::whereIn('name', [
            'page.orders', 'page.products', 'page.categories', 'page.invoices', 'page.customers', 'page.inventory',
            'order.view', 'order.create', 'order.cancel', 'order.refund',
            'product.view', 'product.create', 'product.edit', 'product.delete',
            'category.view', 'category.create', 'category.edit', 'category.delete',
            'inventory.view', 'inventory.stock-in', 'inventory.stock-out', 'inventory.adjust',
            'invoice.view', 'invoice.print', 'invoice.download',
            'customer.view', 'customer.create', 'customer.edit', 'customer.delete',
        ])->pluck('id', 'id')->all();
        $staffRole->syncPermissions($staffPermissions);

        $staffUser = User::firstOrCreate(
            ['email' => 'staff@gmail.com'],
            [
                'name' => 'staff',
                'password' => Hash::make('123456'),
            ]
        );
        $staffUser->syncRoles([$staffRole->id]);

        // --- User Role: POS / orders access only (for walk-in / Google sign-in users) ---
        $userRole = Role::firstOrCreate(['name' => 'User']);
        $userPermissions = Permission::whereIn('name', [
            'page.orders',
            'order.view',
            'order.create',
        ])->pluck('id', 'id')->all();
        $userRole->syncPermissions($userPermissions);
    }
}
