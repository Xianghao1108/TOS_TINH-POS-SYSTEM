<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosInvoiceItem extends Model
{
    protected $table = 'pos_invoice_items';

    protected $fillable = [
        'invoice_id',
        'product_id',
        'quantity',
        'unit_price',
    ];

    /**
     * Get the parent invoice.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(PosInvoice::class, 'invoice_id');
    }

    /**
     * Get the associated product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
