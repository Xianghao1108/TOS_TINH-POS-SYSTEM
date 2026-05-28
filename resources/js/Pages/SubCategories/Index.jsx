import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';

const accentStyles = [
    { tile: 'bg-fuchsia-50', icon: 'text-fuchsia-500', ring: 'ring-fuchsia-100' },
    { tile: 'bg-cyan-50', icon: 'text-cyan-500', ring: 'ring-cyan-100' },
    { tile: 'bg-lime-50', icon: 'text-lime-600', ring: 'ring-lime-100' },
    { tile: 'bg-violet-50', icon: 'text-violet-500', ring: 'ring-violet-100' },
    { tile: 'bg-orange-50', icon: 'text-orange-500', ring: 'ring-orange-100' },
    { tile: 'bg-rose-50', icon: 'text-rose-500', ring: 'ring-rose-100' },
];

const fieldClass = (hasError) =>
    `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export default function SubCategoriesPage({ auth, subCategories, categories = [], filters }) {
    const datasList = subCategories?.data || subCategories || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        category_id: '',
        name: '',
        username: currentUsername,
    });

    const {
        data: editData,
        setData: setEditData,
        patch: patchEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: editReset,
        clearErrors: editClearErrors,
    } = useForm({
        id: '',
        category_id: '',
        name: '',
        username: currentUsername,
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const headWeb = 'Sub Categories';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('sub-categories.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const openAddModal = () => {
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const closeAddModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('sub-categories.store'), {
            onSuccess: () => closeAddModal(),
        });
    };

    const openEditModal = (item) => {
        setEditData({
            id: item.id,
            category_id: item.category_id || (item.category ? item.category.id : ''),
            name: item.name || '',
            username: item.username || currentUsername,
        });
        editClearErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editReset();
        editClearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        patchEdit(route('sub-categories.update', editData.id), {
            onSuccess: () => closeEditModal(),
        });
    };

    const confirmDataDeletion = (item) => {
        setDataEdit(item);
        setConfirmingDataDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        destroy(route('sub-categories.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const getCategoryName = (item) => item?.category?.category_title || item?.category?.name || 'Unassigned';
    const getStatus = (item) => item?.status === 1 || item?.status === 'active' ? 'active' : 'inactive';

    const renderFormFields = (values, setValues, formErrors, mode) => (
        <div className="space-y-5">
            <div>
                <label htmlFor={`${mode}_category_id`} className="block text-sm font-semibold text-slate-800">
                    Parent category <span className="text-rose-500">*</span>
                </label>
                <select
                    id={`${mode}_category_id`}
                    className={fieldClass(formErrors.category_id)}
                    value={values.category_id}
                    onChange={(e) => setValues('category_id', e.target.value)}
                >
                    <option value="">Select a parent category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.category_title || cat.name}
                        </option>
                    ))}
                </select>
                <InputError message={formErrors.category_id} className="mt-2" />
            </div>

            <div>
                <label htmlFor={`${mode}_name`} className="block text-sm font-semibold text-slate-800">
                    Sub-category title <span className="text-rose-500">*</span>
                </label>
                <input
                    id={`${mode}_name`}
                    type="text"
                    className={fieldClass(formErrors.name)}
                    value={values.name}
                    onChange={(e) => setValues('name', e.target.value)}
                    placeholder="Sparkling drinks"
                />
                <InputError message={formErrors.name} className="mt-2" />
            </div>
        </div>
    );

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />

            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
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
                                        className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600"
                                        aria-label="Search sub categories"
                                    >
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                <button
                                    onClick={openAddModal}
                                    type="button"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                                >
                                    <i className="fas fa-plus text-xs"></i>
                                    <span>New Sub Category</span>
                                </button>
                            </div>
                        </div>

                        {datasList.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {datasList.map((item, index) => {
                                    const accent = accentStyles[index % accentStyles.length];
                                    const status = getStatus(item);

                                    return (
                                        <article
                                            key={item?.id || index}
                                            className="group relative overflow-hidden rounded-2xl border border-emerald-50 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                                        >
                                            <div className="absolute right-4 top-4 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                                #{item?.id}
                                            </div>

                                            <div className="mb-5 flex items-start justify-between gap-4 pr-16">
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}
                                                >
                                                    <i className="fas fa-bookmark text-lg"></i>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h2 className="text-lg font-semibold text-slate-950">
                                                    {item?.name}
                                                </h2>
                                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                    <i className="fas fa-tag text-[10px]"></i>
                                                    {getCategoryName(item)}
                                                </div>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                                                {item?.username && (
                                                    <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-500">
                                                        {item.username}
                                                    </span>
                                                )}
                                                <span className={`rounded-full px-3 py-1 ${status === 'active' ? 'bg-lime-50 text-lime-700' : 'bg-rose-50 text-rose-600'}`}>
                                                    {status}
                                                </span>
                                                {item?.created_at && (
                                                    <span>
                                                        {moment(item.created_at).format('DD/MM/YYYY')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-6 flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                    type="button"
                                                >
                                                    <i className="fas fa-edit text-xs"></i>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDataDeletion(item)}
                                                    type="button"
                                                    className="inline-flex h-10 w-11 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                                                    aria-label={`Delete ${item?.name || 'sub category'}`}
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash text-sm"></i>
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center shadow-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
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

                <Modal show={isModalOpen} onClose={closeAddModal}>
                    <form onSubmit={submitAdd} noValidate className="p-6">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-500 ring-1 ring-fuchsia-100">
                                <i className="fas fa-bookmark text-lg"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950">New Sub Category</h2>
                                <p className="mt-1 text-sm text-slate-500">Nest it under a parent category.</p>
                            </div>
                        </div>

                        {renderFormFields(data, setData, errors, 'add')}

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                            <button
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={processing}
                                type="submit"
                            >
                                {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                                Save
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal show={isEditModalOpen} onClose={closeEditModal}>
                    <form onSubmit={submitEdit} noValidate className="p-6">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-500 ring-1 ring-cyan-100">
                                <i className="fas fa-pen text-lg"></i>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950">Edit Sub Category</h2>
                                <p className="mt-1 text-sm text-slate-500">Keep the label clean and easy to scan.</p>
                            </div>
                        </div>

                        {renderFormFields(editData, setEditData, editErrors, 'edit')}

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                            <button
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={editProcessing}
                                type="submit"
                            >
                                {editProcessing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                                Update
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal show={confirmingDataDeletion} onClose={closeModal}>
                    <form onSubmit={deleteDataRow} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            Confirmation!
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Are you sure you want to delete <span className="text-lg font-medium">{dataEdit?.name}</span>?
                        </p>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                            <DangerButton className="ms-3" disabled={deleteProcessing}>Yes</DangerButton>
                        </div>
                    </form>
                </Modal>
            </section>
        </AdminLayout>
    );
}
