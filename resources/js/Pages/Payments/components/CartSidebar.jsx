import React from 'react';
import { money } from '../utils/paymentHelpers';
import { CartItem } from './CartItem';

export function CartSidebar({
    cart = [],
    setCart,
    subtotal = 0,
    checkoutCurrency = 'USD',
    setCheckoutCurrency,
    onUpdateQuantity,
    onRemoveItem,
    onProceed
}) {
    const orderSequence = 'Order #8832';

    return (
        <div className="card d-flex flex-column h-100 mb-0 flex-grow-1 shadow-sm min-h-0 rounded-2xl border border-slate-200/65 bg-white lg:col-span-5 text-left">
            {/* Panel Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <i className="fas fa-shopping-basket text-[#00A86B]"></i>
                    <span>Details Order</span>
                </h2>
                <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setCart([])}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-100 transition duration-155 cursor-pointer shadow-xs active:scale-95"
                            title="Clear all items in the cart"
                        >
                            <i className="fas fa-trash-alt text-[10px]"></i>
                            <span>Clear Cart</span>
                        </button>
                    )}
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                        {orderSequence}
                    </span>
                </div>
            </div>

            {/* Interactive Cart Item Area */}
            <div
                className="flex-grow-1 min-h-0 overflow-auto p-3 bg-slate-50/50"
                style={{ minHeight: '200px', maxHeight: 'calc(100vh - 320px)' }}
            >
                <div className="space-y-3">
                    {cart.length > 0 ? (
                        cart.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemoveItem={onRemoveItem}
                            />
                        ))
                    ) : (
                        /* Empty State Interface */
                        <div className="flex min-h-[200px] flex-col items-center justify-center py-10 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#00A86B]">
                                <i className="fas fa-shopping-basket text-2xl"></i>
                            </div>
                            <p className="max-w-[240px] text-sm font-semibold text-gray-500">
                                Cart is empty. Scan or tap a product to add it to the current transaction.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Form Summary Display */}
            <div className="mt-auto flex-shrink-0 space-y-4 border-t border-slate-100 p-5 bg-white">
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Details Payment</h3>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Checkout Currency</span>
                        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setCheckoutCurrency('USD')}
                                className={`px-3 py-1 rounded-md transition duration-150 ${checkoutCurrency === 'USD' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                USD
                            </button>
                            <button
                                type="button"
                                onClick={() => setCheckoutCurrency('KHR')}
                                className={`px-3 py-1 rounded-md transition duration-150 ${checkoutCurrency === 'KHR' ? 'bg-white text-[#00A86B] shadow-xs' : 'text-slate-500 hover:text-[#00A86B]'}`}
                            >
                                KHR
                            </button>
                        </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                        <span className="text-sm font-bold text-slate-800">Sub total</span>
                        <span className="text-2xl font-black text-[#00A86B] tracking-tight">
                            {checkoutCurrency === 'USD' 
                                ? `$${money(subtotal)}` 
                                : `${Math.round(subtotal * 4100).toLocaleString('en-US')} KHR`
                            }
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onProceed}
                    disabled={cart.length === 0}
                    className="w-full bg-[#00A86B] hover:bg-emerald-700 active:scale-[0.99] text-white py-3 px-4 rounded-full font-bold shadow-sm shadow-emerald-100 hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <i className="fas fa-wallet text-sm"></i>
                    <span>Proceed to Checkout</span>
                </button>
            </div>
        </div>
    );
}
