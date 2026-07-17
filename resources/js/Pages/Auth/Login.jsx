import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import IconInput from '@/Components/UI/IconInput';
import FormSeparator from '@/Components/UI/FormSeparator';
import BrandPanel from './Partials/BrandPanel';
import AlternativeAccess from './Partials/AlternativeAccess';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans antialiased">
            <Head title="Log in" />

            {/* Split Pane Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full">

                {/* Column A: Left Sidebar (Visual Brand Panel) */}
                <BrandPanel />

                {/* Column B: Right Workspace (Interactive Login Panel) */}
                <div className="flex flex-col justify-between items-center bg-white p-8 sm:p-12 lg:p-16 min-h-screen">
                    <div className="w-full max-w-md my-auto flex flex-col justify-center">

                        {/* Mobile Brand Header (hidden on large displays) */}
                        <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-50 border border-green-100 shadow-sm overflow-hidden">
                                <img
                                    src="/images/TOS TINH NOBG.png"
                                    alt="Tos Tinh Mart Logo"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Tos Tinh Mart</h1>
                                <span className="text-[10px] font-semibold tracking-wider text-green-700 uppercase block -mt-1">
                                    POS System
                                </span>
                            </div>
                        </div>

                        {/* Welcome Group */}
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome to POS</h2>
                            <p className="text-sm text-gray-500 mt-2">Please sign in to your account</p>
                        </div>

                        {/* Status notification */}
                        {status && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 text-sm font-medium text-green-700 border border-green-100">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-6">

                            {/* Email Input Field */}
                            <IconInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="user123@gmail.com"
                                autoComplete="username"
                                required
                                icon="fa-envelope"
                                label="Email Address"
                                error={errors.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            {/* Password Input Field */}
                            <IconInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                icon="fa-lock"
                                label="Password"
                                error={errors.password}
                                onChange={(e) => setData('password', e.target.value)}
                                rightElement={
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                    </button>
                                }
                            />

                            {/* Form Utilities */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-green-300 text-[#166534] shadow-sm focus:ring-[#166534] h-4 w-4"
                                    />
                                    <span className="ml-2 text-sm text-gray-600 hover:text-gray-900 transition-colors selection:bg-transparent">
                                        Remember me
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline focus:outline-none transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#166534] hover:bg-[#14532d] active:bg-[#0f3d21] text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-green-900/10 hover:shadow-green-900/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? (
                                    <i className="fas fa-circle-notch fa-spin text-lg"></i>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <i className="fas fa-arrow-right text-xs"></i>
                                    </>
                                )}
                            </button>
                            <div className="mt-4 text-center text-sm text-gray-600">
                                <span>Don't have an account?</span>
                                <Link
                                    href={route('register')}
                                    className="text-green-700 hover:text-green-800 hover:underline font-semibold ml-1 transition-colors"
                                >
                                    Register here
                                </Link>
                            </div>
                        </form>

                        {/* Separator */}
                        <FormSeparator text="OR ACCESS VIA" />

                        {/* Google Sign In Button */}
                        <a
                            href={route('auth.google')}
                            className="w-full mt-4 flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-green-700 hover:border-green-200 transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            <span>Sign In with Google</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}
