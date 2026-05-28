import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CategoriesCreateEdit({ auth, datas = {} }) {
    const isEditing = Boolean(datas?.id);
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';
    const { data, setData, post, patch, errors, reset, processing, recentlySuccessful } =
        useForm({
            name: datas?.name || '',
            view_order: datas?.view_order || '',
            username: datas?.username || currentUsername,
            status: datas?.status || '',
        });

    const submit = (e) => {
        e.preventDefault();

        if (!isEditing) {
            post(route('categories.store'), {
                preserveState: true,
                onFinish: () => {
                    reset();
                },
            });
        } else {
            patch(route('categories.update', datas.id), {
                onFinish: () => {
                    reset();
                },
            });
        }
    };

    const headWeb = isEditing ? 'Edit Category' : 'Create Category';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: 'Categories', url: route('categories.index') }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <Link
                                    href={route('categories.index')}
                                    className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                                >
                                    <i className="fas fa-arrow-left text-xs"></i>
                                    <span>Back to categories</span>
                                </Link>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                                    {headWeb}
                                </h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Group products to speed up POS browsing.
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            className="overflow-hidden rounded-xl border border-emerald-50 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                        >
                            <div className="border-b border-emerald-50 px-6 py-5 sm:px-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                        <i className="fas fa-tag text-lg"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-950">Category details</h2>
                                        <p className="mt-1 text-sm text-slate-500">Set the display name, product count, and availability.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 px-6 py-6 sm:px-8">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                                        Category title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`mt-2 h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                            errors.name
                                                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                                                : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
                                        }`}
                                        placeholder="Beverages"
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div>
                                    <label htmlFor="view_order" className="block text-sm font-semibold text-slate-800">
                                        Total products <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="view_order"
                                        name="view_order"
                                        type="number"
                                        min="0"
                                        value={data.view_order}
                                        onChange={(e) => setData('view_order', e.target.value)}
                                        className={`mt-2 h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                            errors.view_order
                                                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                                                : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
                                        }`}
                                        placeholder="32"
                                    />
                                    <InputError className="mt-2" message={errors.view_order} />
                                </div>

                                <input type="hidden" name="username" value={data.username} />
                                <InputError className="mt-2" message={errors.username} />

                                <div>
                                    <label htmlFor="status" className="block text-sm font-semibold text-slate-800">
                                        Status <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className={`mt-2 h-12 w-full rounded-lg border bg-white px-4 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
                                            errors.status
                                                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                                                : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
                                        }`}
                                    >
                                        <option value="">Select status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <InputError className="mt-2" message={errors.status} />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-emerald-50 bg-emerald-50/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                                <p className="text-sm font-medium text-emerald-700">
                                    {recentlySuccessful ? 'Category saved successfully.' : 'Changes apply to POS category browsing.'}
                                </p>
                                <div className="flex gap-3">
                                    <Link
                                        href={route('categories.index')}
                                        className="inline-flex h-11 items-center justify-center rounded-lg border border-emerald-100 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        disabled={processing}
                                        type="submit"
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                                        <span>{processing ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Category' : 'Save Category')}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
