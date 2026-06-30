import React from 'react';
import moment from 'moment';
import { accentStyles, getStatus, getCategoryName } from '../utils/subCategoryHelpers';

export function SubCategoryCard({ item, index, onEdit, onDelete }) {
    const accent = accentStyles[index % accentStyles.length];
    const status = getStatus(item);

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-emerald-50 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] text-left">
            <div className="absolute right-4 top-4 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                #{item?.id}
            </div>

            <div className="mb-5 flex items-start justify-between gap-4 pr-16">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                    <i className="fas fa-bookmark text-lg"></i>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-950">
                    {item?.name}
                </h2>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <i className="fas fa-tag text-[10px]"></i>
                    {getCategoryName(item)}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                {item?.username && (
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-505">
                        {item.username}
                    </span>
                )}
                <span className={`rounded-full px-3 py-1 ${status === 'active' ? 'bg-lime-50 text-lime-700' : 'bg-rose-50 text-rose-600'}`}>
                    {status}
                </span>
                {item?.created_at && (
                    <span>
                        {moment(item.created_at).format('DD/MM/YYYY')}
                    </span>
                )}
            </div>

            <div className="mt-6 flex gap-2">
                <button
                    onClick={() => onEdit(item)}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 cursor-pointer"
                    type="button"
                >
                    <i className="fas fa-edit text-xs"></i>
                    Edit
                </button>
                <button
                    onClick={() => onDelete(item)}
                    type="button"
                    className="inline-flex h-10 w-11 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 cursor-pointer"
                    aria-label={`Delete ${item?.name || 'sub category'}`}
                    title="Delete"
                >
                    <i className="fas fa-trash text-sm"></i>
                </button>
            </div>
        </article>
    );
}
