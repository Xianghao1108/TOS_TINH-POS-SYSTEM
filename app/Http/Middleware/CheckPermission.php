<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  string  $permission  The required permission
     */
    public function handle(Request $request, Closure $next, $permission): Response
    {
        // Get the currently authenticated user
        $user = $request->user();

        if (! $user) {
            abort(403, 'You do not have the required permission.');
        }

        // Check if the user has the specified permission or is an Admin
        if ($user->hasRole('Admin')) {
            return $next($request);
        }

        try {
            if (! $user->hasPermissionTo($permission)) {
                abort(403, 'You do not have the required permission.');
            }
        } catch (PermissionDoesNotExist $e) {
            abort(403, 'You do not have the required permission.');
        }

        // If permission is granted, allow the request to continue
        return $next($request);
    }
}
