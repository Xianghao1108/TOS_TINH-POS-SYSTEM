import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';

// Custom Hooks and Components
import { useRoleManagement } from './hooks/useRoleManagement';
import { RoleTable } from './components/RoleTable';
import { RoleDeleteModal } from './components/RoleDeleteModal';

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
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        
                        {/* Heading Section */}
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="text-left">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-users-cog text-[10px]"></i>
                                    Security panel
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">System Roles</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Define access control levels and user permission sets.
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search roles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600 border-0 bg-transparent cursor-pointer" 
                                        aria-label="Search roles"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                {can['role-create'] !== false && (
                                    <Link 
                                        href={route('roles.create')} 
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 border-0 cursor-pointer text-center"
                                    >
                                        <i className="fas fa-plus text-xs"></i>
                                        Add Role
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Table block */}
                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                            <div className="border-b border-emerald-50 bg-white px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-slate-950">Roles List</h2>
                                        <p className="mt-1 text-sm text-slate-500">{datasList.length} roles found on this page.</p>
                                    </div>
                                </div>
                            </div>

                            <RoleTable
                                datasList={datasList}
                                can={can}
                                onDelete={confirmDataDeletion}
                            />

                            <div className="border-t border-emerald-50 bg-white px-5 py-4">
                                <Pagination links={roles.links} />
                            </div>
                        </div>

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
