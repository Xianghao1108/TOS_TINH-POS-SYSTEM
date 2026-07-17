import React, { useState } from 'react';
import axios from 'axios';

export default function AdminSystemSettings() {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [copied, setCopied] = useState(false);

    const webhookUrl = `${window.location.origin}/api/payment-webhook`;

    const handleCopyWebhook = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Failed to copy webhook URL: ', err);
        }
    };

    const triggerManualSync = async () => {
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const token = localStorage.getItem('auth_token');

        try {
            const response = await axios.post('/api/reports/trigger-now', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && (response.data.success || response.status === 200)) {
                setSuccessMessage(response.data.message || 'Daily sales report sent to Telegram successfully!');
            } else {
                setErrorMessage(response.data.message || 'Failed to dispatch report. Server returned unsuccessful status.');
            }
        } catch (error) {
            console.error('Manual sync execution failed:', error);
            if (error.response) {
                if (error.response.status === 403) {
                    setErrorMessage('Forbidden: Insufficient privileges. You must have Admin permissions to trigger manual report sync.');
                } else if (error.response.status === 401) {
                    setErrorMessage('Unauthorized: Invalid or missing authentication token. Please log in again.');
                } else {
                    setErrorMessage(error.response.data?.message || `Error ${error.response.status}: Failed to trigger report sync.`);
                }
            } else {
                setErrorMessage('Network Error: Failed to connect to the report sync server.');
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="space-y-6">
            {/* Header Block */}
            <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-shield-alt text-indigo-600"></i>
                    <span>Admin System Settings</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Manage critical system integration overrides, verify security configurations, and force manual task execution.
                </p>
            </div>

            {/* Core Panels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Manual Sync Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all duration-200 animate-fade-in">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50">
                                <i className="fas fa-sync-alt text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Report Management</h3>
                                <span className="text-base font-bold text-slate-800">Manual Sales Report Sync</span>
                            </div>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-500">
                            Manually compile and dispatch the latest daily sales summary metrics (total orders, overall revenue, payment breakups) directly to the Telegram bot channel immediately.
                        </p>

                        <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs text-slate-600 space-y-2">
                            <div className="flex items-center gap-2">
                                <i className="fas fa-key text-indigo-500"></i>
                                <span className="font-semibold">Security Level: Strict Admin-Only</span>
                            </div>
                            <p className="text-slate-500">
                                This request is protected by Sanctum stateful authentication. The active session bearer token will be injected automatically into the request headers.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={triggerManualSync}
                            disabled={loading}
                            className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 ${loading
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Synchronizing Report...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>
                                    <span>Trigger Telegram Sync</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Webhook Configuration Details Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all duration-200 animate-fade-in">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                                    <i className="fas fa-network-wired text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Gateway Integration</h3>
                                    <span className="text-base font-bold text-slate-800">Webhook Configuration Details</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-500">
                            The public endpoints for debugging and simulating webhook payments have been deactivated to prevent parameter tampering. The API now strictly verifies HMAC signatures on all incoming payload triggers.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Production Webhook URL
                                </label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-700 break-all select-all">
                                    <span className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none">{webhookUrl}</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyWebhook}
                                        className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition-colors"
                                        title="Copy to Clipboard"
                                    >
                                        {copied ? (
                                            <i className="fas fa-check text-emerald-500 text-xs"></i>
                                        ) : (
                                            <i className="far fa-copy text-xs"></i>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-150 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                                    <span className="text-xs font-semibold text-emerald-800">Security Signature Protection</span>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <i className="fas fa-lock mr-1.5 text-emerald-600"></i>
                                    Secure (Signature Verified)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-3 bg-amber-50/70 border border-amber-100 rounded-lg text-[11px] text-amber-800 flex gap-2">
                        <i className="fas fa-shield-alt mt-0.5 text-amber-600"></i>
                        <span>
                            Debug endpoints are permanently disabled. The handler parses the signature header and decrypts verification payloads to authorize incoming transactions.
                        </span>
                    </div>
                </div>



            </div>

            {/* Error and Success Banners */}
            <div className="space-y-3 pt-2">
                {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 shadow-sm flex items-start gap-3 animate-fade-in transition-all duration-300">
                        <div className="text-emerald-500 mt-0.5">
                            <i className="fas fa-check-circle text-lg"></i>
                        </div>
                        <div className="flex-1 text-sm">
                            <span className="font-semibold block text-emerald-950">Execution Successful</span>
                            <span>{successMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSuccessMessage('')}
                            className="text-emerald-400 hover:text-emerald-600 transition p-1"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 shadow-sm flex items-start gap-3 animate-fade-in transition-all duration-300">
                        <div className="text-rose-500 mt-0.5">
                            <i className="fas fa-exclamation-circle text-lg"></i>
                        </div>
                        <div className="flex-1 text-sm">
                            <span className="font-semibold block text-rose-950">Execution Failed</span>
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMessage('')}
                            className="text-rose-400 hover:text-rose-600 transition p-1"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
