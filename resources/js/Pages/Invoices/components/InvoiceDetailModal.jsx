import React from 'react';
import Modal from '@/Components/Modal';
import { money, invoiceNo, orderNo, formatDate, statusPill, paymentMethodPill, paymentMethodLabel } from '../utils/invoiceHelpers';

export function InvoiceDetailModal({ isOpen, onClose, selectedInvoice }) {
    return (
        <Modal show={isOpen && !!selectedInvoice} onClose={onClose} maxWidth="5xl">
            {selectedInvoice && (
                <div className="max-h-[85vh] overflow-y-auto text-left">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-50 bg-white px-6 py-5">
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">{invoiceNo(selectedInvoice.id)}</h2>
                            <p className="mt-1 text-sm text-slate-500">Issued {formatDate(selectedInvoice.created_at, true)}</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 border-0 cursor-pointer"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="rounded-2xl bg-emerald-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Customer</p>
                                <p className="mt-2 font-bold text-slate-950">{selectedInvoice.customer?.name || 'Walk-in'}</p>
                                <p className="text-sm text-slate-500">{selectedInvoice.customer?.phone || 'No phone'}</p>
                            </div>
                            <div className="rounded-2xl bg-cyan-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">Cashier</p>
                                <p className="mt-2 font-bold text-slate-950">{selectedInvoice.staff?.name || 'Unknown'}</p>
                            </div>
                            <div className="rounded-2xl bg-fuchsia-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-700">Status</p>
                                <div className="mt-2">{statusPill(selectedInvoice.status)}</div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Total</p>
                                <p className="mt-2 text-xl font-bold text-slate-950">{money(selectedInvoice.total)}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-50 bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Payment Method</p>
                            <div className="mt-3 flex items-center gap-3">
                                {paymentMethodPill(selectedInvoice.payment_method)}
                                <span className="text-sm font-semibold text-slate-600">{paymentMethodLabel(selectedInvoice.payment_method)}</span>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-emerald-50 bg-emerald-50/60 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                        <th className="px-4 py-3">Order</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Subtotal</th>
                                        <th className="px-4 py-3 text-right">Discount</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-50">
                                    {selectedInvoice.orders?.length > 0 ? selectedInvoice.orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-4 py-3 font-bold text-slate-900">{orderNo(order.id)}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500">{formatDate(order.created_at)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-slate-600">{money(order.subtotal)}</td>
                                            <td className="px-4 py-3 text-right text-sm text-rose-500">-{money(order.discount)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-950">{money(order.total)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-500">No orders linked to this invoice.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
