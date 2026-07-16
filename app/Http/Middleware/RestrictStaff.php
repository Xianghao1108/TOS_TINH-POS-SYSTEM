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

        if ($user && ($user->hasRole('Staff') || $user->hasRole('User') || $user->hasRole('Cashier'))) {
            // Non-Admin users are only allowed to access POS page, save checkout, profile pages, and logout
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
                return redirect()->route('orders.index');
            }
        }

        return $next($request);
    }
}
