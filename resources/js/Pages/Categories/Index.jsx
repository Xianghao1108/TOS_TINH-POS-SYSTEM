import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

// Custom Hooks and Components
import { useCategoryManagement } from './hooks/useCategoryManagement';
import { CategoryCard } from './components/CategoryCard';
import { CategoryDeleteModal } from './components/CategoryDeleteModal';

export default function CategoriesPage({ auth, categoryData, filters }) {
    const datasList = categoryData?.data || categoryData || [];
    const headWeb = 'Categories';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const {
        searchQuery,
        setSearchQuery,
        confirmingDataDeletion,
        deleteData,
        processing,

        confirmDataDeletion,
        closeModal,
        deleteDataRow,
        handleSearch
    } = useCategoryManagement(filters);

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        
                        {/* Header Banner */}
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="text-left">
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                                    Categories
                                </h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Group products to speed up POS browsing.
                                </p>
                            </div>

                            {/* Controls */}
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
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600 border-0 bg-transparent cursor-pointer"
                                        aria-label="Search categories"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                <Link
                                    href={route('categories.create')}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 border-0 cursor-pointer"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                    <span>New Category</span>
                                </Link>
                            </div>
                        </div>

                        {/* Category Cards Matrix */}
                        {datasList.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {datasList.map((item, index) => (
                                    <CategoryCard
                                        key={item?.id || index}
                                        item={item}
                                        index={index}
                                        onDelete={confirmDataDeletion}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center shadow-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-505">
                                    <i className="fas fa-tag text-lg"></i>
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-slate-900">No categories found</h2>
                                <p className="mt-1 text-sm text-slate-500">Create a category to start grouping products.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {categoryData?.links && (
                            <div className="mt-8 rounded-xl border border-emerald-50 bg-white px-4 py-3 shadow-sm">
                                <Pagination links={categoryData.links} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <CategoryDeleteModal
                    isOpen={confirmingDataDeletion}
                    onClose={closeModal}
                    onSubmit={deleteDataRow}
                    deleteData={deleteData}
                    processing={processing}
                />
            </section>
        </AdminLayout>
    );
}
