import React from 'react';
import moment from 'moment';
import { accentStyles } from '../utils/unitHelpers';

export function UnitTable({ datasList = [], onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto text-left">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-emerald-50 bg-emerald-50/60 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-5 py-4">Unit</th>
                        <th className="px-5 py-4">Created By</th>
                        <th className="px-5 py-4">Created At</th>
                        <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                    {datasList.length > 0 ? (
                        datasList.map((item, index) => {
                            const accent = accentStyles[index % accentStyles.length];

                            return (
                                <tr key={item.id} className="transition hover:bg-emerald-50/30">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                                                <i className="fas fa-ruler text-sm"></i>
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-950">{item?.unit_title}</p>
                                                <p className="mt-0.5 text-xs font-semibold text-slate-400">Unit #{item?.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-505">
                                            {item?.username || 'System'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                                        {item?.created_at ? moment(item.created_at).format('DD/MM/YYYY') : 'N/A'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => onEdit(item)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100 cursor-pointer" type="button">
                                                <i className="fas fa-edit text-xs"></i>
                                                Edit
                                            </button>
                                            <button onClick={() => onDelete(item)} type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 cursor-pointer" aria-label={`Delete ${item?.unit_title || 'unit'}`} title="Delete">
                                                <i className="fas fa-trash text-sm"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-5 py-14 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                                    <i className="fas fa-ruler-combined text-lg"></i>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-slate-500">There are no records found!</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
