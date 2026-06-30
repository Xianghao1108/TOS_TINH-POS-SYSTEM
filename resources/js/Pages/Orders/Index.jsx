import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Custom Hooks and Components
import { useOrderManagement } from './hooks/useOrderManagement';
import { OrderTable } from './components/OrderTable';
import { OrderDetailModal } from './components/OrderDetailModal';
import { OrderDeleteModal } from './components/OrderDeleteModal';

export default function OrdersPage({ orders, filters }) {
    const datasList = orders?.data || orders || [];
    const headWeb = 'Sales History Log';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const {
        searchQuery,
        setSearchQuery,
        isDetailModalOpen,
        confirmingDeletion,
        activeOrder,

        handleSearch,
        openDetailModal,
        closeDetailModal,
        confirmOrderDeletion,
        closeDeleteModal,
        deleteOrderRow
    } = useOrderManagement(filters);

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />} >
            <Head title={headWeb} />
            <section className="content p-6 max-w-7xl mx-auto">
                <div className="bg-white border border-gray-200 rounded shadow-sm">
                    
                    {/* Header Banner */}
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Order History Data Log</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Historical checkout sales records.</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search Invoice ID..."
                                    className="border border-gray-300 rounded px-3 py-1 text-sm w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 cursor-pointer">
                                    <i className="fas fa-search"></i>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Order Table list */}
                    <OrderTable
                        datasList={datasList}
                        onViewDetail={openDetailModal}
                        onDelete={confirmOrderDeletion}
                    />

                    {/* Pagination */}
                    {orders?.links && (
                        <div className="p-4 border-t border-gray-200">
                            <Pagination links={orders.links} />
                        </div>
                    )}
                </div>
            </section>

            {/* Master spec details modal */}
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
                activeOrder={activeOrder}
            />

            {/* Delete verify modal */}
            <OrderDeleteModal
                isOpen={confirmingDeletion}
                onClose={closeDeleteModal}
                onSubmit={deleteOrderRow}
                activeOrder={activeOrder}
            />
        </AdminLayout>
    );
}
