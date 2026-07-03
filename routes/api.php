<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PaymentApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group([ 'middleware' => 'api', 'prefix' => 'auth' ], function ($router) {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('jwt.auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');
    });
});

Route::post('/create-payment', [PaymentApiController::class, 'createPayment']);
Route::get('/payment-status/{payment_id}', [PaymentApiController::class, 'getPaymentStatus']);
Route::post('/bakong/webhook', [PaymentApiController::class, 'bakongWebhook']);
Route::post('/payment-webhook', [PaymentApiController::class, 'simulateWebhook']);
Route::post('/orders', [OrderController::class, 'store']);

// Migrated Telegram Webhook routes
Route::post('/telegram-webhook', [\App\Http\Controllers\Api\TelegramBotController::class, 'handleWebhook']);
Route::post('/send/telegram', [\App\Http\Controllers\Api\TelegramBotController::class, 'handleOriginalBotCommands']);