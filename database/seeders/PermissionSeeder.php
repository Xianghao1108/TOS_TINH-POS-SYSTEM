<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Page Access Permissions
            'page.dashboard',
            'page.products',
            'page.categories',
            'page.inventory',
            'page.orders',
            'page.invoices',
            'page.customers',
            'page.suppliers',
            'page.reports',
            'page.users',
            'page.roles',
            'page.settings',

            // Products actions
            'product.view',
            'product.create',
            'product.edit',
            'product.delete',

            // Categories actions
            'category.view',
            'category.create',
            'category.edit',
            'category.delete',

            // Inventory actions
            'inventory.view',
            'inventory.stock-in',
            'inventory.stock-out',
            'inventory.adjust',

            // Orders actions
            'order.view',
            'order.create',
            'order.cancel',
            'order.refund',

            // Invoices actions
            'invoice.view',
            'invoice.print',
            'invoice.download',

            // Customers actions
            'customer.view',
            'customer.create',
            'customer.edit',
            'customer.delete',

            // Reports actions
            'report.daily',
            'report.monthly',
            'report.export',

            // Users actions
            'user.view',
            'user.create',
            'user.edit',
            'user.delete',

            // Roles actions
            'role.view',
            'role.create',
            'role.edit',
            'role.delete',

            // Settings actions
            'setting.view',
            'setting.update',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
