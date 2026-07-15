import React from 'react';
import { money, invoiceNo, formatDate, statusPill, paymentMethodPill } from '../utils/invoiceHelpers';

export function InvoiceTable({ invoiceList = [], onView, onEdit, onToggleStatus, onDelete, onPreview }) {
    return (
        <div className="w-full text-left">
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-emerald-50 bg-emerald-50/50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            <th className="px-2 py-3">Invoice</th>
                            <th className="px-2 py-3">Customer</th>
                            <th className="px-2 py-3">Cashier</th>
                            <th className="px-2 py-3">Orders</th>
                            <th className="px-2 py-3">Method</th>
                            <th className="px-2 py-3 text-right">Total</th>
                            <th className="px-2 py-3">Status</th>
                            <th className="px-2 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-50">
                        {invoiceList.length > 0 ? invoiceList.map((invoice) => (
                            <tr key={invoice.id} className="transition hover:bg-emerald-50/30">
                                <td className="px-2 py-3">
                                    <p className="font-bold text-slate-950 text-xs">{invoiceNo(invoice.id)}</p>
                                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">{formatDate(invoice.created_at)}</p>
                                </td>
                                <td className="px-2 py-3 text-xs">
                                    <p className="font-semibold text-slate-800">{invoice.customer?.name || 'Walk-in Customer'}</p>
                                    <p className="mt-0.5 text-[10px] text-slate-400">{invoice.customer?.phone || 'No phone'}</p>
                                </td>
                                <td className="px-2 py-3 text-xs font-medium text-slate-600">{invoice.staff?.name || 'Unknown'}</td>
                                <td className="px-2 py-3">
                                    <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">
                                        {invoice.orders?.length || 0} orders
                                    </span>
                                </td>
                                <td className="px-2 py-3">{paymentMethodPill(invoice.payment_method)}</td>
                                <td className="px-2 py-3 text-right text-sm font-bold text-slate-950">{money(invoice.total)}</td>
                                <td className="px-2 py-3">{statusPill(invoice.status)}</td>
                                <td className="px-2 py-3">
                                    <div className="flex justify-end gap-1.5">
                                        <button onClick={() => onView(invoice)} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 text-[11px] font-bold text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-600 cursor-pointer" title="View invoice" type="button">
                                            <i className="fas fa-eye text-[10px]"></i> View
                                        </button>
                                        <button onClick={() => onEdit(invoice)} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 text-[11px] font-bold text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 cursor-pointer" title="Edit invoice" type="button">
                                            <i className="fas fa-edit text-[10px]"></i> Edit
                                        </button>
                                        <button onClick={() => onPreview(invoice)} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2.5 text-[11px] font-bold text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer" title="Preview invoice" type="button">
                                            <i className="fas fa-file-invoice text-[10px]"></i> Preview
                                        </button>
                                        <button onClick={() => onToggleStatus(invoice)} className="inline-flex h-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 cursor-pointer" type="button">
                                            {invoice.status === 1 ? 'Mark unpaid' : 'Mark paid'}
                                        </button>
                                        <button onClick={() => onDelete(invoice)} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 cursor-pointer" title="Delete invoice" type="button">
                                            <i className="fas fa-trash text-[10px]"></i> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="8" className="px-5 py-14 text-center text-sm font-medium text-slate-500">
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
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Method</p>
                                <div className="mt-1">{paymentMethodPill(invoice.payment_method)}</div>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={() => onView(invoice)} className="h-10 flex-1 min-w-[70px] rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700 cursor-pointer border-0">View</button>
                            <button onClick={() => onEdit(invoice)} className="h-10 flex-1 min-w-[70px] rounded-xl bg-amber-50 text-sm font-bold text-amber-700 cursor-pointer border-0">Edit</button>
                            <button onClick={() => onPreview(invoice)} className="h-10 flex-1 min-w-[70px] rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 cursor-pointer border-0 flex items-center justify-center gap-1.5">
                                <i className="fas fa-file-invoice text-xs"></i> Preview
                            </button>
                            <button onClick={() => onToggleStatus(invoice)} className="h-10 flex-1 min-w-[70px] rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700 cursor-pointer border-0">
                                {invoice.status === 1 ? 'Unpaid' : 'Paid'}
                            </button>
                            <button onClick={() => onDelete(invoice)} className="h-10 flex-1 min-w-[70px] rounded-xl bg-rose-50 text-sm font-bold text-rose-700 cursor-pointer border-0 flex items-center justify-center gap-1.5">
                                <i className="fas fa-trash text-xs"></i> Delete
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
