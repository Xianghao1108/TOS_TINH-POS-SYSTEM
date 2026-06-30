import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import moment from 'moment';
import { money } from '../utils/orderHelpers';

export function OrderDetailModal({ isOpen, onClose, activeOrder }) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="3xl">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center text-left">
                <h2 className="text-xl font-bold text-gray-800">
                    <i className="fas fa-file-invoice text-blue-600 mr-2"></i> Invoice Breakdown Details: #INV-{activeOrder?.id}
                </h2>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 transition border-0 bg-transparent cursor-pointer"
                >
                    <i className="fas fa-times text-lg"></i>
                </button>
            </div>

            <div className="p-6 space-y-6 text-left">
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
                        <div className="border border-gray-250 rounded overflow-hidden">
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
                                        <td className="p-3 text-right text-rose-500 border-0">Discount:</td>
                                        <td className="p-3 text-right text-rose-500 border-0">-${money(activeOrder.discount)}</td>
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
                <SecondaryButton onClick={onClose}>Close History Window</SecondaryButton>
            </div>
        </Modal>
    );
}
