<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'email',
        'phone',
    ];

    protected $appends = ['name'];

    public function getNameAttribute()
    {
        return $this->username;
    }
}
