<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictStaff
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Admin users bypass all staff restrictions
        if ($user && ! $user->hasRole('Admin') && ($user->hasRole('Staff') || $user->hasRole('User') || $user->hasRole('Cashier'))) {
            // Check specific allowed routes first (bypass permission checks)
            $allowedRouteNames = [
                'orders.index',
                'payments.store',
                'profile.edit',
                'profile.update',
                'profile.destroy',
                'logout',
            ];

            $currentRoute = $request->route() ? $request->route()->getName() : null;

            if (! in_array($currentRoute, $allowedRouteNames)) {
                // If route is 'dashboard', check page.dashboard permission
                if ($currentRoute === 'dashboard') {
                    try {
                        if (! $user->hasPermissionTo('page.dashboard')) {
                            return redirect()->route('orders.index');
                        }
                    } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
                        return redirect()->route('orders.index');
                    }
                    return $next($request);
                }

                // Dynamically check Spatie permissions mapped to the route's middleware
                $route = $request->route();
                if ($route) {
                    $middlewares = $route->gatherMiddleware();
                    foreach ($middlewares as $middleware) {
                        if (is_string($middleware) && str_starts_with($middleware, 'check:')) {
                            $permission = substr($middleware, 6);
                            try {
                                if (! $user->hasPermissionTo($permission)) {
                                    return redirect()->route('orders.index');
                                }
                            } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
                                return redirect()->route('orders.index');
                            }
                        }
                    }
                } else {
                    return redirect()->route('orders.index');
                }
            }
        }

        return $next($request);
    }
}
