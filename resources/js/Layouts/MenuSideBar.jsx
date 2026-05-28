import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function MenuSideBar() {
    const { url } = usePage();
    const [isExpanded, setIsExpanded] = useState(true);
    const [openDropdowns, setOpenDropdowns] = useState({});

    // Uniform active check helper (exact matches, sub-routes, or query strings)
    const isUrlActive = (path) => url === path || url.startsWith(path + '/') || url.startsWith(path + '?');

    const toggleDropdown = (label) => {
        if (!isExpanded) setIsExpanded(true);
        setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
    };

    // Auto-expand parent dropdown if a sub-item URL is currently active on reload
    useEffect(() => {
        menuGroups.forEach(group => {
            group.items.forEach(item => {
                if (item.isDropdown && item.subItems.some(sub => isUrlActive(sub.path))) {
                    setOpenDropdowns(prev => ({ ...prev, [item.text]: true }));
                }
            });
        });
    }, [url]);

    const menuGroups = [
        {
            label: 'Main',
            items: [
                { path: '/dashboard', icon: 'fas fa-th-large', text: 'Dashboard' },
                { path: '/orders', icon: 'fas fa-shopping-cart', text: 'Orders' },
            ]
        },
        {
            label: 'Management',
            items: [
                { path: '/products', icon: 'fas fa-box', text: 'Products' },
                {
                    icon: 'fa-solid fa-layer-group',
                    text: 'Categories',
                    isDropdown: true,
                    subItems: [
                        { path: '/categories', text: 'Main Categories' },
                        { path: '/sub-categories', text: 'Sub Categories' },
                        { path: '/units', text: 'Units' },
                        { path: '/sizes', text: 'Sizes' },
                        { path: '/makers', text: 'Maker' },
                        { path: '/brands', text: 'Brand' },
                    ]
                },
            ]
        },
        {
            label: 'Operation',
            items: [
                { path: '/invoices', icon: 'fas fa-file-invoice-dollar', text: 'Invoices' },
                { path: '/customers', icon: 'fas fa-user-tag', text: 'Customers' },
            ]
        },
        {
            label: 'System',
            items: [
                { path: '/users', icon: 'fas fa-user-shield', text: 'User List' },
                { path: '/roles', icon: 'fas fa-users-cog', text: 'Roles & Permissions' },
                { path: '/settings', icon: 'fas fa-cog', text: 'Settings' },
            ]
        }
    ];

    return (
        <aside
            className="minimart-sidebar transition-all duration-300 ease-in-out relative flex flex-col z-20 whitespace-nowrap overflow-hidden bg-white border-r border-gray-200"
            style={{ width: isExpanded ? '280px' : '80px' }}
        >
            {/* Header section */}
            <div className="sidebar-header flex flex-col transition-all duration-300 ease-in-out" style={{ padding: isExpanded ? '30px 25px 20px' : '20px 10px', alignItems: 'center' }}>
                <div className={`w-full flex ${isExpanded ? 'justify-between' : 'justify-center'} items-center mb-4 transition-all duration-300`}>
                    {isExpanded && <span className="text-gray-400 font-semibold text-xs tracking-wider uppercase">Menu</span>}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700 transition-colors outline-none focus:outline-none flex items-center justify-center p-1 rounded hover:bg-gray-100"
                    >
                        <i className="fas fa-bars text-xl"></i>
                    </button>
                </div>

                <img
                    src="/images/TOS TINH NOBG.png"
                    alt="Logo"
                    className="brand-logo transition-all duration-300 ease-in-out"
                    style={{ width: isExpanded ? '80px' : '40px', height: isExpanded ? '80px' : '40px', objectFit: 'contain', marginBottom: isExpanded ? '10px' : '0' }}
                />

                <div
                    className="flex flex-col items-center transition-all duration-300 ease-in-out"
                    style={{
                        opacity: isExpanded ? 1 : 0,
                        maxHeight: isExpanded ? '100px' : '0',
                        overflow: 'hidden'
                    }}
                >
                    <h2 className="brand-title">Tos Tinh Mart</h2>
                    <span className="brand-subtitle">Admin Console</span>
                </div>
            </div>

            {/* Navigation block */}
            <nav className="sidebar-nav flex-1 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden" style={{ padding: isExpanded ? '10px 15px' : '10px 8px' }}>
                {menuGroups.map((group, groupIndex) => (
                    <div className="nav-group mb-4" key={groupIndex}>
                        <span
                            className="nav-label text-xs font-bold text-gray-400 uppercase tracking-wider block transition-all duration-300 ease-in-out"
                            style={{
                                opacity: isExpanded ? 1 : 0,
                                maxHeight: isExpanded ? '24px' : '0',
                                marginBottom: isExpanded ? '8px' : '0',
                                paddingLeft: '20px',
                                overflow: 'hidden'
                            }}
                        >
                            {group.label}
                        </span>
                        <ul className="nav-list m-0 p-0 list-none space-y-1">
                            {group.items.map((item, itemIndex) => {
                                const isParentActive = item.isDropdown && item.subItems.some(sub => isUrlActive(sub.path));
                                const currentItemActive = !item.isDropdown && isUrlActive(item.path);

                                return (
                                    <li key={itemIndex}>
                                        {item.isDropdown ? (
                                            <>
                                                <button
                                                    onClick={() => toggleDropdown(item.text)}
                                                    className={`nav-item w-full flex items-center transition-all duration-300 ${isParentActive ? 'active' : ''}`}
                                                    style={{
                                                        padding: isExpanded ? '14px 20px' : '14px 0',
                                                        justifyContent: isExpanded ? 'space-between' : 'center',
                                                    }}
                                                >
                                                    <div className="flex items-center">
                                                        <i className={`${item.icon} text-base`} style={{ width: '20px', textAlign: 'center', marginRight: isExpanded ? '15px' : '0' }}></i>
                                                        {isExpanded && <span className="text-sm font-medium">{item.text}</span>}
                                                    </div>
                                                    {isExpanded && (
                                                        <i className={`fas fa-chevron-${openDropdowns[item.text] ? 'up' : 'down'} text-xs opacity-60 transition-transform duration-300`}></i>
                                                    )}
                                                </button>

                                                {/* Dropdown inner container links */}
                                                <div
                                                    className="transition-all duration-300 ease-in-out overflow-hidden"
                                                    style={{
                                                        maxHeight: openDropdowns[item.text] && isExpanded ? '320px' : '0',
                                                        opacity: openDropdowns[item.text] && isExpanded ? 1 : 0
                                                    }}
                                                >
                                                    <ul className="pl-12 py-1 m-0 list-none space-y-1">
                                                        {item.subItems.map((subItem, subIndex) => (
                                                            <li key={subIndex}>
                                                                <Link
                                                                    href={subItem.path}
                                                                    className={`nav-sub-item block text-sm py-2 transition-colors duration-200 rounded-md ${isUrlActive(subItem.path) ? 'text-green-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
                                                                >
                                                                    {subItem.text}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href || item.path}
                                                className={`nav-item flex items-center transition-all duration-300 ${currentItemActive ? 'active' : ''}`}
                                                style={{
                                                    justifyContent: isExpanded ? 'flex-start' : 'center',
                                                    padding: isExpanded ? '14px 20px' : '14px 0'
                                                }}
                                            >
                                                <i className={`${item.icon} text-base`} style={{ width: '20px', textAlign: 'center', marginRight: isExpanded ? '15px' : '0' }}></i>
                                                {isExpanded && <span className="text-sm font-medium">{item.text}</span>}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer section */}

        </aside>
    );
}
