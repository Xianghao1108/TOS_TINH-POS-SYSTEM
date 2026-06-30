import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Custom Hooks and Components
import { useInvoiceManagement } from './hooks/useInvoiceManagement';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { InvoiceAddModal } from './components/InvoiceAddModal';
import { InvoiceDeleteModal } from './components/InvoiceDeleteModal';

export default function InvoicesIndex({ 
    invoices = {}, 
    customers = [], 
    pendingOrders = [], 
    users = [], 
    filters = {} 
}) {
    const {
        searchQuery,
        setSearchQuery,
        isAddModalOpen,
        isDetailModalOpen,
        isDeleteModalOpen,
        selectedInvoice,
        customerSearch,
        showSuggestions,
        setShowSuggestions,

        data,
        setData,
        processing,
        errors,

        filteredCustomers,
        filteredPendingOrders,
        stats,

        handleSearch,
        clearSearch,
        openAddModal,
        closeAddModal,
        selectCustomer,
        handleCustomerSearchChange,
        toggleOrder,
        submitAddInvoice,
        openDetailModal,
        openDeleteModal,
        handleToggleStatus,
        handleDeleteInvoice
    } = useInvoiceManagement(
        { user: { id: 1 } }, // Fallback auth structure handled in hook if needed
        invoices,
        customers,
        pendingOrders,
        users,
        filters
    );

    const invoiceList = invoices.data || [];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header="Invoices" links={[{ title: 'Home', url: '/' }, { title: 'Invoices', url: '' }]} />}>
            <Head title="Invoices" />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        
                        {/* Header Banner */}
                        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="text-left">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-receipt text-[10px]"></i>
                                    Billing desk
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Invoices</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Bundle customer orders, track payment status, and keep checkout history tidy.
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search invoice ID"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600 border-0 bg-transparent cursor-pointer"
                                        aria-label="Search invoices"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>
                                {filters.search && (
                                    <button
                                        onClick={clearSearch}
                                        type="button"
                                        className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-100 bg-white px-4 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                )}
                                <button
                                    onClick={openAddModal}
                                    type="button"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 border-0 cursor-pointer"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                    New Invoice
                                </button>
                            </div>
                        </div>

                        {/* Stats Widgets */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-emerald-50 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] text-left">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                                            <p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p>
                                        </div>
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                                            <i className={`${item.icon} text-lg`}></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table block */}
                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
                            <InvoiceTable
                                invoiceList={invoiceList}
                                onView={openDetailModal}
                                onToggleStatus={handleToggleStatus}
                                onDelete={openDeleteModal}
                            />
                        </div>

                        {/* Pagination links */}
                        {invoices.links && invoices.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {invoices.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}
                                        className={`min-w-10 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
                                            link.active
                                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                                : 'border-emerald-100 bg-white text-slate-600 hover:bg-emerald-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '<').replace('&raquo;', '>') }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Invoice Modal */}
                <InvoiceAddModal
                    isOpen={isAddModalOpen}
                    onClose={closeAddModal}
                    onSubmit={submitAddInvoice}
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    customerSearch={customerSearch}
                    handleCustomerSearchChange={handleCustomerSearchChange}
                    showSuggestions={showSuggestions}
                    setShowSuggestions={setShowSuggestions}
                    filteredCustomers={filteredCustomers}
                    selectCustomer={selectCustomer}
                    filteredPendingOrders={filteredPendingOrders}
                    toggleOrder={toggleOrder}
                    users={users}
                />

                {/* Detail spec sheets modal */}
                <InvoiceDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    selectedInvoice={selectedInvoice}
                />

                {/* Delete verification modal */}
                <InvoiceDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onSubmit={handleDeleteInvoice}
                    selectedInvoice={selectedInvoice}
                />

            </section>
        </AdminLayout>
    );
}
