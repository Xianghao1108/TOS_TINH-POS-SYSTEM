import React from 'react';
import { money, getProductImageUrl, getCategoryStyle } from '../utils/paymentHelpers';

export function ProductCard({ product, cart = [], onAddToCart }) {
    const cartItem = cart.find(item => item.id === product.id);
    const remainingStock = Number(product.product_stock) - Number(cartItem?.quantity || 0);
    const isLowStock = remainingStock < 5;

    const catName = product.category?.name?.toLowerCase() || '';
    let productIcon = 'fa-box-open';
    if (catName.includes('beverage') || product.product_title?.toLowerCase().includes('cola') || product.product_title?.toLowerCase().includes('water')) {
        productIcon = 'fa-coffee';
    } else if (catName.includes('snack') || product.product_title?.toLowerCase().includes('chip') || product.product_title?.toLowerCase().includes('snack')) {
        productIcon = 'fa-cookie';
    } else if (catName.includes('bakery') || product.product_title?.toLowerCase().includes('bread')) {
        productIcon = 'fa-bread-slice';
    } else if (catName.includes('dairy') || product.product_title?.toLowerCase().includes('cheese') || product.product_title?.toLowerCase().includes('milk')) {
        productIcon = 'fa-cheese';
    } else if (catName.includes('pantry') || product.product_title?.toLowerCase().includes('egg')) {
        productIcon = 'fa-egg';
    }

    const handlePress = () => {
        if (remainingStock > 0 && onAddToCart) {
            onAddToCart(product);
        }
    };

    return (
        <div
            onClick={handlePress}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePress();
                }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Add ${product.product_title} to cart`}
            className={`bg-white rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 group cursor-pointer border border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500/20 select-none ${
                remainingStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {/* Image Wrapper */}
            <div className="relative w-full aspect-square bg-slate-50/70 rounded-2xl flex items-center justify-center p-3 overflow-hidden mb-2 transition-colors duration-300 group-hover:bg-slate-100/50">
                {product.images && product.images.length > 0 ? (
                    <img
                        src={getProductImageUrl(product.images[0])}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        alt={product.product_title}
                    />
                ) : (
                    <div className="flex items-center justify-center text-slate-400">
                        <i className={`fas ${productIcon} text-4xl text-slate-300/80 transition-transform duration-500 group-hover:scale-110`}></i>
                    </div>
                )}

                {/* Absolute stock status indicators */}
                {remainingStock <= 0 ? (
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-semibold border border-slate-200/40 uppercase tracking-wider">
                        Out of Stock
                     </span>
                ) : isLowStock ? (
                    <span className="absolute top-2 left-2 bg-rose-50/95 backdrop-blur-xs text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-semibold border border-rose-100/40 uppercase tracking-wider">
                        {remainingStock} Left
                     </span>
                ) : null}
            </div>

            {/* Product Info Details Block */}
            <div className="flex flex-col flex-grow justify-between text-left">
                {/* Product Name */}
                <h3 className="text-slate-800 font-medium text-sm truncate mb-1" title={product.product_title}>
                    {product.product_title}
                </h3>

                {/* Bottom Row */}
                <div className="flex justify-between items-center mt-2 w-full">
                    {/* Category Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider ${getCategoryStyle(product.category?.name)}`}>
                        {product.category?.name || 'General'}
                    </span>

                    {/* Price Display */}
                    <span className="text-slate-900 font-bold text-base">
                        ${money(product.product_price)}
                    </span>
                </div>
            </div>
        </div>
    );
}
