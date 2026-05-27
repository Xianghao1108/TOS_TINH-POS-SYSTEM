import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function SubCategoriesPage({ auth, subCategories, categories = [], filters }) {
    const datasList = subCategories?.data || subCategories || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';
    
    // Add Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Delete Modal State
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    // Form for Add Modal
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        category_id: '',
        name: '',
        username: currentUsername
    });

    // Form for Edit Modal
    const { data: editData, setData: setEditData, patch: patchEdit, processing: editProcessing, errors: editErrors, reset: editReset, clearErrors: editClearErrors } = useForm({
        id: '',
        category_id: '',
        name: '',
        username: currentUsername
    });

    // Form for Delete Action
    const { delete: destroy, processing: deleteProcessing } = useForm();

    const headWeb = 'Sub Category List';
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
            username: item.username || currentUsername
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

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />} >
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card card-outline card-info shadow-sm">
                            <div className="card-header">
                                <h3 className="card-title">
                                    Datalist Management
                                </h3>
                                <div className="card-tools d-flex align-items-center">
                                    <button onClick={openAddModal} className="btn btn-primary btn-sm mr-2">
                                        <i className="fas fa-plus"></i> Add Sub Category
                                    </button>
                                    <form onSubmit={handleSearch} className="input-group input-group-sm" style={{ width: '150px' }}>
                                        <input 
                                            type="text" 
                                            name="table_search" 
                                            className="form-control float-right" 
                                            placeholder="Search" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <div className="input-group-append">
                                            <button type="submit" className="btn btn-default">
                                                <i className="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="card-body table-responsive p-0">
                                <table className="table table-hover text-nowrap">
                                    <thead>
                                        <tr>
                                            <th>#ID</th>
                                            <th>Sub-Category Title</th>
                                            <th> Category</th>
                                            <th>Created By</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datasList.length > 0 ?
                                            datasList.map((item, k) => (
                                                <tr key={k}>
                                                    <td>{item?.id}</td>
                                                    <td>{item?.name}</td>
                                                    <td>{item?.category?.category_title || item?.category?.name}</td>
                                                    <td><span className="badge badge-info">{item?.username}</span></td>
                                                    <td>{item?.status === 1 ? 'active' : 'inactive'}</td>
                                                    <td>{moment(item?.created_at).format("DD/MM/YYYY")}</td>
                                                    <td width={'170px'}>
                                                        <button onClick={() => openEditModal(item)} className="btn btn-info btn-xs mr-2">
                                                            <i className='fas fa-edit'></i> Edit
                                                        </button>
                                                        <button onClick={() => confirmDataDeletion(item)} type="button" className="btn btn-danger btn-xs">
                                                            <i className='fas fa-trash'></i> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                            :
                                            <tr>
                                                <td colSpan={7} className="text-center">There are no records!</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>

                                {/* Add Modal Form */}
                                <Modal show={isModalOpen} onClose={closeAddModal}>
                                    <form onSubmit={submitAdd} noValidate className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Add New Sub Category
                                        </h2>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="category_id" value="Parent Category" />
                                            <select
                                                id="category_id"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                            >
                                                <option value="">Select a Parent Category</option>
                                                {categories && categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.category_title || cat.name}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category_id} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="name" value="Sub-Category Title" />
                                            <TextInput
                                                id="name"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter title"
                                            />
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                                            <PrimaryButton className="ms-3" disabled={processing}>Save</PrimaryButton>
                                        </div>
                                    </form>
                                </Modal>

                                {/* Edit Modal Form */}
                                <Modal show={isEditModalOpen} onClose={closeEditModal}>
                                    <form onSubmit={submitEdit} noValidate className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Edit Sub Category
                                        </h2>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="edit_category_id" value="Parent Category" />
                                            <select
                                                id="edit_category_id"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                value={editData.category_id}
                                                onChange={(e) => setEditData('category_id', e.target.value)}
                                            >
                                                <option value="">Select a Parent Category</option>
                                                {categories && categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.category_title || cat.name}</option>
                                                ))}
                                            </select>
                                            <InputError message={editErrors.category_id} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="edit_name" value="Sub-Category Title" />
                                            <TextInput
                                                id="edit_name"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={editData.name}
                                                onChange={(e) => setEditData('name', e.target.value)}
                                                placeholder="Enter title"
                                            />
                                            <InputError message={editErrors.name} className="mt-2" />
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                                            <PrimaryButton className="ms-3" disabled={editProcessing}>Update</PrimaryButton>
                                        </div>
                                    </form>
                                </Modal>

                                {/* Delete Modal Form */}
                                <Modal show={confirmingDataDeletion} onClose={closeModal}>
                                    <form onSubmit={deleteDataRow} className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Confirmation!
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Are you sure you want to delete <span className='text-lg font-medium'>{dataEdit?.name}</span>?
                                        </p>
                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                                            <DangerButton className="ms-3" disabled={deleteProcessing}>Yes</DangerButton>
                                        </div>
                                    </form>
                                </Modal>
                            </div>

                            {subCategories?.links && (
                                <div className="card-footer clearfix">
                                    <Pagination links={subCategories.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
