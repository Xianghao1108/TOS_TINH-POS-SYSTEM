<?php

namespace App\Providers;

use App\Services\Notification\INotificationService;
use App\Services\Notification\TelegramNotificationService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Config;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            INotificationService::class,
            TelegramNotificationService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production or on Railway
        if (config('app.env') === 'production' || isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
            URL::forceScheme('https');
        }

        // Automatically assign Admin role on login for both new and old users
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Login::class,
            function (\Illuminate\Auth\Events\Login $event) {
                $user = $event->user;
                $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
                if (!$user->hasRole('Admin')) {
                    $user->assignRole($role);
                }
            }
        );
    }
}
