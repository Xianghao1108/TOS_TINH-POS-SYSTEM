import React from 'react';
import { Link } from '@inertiajs/react';
import moment from 'moment';

const accentStyles = [
    { tile: 'bg-sky-50', icon: 'text-sky-500', ring: 'ring-sky-100' },
    { tile: 'bg-orange-50', icon: 'text-orange-500', ring: 'ring-orange-100' },
    { tile: 'bg-violet-50', icon: 'text-violet-500', ring: 'ring-violet-100' },
    { tile: 'bg-rose-50', icon: 'text-rose-500', ring: 'ring-rose-100' },
    { tile: 'bg-emerald-50', icon: 'text-emerald-500', ring: 'ring-emerald-100' },
    { tile: 'bg-amber-50', icon: 'text-amber-500', ring: 'ring-amber-100' },
];

export function CategoryCard({ item, index, onDelete }) {
    const accent = accentStyles[index % accentStyles.length];

    const getProductCount = (categoryItem) => {
        return categoryItem?.products_count ?? categoryItem?.product_count ?? categoryItem?.total_products ?? categoryItem?.total_product ?? categoryItem?.view_order ?? 0;
    };

    const pluralizeProducts = (count) => `${count} ${Number(count) === 1 ? 'product' : 'products'}`;
    const productCount = getProductCount(item);

    return (
        <article className="group rounded-xl border border-emerald-50 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] text-left">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                    <i className="fas fa-tag text-lg"></i>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={route('categories.edit', item.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-505 transition hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                        aria-label={`Edit ${item?.name || 'category'}`}
                        title="Edit"
                    >
                        <i className="fas fa-edit text-sm"></i>
                    </Link>
                    <button
                        onClick={() => onDelete(item)}
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        aria-label={`Delete ${item?.name || 'category'}`}
                        title="Delete"
                    >
                        <i className="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-950">
                    {item?.name}
                </h2>
                <p className="text-sm font-medium text-slate-500">
                    {pluralizeProducts(productCount)}
                </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                {item?.username && (
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-500">
                        {item.username}
                    </span>
                )}
                {item?.status !== undefined && item?.status !== null && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        {item.status === 1 ? 'active' : item.status}
                    </span>
                )}
                {item?.created_at && (
                    <span>
                        {moment(item.created_at).format('DD/MM/YYYY')}
                    </span>
                )}
            </div>
        </article>
    );
}
