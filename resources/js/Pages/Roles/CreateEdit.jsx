import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useState, useMemo } from "react";

const MODULES_CONFIG = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        icon: 'fas fa-th-large text-blue-500',
        pagePermission: 'page.dashboard',
        actions: []
    },
    {
        id: 'products',
        name: 'Products',
        icon: 'fas fa-box text-emerald-500',
        pagePermission: 'page.products',
        actions: [
            { name: 'product.view', label: 'View Products' },
            { name: 'product.create', label: 'Create Products' },
            { name: 'product.edit', label: 'Edit Products' },
            { name: 'product.delete', label: 'Delete Products' }
        ]
    },
    {
        id: 'categories',
        name: 'Categories',
        icon: 'fa-solid fa-layer-group text-yellow-500',
        pagePermission: 'page.categories',
        actions: [
            { name: 'category.view', label: 'View Categories' },
            { name: 'category.create', label: 'Create Categories' },
            { name: 'category.edit', label: 'Edit Categories' },
            { name: 'category.delete', label: 'Delete Categories' }
        ]
    },
    {
        id: 'inventory',
        name: 'Inventory',
        icon: 'fas fa-warehouse text-purple-500',
        pagePermission: 'page.inventory',
        actions: [
            { name: 'inventory.view', label: 'View Inventory' },
            { name: 'inventory.stock-in', label: 'Stock In' },
            { name: 'inventory.stock-out', label: 'Stock Out' },
            { name: 'inventory.adjust', label: 'Adjust Stock' }
        ]
    },
    {
        id: 'orders',
        name: 'Orders',
        icon: 'fas fa-shopping-cart text-rose-500',
        pagePermission: 'page.orders',
        actions: [
            { name: 'order.view', label: 'View Orders' },
            { name: 'order.create', label: 'Create Order' },
            { name: 'order.cancel', label: 'Cancel Order' },
            { name: 'order.refund', label: 'Refund Order' }
        ]
    },
    {
        id: 'invoices',
        name: 'Invoices',
        icon: 'fas fa-file-invoice-dollar text-cyan-500',
        pagePermission: 'page.invoices',
        actions: [
            { name: 'invoice.view', label: 'View Invoices' },
            { name: 'invoice.print', label: 'Print Invoice' },
            { name: 'invoice.download', label: 'Download Invoice' }
        ]
    },
    {
        id: 'customers',
        name: 'Customers',
        icon: 'fas fa-user-tag text-teal-500',
        pagePermission: 'page.customers',
        actions: [
            { name: 'customer.view', label: 'View Customers' },
            { name: 'customer.create', label: 'Create Customer' },
            { name: 'customer.edit', label: 'Edit Customer' },
            { name: 'customer.delete', label: 'Delete Customer' }
        ]
    },
    {
        id: 'suppliers',
        name: 'Suppliers',
        icon: 'fas fa-truck text-orange-500',
        pagePermission: 'page.suppliers',
        actions: []
    },
    {
        id: 'reports',
        name: 'Reports',
        icon: 'fas fa-chart-line text-indigo-500',
        pagePermission: 'page.reports',
        actions: [
            { name: 'report.daily', label: 'Daily Report' },
            { name: 'report.monthly', label: 'Monthly Report' },
            { name: 'report.export', label: 'Export Reports' }
        ]
    },
    {
        id: 'users',
        name: 'Users',
        icon: 'fas fa-user-shield text-slate-500',
        pagePermission: 'page.users',
        actions: [
            { name: 'user.view', label: 'View Users' },
            { name: 'user.create', label: 'Create User' },
            { name: 'user.edit', label: 'Edit User' },
            { name: 'user.delete', label: 'Delete User' }
        ]
    },
    {
        id: 'roles',
        name: 'Roles & Permissions',
        icon: 'fas fa-users-cog text-pink-500',
        pagePermission: 'page.roles',
        actions: [
            { name: 'role.view', label: 'View Roles' },
            { name: 'role.create', label: 'Create Role' },
            { name: 'role.edit', label: 'Edit Role' },
            { name: 'role.delete', label: 'Delete Role' }
        ]
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: 'fas fa-cog text-gray-500',
        pagePermission: 'page.settings',
        actions: [
            { name: 'setting.view', label: 'View Settings' },
            { name: 'setting.update', label: 'Update Settings' }
        ]
    }
];

export default function RoleCreateEdit({ role, permissions }) {
    const isEditing = Boolean(role?.id);
    const { data, setData, post, patch, errors, reset, processing } =
        useForm({
            name: role?.name || '',
            permissions: [],
        });

    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedModules, setCollapsedModules] = useState({});

    // Create lookup helper maps
    const permissionNameToIdMap = useMemo(() => {
        return permissions.reduce((acc, p) => ({ ...acc, [p.name]: p.id }), {});
    }, [permissions]);

    const permissionIdToNameMap = useMemo(() => {
        return permissions.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
    }, [permissions]);

    // Map initial role permissions to state
    useEffect(() => {
        if (role !== undefined) {
            const permIds = role.permissions.map(p => p.id);
            setData('permissions', permIds);
        }
    }, [role]);

    // Filter modules based on search query
    const filteredModules = useMemo(() => {
        if (!searchQuery.trim()) return MODULES_CONFIG;
        const q = searchQuery.toLowerCase();
        return MODULES_CONFIG.filter(mod => {
            if (mod.name.toLowerCase().includes(q)) return true;
            if (mod.pagePermission.toLowerCase().includes(q)) return true;
            return mod.actions.some(act => 
                act.name.toLowerCase().includes(q) || 
                act.label.toLowerCase().includes(q)
            );
        });
    }, [searchQuery]);

    // Check if a specific permission ID is active
    const isPermissionChecked = (permissionName) => {
        const id = permissionNameToIdMap[permissionName];
        return id ? data.permissions.includes(id) : false;
    };

    // Toggle a permission in state
    const handlePermissionToggle = (permissionName, isPagePermission = false) => {
        const id = permissionNameToIdMap[permissionName];
        if (!id) return;

        let newPermissions = [...data.permissions];
        const isCurrentlyChecked = newPermissions.includes(id);

        if (isCurrentlyChecked) {
            // Unchecking
            newPermissions = newPermissions.filter(pId => pId !== id);

            // If it is a page permission, uncheck all action permissions inside this module
            if (isPagePermission) {
                const module = MODULES_CONFIG.find(m => m.pagePermission === permissionName);
                if (module) {
                    const actionIds = module.actions
                        .map(act => permissionNameToIdMap[act.name])
                        .filter(Boolean);
                    newPermissions = newPermissions.filter(pId => !actionIds.includes(pId));
                }
            }
        } else {
            // Checking
            newPermissions.push(id);
        }

        setData('permissions', newPermissions);
    };

    // Select all permissions for a single module (both page and all actions)
    const handleSelectAllModuleActions = (module) => {
        let newPermissions = [...data.permissions];
        
        // Ensure page permission is added
        const pagePermId = permissionNameToIdMap[module.pagePermission];
        if (pagePermId && !newPermissions.includes(pagePermId)) {
            newPermissions.push(pagePermId);
        }

        // Ensure all actions are added
        module.actions.forEach(act => {
            const actId = permissionNameToIdMap[act.name];
            if (actId && !newPermissions.includes(actId)) {
                newPermissions.push(actId);
            }
        });

        setData('permissions', newPermissions);
    };

    // Deselect all permissions for a single module
    const handleDeselectAllModuleActions = (module) => {
        let newPermissions = [...data.permissions];

        const targetIds = [
            permissionNameToIdMap[module.pagePermission],
            ...module.actions.map(act => permissionNameToIdMap[act.name])
        ].filter(Boolean);

        newPermissions = newPermissions.filter(pId => !targetIds.includes(pId));
        setData('permissions', newPermissions);
    };

    // Global Select All
    const handleSelectAllGlobal = () => {
        const allIds = permissions.map(p => p.id);
        setData('permissions', allIds);
    };

    // Global Deselect All
    const handleDeselectAllGlobal = () => {
        setData('permissions', []);
    };

    // Toggle collapse state for a specific module
    const toggleCollapse = (moduleId) => {
        setCollapsedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    // Global Collapse/Expand
    const handleCollapseAll = () => {
        const collapsed = {};
        MODULES_CONFIG.forEach(m => collapsed[m.id] = true);
        setCollapsedModules(collapsed);
    };

    const handleExpandAll = () => {
        setCollapsedModules({});
    };

    const submit = (e) => {
        e.preventDefault();
        if (!isEditing) {
            post(route('roles.store'), {
                preserveState: true,
                onSuccess: () => reset(),
            });
        } else {
            patch(route('roles.update', role.id), {
                preserveState: true,
            });
        }
    };

    const headWeb = isEditing ? 'Edit Role' : 'Create Role';
    const linksBreadcrumb = [
        { title: 'Home', url: '/' },
        { title: 'Roles & Permissions', url: route('roles.index') },
        { title: headWeb, url: '' }
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8 pb-24">
                    <div className="mx-auto max-w-6xl">
                        
                        {/* Header Block */}
                        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <Link
                                    href={route('roles.index')}
                                    className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-950"
                                >
                                    <i className="fas fa-arrow-left text-xs"></i>
                                    <span>Back to roles list</span>
                                </Link>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-900 sm:text-4xl">
                                    {headWeb}
                                </h1>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    Configure role security settings and assign page-level and action-level permissions.
                                </p>
                            </div>

                            {/* Badge with selected count */}
                            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 border border-emerald-100 self-start sm:self-auto">
                                <i className="fas fa-key text-emerald-500"></i>
                                <span>{data.permissions.length} / {permissions.length} Permissions Active</span>
                            </div>
                        </div>

                        {/* Form Card */}
                        <form onSubmit={submit} noValidate>
                            {/* Card Details */}
                            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm mb-6">
                                <div className="border-b border-slate-100 px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                            <i className="fas fa-user-shield text-lg"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Role Details</h2>
                                            <p className="mt-0.5 text-xs text-slate-500">Set the display name for the role.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
                                            Role Title <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            id="title"
                                            name="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                                errors.name
                                                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                                                    : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                                            }`}
                                            placeholder="E.g., Manager, Supervisor, Cashier"
                                            required
                                        />
                                        <InputError className="mt-2" message={errors.name} />
                                    </div>
                                </div>
                            </div>

                            {/* Toolbar (Search & Collapse & Select All) */}
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <i className="fas fa-search text-sm"></i>
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search permissions or modules..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:border-emerald-400 focus:bg-white"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={handleSelectAllGlobal}
                                        className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeselectAllGlobal}
                                        className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                                    >
                                        Deselect All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExpandAll}
                                        className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                                    >
                                        Expand All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCollapseAll}
                                        className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
                                    >
                                        Collapse All
                                    </button>
                                </div>
                            </div>

                            {/* Permission Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredModules.map((module) => {
                                    const isPageActive = isPermissionChecked(module.pagePermission);
                                    const isCollapsed = collapsedModules[module.id];
                                    
                                    // Calculate module status details
                                    const totalActions = module.actions.length;
                                    const selectedActionsCount = module.actions.filter(act => isPermissionChecked(act.name)).length;

                                    return (
                                        <div
                                            key={module.id}
                                            className={`rounded-xl border bg-white transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.005] hover:border-slate-200 ${
                                                isPageActive ? 'border-emerald-100 ring-1 ring-emerald-50' : 'border-slate-100'
                                            }`}
                                        >
                                            {/* Card Header */}
                                            <div className="flex items-center justify-between border-b border-slate-50 px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 shrink-0">
                                                        <i className={`${module.icon} text-xs`}></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{module.name}</h3>
                                                        {totalActions > 0 && isPageActive && (
                                                            <p className="text-[9px] font-semibold text-emerald-600 mt-0.5">
                                                                {selectedActionsCount}/{totalActions} active
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    {totalActions > 0 && isPageActive && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSelectAllModuleActions(module)}
                                                                className="text-[9px] text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold transition"
                                                            >
                                                                All
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeselectAllModuleActions(module)}
                                                                className="text-[9px] text-slate-500 hover:text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded font-bold transition"
                                                            >
                                                                Clear
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCollapse(module.id)}
                                                        className="text-slate-400 hover:text-slate-600 p-0.5 transition"
                                                    >
                                                        <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'} text-[10px]`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            {!isCollapsed && (
                                                <div className="p-3.5">
                                                    {/* Level 1: Page Access */}
                                                    <div className="relative flex items-center p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition duration-150">
                                                        <div className="flex h-4 items-center">
                                                            <input
                                                                type="checkbox"
                                                                id={`perm-page-${module.id}`}
                                                                checked={isPageActive}
                                                                onChange={() => handlePermissionToggle(module.pagePermission, true)}
                                                                className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                            />
                                                        </div>
                                                        <div className="ml-2.5 text-xs leading-5">
                                                            <label
                                                                htmlFor={`perm-page-${module.id}`}
                                                                className="font-bold text-slate-800 hover:text-slate-900 cursor-pointer select-none text-[11px]"
                                                            >
                                                                Access Page
                                                            </label>
                                                            <span className="block text-[8px] text-slate-400 leading-none">
                                                                {module.pagePermission}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Level 2: Action Permissions */}
                                                    {module.actions.length > 0 && (
                                                        <div className="mt-2.5 pt-2.5 border-t border-slate-50">
                                                            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Actions</h4>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {module.actions.map((act) => {
                                                                    const isActChecked = isPermissionChecked(act.name);
                                                                    return (
                                                                        <div
                                                                            key={act.name}
                                                                            className={`relative flex items-center p-1.5 rounded-md border transition duration-150 ${
                                                                                !isPageActive 
                                                                                    ? 'opacity-40 border-slate-100 bg-slate-50/20 cursor-not-allowed' 
                                                                                    : isActChecked 
                                                                                        ? 'border-emerald-100 bg-emerald-50/20' 
                                                                                        : 'border-slate-50 bg-white hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            <div className="flex h-4 items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`perm-act-${act.name}`}
                                                                                    checked={isActChecked}
                                                                                    disabled={!isPageActive}
                                                                                    onChange={() => handlePermissionToggle(act.name, false)}
                                                                                    className="h-3 w-3 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                                                                                />
                                                                            </div>
                                                                            <div className="ml-2 text-[10px] leading-none shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                                                                <label
                                                                                    htmlFor={`perm-act-${act.name}`}
                                                                                    className={`font-semibold text-slate-700 select-none ${
                                                                                        isPageActive ? 'cursor-pointer hover:text-slate-900' : 'cursor-not-allowed text-slate-400'
                                                                                    }`}
                                                                                    title={act.label}
                                                                                >
                                                                                    {act.label}
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {filteredModules.length === 0 && (
                                    <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3">
                                            <i className="fas fa-search text-lg"></i>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">No permissions found</h3>
                                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search query.</p>
                                    </div>
                                )}
                            </div>

                            {/* Sticky Footer Save Button */}
                            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] flex justify-end gap-3 max-w-6xl mx-auto rounded-t-2xl">
                                <Link
                                    href={route('roles.index')}
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    disabled={processing}
                                    type="submit"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-6 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                                    {isEditing ? 'Update Role' : 'Save Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
