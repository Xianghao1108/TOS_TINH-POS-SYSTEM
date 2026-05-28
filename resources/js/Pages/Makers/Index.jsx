import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';

const accentStyles = [
    { tile: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    { tile: 'bg-cyan-50', icon: 'text-cyan-600', ring: 'ring-cyan-100' },
    { tile: 'bg-fuchsia-50', icon: 'text-fuchsia-600', ring: 'ring-fuchsia-100' },
    { tile: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
];

const inputClass = (hasError) =>
    `mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        hasError
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-emerald-100 focus:border-emerald-400 focus:ring-emerald-100'
    }`;

export default function MakersPage({ auth, makers, filters }) {
    const datasList = makers?.data || makers || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [makerExistsError, setMakerExistsError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        maker_title: '',
        username: currentUsername,
    });

    const { data: editData, setData: setEditData, patch: patchEdit, processing: editProcessing, errors: editErrors, reset: editReset, clearErrors: editClearErrors } = useForm({
        id: '',
        maker_title: '',
        username: currentUsername,
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const headWeb = 'Maker List';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('makers.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const handleCheckExists = async (value, isEdit = false) => {
        setMakerExistsError('');
        if (!value) return;

        try {
            const response = await axios.post(route('makers.check'), { maker_title: value });
            if (response.data.exists) {
                if (isEdit && dataEdit.maker_title === value) return;
                setMakerExistsError('This maker title already exists in the database.');
            }
        } catch (error) {
            console.error('Error checking maker existence:', error);
        }
    };

    const openAddModal = () => {
        reset();
        clearErrors();
        setMakerExistsError('');
        setIsModalOpen(true);
    };

    const closeAddModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
        setMakerExistsError('');
    };

    const submitAdd = (e) => {
        e.preventDefault();
        if (makerExistsError) return;
        post(route('makers.store'), { onSuccess: () => closeAddModal() });
    };

    const openEditModal = (item) => {
        setDataEdit(item);
        setEditData({
            id: item.id,
            maker_title: item.maker_title || '',
            username: item.username || currentUsername,
        });
        editClearErrors();
        setMakerExistsError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editReset();
        editClearErrors();
        setMakerExistsError('');
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (makerExistsError) return;
        patchEdit(route('makers.update', editData.id), { onSuccess: () => closeEditModal() });
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
        destroy(route('makers.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const renderMakerForm = ({ mode, values, setValues, formErrors, busy, onCancel }) => {
        const isEdit = mode === 'edit';

        return (
            <form onSubmit={isEdit ? submitEdit : submitAdd} noValidate className="p-6">
                <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isEdit ? 'bg-cyan-50 text-cyan-600 ring-cyan-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'} ring-1`}>
                        <i className={`fas ${isEdit ? 'fa-pen' : 'fa-industry'} text-lg`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">{isEdit ? 'Edit Maker' : 'Add New Maker'}</h2>
                        <p className="mt-1 text-sm text-slate-500">Register product makers for clearer brand and item tracking.</p>
                    </div>
                </div>

                <div>
                    <label htmlFor={isEdit ? 'edit_maker_title' : 'maker_title'} className="block text-sm font-semibold text-slate-800">
                        Maker title <span className="text-rose-500">*</span>
                    </label>
                    <input
                        id={isEdit ? 'edit_maker_title' : 'maker_title'}
                        type="text"
                        className={inputClass(makerExistsError || formErrors.maker_title)}
                        value={values.maker_title}
                        onChange={(e) => setValues('maker_title', e.target.value)}
                        onBlur={(e) => handleCheckExists(e.target.value, isEdit)}
                        placeholder="Coca-Cola Company"
                    />
                    <InputError message={makerExistsError || formErrors.maker_title} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={busy || !!makerExistsError}
                        type="submit"
                    >
                        {busy && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                        {isEdit ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="min-h-[calc(100vh-140px)] bg-[#F2F9F5] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
                                    <i className="fas fa-industry text-[10px]"></i>
                                    Supplier labels
                                </div>
                                <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">Maker List</h1>
                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Keep product origins tidy for brands, stock, and reporting.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                                    <input
                                        type="text"
                                        name="table_search"
                                        className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Search makers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-emerald-600" aria-label="Search makers">
                                        <i className="fas fa-search text-xs"></i>
                                    </button>
                                </form>

                                <button onClick={openAddModal} type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2">
                                    <i className="fas fa-plus text-xs"></i>
                                    Add Maker
                                </button>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-emerald-50 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                            <div className="border-b border-emerald-50 bg-white px-5 py-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-950">Makers Management</h2>
                                        <p className="mt-1 text-sm text-slate-500">{datasList.length} makers loaded on this page.</p>
                                    </div>
                                    <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                                        Live duplicate check
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-emerald-50 bg-emerald-50/60 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                            <th className="px-5 py-4">Maker</th>
                                            <th className="px-5 py-4">Created By</th>
                                            <th className="px-5 py-4">Created At</th>
                                            <th className="px-5 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50">
                                        {datasList.length > 0 ? (
                                            datasList.map((item, index) => {
                                                const accent = accentStyles[index % accentStyles.length];

                                                return (
                                                    <tr key={item.id} className="transition hover:bg-emerald-50/30">
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.tile} ${accent.icon} ring-1 ${accent.ring}`}>
                                                                    <i className="fas fa-industry text-sm"></i>
                                                                </div>
                                                                <div>
                                                                    <p className="text-base font-bold text-slate-950">{item?.maker_title}</p>
                                                                    <p className="mt-0.5 text-xs font-semibold text-slate-400">Maker #{item?.id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                                                                {item?.username || 'System'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm font-medium text-slate-500">
                                                            {item?.created_at ? moment(item.created_at).format('DD/MM/YYYY') : 'N/A'}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => openEditModal(item)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100" type="button">
                                                                    <i className="fas fa-edit text-xs"></i>
                                                                    Edit
                                                                </button>
                                                                <button onClick={() => confirmDataDeletion(item)} type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100" aria-label={`Delete ${item?.maker_title || 'maker'}`} title="Delete">
                                                                    <i className="fas fa-trash text-sm"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-14 text-center">
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                                                        <i className="fas fa-industry text-lg"></i>
                                                    </div>
                                                    <p className="mt-4 text-sm font-semibold text-slate-500">There are no records found!</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {makers?.links && (
                                <div className="border-t border-emerald-50 px-4 py-3">
                                    <Pagination links={makers.links} />
                                </div>
                            )}
                        </div>

                        <Modal show={isModalOpen} onClose={closeAddModal}>
                            {renderMakerForm({ mode: 'add', values: data, setValues: setData, formErrors: errors, busy: processing, onCancel: closeAddModal })}
                        </Modal>

                        <Modal show={isEditModalOpen} onClose={closeEditModal}>
                            {renderMakerForm({ mode: 'edit', values: editData, setValues: setEditData, formErrors: editErrors, busy: editProcessing, onCancel: closeEditModal })}
                        </Modal>

                        <Modal show={confirmingDataDeletion} onClose={closeModal}>
                            <form onSubmit={deleteDataRow} className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                    <i className="fas fa-trash text-lg"></i>
                                </div>
                                <h2 className="text-lg font-bold text-slate-950">Delete maker?</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Are you sure you want to delete <span className="font-bold text-slate-900">{dataEdit?.maker_title}</span>?
                                </p>
                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                                    <DangerButton className="ms-3" disabled={deleteProcessing}>Yes, Delete</DangerButton>
                                </div>
                            </form>
                        </Modal>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
