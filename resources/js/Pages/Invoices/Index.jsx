import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import Modal from '@/Components/Modal';

export default function InvoicesIndex({ invoices = {}, customers = [], pendingOrders = [], users = [], filters = {} }) {
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [filteredPendingOrders, setFilteredPendingOrders] = useState([]);

    // States for customer textbox autocomplete search
    const [customerSearch, setCustomerSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Inertia form for adding new Invoice
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        staff_id: auth?.user?.id || '',
        status: '2', // default to unpaid (2)
        total: '0.00',
        order_ids: [],
    });

    // Handle search query submission
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/invoices', { search: searchQuery }, { preserveState: true });
    };

    // Filter customers list by textbox entry
    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.phone && c.phone.includes(customerSearch))
    );

    // Filter pending orders when customer selection changes
    useEffect(() => {
        if (data.customer_id) {
            const customerOrders = pendingOrders.filter(
                order => String(order.customer_id) === String(data.customer_id)
            );
            setFilteredPendingOrders(customerOrders);
            // Reset selected orders when customer changes
            setData(prev => ({
                ...prev,
                order_ids: [],
                total: '0.00'
            }));
        } else {
            setFilteredPendingOrders([]);
            setData(prev => ({
                ...prev,
                order_ids: [],
                total: '0.00'
            }));
        }
    }, [data.customer_id, pendingOrders]);

    // Handle textbox changes for Customer selection
    const handleCustomerSearchChange = (e) => {
        const val = e.target.value;
        setCustomerSearch(val);
        setData('customer_id', ''); // clear customer ID until selected
        setShowSuggestions(true);
    };

    // Handle selecting a Customer from the overlay list
    const handleSelectCustomer = (customer) => {
        setCustomerSearch(customer.name);
        setData('customer_id', customer.id);
        setShowSuggestions(false);
    };

    // Handle checkbox change in Add Modal
    const handleOrderCheckboxChange = (orderId, isChecked) => {
        let updatedOrderIds = [...data.order_ids];
        if (isChecked) {
            updatedOrderIds.push(orderId);
        } else {
            updatedOrderIds = updatedOrderIds.filter(id => id !== orderId);
        }

        // Calculate total reactively
        const newTotal = pendingOrders
            .filter(order => updatedOrderIds.includes(order.id))
            .reduce((sum, order) => sum + parseFloat(order.total), 0);

        setData(prev => ({
            ...prev,
            order_ids: updatedOrderIds,
            total: newTotal.toFixed(2)
        }));
    };

    const openAddModal = () => {
        clearErrors();
        reset({
            customer_id: '',
            staff_id: auth?.user?.id || (users[0]?.id || ''),
            status: '2',
            total: '0.00',
            order_ids: [],
        });
        setCustomerSearch('');
        setShowSuggestions(false);
        setIsAddModalOpen(true);
    };

    const openDetailModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailModalOpen(true);
    };

    const openDeleteModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDeleteModalOpen(true);
    };

    const submitAddInvoice = (e) => {
        e.preventDefault();
        post('/invoices', {
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleToggleStatus = (invoice) => {
        const nextStatus = invoice.status === 1 ? 2 : 1;
        router.patch(`/invoices/${invoice.id}`, {
            status: nextStatus
        }, {
            preserveScroll: true
        });
    };

    const handleDeleteInvoice = () => {
        router.delete(`/invoices/${selectedInvoice.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedInvoice(null);
            },
            preserveScroll: true
        });
    };

    const headWeb = 'Invoices';
    const linksBreadcrumb = [
        { title: 'Home', url: '/' },
        { title: headWeb, url: '' }
    ];

    // Stats calculations
    const invoiceList = invoices.data || [];
    const totalInvoicesCount = invoices.total || 0;
    const paidInvoicesCount = invoiceList.filter(inv => inv.status === 1).length;
    const unpaidInvoicesCount = invoiceList.filter(inv => inv.status === 2).length;
    const totalRevenue = invoiceList.reduce((sum, inv) => sum + parseFloat(inv.total), 0);

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <div className="p-6 max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                        <p className="text-sm text-gray-500">Create, manage and link customer orders in unified invoices.</p>
                    </div>
                    <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition duration-150">
                        <i className="fas fa-plus"></i> New Invoice
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Total Invoices</span>
                        <span className="text-2xl font-bold text-gray-800">{totalInvoicesCount}</span>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Paid Invoices</span>
                        <span className="text-2xl font-bold text-green-600">{paidInvoicesCount}</span>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Unpaid Invoices</span>
                        <span className="text-2xl font-bold text-yellow-600">{unpaidInvoicesCount}</span>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Loaded Total Sum</span>
                        <span className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</span>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Invoice ID..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-4 py-2 rounded transition">
                        Search
                    </button>
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                router.get('/invoices');
                            }}
                            className="text-red-500 hover:text-red-700 px-2 py-2 flex items-center"
                        >
                            Clear
                        </button>
                    )}
                </form>

                {/* Data Table */}
                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 font-semibold text-gray-700">Invoice ID</th>
                                <th className="p-4 font-semibold text-gray-700">Date</th>
                                <th className="p-4 font-semibold text-gray-700">Customer Name</th>
                                <th className="p-4 font-semibold text-gray-700">Cashier</th>
                                <th className="p-4 font-semibold text-gray-700">Orders Connected</th>
                                <th className="p-4 font-semibold text-gray-700">Total</th>
                                <th className="p-4 font-semibold text-gray-700">Status</th>
                                <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceList.length > 0 ? (
                                invoiceList.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-800 font-semibold">
                                            #INV-{String(invoice.id).padStart(5, '0')}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-800">
                                            {invoice.customer ? invoice.customer.name : 'Walk-in Customer'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {invoice.staff ? invoice.staff.name : 'Unknown Cashier'}
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                                                {invoice.orders ? invoice.orders.length : 0} Orders
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-900 font-bold">
                                            ${parseFloat(invoice.total).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            {invoice.status === 1 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                    <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full"></span>
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                    <span className="w-1.5 h-1.5 mr-1.5 bg-yellow-500 rounded-full"></span>
                                                    Unpaid
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => openDetailModal(invoice)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                                title="View Items"
                                            >
                                                <i className="fas fa-eye"></i> View
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(invoice)}
                                                className={`px-3 py-1 rounded text-xs font-semibold border transition ${
                                                    invoice.status === 1
                                                        ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                                                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                                }`}
                                                title="Toggle Status"
                                            >
                                                {invoice.status === 1 ? 'Mark Unpaid' : 'Mark Paid'}
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(invoice)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete Invoice"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {invoices.links && invoices.links.length > 3 && (
                    <div className="mt-6 flex justify-center gap-1">
                        {invoices.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url, {}, { preserveState: true })}
                                className={`px-3 py-1.5 rounded border text-sm transition ${
                                    link.active
                                        ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Invoice Modal */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="2xl">
                {/* Modal Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Create New Invoice</h2>
                    <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={submitAddInvoice} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Search Textbox with Autocomplete */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                            <input
                                type="text"
                                value={customerSearch}
                                onChange={handleCustomerSearchChange}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Type customer name or phone..."
                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {showSuggestions && (
                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(customer => (
                                            <button
                                                key={customer.id}
                                                type="button"
                                                onClick={() => handleSelectCustomer(customer)}
                                                className="w-full text-left px-3 py-2 hover:bg-blue-50 transition text-sm text-gray-700 flex justify-between"
                                            >
                                                <span className="font-medium">{customer.name}</span>
                                                <span className="text-xs text-gray-400">{customer.phone || 'No phone'}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-gray-500 italic">No customers found</div>
                                    )}
                                </div>
                            )}
                            {errors.customer_id && <div className="text-red-500 text-sm mt-1">{errors.customer_id}</div>}
                        </div>

                        {/* Cashier (Staff) Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cashier (Staff)</label>
                            <select
                                value={data.staff_id}
                                onChange={e => setData('staff_id', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">-- Select Cashier --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            {errors.staff_id && <div className="text-red-500 text-sm mt-1">{errors.staff_id}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="1">Paid</option>
                                <option value="2">Unpaid</option>
                            </select>
                            {errors.status && <div className="text-red-500 text-sm mt-1">{errors.status}</div>}
                        </div>

                        {/* Total Invoice Cost (Reactive representation) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Invoice Cost ($)</label>
                            <input
                                type="text"
                                value={`$ ${data.total}`}
                                className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 font-bold text-blue-700 focus:outline-none"
                                readOnly
                            />
                            {errors.total && <div className="text-red-500 text-sm mt-1">{errors.total}</div>}
                        </div>
                    </div>

                    {/* Pending Orders Selector Checkboxes */}
                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-md font-semibold text-gray-800 mb-2">Select Pending Orders</h3>
                        {data.customer_id ? (
                            filteredPendingOrders.length > 0 ? (
                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50 space-y-2">
                                    {filteredPendingOrders.map(order => (
                                        <label
                                            key={order.id}
                                            className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 cursor-pointer transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={data.order_ids.includes(order.id)}
                                                    onChange={e => handleOrderCheckboxChange(order.id, e.target.checked)}
                                                    className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <div>
                                                    <span className="font-semibold text-gray-800 text-sm">
                                                        Order #ORD-{String(order.id).padStart(5, '0')}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm">
                                                ${parseFloat(order.total).toFixed(2)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-100 rounded p-3">
                                    No pending orders found for this customer.
                                </p>
                            )
                        ) : (
                            <p className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded p-3 text-center">
                                Please select a customer first to view their pending orders.
                            </p>
                        )}
                        {errors.order_ids && <div className="text-red-500 text-sm mt-1">{errors.order_ids}</div>}
                    </div>

                    {/* Modal Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.order_ids.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Create Invoice
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal show={isDetailModalOpen && !!selectedInvoice} onClose={() => setIsDetailModalOpen(false)} maxWidth="3xl">
                {/* Modal Header */}
                {selectedInvoice && (
                    <>
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                Invoice Details: #INV-{String(selectedInvoice.id).padStart(5, '0')}
                            </h2>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Overview Header Metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-100 rounded">
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 uppercase">Customer</span>
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {selectedInvoice.customer ? selectedInvoice.customer.name : 'Walk-in'}
                                    </span>
                                    {selectedInvoice.customer?.phone && (
                                        <span className="block text-xs text-gray-500">{selectedInvoice.customer.phone}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 uppercase">Cashier</span>
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {selectedInvoice.staff ? selectedInvoice.staff.name : 'Unknown'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 uppercase">Date Issued</span>
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-400 uppercase">Status</span>
                                    {selectedInvoice.status === 1 ? (
                                        <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            Paid
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                            Unpaid
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Connected Orders Sub-table */}
                            <div>
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Connected Orders Statement</h3>
                                <div className="border border-gray-200 rounded overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                                                <th className="p-3">Order ID</th>
                                                <th className="p-3">Order Date</th>
                                                <th className="p-3 text-right">Subtotal</th>
                                                <th className="p-3 text-right">Discount</th>
                                                <th className="p-3 text-right">Order Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {selectedInvoice.orders && selectedInvoice.orders.length > 0 ? (
                                                selectedInvoice.orders.map(order => (
                                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="p-3 font-semibold text-gray-700">
                                                            #ORD-{String(order.id).padStart(5, '0')}
                                                        </td>
                                                        <td className="p-3 text-gray-500">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-3 text-right text-gray-600">
                                                            ${parseFloat(order.subtotal).toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right text-red-500">
                                                            -${parseFloat(order.discount).toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-gray-800">
                                                            ${parseFloat(order.total).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="p-4 text-center text-gray-500">
                                                        No orders linked to this invoice.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50 font-bold text-gray-800 border-t border-gray-200">
                                                <td colSpan="4" className="p-3 text-right">Invoice Total:</td>
                                                <td className="p-3 text-right text-lg text-blue-700">
                                                    ${parseFloat(selectedInvoice.total).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
                            >
                                Close Details
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Delete Invoice Modal */}
            <Modal show={isDeleteModalOpen && !!selectedInvoice} onClose={() => setIsDeleteModalOpen(false)} maxWidth="md">
                {selectedInvoice && (
                    <div className="p-6 relative">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Invoice</h2>
                        <p className="text-gray-700 mb-6 font-medium">
                            Are you sure you want to delete invoice <strong>#INV-{String(selectedInvoice.id).padStart(5, '0')}</strong>? 
                            This will dissociate connected orders but will not delete the orders themselves.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteInvoice}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
