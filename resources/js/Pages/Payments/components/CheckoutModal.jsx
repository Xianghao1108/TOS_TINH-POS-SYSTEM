import React from 'react';
import { money } from '../utils/paymentHelpers';

export function CheckoutModal({
    cart = [],
    customers = [],
    discount,
    setDiscount,
    cashReceived,
    setCashReceived,
    paymentMethod,
    setPaymentMethod,
    transactionReference,
    setTransactionReference,
    processing,
    khqrLoading,
    errors = {},
    data,
    setData,
    subtotal,
    discountAmountVal,
    totalPaymentVal,
    changeDue,
    onClose,
    onConfirm
}) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
            {/* Modal Card Layout */}
            <div className="bg-white w-full max-w-4xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] border border-slate-100 animate-[float_4s_ease-in-out_infinite] relative text-left">
                
                {/* Validation Error Banner */}
                {Object.keys(errors).length > 0 && (
                    <div className="absolute top-4 left-4 right-4 z-20 p-3 rounded-xl bg-rose-50 text-xs font-semibold text-rose-600 border border-rose-100 shadow-sm flex items-center gap-2">
                        <i className="fas fa-exclamation-circle text-rose-500"></i>
                        <div className="flex-1">
                            {Object.values(errors).map((err, idx) => (
                                <p key={idx}>* {err}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Left Column: Order Summary, Customer, Discount */}
                <div className="p-6 md:p-8 bg-slate-50 md:w-1/2 flex flex-col justify-between border-r border-slate-200/60">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-receipt text-slate-400"></i>
                                <span>Order Summary</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-semibold">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
                        </div>

                        {/* Large Total Price Header */}
                        <div className="bg-[#EBF7EE] p-5 rounded-2xl border border-emerald-100/50 text-center mb-6">
                            <span className="text-xs font-bold text-[#00A86B] uppercase tracking-wider block">Grand Total Payment</span>
                            <span className="text-3xl font-black text-[#00A86B] mt-1 block">
                                ${money(totalPaymentVal)}
                            </span>
                        </div>

                        {/* Customer Assignment component */}
                        <div className="space-y-1.5 mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Link Customer profile</label>
                            <div className="relative">
                                <select
                                    value={data.customer_id || ''}
                                    onChange={e => setData('customer_id', e.target.value || null)}
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/25 transition"
                                >
                                    <option value="">-- Guest Checkout --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.username} {c.phone ? `(${c.phone})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <i className="fas fa-chevron-down text-[10px]"></i>
                                </div>
                            </div>
                        </div>

                        {/* Discount input component */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Rate (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    placeholder="0"
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 transition"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Small calculation rows */}
                    <div className="border-t border-slate-200/60 pt-4 mt-6 space-y-2 text-xs font-semibold text-slate-500">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${money(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-rose-500">
                            <span>Discount amount</span>
                            <span>-${money(discountAmountVal)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Method Selection & Checkout calculations */}
                <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between bg-white">
                    <div>
                        <h3 className="text-md font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                            <i className="fas fa-wallet text-slate-400"></i>
                            <span>Select Payment Method</span>
                        </h3>

                        {/* Grid selector for payment types */}
                        <div className="grid grid-cols-3 gap-2.5 mb-6">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition text-center ${paymentMethod === 'cash'
                                    ? 'bg-emerald-50 border-[#00A86B] text-[#00A86B] shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                    }`}
                            >
                                <i className={`fas fa-money-bill-wave text-xl ${paymentMethod === 'cash' ? 'text-[#00A86B]' : 'text-slate-400'}`}></i>
                                <span className="text-[10px] font-bold">Cash</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('qr')}
                                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition text-center ${paymentMethod === 'qr'
                                    ? 'bg-emerald-50 border-[#00A86B] text-[#00A86B] shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                    }`}
                            >
                                <i className={`fas fa-qrcode text-xl ${paymentMethod === 'qr' ? 'text-[#00A86B]' : 'text-slate-400'}`}></i>
                                <span className="text-[10px] font-bold">KHQR</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition text-center ${paymentMethod === 'card'
                                    ? 'bg-emerald-50 border-[#00A86B] text-[#00A86B] shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                    }`}
                            >
                                <i className={`fas fa-credit-card text-xl ${paymentMethod === 'card' ? 'text-[#00A86B]' : 'text-slate-400'}`}></i>
                                <span className="text-[10px] font-bold">Card</span>
                            </button>
                        </div>

                        {/* Conditional options inputs container */}
                        {paymentMethod === 'cash' ? (
                            <div className="space-y-4 p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <i className="fas fa-hand-holding-usd text-[#00A86B]"></i>
                                        <span>Cash Received ($)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-28 text-right border border-slate-250 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-800 border-t border-slate-100 pt-3">
                                    <span>Change Due</span>
                                    <span className="text-lg font-black text-[#00A86B]">${money(changeDue)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-left">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#00A86B]">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Digital checkout selected</h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Payment processed on digital screen scanner.</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction ref # (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TXN-99831A"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                                        value={transactionReference}
                                        onChange={(e) => setTransactionReference(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Base Actions buttons of the modal */}
                    <div className="flex flex-col gap-2 mt-6">
                        <button
                            type="button"
                            disabled={processing || khqrLoading || (paymentMethod === 'cash' && Number(cashReceived || 0) < totalPaymentVal)}
                            onClick={onConfirm}
                            className="w-full bg-[#00A86B] hover:bg-emerald-700 active:scale-[0.99] text-white py-3.5 px-4 rounded-full font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing || khqrLoading ? (
                                <i className="fas fa-circle-notch fa-spin text-sm"></i>
                            ) : (
                                <>
                                    {paymentMethod === 'qr' ? (
                                        <>
                                            <i className="fas fa-qrcode text-sm"></i>
                                            <span>Proceed to pay via KHQR</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-print text-sm"></i>
                                            <span>Confirm Order / Print Receipt</span>
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full border border-slate-200 text-slate-550 hover:bg-slate-50 py-3 px-4 rounded-full font-semibold transition text-center"
                        >
                            Cancel / Back to Cart
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
