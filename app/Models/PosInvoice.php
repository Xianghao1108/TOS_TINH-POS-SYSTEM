<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosInvoice extends Model
{
    protected $table = 'pos_invoices';

    protected $fillable = [
        'invoice_number',
        'staff_id',
        'total_amount',
        'payment_method',
        'status',
    ];

    /**
     * Get the items belonging to this invoice.
     */
    public function items(): HasMany
    {
        return $this->hasMany(PosInvoiceItem::class, 'invoice_id');
    }

    /**
     * Get the staff member who processed the checkout.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    /**
     * Auto-generate a sequential unique invoice number (e.g. INV-2026-0001).
     */
    public static function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $prefix = "INV-{$year}-";

        $lastInvoice = self::where('invoice_number', 'like', $prefix.'%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNum = intval(substr($lastInvoice->invoice_number, strlen($prefix)));
            $nextNum = $lastNum + 1;
        } else {
            $nextNum = 1;
        }

        return $prefix.str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT);
    }
}
