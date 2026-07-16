import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Custom Hooks and Components
import { useProductManagement } from './hooks/useProductManagement';
import { ProductTable } from './components/ProductTable';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductAddModal } from './components/ProductAddModal';
import { ProductEditModal } from './components/ProductEditModal';
import { ProductDeleteModal } from './components/ProductDeleteModal';

export default function ProductsPage({ 
    auth, 
    products, 
    categories, 
    sizes, 
    units, 
    makers, 
    brands, 
    filters 
}) {
    const datasList = products?.data || products || [];
    const headWeb = 'Product List';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const {
        searchQuery,
        setSearchQuery,
        codeExistsError,
        isModalOpen,
        isEditModalOpen,
        isDetailModalOpen,
        confirmingDataDeletion,
        dataEdit,
        productDetail,
        selectedImages,
        selectedFilters,
        handleFilterChange,

        data,
        setData,
        processing,
        errors,

        editData,
        setEditData,
        editProcessing,
        editErrors,

        handleSearch,
        handleCheckCodeExists,
        handleFileChange,
        openAddModal,
        closeAddModal,
        submitAdd,
        openEditModal,
        closeEditModal,
        submitEdit,
        deleteUploadedImage,
        openDetailModal,
        closeDetailModal,
        confirmDataDeletion,
        closeModal,
        deleteDataRow,
        deleteProcessing,
        deleteErrors
    } = useProductManagement(auth, filters);

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        
                        {/* Header Banner */}
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-box text-[10px]"></i>
                                    Inventory items
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Product List</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Manage catalog products, pricing, stock levels, and media.
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        name="table_search"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search title or code..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600 border-0 bg-transparent cursor-pointer" 
                                        aria-label="Search products"
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
                                    Add Product
                                </button>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                                <select
                                    value={selectedFilters.category_id}
                                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                    className="h-10 w-full rounded-xl border border-emerald-100 bg-white px-3 text-xs text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer font-medium"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name || c.category_title}</option>)}
                                </select>
                            </div>

                            {/* Size Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Size</label>
                                <select
                                    value={selectedFilters.size_id}
                                    onChange={(e) => handleFilterChange('size_id', e.target.value)}
                                    className="h-10 w-full rounded-xl border border-emerald-100 bg-white px-3 text-xs text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer font-medium"
                                >
                                    <option value="">All Sizes</option>
                                    {sizes.map(s => <option key={s.id} value={s.id}>{s.size_title}</option>)}
                                </select>
                            </div>

                            {/* Unit Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Unit</label>
                                <select
                                    value={selectedFilters.unit_id}
                                    onChange={(e) => handleFilterChange('unit_id', e.target.value)}
                                    className="h-10 w-full rounded-xl border border-emerald-100 bg-white px-3 text-xs text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer font-medium"
                                >
                                    <option value="">All Units</option>
                                    {units.map(u => <option key={u.id} value={u.id}>{u.unit_title}</option>)}
                                </select>
                            </div>

                            {/* Maker Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Maker</label>
                                <select
                                    value={selectedFilters.maker_id}
                                    onChange={(e) => handleFilterChange('maker_id', e.target.value)}
                                    className="h-10 w-full rounded-xl border border-emerald-100 bg-white px-3 text-xs text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer font-medium"
                                >
                                    <option value="">All Makers</option>
                                    {makers.map(m => <option key={m.id} value={m.id}>{m.maker_title}</option>)}
                                </select>
                            </div>

                            {/* Brand Filter */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Brand</label>
                                <select
                                    value={selectedFilters.brand_id}
                                    onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                                    className="h-10 w-full rounded-xl border border-emerald-100 bg-white px-3 text-xs text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer font-medium"
                                >
                                    <option value="">All Brands</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.brand_title}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Product Table Container */}
                        <div className="overflow-hidden rounded-2xl border border-emerald-55 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                            <div className="border-b border-emerald-50 bg-white px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-slate-950">Products Management</h2>
                                        <p className="mt-1 text-sm text-slate-500">{datasList.length} products loaded on this page.</p>
                                    </div>
                                    <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                                        Active catalog items
                                    </span>
                                </div>
                            </div>

                            {/* Table */}
                            <ProductTable
                                productsList={datasList}
                                onViewDetail={openDetailModal}
                                onEdit={openEditModal}
                                onDelete={confirmDataDeletion}
                            />

                            {/* Pagination links */}
                            {products?.links && (
                                <div className="border-t border-emerald-50 px-4 py-3">
                                    <Pagination links={products.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Specification detail modal */}
                <ProductDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={closeDetailModal}
                    productDetail={productDetail}
                />

                {/* Add product modal */}
                <ProductAddModal
                    isOpen={isModalOpen}
                    onClose={closeAddModal}
                    onSubmit={submitAdd}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    codeExistsError={codeExistsError}
                    selectedImages={selectedImages}
                    handleFileChange={handleFileChange}
                    handleCheckCodeExists={handleCheckCodeExists}
                    categories={categories}
                    sizes={sizes}
                    units={units}
                    makers={makers}
                    brands={brands}
                />

                {/* Edit product modal */}
                <ProductEditModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={submitEdit}
                    editData={editData}
                    setEditData={setEditData}
                    dataEdit={dataEdit}
                    editErrors={editErrors}
                    editProcessing={editProcessing}
                    codeExistsError={codeExistsError}
                    selectedImages={selectedImages}
                    handleFileChange={handleFileChange}
                    handleCheckCodeExists={handleCheckCodeExists}
                    deleteUploadedImage={deleteUploadedImage}
                    categories={categories}
                    sizes={sizes}
                    units={units}
                    makers={makers}
                    brands={brands}
                />

                {/* Delete product modal */}
                <ProductDeleteModal
                    isOpen={confirmingDataDeletion}
                    onClose={closeModal}
                    onSubmit={deleteDataRow}
                    productTitle={dataEdit?.product_title || ''}
                    processing={deleteProcessing}
                    error={deleteErrors?.error}
                />

            </section>
        </AdminLayout>
    );
}
