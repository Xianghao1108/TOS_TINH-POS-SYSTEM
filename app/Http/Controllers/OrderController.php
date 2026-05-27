<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of order history.
     */
    public function index(Request $request): Response
    {
        // Eager load relationships to prevent N+1 query slowdowns
        $query = Order::with(['items', 'staff']);

        // Search tracking logic (by Invoice ID Number directly)
        if ($request->has('search') && $request->search != '') {
            $query->where('id', $request->search);
        }

        return Inertia::render('Orders/Index', [
            'orders' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only('search')
        ]);
    }

    /**
     * Remove the specified order from historical logs.
     */
    public function destroy(Order $order): RedirectResponse
    {
        // The migration cascade rule automatically drops matching items rows safely from DB
        $order->delete();
        return redirect()->back()->with('success', 'Order record removed from log.');
    }
}
