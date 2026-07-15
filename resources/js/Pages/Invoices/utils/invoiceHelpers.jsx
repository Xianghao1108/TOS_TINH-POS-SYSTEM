import React from 'react';

export const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export const invoiceNo = (id) => `#INV-${String(id).padStart(5, '0')}`;

export const orderNo = (id) => `#ORD-${String(id).padStart(5, '0')}`;

export const formatDate = (value, withTime = false) => {
    if (!value) return 'N/A';

    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
};

export const fieldClass = (hasError) =>
    `h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export const statusPill = (status) => status === 1 ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Paid
    </span>
) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
        Unpaid
    </span>
);

export const paymentMethodLabel = (method) => {
    const cleanMethod = (method || '').toString().trim().toLowerCase();
    switch (cleanMethod) {
        case 'qr':
            return 'QR';
        case 'khqr':
            return 'KHQR';
        case 'aba_qr':
        case 'aba_qr_code':
        case 'aba':
            return 'ABA QR';
        case 'cash':
            return 'Cash';
        case 'card':
            return 'Card';
        default:
            if (!method) return 'Unknown';
            return method.toString().trim().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
};

export const paymentMethodPill = (method) => {
    const label = paymentMethodLabel(method);

    if (label === 'Cash') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Cash
            </span>
        );
    }

    if (label === 'QR' || label === 'ABA QR') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
                {label}
            </span>
        );
    }

    if (label === 'KHQR') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                KHQR
            </span>
        );
    }

    if (label === 'Card') {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                Card
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            {label}
        </span>
    );
};
