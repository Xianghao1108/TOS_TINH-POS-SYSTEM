import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function UsersCreateEdit({ user, roles }) {
    const isEditing = !!user?.id;
    
    const { data, setData, post, patch, errors, processing } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: user?.roles?.map(role => role.id) || (roles?.[0] ? [roles[0].id] : []),
        send_invite: true,
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (!isEditing) {
            post(route('users.store'));
        } else {
            patch(route('users.update', user.id));
        }
    };

    const headWeb = isEditing ? 'Edit User' : 'User Create';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            
            <div className="py-6 sm:py-10 bg-gray-50/50 flex items-start justify-center px-4 sm:px-6 lg:px-8 font-sans w-full">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-6 sm:px-8 border-b border-gray-100 flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div className="pt-1">
                                <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                                    {isEditing ? 'Edit user' : 'Invite a new user'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1.5">
                                    Send an invitation or create credentials for a team member.
                                </p>
                            </div>
                        </div>
                        <Link 
                            href={route('users.index')} 
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Link>
                    </div>

                    <form onSubmit={submit}>
                        <div className="px-6 py-8 sm:px-8 space-y-8">
                            
                            {/* Form Fields (Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                                        placeholder="Jane Doe"
                                    />
                                    <InputError className="mt-1.5 text-sm" message={errors.name} />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                                        placeholder="jane@example.com"
                                    />
                                    <InputError className="mt-1.5 text-sm" message={errors.email} />
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="roles">
                                        Role
                                    </label>
                                    <select
                                        id="roles"
                                        value={data.roles[0] || ''}
                                        onChange={(e) => setData('roles', [parseInt(e.target.value)])}
                                        className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none shadow-sm ${errors.roles ? 'border-red-300' : 'border-gray-200'}`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                                    >
                                        <option value="" disabled>Select a role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-1.5 text-sm" message={errors.roles} />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                                        placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                                    />
                                    <InputError className="mt-1.5 text-sm" message={errors.password} />
                                </div>
                            </div>

                            {/* Status Toggle Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Toggle 1: Send invitation */}
                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 shadow-sm transition-colors hover:bg-gray-50">
                                    <div className="pr-4">
                                        <p className="font-semibold text-gray-900 text-sm">Send invitation email</p>
                                        <p className="text-sm text-gray-500 mt-1">Email login details</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={data.send_invite} 
                                            onChange={(e) => setData('send_invite', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>

                                {/* Toggle 2: Account active */}
                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 shadow-sm transition-colors hover:bg-gray-50">
                                    <div className="pr-4">
                                        <p className="font-semibold text-gray-900 text-sm">Account active</p>
                                        <p className="text-sm text-gray-500 mt-1">Allow sign-in</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={data.is_active} 
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-5 sm:px-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-2xl">
                            <Link 
                                href={route('users.index')}
                                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-4 py-2.5 rounded-lg hover:bg-gray-200/50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-500 border border-transparent rounded-lg font-semibold text-white text-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {processing ? 'Processing...' : (isEditing ? 'Save changes' : '+ Create user')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}