import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    const [showFeatures, setShowFeatures] = useState(false);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#EBF7EE] p-4 md:p-8 font-sans antialiased">
            <Head title="Welcome to Smart Minimart" />

            {/* Custom animations for float, pulse and wave effect */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(1deg); }
                }
                @keyframes float-opposite {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(12px) rotate(-2deg); }
                }
                .animate-float-phone {
                    animation: float 5s ease-in-out infinite;
                }
                .animate-float-pos {
                    animation: float-opposite 6s ease-in-out infinite;
                }
            `}} />

            {/* Main Card */}
            <div className="bg-white rounded-[24px] shadow-xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 relative">
                
                {/* Left Section (Content & Brand - 50% width on desktop) */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between h-full min-h-[500px]">
                    
                    {/* Header/Logo Block */}
                    <div className="flex items-center gap-3">
                        <div className="bg-[#00A86B] p-2.5 rounded-xl inline-flex w-fit text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h5.25M18 21v-7.5a.75.75 0 0 0-.75-.75h-.5V9l.5-.166a.75.75 0 0 0 .516-.711V5.25A2.25 2.25 0 0 0 15.75 3H8.25A2.25 2.25 0 0 0 6 5.25v2.873a.75.75 0 0 0 .516.711l.5.166V12.75h-.5a.75.75 0 0 0-.75.75V21M3 10.5h18M3 14h18M3 17.5h18" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Smart POS System</h1>
                            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block mt-1">RETAIL POS ADMIN</span>
                        </div>
                    </div>

                    {/* Main Typography */}
                    <div className="my-auto py-6 text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-8 mb-4 tracking-tight leading-tight">
                            Welcome back
                        </h2>
                        <p className="text-slate-500 text-sm md:text-base max-w-sm leading-relaxed">
                            Your retail management suite is ready. Ready to start your shift?
                        </p>

                        {/* Button Actions */}
                        <div className="flex items-center gap-4 mt-8">
                            <Link
                                href={route('login')}
                                className="bg-[#00A86B] hover:bg-[#008f5a] text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-sm transition duration-200"
                            >
                                <span>Sign In</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                            <button
                                onClick={() => setShowFeatures(true)}
                                type="button"
                                className="border border-slate-200 text-slate-600 px-6 py-3 rounded-full font-medium hover:bg-slate-50 transition duration-200"
                            >
                                View Features
                            </button>
                        </div>
                    </div>

                    {/* Footer Divider & Slogan */}
                    <div className="w-full text-left">
                        <div className="border-t border-slate-100 my-8"></div>
                        <p className="italic text-xs md:text-sm text-slate-400">
                            Smart Solutions for Modern Retail
                        </p>
                    </div>

                </div>

                {/* Right Section (Visual Spotlight Image - 50% width on desktop) */}
                <div className="hidden md:block relative h-full w-full bg-gradient-to-br from-[#0B2E1C] via-[#004D40] to-[#052919] p-8 overflow-hidden min-h-[500px]">
                    
                    {/* Glowing decorative circles (minimart store environment aesthetic) */}
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald-500/10 filter blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-teal-400/10 filter blur-[80px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent_60%)]"></div>

                    {/* Store Shelf Grid Pattern Lines */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}></div>

                    {/* Core visual display: Mockup smartphone and floating POS Terminal */}
                    <div className="relative w-full h-full flex items-center justify-center pb-12">
                        <div className="relative w-full max-w-[360px] h-[340px] flex items-center justify-center">
                            
                            {/* 1. Styled Smartphone Mockup */}
                            <div className="absolute left-6 bottom-4 w-48 h-[280px] bg-slate-900 border-4 border-slate-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-2 text-white border-opacity-90 animate-float-phone select-none z-10">
                                {/* Device Camera / Notch */}
                                <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                                </div>
                                
                                {/* Inner Mobile Interface */}
                                <div className="flex-1 bg-white rounded-[22px] p-2 text-slate-800 flex flex-col justify-between overflow-hidden">
                                    {/* Dashboard Top bar */}
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3.5 h-3.5 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-[#00A86B] rounded-full"></div>
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-700">POS App</span>
                                        </div>
                                        <span className="text-[8px] font-medium text-slate-400">POS-01</span>
                                    </div>

                                    {/* Sales Analytics Chart Mockup */}
                                    <div className="my-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col">
                                        <span className="text-[7px] text-slate-400 font-semibold uppercase tracking-wider">Today's Sales</span>
                                        <span className="text-xs font-extrabold text-slate-800">$1,420.50</span>
                                        {/* Dynamic tiny SVG chart */}
                                        <svg className="w-full h-6 mt-1 text-[#00A86B]" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 25 C10 20, 20 28, 30 15 C40 5, 50 18, 60 10 C70 2, 80 12, 100 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M0 25 C10 20, 20 28, 30 15 C40 5, 50 18, 60 10 C70 2, 80 12, 100 4 V30 H0 Z" fill="url(#chartGrad)" opacity="0.15" />
                                            <defs>
                                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#00A86B" />
                                                    <stop offset="100%" stopColor="#00A86B" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>

                                    {/* Active Order Item Mock */}
                                    <div className="flex-1 flex flex-col justify-start gap-1">
                                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Cart Items</span>
                                        <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                            <div className="text-left">
                                                <p className="text-[8px] font-semibold text-slate-700 truncate w-24">Coca-Cola Zero Sugar</p>
                                                <p className="text-[7px] text-slate-400">Qty: 2 &times; $1.50</p>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-800">$3.00</span>
                                        </div>
                                    </div>

                                    {/* Phone bottom payment button */}
                                    <div className="w-full bg-emerald-50 py-1.5 rounded-lg text-center mt-1 border border-emerald-100 flex items-center justify-center gap-1">
                                        <span className="text-[8px] font-extrabold text-[#00A86B]">Processing Checkout...</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Floating Contactless Wave / Wave Ripple indicator */}
                            <div className="absolute left-[130px] top-[110px] z-15 pointer-events-none flex items-center justify-center w-16 h-16">
                                <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400/20 opacity-75"></span>
                                <span className="animate-pulse absolute inline-flex h-8 w-8 rounded-full bg-emerald-400/30"></span>
                                <svg className="w-6 h-6 text-emerald-300 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 0 1 0-5.303m5.304 0a3.75 3.75 0 0 1 0 5.303m-7.425 2.122a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                                </svg>
                            </div>

                            {/* 3. Floating POS Terminal Image */}
                            <div className="absolute -right-4 top-2 w-56 z-20 animate-float-pos select-none filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]">
                                <img
                                    src="/images/pos_terminal.png"
                                    alt="POS Terminal Machine"
                                    className="w-full h-auto object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {/* Fallback cash register vector in case image missing */}
                                <div className="hidden only:block text-emerald-500/20 text-center">
                                    <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V18z" />
                                    </svg>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Floating System Badge */}
                    <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/20 border border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0 relative border border-white/15">
                            {/* Pulse line chart icon */}
                            <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                            </svg>
                            <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                            </span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-bold text-white tracking-wide">System Status: Online</p>
                            <p className="text-[10px] text-slate-300 mt-0.5">Inventory Synced 2m ago</p>
                        </div>
                    </div>

                </div>

            </div>

            {/* View Features Modal */}
            {showFeatures && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl relative border border-slate-100 flex flex-col text-left">
                        {/* Close button */}
                        <button 
                            onClick={() => setShowFeatures(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-emerald-50 p-2.5 rounded-2xl inline-flex text-[#00A86B] border border-emerald-100">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.982-11.795H14l1-6.155L6.018 14.805h5.795Z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Retail Suite Features</h3>
                                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Powerful & Scalable System</p>
                            </div>
                        </div>

                        {/* List of features */}
                        <div className="space-y-4 flex-1">
                            <div className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-950">Real-Time POS Checkout</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Streamlined cash register interface with instant item search, category filters, and quick transaction flow.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-950">Secure Google Authentication</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Single sign-on integration allowing employees and administrators to securely access the shift system.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-950">Inventory & Stock Tracking</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Automatic updates on stock quantities, real-time warning indicators for low inventory levels.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-950">Analytics & Invoices</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Interactive graphs, role-based dashboards, and automated PDF generating modules for receipts.</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowFeatures(false)}
                            className="mt-6 w-full py-3 bg-[#00A86B] hover:bg-[#008f5a] text-white text-center rounded-full font-bold transition shadow-sm"
                        >
                            Got It, Thanks!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
