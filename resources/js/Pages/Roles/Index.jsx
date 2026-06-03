import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';

const accentStyles = [
    { tile: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    { tile: 'bg-cyan-50', icon: 'text-cyan-600', ring: 'ring-cyan-100' },
    { tile: 'bg-fuchsia-50', icon: 'text-fuchsia-600', ring: 'ring-fuchsia-100' },
    { tile: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
];

export default function UserPage({ roles }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {}; 
    const datasList = roles.data || [];
    
    const [searchQuery, setSearchQuery] = useState(new URLSearchParams(window.location.search).get('search') || '');
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    
    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, clearErrors } =
        useForm({
            id: '',
            name: ''
        });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('roles.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const confirmDataDeletion = (item) => {
        setDataEdit(item);
        setDeleteData('id', item.id);
        setDeleteData('name', item.name);
        setConfirmingDataDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        destroy(route('roles.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

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
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-users-cog text-[10px]"></i>
                                    Security panel
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">System Roles</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Define access control levels and user permission sets.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                {/* Search Form */}
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search roles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600" aria-label="Search roles">
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                {can['role-create'] !== false && (
                                    <Link href={route('roles.create')} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2">
                                        <i className="fas fa-plus text-xs"></i>
                                        Add Role
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Card & Table container */}
                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                            <div className="border-b border-emerald-50 bg-white px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">Roles List</h2>
                                        <p className="mt-1 text-sm text-slate-500">{datasList.length} roles found on this page.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-emerald-50 bg-emerald-50/60 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                            <th className="px-5 py-4">#ID</th>
                                            <th className="px-5 py-4">Role Title</th>
                                            <th className="px-5 py-4">Guard Name</th>
                                            <th className="px-5 py-4">Created At</th>
                                            {can['role-edit'] !== false && can['role-delete'] !== false && (
                                                <th className="px-5 py-4 text-right">Action</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50">
                                        {datasList.length > 0 ? (
                                            datasList.map((item, index) => {
                                                const accent = accentStyles[index % accentStyles.length];

                                                return (
                                                    <tr key={item.id} className="transition hover:bg-emerald-50/30">
                                                        <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                                                            {item.id}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                                                                    <i className="fas fa-user-shield text-sm"></i>
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-slate-800">{item.name}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-500">
                                                            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                                {item.guard_name}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-500">
                                                            {moment(item.created_at).format("DD/MM/YYYY")}
                                                        </td>
                                                        {(can['role-edit'] !== false || can['role-delete'] !== false) && (
                                                            <td className="px-5 py-4 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    {can['role-edit'] !== false && (
                                                                        <Link
                                                                            href={route('roles.edit', item.id)}
                                                                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-emerald-700"
                                                                        >
                                                                            <i className="fas fa-edit text-[10px]"></i> Edit
                                                                        </Link>
                                                                    )}
                                                                    {can['role-delete'] !== false && (
                                                                        <button
                                                                            onClick={() => confirmDataDeletion(item)}
                                                                            type="button"
                                                                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 hover:text-rose-800"
                                                                        >
                                                                            <i className="fas fa-trash text-[10px]"></i> Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-sm font-medium text-slate-500">
                                                    No roles found in database.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="border-t border-emerald-50 bg-white px-5 py-4">
                                <Pagination links={roles.links} />
                            </div>
                        </div>

                        {/* Delete confirmation modal */}
                        <Modal show={confirmingDataDeletion} onClose={closeModal}>
                            <form onSubmit={deleteDataRow} className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                                        <i className="fas fa-exclamation-triangle text-lg"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">Confirm Deletion</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Are you sure you want to delete the role <span className="font-semibold text-slate-800">{deleteData.name}</span>? This will remove all associated permission linkages.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                                    <DangerButton disabled={processing}>Delete Role</DangerButton>
                                </div>
                            </form>
                        </Modal>
                        
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
