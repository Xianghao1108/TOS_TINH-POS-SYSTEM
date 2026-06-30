<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Payment;
use App\Services\KhqrService;

$payment = Payment::where('payment_status', 'pending')->latest()->first();

if (!$payment) {
    echo "No pending payments found in database.\n";
    exit;
}

$khqrService = new KhqrService();

echo "MD5: " . $payment->khqr_md5 . "\n";
echo "Trying URL: " . config('services.bakong.api_url') . "\n";

$result = $khqrService->checkTransaction($payment->khqr_md5);

echo "Response:\n";
print_r($result);
echo "\n";
