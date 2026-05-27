<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    //
    protected $fillable = [
        'brand_title',
        'maker_id',
        'username'
    ];
    public function maker()
    {
        return $this->belongsTo(Maker::class);
    }
}
