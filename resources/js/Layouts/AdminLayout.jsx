import React, { useEffect } from 'react';
import 'admin-lte/dist/js/adminlte.min.js';
import MenuSideBar from './MenuSideBar';

import $ from 'jquery';
import { Link, usePage } from '@inertiajs/react';

const AdminLayout = ({breadcrumb, children, hideHeader = false }) => {
    const { auth } = usePage().props;
    const user = auth.user;
    const isStaff = auth.roles?.includes('Staff');
    const roleName = auth.roles?.[0] || 'User';

    useEffect(() => {
        // Ensure dropdowns, tooltips, and modals work
        $('[data-toggle="dropdown"]').dropdown();
    }, []);
    
    return (
        <div className="flex h-screen overflow-hidden">
            {!isStaff && <MenuSideBar />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#F4F9F6]">
                {/* Navbar */}
                {!hideHeader && (
                    <nav className="main-header flex items-center justify-end px-6 py-3 bg-white border-b border-gray-200" style={{ marginLeft: 0 }}>
                        <div className="flex items-center gap-6">


                            {/* User Profile */}
                            <div className="flex items-center gap-3 cursor-pointer relative" data-toggle="dropdown">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                    {user?.name?.substring(0, 2) || 'US'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</span>
                                    <span className="text-[10px] text-gray-500 mt-1">{roleName}</span>
                                </div>
                            </div>
                            <div className="dropdown-menu dropdown-menu-right mt-2 shadow-lg border-0 rounded-lg">
                                {!isStaff && (
                                    <>
                                        <Link href={route('profile.edit')} className="dropdown-item py-2 px-4 hover:bg-gray-50">Profile</Link>
                                        <div className="dropdown-divider my-1"></div>
                                    </>
                                )}
                                <Link
                                    className="dropdown-item py-2 px-4 hover:bg-gray-50 text-red-600"
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    Logout
                                </Link>
                            </div>
                        </div>
                    </nav>
                )}

                {/* Content Wrapper */}
                <div className="content-wrapper flex-1" style={{ marginLeft: 0, backgroundColor: 'transparent' }}>
                    {breadcrumb && breadcrumb}
                    <section className="content">{children}</section>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
