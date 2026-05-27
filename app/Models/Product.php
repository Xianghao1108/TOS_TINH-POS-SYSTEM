<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'size_id',
        'unit_id',
        'maker_id',
        'brand_id',
        'category_id',
        'product_title',
        'product_description',
        'product_code',
        'product_price',
        'product_stock',
        'product_status',
        'user_id'
    ];

    // Eager load images relationship block
    public function images() 
    { 
        return $this->hasMany(ProductImage::class); 
    }

    public function category() { return $this->belongsTo(Category::class); }
    public function size() { return $this->belongsTo(Size::class); }
    public function unit() { return $this->belongsTo(Unit::class); }
    public function maker() { return $this->belongsTo(Maker::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
}