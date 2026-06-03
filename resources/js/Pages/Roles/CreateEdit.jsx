import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect } from "react";

export default function RoleCreateEdit({ role, permissions }) {
    const isEditing = Boolean(role?.id);
    const { data, setData, post, patch, errors, reset, processing } =
        useForm({
            name: role?.name || '',
            permissions: [],
        });

    useEffect(() => {
        if (role !== undefined) {
            const permIds = role.permissions.map(p => p.id);
            setData('permissions', permIds);
        }
    }, [role]);

    const handleSelectPermission = (e) => {
        const id = parseInt(e.target.value);
        if (e.target.checked) {
            if (!data.permissions.includes(id)) {
                setData('permissions', [...data.permissions, id]);
            }
        } else {
            setData('permissions', data.permissions.filter(p => p !== id));
        }
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

    const inputClass = (hasError) =>
        `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            hasError
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
        }`;

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        
                        {/* Header Block */}
                        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <Link
                                    href={route('roles.index')}
                                    className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                                >
                                    <i className="fas fa-arrow-left text-xs"></i>
                                    <span>Back to roles list</span>
                                </Link>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                                    {headWeb}
                                </h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Configure role security settings and access permissions.
                                </p>
                            </div>
                        </div>

                        {/* Form Card */}
                        <form
                            onSubmit={submit}
                            className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                            noValidate
                        >
                            {/* Card Header */}
                            <div className="border-b border-emerald-50 px-6 py-5 sm:px-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                        <i className="fas fa-user-shield text-lg"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-950">Role details</h2>
                                        <p className="mt-1 text-sm text-slate-500">Set the display name and assign permissions.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="space-y-6 px-6 py-6 sm:px-8">
                                
                                {/* Title Field */}
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
                                        className={inputClass(errors.name)}
                                        placeholder="E.g., Cashier, Supervisor"
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                {/* Permissions Grid Section */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                                        System Permissions <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {permissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="relative flex items-start p-4 rounded-xl border border-emerald-50 bg-[#F4F9F6]/30 hover:bg-[#F2F9F5] transition duration-200"
                                            >
                                                <div className="flex h-6 items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="permissions"
                                                        value={permission.id}
                                                        id={`perm-${permission.id}`}
                                                        onChange={handleSelectPermission}
                                                        checked={data.permissions.includes(permission.id)}
                                                        className="h-4.5 w-4.5 rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm leading-6">
                                                    <label
                                                        htmlFor={`perm-${permission.id}`}
                                                        className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                                                    >
                                                        {permission.name}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <InputError className="mt-2" message={errors.permissions} />
                                </div>

                            </div>

                            {/* Card Footer */}
                            <div className="border-t border-emerald-50 bg-slate-50/50 px-6 py-4 flex justify-end gap-3 sm:px-8">
                                <Link
                                    href={route('roles.index')}
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    disabled={processing}
                                    type="submit"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
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
