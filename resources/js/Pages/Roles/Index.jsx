import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';

// Custom Hooks and Components
import { useRoleManagement } from './hooks/useRoleManagement';
import { RoleDeleteModal } from './components/RoleDeleteModal';

const SUMMARY_MODULES = [
    { name: 'Dashboard', permission: 'page.dashboard', icon: 'fas fa-th-large text-blue-500' },
    { name: 'Products', permission: 'page.products', icon: 'fas fa-box text-emerald-500' },
    { name: 'Categories', permission: 'page.categories', icon: 'fa-solid fa-layer-group text-yellow-500' },
    { name: 'Inventory', permission: 'page.inventory', icon: 'fas fa-warehouse text-purple-500' },
    { name: 'Orders', permission: 'page.orders', icon: 'fas fa-shopping-cart text-rose-500' },
    { name: 'Invoices', permission: 'page.invoices', icon: 'fas fa-file-invoice-dollar text-cyan-500' },
    { name: 'Customers', permission: 'page.customers', icon: 'fas fa-user-tag text-teal-500' },
    { name: 'Reports', permission: 'page.reports', icon: 'fas fa-chart-line text-indigo-500' },
    { name: 'Users', permission: 'page.users', icon: 'fas fa-user-shield text-slate-500' },
    { name: 'Settings', permission: 'page.settings', icon: 'fas fa-cog text-gray-500' },
];

export default function UserPage({ roles }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {}; 
    const datasList = roles.data || [];

    const {
        searchQuery,
        setSearchQuery,
        confirmingDataDeletion,
        deleteData,
        processing,

        handleSearch,
        confirmDataDeletion,
        closeModal,
        deleteDataRow
    } = useRoleManagement();

    const headWeb = 'Roles & Permissions';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8 pb-12">
                    <div className="mx-auto max-w-7xl">
                        
                        {/* Heading Section */}
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="text-left">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#5C4033] shadow-sm">
                                    <i className="fas fa-users-cog text-[10px]"></i>
                                    Security panel
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-normal text-slate-900 sm:text-4xl">System Roles</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Define access control levels and user permission sets with a coffee brown accent.
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-amber-200 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-[#5C4033] focus:outline-none focus:ring-2 focus:ring-amber-100"
                                        placeholder="Search roles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-[#5C4033] border-0 bg-transparent cursor-pointer" 
                                        aria-label="Search roles"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                {can['role.create'] !== false && (
                                    <Link 
                                        href={route('roles.create')} 
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5C4033] px-5 text-sm font-semibold text-white shadow-sm shadow-amber-250 transition hover:bg-[#4A3228] focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 border-0 cursor-pointer text-center"
                                    >
                                        <i className="fas fa-plus text-xs"></i>
                                        Add Role
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                            {datasList.length > 0 ? (
                                datasList.map((role) => {
                                    const isSystemAdmin = role.name === 'Admin';
                                    const userCount = role.users_count ?? 0;

                                    return (
                                        <div 
                                            key={role.id} 
                                            className="overflow-hidden rounded-2xl border border-amber-100/60 bg-white shadow-sm hover:shadow-md hover:scale-[1.005] transition duration-200 flex flex-col justify-between"
                                        >
                                            {/* Top Section */}
                                            <div className="p-6 border-b border-amber-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#5C4033] ring-1 ring-amber-100">
                                                            <i className="fas fa-user-shield text-lg"></i>
                                                        </div>
                                                        <div className="text-left">
                                                            <h2 className="text-lg font-bold text-slate-900 leading-tight">{role.name}</h2>
                                                            <p className="mt-1 text-xs font-semibold text-slate-400">
                                                                {userCount} {userCount === 1 ? 'Member' : 'Members'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {can['role.edit'] !== false && (
                                                            <Link
                                                                href={route('roles.edit', role.id)}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[#5C4033]"
                                                                title="Edit Role"
                                                            >
                                                                <i className="fas fa-edit text-xs"></i>
                                                            </Link>
                                                        )}
                                                        {can['role.delete'] !== false && !isSystemAdmin && (
                                                            <button
                                                                onClick={() => confirmDataDeletion(role)}
                                                                type="button"
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
                                                                title="Delete Role"
                                                            >
                                                                <i className="fas fa-trash text-xs"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Section: Permission summary list */}
                                            <div className="p-6 bg-slate-50/50 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-left">Modules Allowed</h3>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {SUMMARY_MODULES.map((mod) => {
                                                            // Admin role gets everything automatically. Otherwise check role permissions collection.
                                                            const isAllowed = isSystemAdmin || role.permissions.some(p => p.name === mod.permission);

                                                            return (
                                                                <div 
                                                                    key={mod.name}
                                                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                                                                        isAllowed 
                                                                            ? 'bg-[#FAF7F2] text-[#5C4033] border-amber-100/60' 
                                                                            : 'bg-slate-100/50 text-slate-400 border-slate-200/40'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-1.5 truncate">
                                                                        <i className={`${mod.icon} text-[10px] shrink-0`}></i>
                                                                        <span className="truncate">{mod.name}</span>
                                                                    </div>
                                                                    {isAllowed && (
                                                                        <i className="fas fa-check-circle text-[10px] text-amber-700 shrink-0 ml-1"></i>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-amber-100/50 shadow-sm">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF7F2] text-[#5C4033] mb-3">
                                        <i className="fas fa-users text-lg"></i>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">No roles found</h3>
                                    <p className="text-xs text-slate-500 mt-1">Try adding a new system role to get started.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {roles.links && roles.links.length > 3 && (
                            <div className="flex justify-center bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                <Pagination links={roles.links} />
                            </div>
                        )}

                        {/* Delete confirmation modal */}
                        <RoleDeleteModal
                            isOpen={confirmingDataDeletion}
                            onClose={closeModal}
                            onSubmit={deleteDataRow}
                            deleteData={deleteData}
                            processing={processing}
                        />
                        
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
