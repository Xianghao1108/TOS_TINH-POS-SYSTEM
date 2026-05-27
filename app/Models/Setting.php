<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set/Save a setting key-value pair.
     */
    public static function set(string $key, $value): self
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        return $setting;
    }
}
