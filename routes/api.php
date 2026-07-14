<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PaymentApiController;
use App\Http\Controllers\Api\ReportApiController;
use App\Http\Controllers\Api\TelegramBotController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group(['middleware' => 'api', 'prefix' => 'auth'], function ($router) {
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
Route::post('/telegram-webhook', [TelegramBotController::class, 'handleWebhook']);
Route::post('/send/telegram', [TelegramBotController::class, 'handleOriginalBotCommands']);

Route::post('/reports/trigger-now', [ReportApiController::class, 'triggerNow']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/settings/telegram', [SettingController::class, 'getTelegramSettings']);
    Route::post('/settings/telegram/update', [SettingController::class, 'updateTelegramSettings']);
    Route::post('/invoices/checkout', [InvoiceController::class, 'checkout']);
});
