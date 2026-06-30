import React from 'react';
import moment from 'moment';
import { money } from '../utils/orderHelpers';

export function OrderTable({ datasList = [], onViewDetail, onDelete }) {
    return (
        <div className="overflow-x-auto text-left">
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
                                <button onClick={() => onViewDetail(order)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1 border-0 bg-transparent cursor-pointer" type="button">
                                    <i className="fas fa-eye"></i> View Items ({order.items?.length || 0})
                                </button>
                                <button onClick={() => onDelete(order)} type="button" className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 ml-2 border-0 bg-transparent cursor-pointer">
                                    <i className='fas fa-trash'></i> Delete
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={8} className="p-8 text-center text-gray-500 italic">
                                No orders matched search queries.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
