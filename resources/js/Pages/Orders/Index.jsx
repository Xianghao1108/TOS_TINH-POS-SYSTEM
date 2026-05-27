import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';

export default function OrdersPage({ orders, filters }) {
    const datasList = orders?.data || orders || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);

    const headWeb = 'Sales History Log';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const money = (value) => Number(value || 0).toFixed(2);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('orders.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    // Open item breakdown windows payload settings
    const openDetailModal = (order) => {
        setActiveOrder(order);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setActiveOrder(null);
    };

    const confirmOrderDeletion = (order) => {
        setActiveOrder(order);
        setConfirmingDeletion(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDeletion(false);
        setActiveOrder(null);
    };

    const deleteOrderRow = (e) => {
        e.preventDefault();
        router.delete(route('orders.destroy', activeOrder.id), {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal()
        });
    };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />} >
            <Head title={headWeb} />
            <section className="content p-6 max-w-7xl mx-auto">
                <div className="bg-white border border-gray-200 rounded shadow-sm">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                                <button type="submit" className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                                    <i className="fas fa-search"></i>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase">
                                    <th className="p-4">Invoice No.</th>
                                    <th className="p-4">Date & Time</th>
                                    <th className="p-4">Cashier (Staff)</th>
                                    <th className="p-4">Subtotal</th>
                                    <th className="p-4">Discount</th>
                                    <th className="p-4">Grand Total</th>
                                    <th className="p-4">Received Payment</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {datasList.length > 0 ? datasList.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4"><span className="bg-gray-100 text-gray-800 font-mono px-2 py-1 rounded text-xs font-semibold">#INV-{order.id}</span></td>
                                        <td className="p-4 text-gray-600">{moment(order.created_at).format("DD/MM/YYYY hh:mm A")}</td>
                                        <td className="p-4 text-gray-800">{order.staff?.name || order.staff_id || 'System'}</td>
                                        <td className="p-4 text-gray-600">${money(order.subtotal)}</td>
                                        <td className="p-4 text-red-500">-${money(order.discount)}</td>
                                        <td className="p-4 font-bold text-blue-600">${money(order.total)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                Number(order.total_payment) >= Number(order.total) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                ${money(order.total_payment)} Paid
                                            </span>
                                        </td>
                                        <td className="p-4 flex items-center gap-2">
                                            <button onClick={() => openDetailModal(order)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1">
                                                <i className="fas fa-eye"></i> View Items ({order.items?.length || 0})
                                            </button>
                                            <button onClick={() => confirmOrderDeletion(order)} type="button" className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 ml-2">
                                                <i className='fas fa-trash'></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={8} className="p-8 text-center text-gray-500 italic">No orders matched search queries.</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {orders?.links && <div className="p-4 border-t border-gray-200"><Pagination links={orders.links} /></div>}
                </div>
            </section>

            {/* MASTER DETAIL SPECIFICATION POP-UP MODAL */}
            <Modal show={isDetailModalOpen} onClose={closeDetailModal} maxWidth="3xl">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        <i className="fas fa-file-invoice text-blue-600 mr-2"></i> Invoice Breakdown Details: #INV-{activeOrder?.id}
                    </h2>
                    <button type="button" onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 transition">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {activeOrder && (
                        <>
                            {/* Summary Information Grid Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-150 rounded text-sm">
                                <div>
                                    <p className="mb-1 text-gray-700"><strong>Cashier Station:</strong> {activeOrder.staff?.name || 'Admin'}</p>
                                    <p className="mb-0 text-gray-700"><strong>Timestamp Logs:</strong> {moment(activeOrder.created_at).format("DD MMMM YYYY, hh:mm:ss A")}</p>
                                </div>
                                <div className="md:text-right">
                                    <p className="mb-1 text-gray-700"><strong>Total Items Count:</strong> {activeOrder.items?.length} positions</p>
                                    <p className="mb-0 text-gray-700"><strong>Status State:</strong> <span className="text-green-600 font-bold">Transaction Confirmed</span></p>
                                </div>
                            </div>

                            {/* Itemized Children Rows Table Area */}
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                                            <th className="p-3">Barcode</th>
                                            <th className="p-3">Product Description Title</th>
                                            <th className="p-3 text-right">Unit Price</th>
                                            <th className="p-3 text-center">Quantity</th>
                                            <th className="p-3 text-right">Sub-amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeOrder.items?.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-3 font-mono text-xs text-gray-500">{item.product_code}</td>
                                                <td className="p-3 font-semibold text-gray-800">{item.product_title}</td>
                                                <td className="p-3 text-right text-gray-600">${money(item.product_price)}</td>
                                                <td className="p-3 text-center font-bold text-gray-700">{item.quantity}</td>
                                                <td className="p-3 text-right text-green-600 font-bold">
                                                    ${money(Number(item.product_price) * item.quantity)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50 font-semibold text-gray-700 border-t border-gray-200">
                                            <td colSpan="3" className="p-3 border-0"></td>
                                            <td className="p-3 text-right border-0">Subtotal:</td>
                                            <td className="p-3 text-right border-0">${money(activeOrder.subtotal)}</td>
                                        </tr>
                                        <tr className="bg-gray-50 font-semibold text-gray-700">
                                            <td colSpan="3" className="p-3 border-0"></td>
                                            <td className="p-3 text-right text-danger border-0">Discount:</td>
                                            <td className="p-3 text-right text-danger border-0">-${money(activeOrder.discount)}</td>
                                        </tr>
                                        <tr className="bg-gray-50 font-bold text-gray-850">
                                            <td colSpan="3" className="p-3 border-0"></td>
                                            <td className="p-3 text-right text-lg border-0">Total Bill:</td>
                                            <td className="p-3 text-right text-lg text-blue-600 border-0">${money(activeOrder.total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                    <SecondaryButton onClick={closeDetailModal}>Close History Window</SecondaryButton>
                </div>
            </Modal>

            {/* ORDER RECORD DELETE DESTRUCTION CONFIRMATION */}
            <Modal show={confirmingDeletion} onClose={closeDeleteModal} maxWidth="md">
                <div className="p-6 relative">
                    <button type="button" onClick={closeDeleteModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
                        <i className="fas fa-times"></i>
                    </button>
                    <h2 className="text-lg font-bold text-red-600 mb-3">Danger Alert!</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to completely remove transaction logs for invoice 
                        <strong className="text-red-600 font-semibold ml-1">#INV-{activeOrder?.id}</strong>? 
                        This structural step cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal}>Abort</SecondaryButton>
                        <DangerButton onClick={deleteOrderRow}>Yes, Wipe Record</DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
