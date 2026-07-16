import React, { useState } from 'react';
import AdminLayout from '../Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Breadcrumb from '@/Components/Breadcrumb';
import SalesReportSettings from './Settings/components/SalesReportSettings';

export default function Dashboard({ metrics, chartData = [], recentInvoices = [], topProducts = [], lowStockItems = [] }) {
    const { auth } = usePage().props;
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const headWeb = 'Dashboard';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    // Format currency helper
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(val || 0);
    };

    // Calculate dynamic SVG coordinates for the last 7 days chart
    const svgWidth = 600;
    const svgHeight = 220;
    const paddingX = 40;
    const paddingY = 30;

    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);

    const points = chartData.map((d, i) => {
        const x = paddingX + (i / Math.max(chartData.length - 1, 1)) * (svgWidth - paddingX * 2);
        const y = svgHeight - paddingY - (d.revenue / maxRevenue) * (svgHeight - paddingY * 2);
        return { x, y, date: d.date, revenue: d.revenue };
    });

    // Build the SVG path strings
    let linePath = '';
    let areaPath = '';
    if (points.length > 0) {
        linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
    }

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />

            <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
                
                {/* Header Block: Greetings & System Status Pill */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Hello, {auth.user?.name || 'Administrator'}! 👋
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Here is what's happening at your minimart today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 bg-[#EBF7EE] text-[#00A86B] px-4 py-2 rounded-full border border-emerald-100/50 w-fit self-start md:self-auto">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A86B]"></span>
                        </span>
                        <span className="text-xs font-semibold tracking-wide">System Status: Live & Synced</span>
                    </div>
                </div>

                {/* Grid Block 1: Top Summary Metrics Cards (4 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    
                    {/* Revenue Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
                        <div className="p-3 bg-emerald-50 rounded-xl text-[#00A86B] border border-emerald-100/50">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5 21 12m0 0-3.75 3.75M21 12H3" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Today's Revenue</span>
                            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                                {formatCurrency(metrics.todayRevenue)}
                            </span>
                        </div>
                    </div>

                    {/* Transactions Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Transactions</span>
                            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                                {metrics.todayTransactions}
                            </span>
                        </div>
                    </div>

                    {/* Staff Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600 border border-purple-100/50">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Staff Count</span>
                            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                                {metrics.activeStaffCount}
                            </span>
                        </div>
                    </div>

                    {/* Alerts Card */}
                    <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 text-left transition ${
                        metrics.lowStockCount > 0 
                            ? 'bg-rose-50 border-rose-100/70 text-rose-600' 
                            : 'bg-white border-slate-100 text-slate-700'
                    }`}>
                        <div className={`p-3 rounded-xl border ${
                            metrics.lowStockCount > 0 
                                ? 'bg-rose-100 text-rose-600 border-rose-200/50' 
                                : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <div>
                            <span className={`text-xs font-semibold uppercase tracking-wider block ${
                                metrics.lowStockCount > 0 ? 'text-rose-500' : 'text-slate-400'
                            }`}>
                                Low Stock Alert
                            </span>
                            <span className={`text-2xl font-extrabold mt-1 block ${
                                metrics.lowStockCount > 0 ? 'text-rose-700' : 'text-slate-900'
                            }`}>
                                {metrics.lowStockCount} items
                            </span>
                        </div>
                    </div>

                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Analytics Chart & Recent Invoices (2/3 width on desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Weekly Revenue Line Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Weekly Revenue Trends</h3>
                                    <p className="text-xs text-slate-400">Interactive 7-day revenue lookup</p>
                                </div>
                                <span className="text-xs text-[#00A86B] font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    Last 7 Days
                                </span>
                            </div>

                            {/* Responsive Interactive SVG Area Chart */}
                            <div className="relative w-full overflow-hidden mt-6 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                                <svg 
                                    className="w-full h-auto max-h-[220px]" 
                                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    {/* Horizontal Gridlines */}
                                    <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                                    <line x1={paddingX} y1={(svgHeight - paddingY * 2) / 2 + paddingY} x2={svgWidth - paddingX} y2={(svgHeight - paddingY * 2) / 2 + paddingY} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                                    <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#CBD5E1" strokeWidth="1.5" />

                                    {/* Gradient Area Fill */}
                                    {points.length > 0 && (
                                        <>
                                            <path d={areaPath} fill="url(#chartGradArea)" />
                                            <path d={linePath} stroke="#00A86B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </>
                                    )}

                                    {/* Gradient Definitions */}
                                    <defs>
                                        <linearGradient id="chartGradArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00A86B" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#00A86B" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Data points & Interactive Hover Triggers */}
                                    {points.map((p, idx) => (
                                        <g key={idx}>
                                            <circle 
                                                cx={p.x} 
                                                cy={p.y} 
                                                r={hoveredPoint === idx ? "7" : "5"} 
                                                fill={hoveredPoint === idx ? "#00A86B" : "#FFFFFF"}
                                                stroke="#00A86B" 
                                                strokeWidth="3.5"
                                                className="cursor-pointer transition-all duration-150"
                                                onMouseEnter={() => setHoveredPoint(idx)}
                                                onMouseLeave={() => setHoveredPoint(null)}
                                            />
                                            {/* X-Axis labels (dates) */}
                                            <text 
                                                x={p.x} 
                                                y={svgHeight - 10} 
                                                textAnchor="middle" 
                                                fill="#94A3B8" 
                                                fontSize="11" 
                                                fontWeight="600"
                                            >
                                                {p.date}
                                            </text>
                                        </g>
                                    ))}
                                </svg>

                                {/* Hover tooltip window overlay */}
                                {hoveredPoint !== null && (
                                    <div 
                                        className="absolute bg-slate-900 text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-md z-30 transition-all duration-100 border border-slate-700/50"
                                        style={{
                                            left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                                            top: `${(points[hoveredPoint].y / svgHeight) * 100 - 18}%`,
                                            transform: 'translate(-50%, -100%)'
                                        }}
                                    >
                                        <p className="font-semibold">{points[hoveredPoint].date}</p>
                                        <p className="text-emerald-300 font-bold mt-0.5">{formatCurrency(points[hoveredPoint].revenue)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Invoices Table */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-left">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Recent Checkout Invoices</h3>
                                    <p className="text-xs text-slate-400">The latest 5 transactions completed</p>
                                </div>
                                <Link 
                                    href={route('invoices.index')}
                                    className="text-xs font-semibold text-[#00A86B] hover:text-[#008f5a] bg-emerald-50 hover:bg-emerald-100/70 px-3 py-1.5 rounded-full transition"
                                >
                                    View All Invoices
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                                            <th className="py-3.5 px-6">Invoice ID</th>
                                            <th className="py-3.5 px-6">Customer</th>
                                            <th className="py-3.5 px-6">Date</th>
                                            <th className="py-3.5 px-6">Amount</th>
                                            <th className="py-3.5 px-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                        {recentInvoices.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-400 italic">
                                                    No recent invoices available.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentInvoices.map((inv) => (
                                                <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                                                    <td className="py-4 px-6 font-bold text-slate-900">
                                                        #INV-{inv.id}
                                                    </td>
                                                    <td className="py-4 px-6 font-medium">
                                                        {inv.customer?.customer_name || 'Walk-in Customer'}
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-400 text-xs">
                                                        {new Date(inv.created_at).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-slate-800">
                                                        {formatCurrency(inv.total)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {inv.status === 1 ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#00A86B] border border-emerald-100/50">
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100/50">
                                                                Unpaid
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sales Report Settings */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left">
                            <SalesReportSettings />
                        </div>

                    </div>

                    {/* Right Column: Sidebar Widgets (1/3 width on desktop) */}
                    <div className="space-y-6">
                        


                        {/* Top Best Sellers List */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 mb-4">Top Best Sellers</h3>
                            <div className="space-y-3.5">
                                {topProducts.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-4">No sales data available yet.</p>
                                ) : (
                                    topProducts.map((p, index) => (
                                        <div key={`top-${p.product_id || 'item'}-${index}`} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-extrabold text-[#00A86B] shrink-0">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate" title={p.product_title}>
                                                        {p.product_title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {formatCurrency(p.product_price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {parseInt(p.total_quantity)} sold
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Low Stock Warning Panel */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 mb-4">Low Stock Alerts</h3>
                            <div className="space-y-3">
                                {lowStockItems.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-4">All products are healthy & stocked.</p>
                                ) : (
                                    lowStockItems.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between bg-rose-50/30 p-2.5 rounded-xl border border-rose-100/30">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate" title={p.product_title}>
                                                    {p.product_title}
                                                </p>
                                                <p className="text-[10px] text-slate-400">Code: {p.product_code}</p>
                                            </div>
                                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                                                p.product_stock === 0 
                                                    ? 'bg-rose-100 text-rose-700 animate-pulse' 
                                                    : p.product_stock < 5 
                                                        ? 'bg-amber-100 text-amber-700' 
                                                        : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {p.product_stock} left
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </AdminLayout>
    );
}