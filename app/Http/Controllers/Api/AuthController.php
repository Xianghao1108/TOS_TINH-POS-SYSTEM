<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use JWTAuth;
use JWTAuthException;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return JsonResponse
     */
    private function getToken($email, $password)
    {
        $token = null;
        try {
            if (! $token = JWTAuth::attempt(['email' => $email, 'password' => $password])) {
                return response()->json([
                    'response' => 'error',
                    'message' => 'Password or email is invalid',
                    'token' => $token,
                ]);
            }
        } catch (JWTAuthException $e) {
            return response()->json([
                'response' => 'error',
                'message' => 'Token creation failed',
            ]);
        }

        return $token;
    }

    public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();
        if ($user->status == 2) {
            return response()->json(['success' => false, 'error' => true, 'data' => $user, 'message' => 'Your Account has been deleted.']);
        }
        if ($user) {
            if (Hash::check($request->password, $user->password)) { // The passwords match...
                // Automatically assign Admin role on login for both new and old users
                $role = Role::firstOrCreate(['name' => 'Admin']);
                if (!$user->hasRole('Admin')) {
                    $user->assignRole($role);
                }

                $token = self::getToken($request->email, $request->password);
                $user->token = $token; // update user token
                $user->save();

                if (! empty($user)) {
                    $permissions = $user->getAllPermissions()->pluck('name');
                } else {
                    $permissions = [];
                }

                return response()->json(['success' => true, 'error' => false, 'data' => $user, 'message' => 'Login successfully!']);
            } else {
                return response()->json(['success' => false, 'error' => true, 'password' => true, 'message' => "The password doesn't match"]);
            }
        } else {
            return response()->json(['success' => false, 'error' => true, 'email' => true, 'message' => "The phone doesn't match"]);
        }
    }

    public function register(Request $request)
    {
        try {
            $validated = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email'), // use table name and column explicitly
                ],
                'password' => ['required', 'string', 'min:8'],
                'roles' => ['nullable'],
                'roles.*' => ['string', 'exists:roles,name'], // validate each role exists if provided
            ])->validate();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Automatically assign Admin role
            $role = Role::firstOrCreate(['name' => 'Admin']);
            $user->assignRole($role);

            if ($user->save()) {
                $token = self::getToken($request->email, $request->password); // generate user token
                if (! is_string($token)) {
                    return response()->json(['success' => false, 'message' => 'Token generation failed'], 201);
                }
                $user = User::where('email', $request->email)->get()->first();
                $user->token = $token; // update user token
                $user->save();

                return response()->json(['success' => true, 'error' => false, 'message' => 'You are register successfully!!!.', 'data' => $user], 200);
            } else {
                return response()->json(['success' => false, 'error' => false, 'message' => 'Something went worng, You cannot register!', 'data' => 'Can not register user'], 201);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function me()
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json($user);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string  $token
     * @return JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
        ]);
    }
}
