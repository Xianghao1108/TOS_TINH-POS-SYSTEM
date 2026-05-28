import Breadcrumb from '@/Components/Breadcrumb';
import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;
const invoiceNo = (id) => `#INV-${String(id).padStart(5, '0')}`;
const orderNo = (id) => `#ORD-${String(id).padStart(5, '0')}`;

const formatDate = (value, withTime = false) => {
    if (!value) return 'N/A';

    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
};

const fieldClass = (hasError) =>
    `h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export default function InvoicesIndex({ invoices = {}, customers = [], pendingOrders = [], users = [], filters = {} }) {
    const { auth } = usePage().props;
    const invoiceList = invoices.data || [];
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        staff_id: auth?.user?.id || '',
        status: '2',
        total: '0.00',
        order_ids: [],
    });

    const filteredCustomers = useMemo(() => {
        const query = customerSearch.toLowerCase();
        return customers.filter((customer) =>
            customer.name?.toLowerCase().includes(query) ||
            customer.phone?.includes(customerSearch)
        );
    }, [customers, customerSearch]);

    const filteredPendingOrders = useMemo(() => {
        if (!data.customer_id) return [];
        return pendingOrders.filter((order) => String(order.customer_id) === String(data.customer_id));
    }, [pendingOrders, data.customer_id]);

    const stats = useMemo(() => {
        const paid = invoiceList.filter((invoice) => invoice.status === 1).length;
        const unpaid = invoiceList.filter((invoice) => invoice.status === 2).length;
        const loadedRevenue = invoiceList.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

        return [
            { label: 'Total invoices', value: invoices.total || 0, icon: 'fas fa-file-invoice-dollar', tone: 'text-slate-900 bg-white' },
            { label: 'Paid', value: paid, icon: 'fas fa-check-circle', tone: 'text-emerald-700 bg-emerald-50' },
            { label: 'Unpaid', value: unpaid, icon: 'fas fa-clock', tone: 'text-amber-700 bg-amber-50' },
            { label: 'Loaded value', value: money(loadedRevenue), icon: 'fas fa-wallet', tone: 'text-fuchsia-700 bg-fuchsia-50' },
        ];
    }, [invoiceList, invoices.total]);

    const selectedOrdersTotal = (orderIds) => pendingOrders
        .filter((order) => orderIds.includes(order.id))
        .reduce((sum, order) => sum + Number(order.total || 0), 0)
        .toFixed(2);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('invoices.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearchQuery('');
        router.get(route('invoices.index'), {}, { preserveState: true, replace: true });
    };

    const openAddModal = () => {
        clearErrors();
        reset();
        setData({
            customer_id: '',
            staff_id: auth?.user?.id || users[0]?.id || '',
            status: '2',
            total: '0.00',
            order_ids: [],
        });
        setCustomerSearch('');
        setShowSuggestions(false);
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setCustomerSearch('');
        setShowSuggestions(false);
        clearErrors();
    };

    const selectCustomer = (customer) => {
        setCustomerSearch(customer.name);
        setData({
            ...data,
            customer_id: customer.id,
            order_ids: [],
            total: '0.00',
        });
        setShowSuggestions(false);
    };

    const handleCustomerSearchChange = (e) => {
        setCustomerSearch(e.target.value);
        setData({
            ...data,
            customer_id: '',
            order_ids: [],
            total: '0.00',
        });
        setShowSuggestions(true);
    };

    const toggleOrder = (orderId, checked) => {
        const nextOrderIds = checked
            ? [...data.order_ids, orderId]
            : data.order_ids.filter((id) => id !== orderId);

        setData({
            ...data,
            order_ids: nextOrderIds,
            total: selectedOrdersTotal(nextOrderIds),
        });
    };

    const submitAddInvoice = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                reset();
                closeAddModal();
            },
        });
    };

    const openDetailModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailModalOpen(true);
    };

    const openDeleteModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDeleteModalOpen(true);
    };

    const handleToggleStatus = (invoice) => {
        router.patch(route('invoices.update', invoice.id), {
            status: invoice.status === 1 ? 2 : 1,
        }, {
            preserveScroll: true,
        });
    };

    const handleDeleteInvoice = () => {
        router.delete(route('invoices.destroy', selectedInvoice.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedInvoice(null);
            },
            preserveScroll: true,
        });
    };

    const statusPill = (status) => status === 1 ? (
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

    return (
        <AdminLayout breadcrumb={<Breadcrumb header="Invoices" links={[{ title: 'Home', url: '/' }, { title: 'Invoices', url: '' }]} />}>
            <Head title="Invoices" />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-receipt text-[10px]"></i>
                                    Billing desk
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Invoices</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Bundle customer orders, track payment status, and keep checkout history tidy.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search invoice ID"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600"
                                        aria-label="Search invoices"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>
                                {filters.search && (
                                    <button
                                        onClick={clearSearch}
                                        type="button"
                                        className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-100 bg-white px-4 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
                                    >
                                        Clear
                                    </button>
                                )}
                                <button
                                    onClick={openAddModal}
                                    type="button"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                    New Invoice
                                </button>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-emerald-50 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p>
                                        </div>
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                                            <i className={`${item.icon} text-lg`}></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
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
                                                        <button onClick={() => openDetailModal(invoice)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-600" title="View invoice">
                                                            <i className="fas fa-eye text-sm"></i>
                                                        </button>
                                                        <button onClick={() => handleToggleStatus(invoice)} className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
                                                            {invoice.status === 1 ? 'Mark unpaid' : 'Mark paid'}
                                                        </button>
                                                        <button onClick={() => openDeleteModal(invoice)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete invoice">
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
                                            <button onClick={() => openDetailModal(invoice)} className="h-10 flex-1 rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700">View</button>
                                            <button onClick={() => handleToggleStatus(invoice)} className="h-10 flex-1 rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                                                {invoice.status === 1 ? 'Unpaid' : 'Paid'}
                                            </button>
                                            <button onClick={() => openDeleteModal(invoice)} className="h-10 w-11 rounded-xl bg-rose-50 text-rose-600">
                                                <i className="fas fa-trash text-sm"></i>
                                            </button>
                                        </div>
                                    </article>
                                )) : (
                                    <div className="py-10 text-center text-sm font-medium text-slate-500">No invoices found.</div>
                                )}
                            </div>
                        </div>

                        {invoices.links && invoices.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {invoices.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}
                                        className={`min-w-10 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                            link.active
                                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                                : 'border-emerald-100 bg-white text-slate-600 hover:bg-emerald-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '<').replace('&raquo;', '>') }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Modal show={isAddModalOpen} onClose={closeAddModal} maxWidth="4xl">
                    <form onSubmit={submitAddInvoice} className="max-h-[85vh] overflow-y-auto">
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
                            <button type="button" onClick={closeAddModal} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="relative">
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Customer</label>
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={handleCustomerSearchChange}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                                        placeholder="Type customer name or phone"
                                        className={fieldClass(errors.customer_id)}
                                    />
                                    {showSuggestions && (
                                        <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-emerald-100 bg-white p-1 shadow-xl">
                                            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                                                <button
                                                    key={customer.id}
                                                    type="button"
                                                    onClick={() => selectCustomer(customer)}
                                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-emerald-50"
                                                >
                                                    <span className="font-semibold text-slate-800">{customer.name}</span>
                                                    <span className="text-xs text-slate-400">{customer.phone || 'No phone'}</span>
                                                </button>
                                            )) : (
                                                <div className="px-3 py-2 text-sm text-slate-500">No customers found</div>
                                            )}
                                        </div>
                                    )}
                                    {errors.customer_id && <p className="mt-2 text-sm text-rose-600">{errors.customer_id}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Cashier</label>
                                    <select value={data.staff_id} onChange={(e) => setData('staff_id', e.target.value)} className={fieldClass(errors.staff_id)}>
                                        <option value="">Select cashier</option>
                                        {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                                    </select>
                                    {errors.staff_id && <p className="mt-2 text-sm text-rose-600">{errors.staff_id}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Status</label>
                                    <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={fieldClass(errors.status)}>
                                        <option value="1">Paid</option>
                                        <option value="2">Unpaid</option>
                                    </select>
                                    {errors.status && <p className="mt-2 text-sm text-rose-600">{errors.status}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-800">Invoice total</label>
                                    <div className="flex h-11 items-center rounded-xl border border-emerald-100 bg-emerald-50 px-4 text-lg font-bold text-emerald-700">
                                        {money(data.total)}
                                    </div>
                                    {errors.total && <p className="mt-2 text-sm text-rose-600">{errors.total}</p>}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-emerald-50 bg-[#F2F9F5] p-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-slate-950">Pending orders</h3>
                                        <p className="mt-1 text-sm text-slate-500">Only orders not attached to another invoice appear here.</p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                                        {data.order_ids.length} selected
                                    </span>
                                </div>

                                {data.customer_id ? (
                                    filteredPendingOrders.length > 0 ? (
                                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                            {filteredPendingOrders.map((order) => (
                                                <label key={order.id} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-emerald-50 bg-white p-3 shadow-sm transition hover:border-emerald-100 hover:bg-emerald-50/40">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.order_ids.includes(order.id)}
                                                            onChange={(e) => toggleOrder(order.id, e.target.checked)}
                                                            className="rounded border-emerald-200 text-emerald-600 focus:ring-emerald-500"
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
                                    <div className="rounded-xl border border-emerald-100 bg-white p-6 text-center text-sm font-medium text-slate-500">
                                        Select a customer to load pending orders.
                                    </div>
                                )}
                                {errors.order_ids && <p className="mt-2 text-sm text-rose-600">{errors.order_ids}</p>}
                            </div>
                        </div>

                        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-emerald-50 bg-white px-6 py-4">
                            <button type="button" onClick={closeAddModal} className="h-11 rounded-xl border border-emerald-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || data.order_ids.length === 0}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                                Create Invoice
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal show={isDetailModalOpen && !!selectedInvoice} onClose={() => setIsDetailModalOpen(false)} maxWidth="5xl">
                    {selectedInvoice && (
                        <div className="max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-50 bg-white px-6 py-5">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">{invoiceNo(selectedInvoice.id)}</h2>
                                    <p className="mt-1 text-sm text-slate-500">Issued {formatDate(selectedInvoice.created_at, true)}</p>
                                </div>
                                <button type="button" onClick={() => setIsDetailModalOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">
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

                                <div className="overflow-hidden rounded-2xl border border-emerald-50">
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

                <Modal show={isDeleteModalOpen && !!selectedInvoice} onClose={() => setIsDeleteModalOpen(false)} maxWidth="md">
                    {selectedInvoice && (
                        <div className="p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                <i className="fas fa-trash text-lg"></i>
                            </div>
                            <h2 className="text-xl font-bold text-slate-950">Delete invoice?</h2>
                            <p className="mt-2 text-sm text-slate-600">
                                This will delete {invoiceNo(selectedInvoice.id)} and detach its connected orders.
                            </p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleDeleteInvoice} className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700">
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </section>
        </AdminLayout>
    );
}
