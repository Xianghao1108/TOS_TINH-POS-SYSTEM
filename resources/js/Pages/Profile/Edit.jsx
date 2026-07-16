import Breadcrumb from '@/Components/Breadcrumb';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const headWeb = 'My Profile';
    const linksBreadcrumb = [
        { title: 'Home', url: '/' },
        { title: 'Profile', url: '' }
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title="Profile" />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-6">
                        
                        {/* Profile Info Card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                        <i className="fas fa-user-circle text-lg"></i>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Profile Information</h2>
                                        <p className="mt-0.5 text-xs text-slate-500">Update your account's profile information and email address.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 sm:p-8">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        </div>

                        {/* Password Card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                        <i className="fas fa-key text-lg"></i>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Update Password</h2>
                                        <p className="mt-0.5 text-xs text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 sm:p-8">
                                <UpdatePasswordForm />
                            </div>
                        </div>

                        {/* Delete User Card */}
                        <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
                            <div className="border-b border-rose-100 bg-rose-50/20 px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                                        <i className="fas fa-exclamation-triangle text-lg"></i>
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-rose-955 leading-tight">Delete Account</h2>
                                        <p className="mt-0.5 text-xs text-rose-600/80">Once your account is deleted, all of its resources and data will be permanently deleted.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 sm:p-8">
                                <DeleteUserForm />
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
