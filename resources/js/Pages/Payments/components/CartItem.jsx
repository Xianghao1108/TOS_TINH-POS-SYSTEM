import React from 'react';
import { money, getProductImageUrl } from '../utils/paymentHelpers';

export function CartItem({ item, onUpdateQuantity, onRemoveItem }) {
    return (
        <div className="flex items-center p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs hover:shadow-sm transition">
            {/* Trash icon on far left */}
            <button 
                onClick={() => onRemoveItem(item.id)} 
                className="text-slate-400 hover:text-rose-500 transition mr-2.5 p-1 flex-shrink-0"
                type="button"
                title="Remove item"
            >
                <i className="fas fa-trash-alt text-sm"></i>
            </button>

            {/* Thumbnail Image on the left */}
            <div className="h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center border border-slate-100 mr-3">
                {item.images && item.images.length > 0 ? (
                    <img src={getProductImageUrl(item.images[0])} className="h-full w-full object-cover" alt="product thumbnail" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-green-50 text-green-600">
                        <i className="fas fa-box text-xs"></i>
                    </div>
                )}
            </div>

            {/* Item name and description (middle) */}
            <div className="flex-1 min-w-0 mr-3">
                <h4 className="font-bold text-slate-800 text-sm truncate" title={item.product_title}>{item.product_title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate" title={item.product_description || item.description}>
                    {item.product_description || item.description || 'No description available'}
                </p>
            </div>

            {/* Price and quantity incrementer (right) */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    ${money(Number(item.product_price) * item.quantity)}
                </span>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                    <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-150 text-slate-500 transition-colors font-bold"
                    >
                        -
                    </button>
                    <span className="px-2 py-0.5 font-semibold text-slate-700 min-w-[1.25rem] text-center bg-white border-x border-slate-100">
                        {String(item.quantity).padStart(2, '0')}
                    </span>
                    <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-150 text-slate-500 transition-colors font-bold"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}
