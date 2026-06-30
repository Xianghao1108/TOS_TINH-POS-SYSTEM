import React from 'react';
import { money } from '../utils/paymentHelpers';
import { SuccessScreen } from './SuccessScreen';

export function KhqrModal({
    khqrPaymentData,
    khqrStatus,
    khqrTimeLeft,
    onClose,
    onDone
}) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
            {/* Modal Card Layout */}
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden border border-slate-100 relative text-center p-6 md:p-8 flex flex-col items-center">
                
                {khqrStatus !== 'paid' ? (
                    <>
                        {/* Header */}
                        <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-left">
                            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-qrcode text-[#00A86B]"></i>
                                <span>Bakong KHQR Payment</span>
                            </h3>
                            {khqrStatus === 'pending' && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-100 animate-pulse">
                                    <i className="fas fa-spinner fa-spin text-[8px]"></i>
                                    <span>Waiting...</span>
                                </span>
                            )}
                            {khqrStatus === 'expired' && (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-rose-100">
                                    <span>QR Expired</span>
                                </span>
                            )}
                            {khqrStatus === 'failed' && (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-rose-100">
                                    <span>Failed</span>
                                </span>
                            )}
                        </div>

                        {/* QR Code Frame */}
                        <div className="flex flex-col items-center justify-center my-4 w-full">
                            <div className="relative p-4 bg-white border-2 border-slate-200 rounded-3xl shadow-xs overflow-hidden">
                                {(khqrStatus === 'expired' || khqrStatus === 'failed') && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10">
                                        <i className="fas fa-exclamation-triangle text-rose-500 text-3xl mb-2"></i>
                                        <span className="text-sm font-bold text-slate-800">
                                            {khqrStatus === 'expired' ? 'QR Code Expired' : 'Payment Failed'}
                                        </span>
                                        <span className="text-xs text-slate-450 mt-1">Please close and try again</span>
                                    </div>
                                )}
                                <img
                                    src={khqrPaymentData.qr_image}
                                    alt="Bakong KHQR"
                                    className={`w-60 h-60 object-contain rounded-2xl ${(khqrStatus === 'expired' || khqrStatus === 'failed') ? 'blur-xs' : ''}`}
                                />
                            </div>

                            {/* Countdown Timer */}
                            {khqrStatus === 'pending' && (
                                <div className="mt-4 flex items-center gap-1.5 text-slate-650 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-xs font-bold">
                                    <i className="far fa-clock text-[#00A86B]"></i>
                                    <span>Expires in: </span>
                                    <span className="font-mono text-slate-800">
                                        {Math.floor(khqrTimeLeft / 60).toString().padStart(2, '0')}:
                                        {(khqrTimeLeft % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Transaction Details */}
                        <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-500">Order Number</span>
                                <span className="font-bold text-slate-850">{khqrPaymentData.order_number}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-500">Currency</span>
                                <span className="font-bold text-slate-850">{khqrPaymentData.currency}</span>
                            </div>
                            <div className="border-t border-slate-200/60 my-2 pt-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-800">Total Amount</span>
                                <span className="text-xl font-black text-[#00A86B]">
                                    {khqrPaymentData.currency === 'USD' 
                                        ? `$${money(khqrPaymentData.amount)}` 
                                        : `${Number(khqrPaymentData.amount).toLocaleString('en-US')} KHR`
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full border border-slate-200 text-slate-550 hover:bg-slate-50 py-3 px-4 rounded-full font-semibold transition text-sm text-center cursor-pointer bg-white"
                            >
                                Cancel & Go Back
                            </button>
                        </div>
                    </>
                ) : (
                    /* Success Screen */
                    <SuccessScreen
                        khqrPaymentData={khqrPaymentData}
                        onDone={onDone}
                    />
                )}
            </div>
        </div>
    );
}
