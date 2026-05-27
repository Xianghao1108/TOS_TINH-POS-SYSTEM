import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';

export default function SettingsIndex({ settings = {} }) {
    const [activeTab, setActiveTab] = useState('general');
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupSuccess, setBackupSuccess] = useState(false);

    // Initialize Inertia Form with loaded settings
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        store_name: settings.store_name || '',
        store_address: settings.store_address || '',
        store_email: settings.store_email || '',
        store_phone: settings.store_phone || '',
        currency_symbol: settings.currency_symbol || '',
        tax_rate: settings.tax_rate || '',
        receipt_header: settings.receipt_header || '',
        receipt_footer: settings.receipt_footer || '',
        low_stock_alerts: settings.low_stock_alerts || '1',
        low_stock_threshold: settings.low_stock_threshold || '',
        default_checkout_role: settings.default_checkout_role || '1',
        theme_mode: settings.theme_mode || 'light',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/settings');
    };

    // Simulated backup trigger
    const triggerBackup = () => {
        setBackupLoading(true);
        setBackupSuccess(false);
        setTimeout(() => {
            setBackupLoading(false);
            setBackupSuccess(true);
            // Auto hide success badge
            setTimeout(() => setBackupSuccess(false), 5000);
            
            // Trigger simulated download file
            const element = document.createElement("a");
            const file = new Blob(["-- Mock database dump file output\n-- Created on " + new Date().toISOString() + "\nCREATE TABLE settings..."], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = "tos_tinh_db_backup.sql";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }, 1500);
    };

    const headWeb = 'Settings';
    const linksBreadcrumb = [
        { title: 'Home', url: '/' },
        { title: headWeb, url: '' }
    ];

    const tabItems = [
        { id: 'general', label: 'General Store Settings', icon: 'fas fa-store text-blue-600' },
        { id: 'receipt', label: 'Receipt & Billing Customization', icon: 'fas fa-receipt text-green-600' },
        { id: 'pos', label: 'POS & Alert Configurations', icon: 'fas fa-sliders-h text-yellow-600' },
        { id: 'backup', label: 'Database Backup & System Tools', icon: 'fas fa-database text-purple-600' },
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>
                    <p className="text-sm text-gray-500">Configure store metadata, checkout configurations, and alerts.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Pane: Tab Selection List */}
                    <div className="w-full md:w-1/4 bg-white rounded border border-gray-200 shadow-sm p-2 flex flex-col gap-1 self-start">
                        {tabItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full text-left px-4 py-3 rounded text-sm font-semibold flex items-center gap-3 transition-colors ${
                                    activeTab === item.id
                                        ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <i className={item.icon}></i>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Pane: Settings Forms */}
                    <div className="w-full md:w-3/4 bg-white rounded border border-gray-200 shadow-sm p-6 relative">
                        {recentlySuccessful && (
                            <div className="absolute top-4 right-4 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                                <i className="fas fa-check-circle"></i> Settings Saved!
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* GENERAL TAB CONTENT */}
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Store Profile Details</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label>
                                            <input
                                                type="text"
                                                value={data.store_name}
                                                onChange={e => setData('store_name', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                            <InputError message={errors.store_name} className="mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Currency Symbol</label>
                                            <input
                                                type="text"
                                                value={data.currency_symbol}
                                                onChange={e => setData('currency_symbol', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="$"
                                                required
                                            />
                                            <InputError message={errors.currency_symbol} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Store Email Address</label>
                                            <input
                                                type="email"
                                                value={data.store_email}
                                                onChange={e => setData('store_email', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                            <InputError message={errors.store_email} className="mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Store Phone Number</label>
                                            <input
                                                type="text"
                                                value={data.store_phone}
                                                onChange={e => setData('store_phone', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                            <InputError message={errors.store_phone} className="mt-1" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Store Physical Address</label>
                                        <textarea
                                            value={data.store_address}
                                            onChange={e => setData('store_address', e.target.value)}
                                            rows="3"
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        ></textarea>
                                        <InputError message={errors.store_address} className="mt-1" />
                                    </div>
                                </div>
                            )}

                            {/* RECEIPT TAB CONTENT */}
                            {activeTab === 'receipt' && (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Receipt Template Design</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Applied VAT / Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={data.tax_rate}
                                                onChange={e => setData('tax_rate', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                            <InputError message={errors.tax_rate} className="mt-1" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt Header Greeting</label>
                                        <input
                                            type="text"
                                            value={data.receipt_header}
                                            onChange={e => setData('receipt_header', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Thank you for shopping with us!"
                                        />
                                        <InputError message={errors.receipt_header} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt Footer Note</label>
                                        <textarea
                                            value={data.receipt_footer}
                                            onChange={e => setData('receipt_footer', e.target.value)}
                                            rows="3"
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Please come again! Returns accepted within 7 days."
                                        ></textarea>
                                        <InputError message={errors.receipt_footer} className="mt-1" />
                                    </div>
                                </div>
                            )}

                            {/* POS & CONFIG TAB CONTENT */}
                            {activeTab === 'pos' && (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">System Alerts & Rules</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Default Checkout Target */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Default Checkout Target</label>
                                            <select
                                                value={data.default_checkout_role}
                                                onChange={e => setData('default_checkout_role', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="1">Regular / Retail User</option>
                                                <option value="2">VIP / Wholesale Partner</option>
                                            </select>
                                            <InputError message={errors.default_checkout_role} className="mt-1" />
                                        </div>

                                        {/* UI Theme Selection */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Theme Mode</label>
                                            <select
                                                value={data.theme_mode}
                                                onChange={e => setData('theme_mode', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="light">Console Light Theme</option>
                                                <option value="dark">Console Dark Theme</option>
                                            </select>
                                            <InputError message={errors.theme_mode} className="mt-1" />
                                        </div>
                                    </div>

                                    {/* Low Stock Alerts Switch Toggle */}
                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded border border-gray-150">
                                        <input
                                            type="checkbox"
                                            id="lowStockAlertsToggle"
                                            checked={data.low_stock_alerts === '1'}
                                            onChange={e => setData('low_stock_alerts', e.target.checked ? '1' : '0')}
                                            className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div>
                                            <label htmlFor="lowStockAlertsToggle" className="block text-sm font-bold text-gray-800 cursor-pointer">
                                                Enable Real-time Low Stock Inventory Alerts
                                            </label>
                                            <span className="block text-xs text-gray-500">Flags products when quantities drop below critical thresholds.</span>
                                        </div>
                                    </div>

                                    {data.low_stock_alerts === '1' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Critical Stock Warning Level (units)</label>
                                                <input
                                                    type="number"
                                                    value={data.low_stock_threshold}
                                                    onChange={e => setData('low_stock_threshold', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    required
                                                />
                                                <InputError message={errors.low_stock_threshold} className="mt-1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BACKUP TAB CONTENT */}
                            {activeTab === 'backup' && (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Database Backup Operations</h2>
                                    <p className="text-sm text-gray-600">
                                        Ensure data safety by generating manual database dumps regularly. 
                                        Files compile table structures, registered catalog rows, invoices history, and configurations.
                                    </p>

                                    <div className="bg-purple-50 border border-purple-200 rounded p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div>
                                            <span className="block text-sm font-bold text-purple-900">Download SQL Database Dump</span>
                                            <span className="block text-xs text-purple-700">Simulates compiled sql insert scripts package.</span>
                                        </div>
                                        
                                        <button
                                            type="button"
                                            onClick={triggerBackup}
                                            disabled={backupLoading}
                                            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded text-sm flex items-center gap-2 transition disabled:opacity-50"
                                        >
                                            {backupLoading ? (
                                                <>
                                                    <i className="fas fa-spinner animate-spin"></i> Compiling dump...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-file-download"></i> Backup Database Now
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {backupSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-800 rounded p-3 text-sm font-medium flex items-center gap-2">
                                            <i className="fas fa-check-circle"></i> SQL Database Dump generated and downloaded successfully.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit Save Button for Settings Form */}
                            {activeTab !== 'backup' && (
                                <div className="flex justify-end pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow disabled:opacity-50 transition"
                                    >
                                        {processing ? 'Saving Configurations...' : 'Save All Settings'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
