import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';

const accentStyles = [
    {
        tile: 'bg-sky-50',
        icon: 'text-sky-500',
        ring: 'ring-sky-100',
    },
    {
        tile: 'bg-orange-50',
        icon: 'text-orange-500',
        ring: 'ring-orange-100',
    },
    {
        tile: 'bg-violet-50',
        icon: 'text-violet-500',
        ring: 'ring-violet-100',
    },
    {
        tile: 'bg-rose-50',
        icon: 'text-rose-500',
        ring: 'ring-rose-100',
    },
    {
        tile: 'bg-emerald-50',
        icon: 'text-emerald-500',
        ring: 'ring-emerald-100',
    },
    {
        tile: 'bg-amber-50',
        icon: 'text-amber-500',
        ring: 'ring-amber-100',
    },
];

export default function CategoriesPage({ auth, categoryData, filters }) {
    const datasList = categoryData?.data || categoryData || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, clearErrors } =
        useForm({
            id: '',
            name: '',
        });

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData('id', data.id);
        setDeleteData('name', data.name);
        setConfirmingDataDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        destroy(route('categories.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const headWeb = 'Categories';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('categories.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const getProductCount = (item) => {
        return item?.products_count ?? item?.product_count ?? item?.total_products ?? item?.total_product ?? item?.view_order ?? 0;
    };

    const pluralizeProducts = (count) => `${count} ${Number(count) === 1 ? 'product' : 'products'}`;

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                                    Categories
                                </h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Group products to speed up POS browsing.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        name="table_search"
                                        className="h-11 w-full rounded-lg border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search categories"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600"
                                        aria-label="Search categories"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                <Link
                                    href={route('categories.create')}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                    <span>New Category</span>
                                </Link>
                            </div>
                        </div>

                        {datasList.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {datasList.map((item, index) => {
                                    const accent = accentStyles[index % accentStyles.length];
                                    const productCount = getProductCount(item);

                                    return (
                                        <article
                                            key={item?.id || index}
                                            className="group rounded-xl border border-emerald-50 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]"
                                        >
                                            <div className="mb-5 flex items-start justify-between gap-4">
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}
                                                >
                                                    <i className="fas fa-tag text-lg"></i>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('categories.edit', item.id)}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 transition hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                                                        aria-label={`Edit ${item?.name || 'category'}`}
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit text-sm"></i>
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDataDeletion(item)}
                                                        type="button"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                                                        aria-label={`Delete ${item?.name || 'category'}`}
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash text-sm"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <h2 className="text-lg font-semibold text-slate-950">
                                                    {item?.name}
                                                </h2>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {pluralizeProducts(productCount)}
                                                </p>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                                                {item?.username && (
                                                    <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-500">
                                                        {item.username}
                                                    </span>
                                                )}
                                                {item?.status !== undefined && item?.status !== null && (
                                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                                        {item.status === 1 ? 'active' : item.status}
                                                    </span>
                                                )}
                                                {item?.created_at && (
                                                    <span>
                                                        {moment(item.created_at).format('DD/MM/YYYY')}
                                                    </span>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center shadow-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                                    <i className="fas fa-tag text-lg"></i>
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-slate-900">No categories found</h2>
                                <p className="mt-1 text-sm text-slate-500">Create a category to start grouping products.</p>
                            </div>
                        )}

                        {categoryData?.links && (
                            <div className="mt-8 rounded-xl border border-emerald-50 bg-white px-4 py-3 shadow-sm">
                                <Pagination links={categoryData.links} />
                            </div>
                        )}
                    </div>
                </div>

                <Modal show={confirmingDataDeletion} onClose={closeModal}>
                    <form onSubmit={deleteDataRow} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            Confirmation!
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Are you sure you want to delete <span className="text-lg font-medium">{deleteData.name}</span>?
                        </p>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                            <DangerButton className="ms-3" disabled={processing}>Yes</DangerButton>
                        </div>
                    </form>
                </Modal>
            </section>
        </AdminLayout>
    );
}
