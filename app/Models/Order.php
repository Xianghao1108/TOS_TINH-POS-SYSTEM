<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'staff_id',
        'subtotal',
        'discount',
        'total',
        'total_payment'
    ];

    // One order has many item rows matching your schema map
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Cashier administrator tracking relationship
    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    // Customer link relation (Optional if customer logic is not implemented yet)
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    // Invoices that contain this order
    public function invoices()
    {
        return $this->belongsToMany(Invoice::class, 'invoice_orders', 'order_id', 'invoice_id')
            ->using(InvoiceOrder::class)
            ->withPivot('total')
            ->withTimestamps();
    }
}
