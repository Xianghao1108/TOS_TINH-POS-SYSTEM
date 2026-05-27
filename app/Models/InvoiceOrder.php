<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class InvoiceOrder extends Pivot
{
    protected $table = 'invoice_orders';

    protected $fillable = [
        'invoice_id',
        'order_id',
        'total',
    ];
}
