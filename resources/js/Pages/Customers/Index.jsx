import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';

export default function CustomersIndex({ customers = {}, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Inertia form helper for creation and updates
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        username: '',
        email: '',
        phone: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/customers', { search: searchQuery }, { preserveState: true });
    };

    const openAddModal = () => {
        clearErrors();
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (customer) => {
        clearErrors();
        setData({
            username: customer.username,
            email: customer.email,
            phone: customer.phone,
        });
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (customer) => {
        setSelectedCustomer(customer);
        setIsDeleteModalOpen(true);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post('/customers', {
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(`/customers/${selectedCustomer.id}`, {
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
            },
        });
    };

    const handleDelete = () => {
        destroy(`/customers/${selectedCustomer.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedCustomer(null);
            },
        });
    };

    const headWeb = 'Customers';
    const linksBreadcrumb = [
        { title: 'Home', url: '/' },
        { title: headWeb, url: '' }
    ];

    const customerList = customers.data || [];
    const totalCustomers = customers.total || 0;

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                        <p className="text-sm text-gray-500">Manage your minimart's customer database.</p>
                    </div>
                    <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition duration-150">
                        <i className="fas fa-plus"></i> Add Customer
                    </button>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Total Registered Customers</span>
                        <span className="text-2xl font-bold text-gray-800">{totalCustomers}</span>
                    </div>
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Recently Updated</span>
                        <span className="text-2xl font-bold text-gray-800">{customerList.length > 0 ? 'Active' : 'N/A'}</span>
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
                            placeholder="Search by username, email, phone..."
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
                                router.get('/customers');
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
                                <th className="p-4 font-semibold text-gray-700">ID</th>
                                <th className="p-4 font-semibold text-gray-700">Username</th>
                                <th className="p-4 font-semibold text-gray-700">Email</th>
                                <th className="p-4 font-semibold text-gray-700">Phone</th>
                                <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerList.length > 0 ? (
                                customerList.map((customer) => (
                                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="p-4 text-gray-600 font-mono">
                                            #{String(customer.id).padStart(4, '0')}
                                        </td>
                                        <td className="p-4 text-gray-800 font-medium">
                                            {customer.username}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {customer.email}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {customer.phone}
                                        </td>
                                        <td className="p-4 flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                                title="Edit Customer"
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(customer)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                                                title="Delete Customer"
                                            >
                                                <i className="fas fa-trash"></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {customers.links && customers.links.length > 3 && (
                    <div className="mt-6 flex justify-center gap-1">
                        {customers.links.map((link, idx) => (
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

            {/* Add Customer Modal */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="md">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Add Customer</h2>
                    <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={submitAdd} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <InputError message={errors.username} className="mt-1" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>

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
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Customer Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="md">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Edit Customer</h2>
                    <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={submitEdit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <InputError message={errors.username} className="mt-1" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <InputError message={errors.phone} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="sm">
                {selectedCustomer && (
                    <div className="p-6 relative">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Customer</h2>
                        <p className="text-gray-700 mb-6 font-medium">
                            Are you sure you want to delete customer <strong>{selectedCustomer.username}</strong>? This action cannot be undone.
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
                                onClick={handleDelete}
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
