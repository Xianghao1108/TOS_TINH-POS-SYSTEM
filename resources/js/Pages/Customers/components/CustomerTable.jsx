import React from 'react';
import { padCustomerId } from '../utils/customerHelpers';

export function CustomerTable({ customerList = [], onEdit, onDelete }) {
    return (
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-x-auto text-left">
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
                                    {padCustomerId(customer.id)}
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
                                        onClick={() => onEdit(customer)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                                        title="Edit Customer"
                                        type="button"
                                    >
                                        <i className="fas fa-edit"></i> Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(customer)}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                                        title="Delete Customer"
                                        type="button"
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
    );
}
