import React from 'react';
import { money, invoiceNo, formatDate, statusPill } from '../utils/invoiceHelpers';

export function InvoiceTable({ invoiceList = [], onView, onToggleStatus, onDelete }) {
    return (
        <div className="w-full text-left">
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-emerald-50 bg-emerald-50/50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            <th className="px-5 py-4">Invoice</th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4">Cashier</th>
                            <th className="px-5 py-4">Orders</th>
                            <th className="px-5 py-4 text-right">Total</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                        {invoiceList.length > 0 ? invoiceList.map((invoice) => (
                            <tr key={invoice.id} className="transition hover:bg-emerald-50/30">
                                <td className="px-5 py-4">
                                    <p className="font-bold text-slate-950">{invoiceNo(invoice.id)}</p>
                                    <p className="mt-1 text-xs font-medium text-slate-400">{formatDate(invoice.created_at)}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <p className="font-semibold text-slate-800">{invoice.customer?.name || 'Walk-in Customer'}</p>
                                    <p className="mt-1 text-xs text-slate-400">{invoice.customer?.phone || 'No phone'}</p>
                                </td>
                                <td className="px-5 py-4 text-sm font-medium text-slate-600">{invoice.staff?.name || 'Unknown'}</td>
                                <td className="px-5 py-4">
                                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                                        {invoice.orders?.length || 0} orders
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right text-base font-bold text-slate-950">{money(invoice.total)}</td>
                                <td className="px-5 py-4">{statusPill(invoice.status)}</td>
                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onView(invoice)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-600 cursor-pointer" title="View invoice" type="button">
                                            <i className="fas fa-eye text-sm"></i>
                                        </button>
                                        <button onClick={() => onToggleStatus(invoice)} className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 cursor-pointer" type="button">
                                            {invoice.status === 1 ? 'Mark unpaid' : 'Mark paid'}
                                        </button>
                                        <button onClick={() => onDelete(invoice)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 cursor-pointer" title="Delete invoice" type="button">
                                            <i className="fas fa-trash text-sm"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-5 py-14 text-center text-sm font-medium text-slate-500">
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List View */}
            <div className="grid grid-cols-1 gap-4 p-4 lg:hidden">
                {invoiceList.length > 0 ? invoiceList.map((invoice) => (
                    <article key={invoice.id} className="rounded-2xl border border-emerald-50 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-bold text-slate-950">{invoiceNo(invoice.id)}</p>
                                <p className="mt-1 text-xs font-medium text-slate-400">{formatDate(invoice.created_at)}</p>
                            </div>
                            {statusPill(invoice.status)}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Customer</p>
                                <p className="mt-1 font-semibold text-slate-800">{invoice.customer?.name || 'Walk-in'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Total</p>
                                <p className="mt-1 font-bold text-slate-950">{money(invoice.total)}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => onView(invoice)} className="h-10 flex-1 rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700 cursor-pointer border-0">View</button>
                            <button onClick={() => onToggleStatus(invoice)} className="h-10 flex-1 rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 cursor-pointer border-0">
                                {invoice.status === 1 ? 'Unpaid' : 'Paid'}
                            </button>
                            <button onClick={() => onDelete(invoice)} className="h-10 w-11 rounded-xl bg-rose-50 text-rose-600 cursor-pointer border-0">
                                <i className="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </article>
                )) : (
                    <div className="py-10 text-center text-sm font-medium text-slate-500">No invoices found.</div>
                )}
            </div>
        </div>
    );
}
