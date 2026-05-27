<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'staff_id',
        'total',
        'status',
    ];

    /**
     * Get the customer associated with the invoice.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * Get the staff (User) who created the invoice.
     */
    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Get the orders associated with the invoice.
     */
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'invoice_orders', 'invoice_id', 'order_id')
            ->using(InvoiceOrder::class)
            ->withPivot('total')
            ->withTimestamps();
    }
}
