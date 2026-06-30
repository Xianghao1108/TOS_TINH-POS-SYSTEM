<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderItem;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Summary Metrics
        $today = Carbon::today();
        
        // Today's Revenue: sum of invoice totals from today where status is 1 (paid)
        $todayRevenue = (float) Invoice::whereDate('created_at', $today)
            ->where('status', 1)
            ->sum('total');

        // Today's Transaction Count: count of invoices from today
        $todayTransactions = Invoice::whereDate('created_at', $today)->count();

        // Active Staff Count: total users registered in the system (or active ones)
        $activeStaffCount = User::count();

        // Low Stock Alerts Count: count of products where stock quantity is below a minimum threshold of 10
        $lowStockCount = Product::where('product_stock', '<', 10)->count();

        // 2. Chart Data: Last 7 days of sales (date & revenue)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenue = Invoice::whereDate('created_at', $date)
                ->where('status', 1)
                ->sum('total');

            $chartData[] = [
                'date' => $date->format('M d'),
                'revenue' => (float) $revenue,
            ];
        }

        // 3. Recent Invoices: Eager loaded with customer relationship, newest first
        $recentInvoices = Invoice::with('customer')
            ->latest()
            ->take(5)
            ->get();

        // 4. Top Products: Fetch top 5 best-selling products based on quantity in order_items
        $topProducts = OrderItem::select('product_id', 'product_title', 'product_price')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->groupBy('product_id', 'product_title', 'product_price')
            ->orderByDesc('total_quantity')
            ->take(5)
            ->get();

        // 5. Low Stock Items: Fetch top 5 products with lowest stock quantities
        $lowStockItems = Product::orderBy('product_stock', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'todayRevenue' => $todayRevenue,
                'todayTransactions' => $todayTransactions,
                'activeStaffCount' => $activeStaffCount,
                'lowStockCount' => $lowStockCount,
            ],
            'chartData' => $chartData,
            'recentInvoices' => $recentInvoices,
            'topProducts' => $topProducts,
            'lowStockItems' => $lowStockItems,
        ]);
    }
}
