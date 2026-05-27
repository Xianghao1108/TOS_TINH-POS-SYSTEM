<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices.
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['customer', 'staff', 'orders']);

        // Search tracking logic (by Invoice ID)
        if ($request->has('search') && $request->search != '') {
            $query->where('id', 'like', '%' . $request->search . '%');
        }

        $invoices = $query->latest()->paginate(15)->withQueryString();
        $customers = Customer::orderBy('name')->get();
        
        // Fetch any orders that do not belong to an invoice yet
        $pendingOrders = Order::with(['customer', 'staff'])
            ->whereDoesntHave('invoices')
            ->latest()
            ->get();

        $users = User::orderBy('name')->get();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'customers' => $customers,
            'pendingOrders' => $pendingOrders,
            'users' => $users,
            'filters' => $request->only('search')
        ]);
    }

    /**
     * Store a newly created invoice in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'staff_id' => ['required', 'exists:users,id'],
            'status' => ['required', 'in:1,2'],
            'total' => ['required', 'numeric', 'min:0'],
            'order_ids' => ['required', 'array', 'min:1'],
            'order_ids.*' => ['exists:orders,id'],
        ]);

        DB::transaction(function () use ($validated) {
            $invoice = Invoice::create([
                'customer_id' => $validated['customer_id'],
                'staff_id' => $validated['staff_id'],
                'total' => $validated['total'],
                'status' => $validated['status'],
            ]);

            foreach ($validated['order_ids'] as $orderId) {
                $order = Order::findOrFail($orderId);
                $invoice->orders()->attach($order->id, [
                    'total' => $order->total,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Invoice created successfully.');
    }

    /**
     * Update the specified invoice in storage.
     */
    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'customer_id' => ['sometimes', 'required', 'exists:customers,id'],
            'staff_id' => ['sometimes', 'required', 'exists:users,id'],
            'status' => ['required', 'in:1,2'],
            'total' => ['sometimes', 'required', 'numeric', 'min:0'],
            'order_ids' => ['sometimes', 'required', 'array'],
            'order_ids.*' => ['exists:orders,id'],
        ]);

        DB::transaction(function () use ($invoice, $validated) {
            $updateData = ['status' => $validated['status']];
            
            if (isset($validated['customer_id'])) {
                $updateData['customer_id'] = $validated['customer_id'];
            }
            if (isset($validated['staff_id'])) {
                $updateData['staff_id'] = $validated['staff_id'];
            }
            if (isset($validated['total'])) {
                $updateData['total'] = $validated['total'];
            }

            $invoice->update($updateData);

            if (isset($validated['order_ids'])) {
                $syncData = [];
                foreach ($validated['order_ids'] as $orderId) {
                    $order = Order::findOrFail($orderId);
                    $syncData[$order->id] = ['total' => $order->total];
                }
                $invoice->orders()->sync($syncData);
            }
        });

        return redirect()->back()->with('success', 'Invoice updated successfully.');
    }

    /**
     * Remove the specified invoice from storage.
     */
    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return redirect()->back()->with('success', 'Invoice deleted successfully.');
    }
}
