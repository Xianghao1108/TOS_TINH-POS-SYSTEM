<?php

namespace App\Services\Notification;

use App\Models\Payment;

interface INotificationService
{
    /**
     * Send payment success notification.
     */
    public function sendPaymentSuccessNotification(Payment $payment): bool;
}
