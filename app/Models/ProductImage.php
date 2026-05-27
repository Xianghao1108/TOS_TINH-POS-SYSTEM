<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'product_image_title',
        'product_image_size',
        'product_image_extension'
    ];

    protected $appends = ['image_url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Accessor to get the clean public asset URL path
    public function getImageUrlAttribute()
    {
        return '/storage/products/' . $this->product_image_title;
    }
}
