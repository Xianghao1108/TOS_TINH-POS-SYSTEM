<?php

namespace App\Services\Notification;

use App\Models\Payment;

interface INotificationService
{
    /**
     * Send payment success notification.
     *
     * @param Payment $payment
     * @return bool
     */
    public function sendPaymentSuccessNotification(Payment $payment): bool;
}
