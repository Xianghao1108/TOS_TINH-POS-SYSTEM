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
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
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
                        </form>

                        {/* Separator */}
                        <FormSeparator text="OR ACCESS VIA" />

                        {/* Alternative Login Block */}
                        <AlternativeAccess />
                    </div>

                    {/* Footer Branding */}
                    <div className="w-full text-center text-xs text-gray-400 font-medium pt-8">
                        © Smart Minimart POS · v2.4.0
                    </div>
                </div>

            </div>
        </div>
    );
}
