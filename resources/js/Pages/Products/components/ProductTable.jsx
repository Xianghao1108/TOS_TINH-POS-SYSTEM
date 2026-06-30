import React from 'react';
import { getProductImageUrl, accentStyles } from '../utils/productHelpers';

export function ProductTable({ productsList = [], onViewDetail, onEdit, onDelete }) {
    return (
        <div className="w-full overflow-x-hidden text-left">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-emerald-50 bg-emerald-50/60 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-3 py-2.5">Image</th>
                        <th className="px-3 py-2.5 hidden sm:table-cell">Code</th>
                        <th className="px-3 py-2.5">Product Title</th>
                        <th className="px-3 py-2.5 hidden md:table-cell">Category</th>
                        <th className="px-3 py-2.5">Price</th>
                        <th className="px-3 py-2.5 hidden sm:table-cell">Stock</th>
                        <th className="px-3 py-2.5 hidden sm:table-cell">Status</th>
                        <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                    {productsList.length > 0 ? (
                        productsList.map((item, index) => {
                            const accent = accentStyles[index % accentStyles.length];

                            return (
                                <tr key={item.id} className="transition hover:bg-emerald-50/30">
                                    <td className="px-3 py-2.5">
                                        {item.images && item.images.length > 0 ? (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden ring-1 ring-emerald-100 bg-white shadow-xs">
                                                <img src={getProductImageUrl(item.images[0])} className="h-full w-full object-cover" alt="product thumbnail" />
                                            </div>
                                        ) : (
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                                                <i className="fas fa-box text-xs"></i>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5 hidden sm:table-cell">
                                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                            {item.product_code}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-slate-950 truncate" title={item.product_title}>{item.product_title}</p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-400">
                                                <span>ID #{item.id}</span>
                                                <span className="sm:hidden">• {item.product_code}</span>
                                                <span className="md:hidden">• {item.category?.category_title || item.category?.name || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2.5 hidden md:table-cell">
                                        <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 truncate max-w-full">
                                            {item.category?.category_title || item.category?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-xs font-bold text-emerald-600">
                                        ${Number(item.product_price).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 hidden sm:table-cell">
                                        {item.product_stock}
                                    </td>
                                    <td className="px-3 py-2.5 hidden sm:table-cell">
                                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                                            Number(item.product_status) === 1 
                                                ? 'bg-emerald-50 text-emerald-700' 
                                                : 'bg-rose-50 text-rose-700'
                                        }`}>
                                            {Number(item.product_status) === 1 ? 'In Stock' : 'Out'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => onViewDetail(item)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100" type="button" title="Detail">
                                                <i className="fas fa-eye text-[10px]"></i>
                                            </button>
                                            <button onClick={() => onEdit(item)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100" type="button" title="Edit">
                                                <i className="fas fa-edit text-[10px]"></i>
                                            </button>
                                            <button onClick={() => onDelete(item)} type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100" title="Delete">
                                                <i className="fas fa-trash text-[10px]"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={8} className="px-5 py-14 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                                    <i className="fas fa-box text-lg"></i>
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
