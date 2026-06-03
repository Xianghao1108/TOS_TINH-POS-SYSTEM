import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import IconInput from '@/Components/UI/IconInput';
import FormSeparator from '@/Components/UI/FormSeparator';
import BrandPanel from './Partials/BrandPanel';
import AlternativeAccess from './Partials/AlternativeAccess';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-sans antialiased">
            <Head title="Register" />

            {/* Split Pane Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full">

                {/* Column A: Left Sidebar (Visual Brand Panel) */}
                <BrandPanel />

                {/* Column B: Right Workspace (Interactive Register Panel) */}
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

                        {/* Heading Group */}
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                            <p className="text-sm text-gray-500 mt-2">Get started with your POS account setup</p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={submit} className="space-y-5">

                            {/* Name Input Field */}
                            <IconInput
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                placeholder="John Doe"
                                autoComplete="name"
                                required
                                icon="fa-user"
                                label="Full Name"
                                error={errors.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />

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
                                autoComplete="new-password"
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

                            {/* Confirm Password Input Field */}
                            <IconInput
                                id="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                                icon="fa-lock"
                                label="Confirm Password"
                                error={errors.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                rightElement={
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-green-600 transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                    </button>
                                }
                            />

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
                                        <span>Register</span>
                                        <i className="fas fa-user-plus text-xs"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-4 text-center">
                            <span className="text-sm text-gray-500">Already registered? </span>
                            <Link
                                href={route('login')}
                                className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
