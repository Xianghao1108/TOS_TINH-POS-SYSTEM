import React, { useState } from 'react';
import axios from 'axios';
export default function SalesReportSettings() {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const triggerManualSync = async () => {
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await axios.post('/api/reports/trigger-now');

            if (response.data && response.data.success) {
                setSuccessMessage(response.data.message || 'Daily sales report sent to Telegram successfully!');
                // Auto-clear success message after 7 seconds
                setTimeout(() => setSuccessMessage(''), 7000);
            } else {
                setErrorMessage(response.data.message || 'Failed to dispatch report. Check settings.');
            }
        } catch (error) {
            console.error('Manual sync execution failed:', error);
            const msg = error.response?.data?.message || 'An error occurred while connecting to the report sync server.';
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Block */}
            <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-chart-line text-rose-500"></i>
                    <span>Sales Report Settings</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Manage cron jobs, automated daily triggers, and manual push notifications to your Telegram Bot.
                </p>
            </div>

            {/* Grid Layout for Settings Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Cron Schedule Info Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100/50">
                                <i className="fas fa-clock text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Cron Schedule Info</h3>
                                <span className="text-base font-bold text-slate-800">Runs daily at 23:30</span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="font-medium text-slate-500">Scheduled Time</span>
                                <span className="font-semibold text-slate-800">23:30 (11:30 PM) daily</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                <span className="font-medium text-slate-500">Target Channel</span>
                                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                    <i className="fab fa-telegram text-sky-500"></i> Telegram Bot
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trigger Manual Sync Action Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
                                <i className="fas fa-sync text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Manual Dispatch</h3>
                                <span className="text-base font-bold text-slate-800">Trigger Sync Now</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Force compile the daily sales summary metrics (Total Orders, Total Revenue) and send it directly to your Telegram bot channel immediately, bypassing the midnight cron wait.
                        </p>
                    </div>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={triggerManualSync}
                            disabled={loading}
                            className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 ${loading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 hover:shadow-lg'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>
                                    <span>Trigger Manual Sync</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>




            {/* Alert Notification Banners */}
            <div className="space-y-3">
                {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 shadow-sm flex items-start gap-3 animate-fade-in transition-all duration-300">
                        <div className="text-emerald-500 mt-0.5">
                            <i className="fas fa-check-circle text-lg"></i>
                        </div>
                        <div className="flex-1 text-sm">
                            <span className="font-semibold block">Execution Successful!</span>
                            <span>{successMessage}</span>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 shadow-sm flex items-start gap-3 animate-fade-in transition-all duration-300">
                        <div className="text-rose-500 mt-0.5">
                            <i className="fas fa-exclamation-circle text-lg"></i>
                        </div>
                        <div className="flex-1 text-sm">
                            <span className="font-semibold block">Execution Failed</span>
                            <span>{errorMessage}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
