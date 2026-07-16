import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { getAvatarColor, getInitials } from '../utils/userHelpers';

export function UserTable({ usersList = [], roles = [], onRoleChange, can = {}, onDelete }) {
    const { auth } = usePage().props;

    return (
        <div className="overflow-x-auto text-left">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {usersList.length > 0 ? (
                        usersList.map((item, k) => {
                            const roleName = item?.roles?.[0]?.name || 'User';
                            const status = item.id % 2 === 0 ? 'Inactive' : 'Active';
                            const isCurrentUser = item.id === auth?.user?.id;

                            return (
                                <tr key={k} className="hover:bg-gray-50/50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-700">#{item.id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(item.name)}`}>
                                                {getInitials(item.name)}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-505">{item.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {can['user.edit'] && !isCurrentUser ? (
                                            <select
                                                value={item?.roles?.[0]?.id || ''}
                                                onChange={(e) => onRoleChange(item, e.target.value)}
                                                className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-xs font-semibold text-blue-700 outline-none transition hover:bg-blue-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                            >
                                                <option value="" disabled>Select role</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id} className="text-slate-800 bg-white font-medium">
                                                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                isCurrentUser
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`} title={isCurrentUser ? 'You cannot change your own role' : undefined}>
                                                {roleName} {isCurrentUser && '(You)'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {status === 'Active' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            {can['user.edit'] && (
                                                <Link href={route('users.edit', item.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </Link>
                                            )}
                                            {can['user.delete'] && (
                                                <button onClick={() => onDelete(item)} type="button" className="text-gray-400 hover:text-red-650 transition-colors border-0 bg-transparent cursor-pointer">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                No users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
