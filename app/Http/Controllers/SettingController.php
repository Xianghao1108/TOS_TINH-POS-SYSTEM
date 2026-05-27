<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display the settings index page.
     */
    public function index()
    {
        $settings = [
            'store_name' => Setting::get('store_name', 'Tos Tinh Mart'),
            'store_address' => Setting::get('store_address', 'Phnom Penh, Cambodia'),
            'store_email' => Setting::get('store_email', 'contact@tostinh.com'),
            'store_phone' => Setting::get('store_phone', '+855 12 345 678'),
            'currency_symbol' => Setting::get('currency_symbol', '$'),
            'tax_rate' => Setting::get('tax_rate', '10.00'),
            'receipt_header' => Setting::get('receipt_header', 'Thank you for shopping with us!'),
            'receipt_footer' => Setting::get('receipt_footer', 'Please come again!'),
            'low_stock_alerts' => Setting::get('low_stock_alerts', '1'),
            'low_stock_threshold' => Setting::get('low_stock_threshold', '5'),
            'default_checkout_role' => Setting::get('default_checkout_role', '1'),
            'theme_mode' => Setting::get('theme_mode', 'light'),
        ];

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update configuration settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_address' => 'nullable|string',
            'store_email' => 'required|email|max:255',
            'store_phone' => 'required|string|max:50',
            'currency_symbol' => 'required|string|max:10',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'receipt_header' => 'nullable|string',
            'receipt_footer' => 'nullable|string',
            'low_stock_alerts' => 'required|in:0,1',
            'low_stock_threshold' => 'required|integer|min:0',
            'default_checkout_role' => 'required|in:1,2',
            'theme_mode' => 'required|in:light,dark',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, (string) $value);
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
