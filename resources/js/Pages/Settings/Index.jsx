import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminSystemSettings from './components/AdminSystemSettings';

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
        telegram_bot_token: '',
        telegram_chat_id: '',
        telegram_report_bot_token: '',
        telegram_report_chat_id: '',
        telegram_secret_token: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/settings', {
            preserveScroll: true,
            onSuccess: () => {
                setData(prev => ({
                    ...prev,
                    telegram_bot_token: '',
                    telegram_chat_id: '',
                    telegram_report_bot_token: '',
                    telegram_report_chat_id: '',
                    telegram_secret_token: '',
                }));
            }
        });
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
        { id: 'telegram', label: 'Telegram Bot Settings', icon: 'fab fa-telegram text-sky-600' },
        { id: 'backup', label: 'Database Backup & System Tools', icon: 'fas fa-database text-purple-600' },
        { id: 'admin_system', label: 'Admin System Settings', icon: 'fas fa-shield-alt text-indigo-600' },
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

                            {/* TELEGRAM BOT SETTINGS TAB CONTENT */}
                            {activeTab === 'telegram' && (
                                <div className="space-y-6">
                                    <div className="border-b pb-2">
                                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <i className="fab fa-telegram text-sky-600"></i>
                                            <span>Telegram Bot Integration</span>
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Configure bot integration variables. Sensitive variables are encrypted on the server and shielded from client exposure.
                                        </p>
                                    </div>

                                    {/* Monospace Credentials Summary Card */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-md space-y-4 font-sans">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                                <i className="fas fa-shield-alt text-emerald-500"></i>
                                                <span>Active Credentials Status</span>
                                            </div>
                                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                                Secure Vault
                                            </span>
                                        </div>

                                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs font-mono">
                                             <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">Active Bot Token</span>
                                                 <span className="text-sky-400 block font-bold truncate select-all">{settings.telegram?.bot_token || 'Not Configured'}</span>
                                             </div>
                                             <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">Webhook Secret Token</span>
                                                 <span className="text-indigo-400 block font-bold truncate">{settings.telegram?.secret_token_status || 'Not Configured'}</span>
                                             </div>
                                             <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">Active Chat ID</span>
                                                 <span className="text-emerald-400 block font-bold truncate select-all">{settings.telegram?.chat_id || 'Not Configured'}</span>
                                             </div>
                                             <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">Active Report Bot Token</span>
                                                 <span className="text-rose-400 block font-bold truncate select-all">{settings.telegram?.report_bot_token || 'Not Configured'}</span>
                                             </div>
                                             <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-sans">Active Report Chat ID</span>
                                                 <span className="text-[#E07A5F] block font-bold truncate select-all">{settings.telegram?.report_chat_id || 'Not Configured'}</span>
                                             </div>
                                         </div>
                                    </div>

                                    {/* Overwrite update input form inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Update Telegram Bot Token
                                            </label>
                                            <input
                                                type="password"
                                                value={data.telegram_bot_token}
                                                onChange={e => setData('telegram_bot_token', e.target.value)}
                                                placeholder="Enter new token to update..."
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                            />
                                            <span className="block text-[10px] text-slate-400 mt-1">Leave empty to preserve active configured token.</span>
                                            <InputError message={errors.telegram_bot_token} className="mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Update Telegram Chat ID
                                            </label>
                                            <input
                                                type="text"
                                                value={data.telegram_chat_id}
                                                onChange={e => setData('telegram_chat_id', e.target.value)}
                                                placeholder="Enter new chat ID to update..."
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                            />
                                            <span className="block text-[10px] text-slate-400 mt-1">Leave empty to preserve active configured chat ID.</span>
                                            <InputError message={errors.telegram_chat_id} className="mt-1" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                Update Webhook Secret Token
                                            </label>
                                            <input
                                                type="password"
                                                value={data.telegram_secret_token}
                                                onChange={e => setData('telegram_secret_token', e.target.value)}
                                                placeholder="Enter new secret to update..."
                                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                            />
                                            <span className="block text-[10px] text-slate-400 mt-1">Leave empty to preserve active configured secret.</span>
                                            <InputError message={errors.telegram_secret_token} className="mt-1" />
                                        </div>

                                     <div className="border-t border-slate-200/50 pt-4 mt-6">
                                         <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                             <i className="fas fa-chart-line text-rose-500"></i>
                                             <span>Sales Report Bot Credentials</span>
                                         </h4>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div>
                                                 <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                     Update Telegram Report Bot Token
                                                 </label>
                                                 <input
                                                     type="password"
                                                     value={data.telegram_report_bot_token}
                                                     onChange={e => setData('telegram_report_bot_token', e.target.value)}
                                                     placeholder="Enter new token to update..."
                                                     className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                                 />
                                                 <span className="block text-[10px] text-slate-400 mt-1">Leave empty to preserve active configured token.</span>
                                                 <InputError message={errors.telegram_report_bot_token} className="mt-1" />
                                             </div>

                                             <div>
                                                 <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                     Update Telegram Report Chat ID
                                                 </label>
                                                 <input
                                                     type="text"
                                                     value={data.telegram_report_chat_id}
                                                     onChange={e => setData('telegram_report_chat_id', e.target.value)}
                                                     placeholder="Enter new chat ID to update..."
                                                     className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                                 />
                                                 <span className="block text-[10px] text-slate-400 mt-1">Leave empty to preserve active configured chat ID.</span>
                                                 <InputError message={errors.telegram_report_chat_id} className="mt-1" />
                                             </div>
                                         </div>
                                     </div>
                                    </div>
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




                            {/* ADMIN SYSTEM SETTINGS TAB CONTENT */}
                            {activeTab === 'admin_system' && (
                                <AdminSystemSettings />
                            )}

                            {/* Submit Save Button for Settings Form */}
                            {activeTab !== 'backup' && activeTab !== 'admin_system' && (
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
