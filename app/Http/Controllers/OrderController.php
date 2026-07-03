<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
     * Store a newly created order in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_number' => ['required', 'string', 'max:255', 'unique:orders,order_number'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'staff_id' => ['required', 'exists:users,id'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'max:10'],
            'status' => ['required', 'string', 'max:50'],
            'total_payment' => ['required', 'numeric', 'min:0'],
            'payment_method' => ['required', 'string', 'in:Cash,Credit Card,KHQR'],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
        ]);

        $order = DB::transaction(function () use ($validated) {
            return Order::create($validated);
        });

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => $order,
        ], 201);
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
