import React from 'react';
import Modal from '@/Components/Modal';
import { money, orderNo, formatDate, fieldClass } from '../utils/invoiceHelpers';

export function InvoiceAddModal({
    isOpen,
    onClose,
    onSubmit,
    data,
    setData,
    errors = {},
    processing,
    customerSearch,
    handleCustomerSearchChange,
    showSuggestions,
    setShowSuggestions,
    filteredCustomers = [],
    selectCustomer,
    filteredPendingOrders = [],
    toggleOrder,
    users = []
}) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="4xl">
            <form onSubmit={onSubmit} className="max-h-[85vh] overflow-y-auto text-left">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-50 bg-white px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                            <i className="fas fa-receipt text-lg"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">Create Invoice</h2>
                            <p className="mt-1 text-sm text-slate-500">Select a customer, cashier, and pending orders.</p>
                        </div>
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Customer Search Autocomplete */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-800">Customer *</label>
                            <input
                                type="text"
                                className={fieldClass(errors.customer_id)}
                                placeholder="Search by name or phone..."
                                value={customerSearch}
                                onChange={handleCustomerSearchChange}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {showSuggestions && customerSearch && (
                                <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-105 bg-white shadow-lg">
                                    {filteredCustomers.length > 0 ? (

                            <div>
                                <label className="block text-sm font-semibold text-slate-800">Payment Method *</label>
                                <select
                                    className={fieldClass(false)}
                                    value={data.payment_method || 'cash'}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="qr">QR</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>
                                        filteredCustomers.map((customer) => (
                                            <button
                                                key={customer.id}
                                                type="button"
                                                onClick={() => selectCustomer(customer)}
                                                className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-emerald-50 transition border-0 bg-transparent block cursor-pointer"
                                            >
                                                {customer.name} ({customer.phone || 'No phone'})
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2.5 text-xs text-slate-400 italic">No customers matched</div>
                                    )}
                                </div>
                            )}
                            {errors.customer_id && <p className="mt-2 text-sm text-rose-605">{errors.customer_id}</p>}
                        </div>

                        {/* Cashier selection */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">Cashier *</label>
                            <select
                                className={fieldClass(errors.staff_id)}
                                value={data.staff_id}
                                onChange={(e) => setData('staff_id', e.target.value)}
                            >
                                <option value="">Select Cashier</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            {errors.staff_id && <p className="mt-2 text-sm text-rose-600">{errors.staff_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Status Select */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">Payment Status *</label>
                            <select
                                className={fieldClass(false)}
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="1">Paid</option>
                                <option value="2">Unpaid</option>
                            </select>
                        </div>

                        {/* Summary Total */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">Total Invoice Amount ($)</label>
                            <div className="flex h-11 w-full items-center justify-between rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-800 border border-slate-200">
                                <span>Total:</span>
                                <span className="text-base text-emerald-600">${data.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Orders Checklist */}
                    <div className="border-t border-emerald-50 pt-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-950">Pending orders</h3>
                                <p className="mt-1 text-sm text-slate-500">Only orders not attached to another invoice appear here.</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm border border-slate-200">
                                {data.order_ids.length} selected
                            </span>
                        </div>

                        {data.customer_id ? (
                            filteredPendingOrders.length > 0 ? (
                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {filteredPendingOrders.map((order) => (
                                        <label 
                                            key={order.id} 
                                            className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-emerald-50 bg-white p-3 shadow-sm transition hover:border-emerald-100 hover:bg-emerald-50/40"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={data.order_ids.includes(order.id)}
                                                    onChange={(e) => toggleOrder(order.id, e.target.checked)}
                                                    className="rounded border-emerald-250 text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{orderNo(order.id)}</p>
                                                    <p className="mt-1 text-xs font-medium text-slate-400">{formatDate(order.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{money(order.total)}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm font-medium text-amber-700">
                                    No pending orders found for this customer.
                                </div>
                            )
                        ) : (
                            <div className="rounded-xl border border-emerald-100 bg-white p-6 text-center text-sm font-medium text-slate-500 shadow-xs">
                                Select a customer to load pending orders.
                            </div>
                        )}
                        {errors.order_ids && <p className="mt-2 text-sm text-rose-600">{errors.order_ids}</p>}
                    </div>
                </div>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-emerald-50 bg-white px-6 py-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-650 transition hover:bg-slate-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing || data.order_ids.length === 0}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 border-0 cursor-pointer"
                    >
                        {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                        Create Invoice
                    </button>
                </div>
            </form>
        </Modal>
    );
}
