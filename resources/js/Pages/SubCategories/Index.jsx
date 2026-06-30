import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Custom Hooks and Components
import { useSubCategoryManagement } from './hooks/useSubCategoryManagement';
import { SubCategoryCard } from './components/SubCategoryCard';
import { SubCategoryFormModal } from './components/SubCategoryFormModal';
import { SubCategoryDeleteModal } from './components/SubCategoryDeleteModal';

export default function SubCategoriesPage({ auth, subCategories, categories = [], filters }) {
    const datasList = subCategories?.data || subCategories || [];
    const headWeb = 'Sub Categories';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const {
        searchQuery,
        setSearchQuery,
        isModalOpen,
        isEditModalOpen,
        confirmingDataDeletion,
        dataEdit,

        data,
        setData,
        processing,
        errors,

        editData,
        setEditData,
        editProcessing,
        editErrors,

        handleSearch,
        openAddModal,
        closeAddModal,
        submitAdd,
        openEditModal,
        closeEditModal,
        submitEdit,
        confirmDataDeletion,
        closeModal,
        deleteDataRow
    } = useSubCategoryManagement(auth, filters);

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        
                        {/* Header Banner */}
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="text-left">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-layer-group text-[10px]"></i>
                                    Catalog flow
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                                    Sub Categories
                                </h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Keep product browsing fast, tidy, and ready for the counter rush.
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        name="table_search"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search sub categories"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600 border-0 bg-transparent cursor-pointer"
                                        aria-label="Search sub categories"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                <button
                                    onClick={openAddModal}
                                    type="button"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 border-0 cursor-pointer"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                    <span>New Sub Category</span>
                                </button>
                            </div>
                        </div>

                        {/* Cards List Grid */}
                        {datasList.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {datasList.map((item, index) => (
                                    <SubCategoryCard
                                        key={item?.id || index}
                                        item={item}
                                        index={index}
                                        onEdit={openEditModal}
                                        onDelete={confirmDataDeletion}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center shadow-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-505">
                                    <i className="fas fa-layer-group text-lg"></i>
                                </div>
                                <h2 className="mt-4 text-lg font-semibold text-slate-900">No sub categories found</h2>
                                <p className="mt-1 text-sm text-slate-500">Create one to make POS browsing feel snappy.</p>
                            </div>
                        )}

                        {subCategories?.links && (
                            <div className="mt-8 rounded-2xl border border-emerald-50 bg-white px-4 py-3 shadow-sm">
                                <Pagination links={subCategories.links} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Sub Category Modal */}
                <SubCategoryFormModal
                    isOpen={isModalOpen}
                    onClose={closeAddModal}
                    onSubmit={submitAdd}
                    title="New Sub Category"
                    subtitle="Nest it under a parent category."
                    iconClass="fa-bookmark"
                    iconBgClass="bg-fuchsia-50 text-fuchsia-500 ring-fuchsia-100"
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    categories={categories}
                    isEdit={false}
                />

                {/* Edit Sub Category Modal */}
                <SubCategoryFormModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={submitEdit}
                    title="Edit Sub Category"
                    subtitle="Keep the label clean and easy to scan."
                    iconClass="fa-pen"
                    iconBgClass="bg-cyan-50 text-cyan-500 ring-cyan-100"
                    data={editData}
                    setData={setEditData}
                    errors={editErrors}
                    processing={editProcessing}
                    categories={categories}
                    isEdit={true}
                />

                {/* Delete Confirmation Modal */}
                <SubCategoryDeleteModal
                    isOpen={confirmingDataDeletion}
                    onClose={closeModal}
                    onSubmit={deleteDataRow}
                    name={dataEdit?.name || ''}
                    processing={processing}
                />

            </section>
        </AdminLayout>
    );
}
