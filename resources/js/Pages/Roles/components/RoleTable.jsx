import React from 'react';
import { Link } from '@inertiajs/react';
import moment from 'moment';

const accentStyles = [
    { tile: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    { tile: 'bg-cyan-50', icon: 'text-cyan-600', ring: 'ring-cyan-100' },
    { tile: 'bg-fuchsia-50', icon: 'text-fuchsia-600', ring: 'ring-fuchsia-100' },
    { tile: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
];

export function RoleTable({ datasList = [], can = {}, onDelete }) {
    return (
        <div className="overflow-x-auto text-left">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-emerald-50 bg-emerald-50/60 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-5 py-4">#ID</th>
                        <th className="px-5 py-4">Role Title</th>
                        <th className="px-5 py-4">Guard Name</th>
                        <th className="px-5 py-4">Created At</th>
                        {can['role-edit'] !== false && can['role-delete'] !== false && (
                            <th className="px-5 py-4 text-right">Action</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                    {datasList.length > 0 ? (
                        datasList.map((item, index) => {
                            const accent = accentStyles[index % accentStyles.length];

                            return (
                                <tr key={item.id} className="transition hover:bg-emerald-50/30">
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                                        {item.id}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                                                <i className="fas fa-user-shield text-sm"></i>
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-800">{item.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                            {item.guard_name}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {moment(item.created_at).format("DD/MM/YYYY")}
                                    </td>
                                    {(can['role-edit'] !== false || can['role-delete'] !== false) && (
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {can['role-edit'] !== false && (
                                                    <Link
                                                        href={route('roles.edit', item.id)}
                                                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-emerald-700"
                                                    >
                                                        <i className="fas fa-edit text-[10px]"></i> Edit
                                                    </Link>
                                                )}
                                                {can['role-delete'] !== false && (
                                                    <button
                                                        onClick={() => onDelete(item)}
                                                        type="button"
                                                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
                                                    >
                                                        <i className="fas fa-trash text-[10px]"></i> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="py-8 text-center text-sm font-medium text-slate-500">
                                No roles found in database.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
