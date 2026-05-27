<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictStaff
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('Staff')) {
            // Staff are only allowed to access POS page, save checkout, and logout
            $allowedRouteNames = [
                'orders.index',
                'payments.store',
                'logout',
            ];

            $currentRoute = $request->route() ? $request->route()->getName() : null;

            if (!in_array($currentRoute, $allowedRouteNames)) {
                return redirect()->route('orders.index');
            }
        }

        return $next($request);
    }
}
