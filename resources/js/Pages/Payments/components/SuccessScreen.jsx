import React from 'react';
import { money } from '../utils/paymentHelpers';

export function SuccessScreen({ khqrPaymentData, onDone }) {
    return (
        <div className="py-6 flex flex-col items-center justify-center w-full text-center">
            <div className="w-20 h-20 bg-emerald-50 text-[#00A86B] rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-xs animate-bounce">
                <i className="fas fa-check text-4xl"></i>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-1">Successfully Paid!</h3>
            <p className="text-xs text-slate-550 max-w-xs mb-6">
                Order has been processed successfully. The invoice was generated and stock has been updated.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left w-full space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500">Order Number</span>
                    <span className="font-bold text-slate-850">{khqrPaymentData.order_number}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-500">Paid Amount</span>
                    <span className="font-bold text-slate-850">
                        {khqrPaymentData.currency === 'USD' 
                            ? `$${money(khqrPaymentData.amount)}` 
                            : `${Number(khqrPaymentData.amount).toLocaleString('en-US')} KHR`
                        }
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={onDone}
                className="w-full bg-[#00A86B] hover:bg-emerald-700 active:scale-[0.99] text-white py-3.5 px-4 rounded-full font-bold shadow-md transition text-sm flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
                <span>Done & Clear Cart</span>
                <i className="fas fa-arrow-right"></i>
            </button>
        </div>
    );
}
