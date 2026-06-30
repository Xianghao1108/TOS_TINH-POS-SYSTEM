import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Custom Hooks and Components
import { useUnitManagement } from './hooks/useUnitManagement';
import { UnitTable } from './components/UnitTable';
import { UnitFormModal } from './components/UnitFormModal';
import { UnitDeleteModal } from './components/UnitDeleteModal';

export default function UnitsPage({ auth, units, filters }) {
    const datasList = units?.data || units || [];
    const headWeb = 'Unit List';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const {
        searchQuery,
        setSearchQuery,
        unitExistsError,
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
        handleCheckExists,
        openAddModal,
        closeAddModal,
        submitAdd,
        openEditModal,
        closeEditModal,
        submitEdit,
        confirmDataDeletion,
        closeModal,
        deleteDataRow
    } = useUnitManagement(auth, filters);

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
                                    <i className="fas fa-ruler-combined text-[10px]"></i>
                                    Inventory labels
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Unit List</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Keep product quantities readable across stock, POS, and reports.
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        name="table_search"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search units..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button 
                                        type="submit" 
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600 border-0 bg-transparent cursor-pointer" 
                                        aria-label="Search units"
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
                                    Add Unit
                                </button>
                            </div>
                        </div>

                        {/* Units list Table Block */}
                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                            <div className="border-b border-emerald-50 bg-white px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold text-slate-950">Units Management</h2>
                                        <p className="mt-1 text-sm text-slate-500">{datasList.length} units loaded on this page.</p>
                                    </div>
                                    <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                                        Live duplicate check
                                    </span>
                                </div>
                            </div>

                            <UnitTable
                                datasList={datasList}
                                onEdit={openEditModal}
                                onDelete={confirmDataDeletion}
                            />

                            {units?.links && (
                                <div className="border-t border-emerald-50 px-4 py-3">
                                    <Pagination links={units.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Unit Modal */}
                <UnitFormModal
                    isOpen={isModalOpen}
                    onClose={closeAddModal}
                    onSubmit={submitAdd}
                    title="Add New Unit"
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    unitExistsError={unitExistsError}
                    handleCheckExists={handleCheckExists}
                    isEdit={false}
                />

                {/* Edit Unit Modal */}
                <UnitFormModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={submitEdit}
                    title="Edit Unit"
                    data={editData}
                    setData={setEditData}
                    errors={editErrors}
                    processing={editProcessing}
                    unitExistsError={unitExistsError}
                    handleCheckExists={handleCheckExists}
                    isEdit={true}
                />

                {/* Delete verify Modal */}
                <UnitDeleteModal
                    isOpen={confirmingDataDeletion}
                    onClose={closeModal}
                    onSubmit={deleteDataRow}
                    unitTitle={dataEdit?.unit_title || ''}
                    processing={processing}
                />

            </section>
        </AdminLayout>
    );
}
