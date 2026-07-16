import React, { useEffect, useState } from 'react';
import 'admin-lte/dist/js/adminlte.min.js';
import MenuSideBar from './MenuSideBar';

import $ from 'jquery';
import { Link, usePage } from '@inertiajs/react';

const AdminLayout = ({breadcrumb, children, hideHeader = false }) => {
    const { auth } = usePage().props;
    const user = auth.user;
    const showStreamlined = auth.roles?.includes('Staff') || auth.roles?.includes('User') || auth.roles?.includes('Cashier');
    const roleName = auth.roles?.[0] || 'User';
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        // Ensure dropdowns, tooltips, and modals work
        $('[data-toggle="dropdown"]').dropdown();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-dropdown-container')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const renderTopHeader = () => (
        <nav className="w-full bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-sm shrink-0">
            {/* Left side: branding/logo linking to orders/POS index */}
            <Link href={route('orders.index')} className="flex items-center gap-3 hover:opacity-90 transition select-none">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#00A86B] text-white shadow-sm shadow-emerald-200">
                    <i className="fas fa-cash-register text-sm"></i>
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-md font-extrabold text-slate-900 tracking-tight leading-none">TOS TINH</span>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-1">POS Terminal</span>
                </div>
            </Link>

            {/* Right side: profile dropdown */}
            <div className="relative profile-dropdown-container">
                <button
                    onClick={toggleDropdown}
                    type="button"
                    className="flex items-center gap-3 cursor-pointer border-0 bg-transparent focus:outline-none"
                >
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-sm">
                        {user?.name?.substring(0, 2) || 'US'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                        <span className="text-sm font-bold text-slate-800 leading-none">{user?.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">{roleName}</span>
                    </div>
                    <i className={`fas fa-chevron-down text-xs text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition font-medium"
                            onClick={() => setDropdownOpen(false)}
                        >
                            <i className="fas fa-user-circle text-slate-400 text-base"></i>
                            View/Edit Profile
                        </Link>
                        <div className="border-t border-slate-100 my-1"></div>
                        <Link
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50/50 transition font-bold w-full text-left border-0 bg-transparent cursor-pointer"
                            method="post"
                            href={route('logout')}
                            as="button"
                            onClick={() => setDropdownOpen(false)}
                        >
                            <i className="fas fa-sign-out-alt text-rose-400 text-base"></i>
                            Log Out
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );

    return (
        <div className="flex h-screen overflow-hidden">
            {!showStreamlined && <MenuSideBar />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#F4F9F6]">
                {/* Navbar for Admin */}
                {!showStreamlined && !hideHeader && (
                    <nav className="main-header flex items-center justify-end px-6 py-3 bg-white border-b border-gray-200" style={{ marginLeft: 0 }}>
                        <div className="flex items-center gap-6">
                            {/* User Profile */}
                            <div className="flex items-center gap-3 cursor-pointer relative" data-toggle="dropdown">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                                    {user?.name?.substring(0, 2) || 'US'}
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</span>
                                    <span className="text-[10px] text-gray-500 mt-1">{roleName}</span>
                                </div>
                            </div>
                            <div className="dropdown-menu dropdown-menu-right mt-2 shadow-lg border-0 rounded-lg">
                                <Link href={route('profile.edit')} className="dropdown-item py-2 px-4 hover:bg-gray-50">Profile</Link>
                                <div className="dropdown-divider my-1"></div>
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

                {/* Navbar for non-Admin */}
                {showStreamlined && renderTopHeader()}

                {/* Content Wrapper */}
                <div className="content-wrapper flex-1" style={{ marginLeft: 0, backgroundColor: 'transparent' }}>
                    {!showStreamlined && breadcrumb && breadcrumb}
                    <section className="content">{children}</section>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
