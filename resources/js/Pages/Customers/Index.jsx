import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';

// Custom Hooks and Components
import { useCustomerManagement } from './hooks/useCustomerManagement';
import { CustomerTable } from './components/CustomerTable';
import { CustomerFormModal } from './components/CustomerFormModal';
import { CustomerDeleteModal } from './components/CustomerDeleteModal';

export default function CustomersIndex({ customers = {}, filters = {} }) {
    const headWeb = 'Customers';
    const linksBreadcrumb = [
        { title: 'Home', url: '/' },
        { title: headWeb, url: '' }
    ];

    const {
        searchQuery,
        setSearchQuery,
        isAddModalOpen,
        setIsAddModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        selectedCustomer,

        data,
        setData,
        processing,
        errors,

        handleSearch,
        openAddModal,
        openEditModal,
        openDeleteModal,
        submitAdd,
        submitEdit,
        handleDelete
    } = useCustomerManagement(filters);

    const customerList = customers.data || [];
    const totalCustomers = customers.total || 0;

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <div className="p-6 max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                        <p className="text-sm text-gray-500">Manage your minimart's customer database.</p>
                    </div>
                    <button 
                        onClick={openAddModal} 
                        className="bg-[#00A86B] hover:bg-emerald-700 text-white px-4 py-2 rounded shadow flex items-center gap-2 transition duration-150 border-0 cursor-pointer text-sm font-semibold"
                    >
                        <i className="fas fa-plus"></i> Add Customer
                    </button>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
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
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-4 py-2 rounded transition cursor-pointer text-sm"
                    >
                        Search
                    </button>
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                router.get('/customers');
                            }}
                            className="text-red-500 hover:text-red-700 px-2 py-2 flex items-center cursor-pointer border-0 bg-transparent text-sm font-semibold"
                        >
                            Clear
                        </button>
                    )}
                </form>

                {/* Customer data table */}
                <CustomerTable
                    customerList={customerList}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                />

                {/* Pagination */}
                {customers.links && customers.links.length > 3 && (
                    <div className="mt-6 flex justify-center gap-1">
                        {customers.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url, {}, { preserveState: true })}
                                className={`px-3 py-1.5 rounded border text-sm transition cursor-pointer ${
                                    link.active
                                        ? 'bg-[#00A86B] border-emerald-600 text-white font-semibold'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Customer Modal */}
            <CustomerFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={submitAdd}
                title="Add Customer"
                submitText="Save"
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
            />

            {/* Edit Customer Modal */}
            <CustomerFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={submitEdit}
                title="Edit Customer"
                submitText="Update"
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
            />

            {/* Delete Customer Confirmation Modal */}
            <CustomerDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSubmit={handleDelete}
                selectedCustomer={selectedCustomer}
            />
        </AdminLayout>
    );
}
