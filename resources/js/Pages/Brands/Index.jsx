import Breadcrumb from '@/Components/Breadcrumb';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import moment from 'moment';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function BrandsPage({ auth, brands, makers, filters }) {
    const datasList = brands?.data || brands || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    
    // Live validation state
    const [brandExistsError, setBrandExistsError] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    // Add Form
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        brand_title: '',
        maker_id: '',
        username: currentUsername
    });

    // Edit Form
    const { data: editData, setData: setEditData, patch: patchEdit, processing: editProcessing, errors: editErrors, reset: editReset, clearErrors: editClearErrors } = useForm({
        id: '',
        brand_title: '',
        maker_id: '',
        username: currentUsername
    });

    // Delete Form
    const { delete: destroy, processing: deleteProcessing } = useForm();

    const headWeb = 'Brand List';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('brands.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    // Live Exists Check
    const handleCheckExists = async (value, isEdit = false) => {
        setBrandExistsError('');
        if (!value) return;

        try {
            const response = await axios.post(route('brands.check'), { brand_title: value });
            if (response.data.exists) {
                if (isEdit && dataEdit.brand_title === value) return; 
                setBrandExistsError('This brand title already exists in the database.');
            }
        } catch (error) {
            console.error("Error checking brand existence:", error);
        }
    };

    // Add Methods
    const openAddModal = () => {
        reset();
        clearErrors();
        setBrandExistsError('');
        setIsModalOpen(true);
    };

    const closeAddModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submitAdd = (e) => {
        e.preventDefault();
        if (brandExistsError) return;
        post(route('brands.store'), { onSuccess: () => closeAddModal() });
    };

    // Edit Methods
    const openEditModal = (item) => {
        setDataEdit(item);
        setEditData({
            id: item.id,
            brand_title: item.brand_title || '',
            maker_id: item.maker_id || (item.maker ? item.maker.id : ''),
            username: item.username || currentUsername
        });
        editClearErrors();
        setBrandExistsError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editReset();
        editClearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (brandExistsError) return;
        patchEdit(route('brands.update', editData.id), { onSuccess: () => closeEditModal() });
    };

    // Delete Methods
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
        destroy(route('brands.destroy', dataEdit.id), {
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
                                <h3 className="card-title">Brands Management</h3>
                                <div className="card-tools d-flex align-items-center">
                                    <button onClick={openAddModal} className="btn btn-primary btn-sm mr-2">
                                        <i className="fas fa-plus"></i> Add Brand
                                    </button>
                                    <form onSubmit={handleSearch} className="input-group input-group-sm" style={{ width: '150px' }}>
                                        <input 
                                            type="text" 
                                            name="table_search" 
                                            className="form-control float-right" 
                                            placeholder="Search brands..." 
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
                                            <th>Brand Title</th>
                                            <th>Maker</th>
                                            <th>Created By</th>
                                            <th>Created At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datasList.length > 0 ?
                                            datasList.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item?.id}</td>
                                                    <td>{item?.brand_title}</td>
                                                    {/* Display Maker Name if relationship exists */}
                                                    <td>{item?.maker?.maker_title || item?.maker_id}</td>
                                                    <td><span className="badge badge-info">{item?.username}</span></td>
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
                                            )) : (
                                            <tr>
                                                <td colSpan={6} className="text-center">There are no records found!</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Add Modal */}
                                <Modal show={isModalOpen} onClose={closeAddModal}>
                                    <form onSubmit={submitAdd} className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">Add New Brand</h2>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="maker_id" value="Maker" />
                                            <select
                                                id="maker_id"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                value={data.maker_id}
                                                onChange={(e) => setData('maker_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Select a Maker</option>
                                                {makers && makers.map((maker) => (
                                                    <option key={maker.id} value={maker.id}>{maker.maker_title}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.maker_id} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="brand_title" value="Brand Title" />
                                            <TextInput
                                                id="brand_title"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.brand_title}
                                                onChange={(e) => setData('brand_title', e.target.value)}
                                                onBlur={(e) => handleCheckExists(e.target.value)}
                                                required
                                            />
                                            <InputError message={brandExistsError || errors.brand_title} className="mt-2" />
                                        </div>
                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                                            <PrimaryButton className="ms-3" disabled={processing || !!brandExistsError}>Save</PrimaryButton>
                                        </div>
                                    </form>
                                </Modal>

                                {/* Edit Modal */}
                                <Modal show={isEditModalOpen} onClose={closeEditModal}>
                                    <form onSubmit={submitEdit} className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">Edit Brand</h2>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="edit_maker_id" value="Maker" />
                                            <select
                                                id="edit_maker_id"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                value={editData.maker_id}
                                                onChange={(e) => setEditData('maker_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Select a Maker</option>
                                                {makers && makers.map((maker) => (
                                                    <option key={maker.id} value={maker.id}>{maker.maker_title}</option>
                                                ))}
                                            </select>
                                            <InputError message={editErrors.maker_id} className="mt-2" />
                                        </div>

                                        <div className="mt-4">
                                            <InputLabel htmlFor="edit_brand_title" value="Brand Title" />
                                            <TextInput
                                                id="edit_brand_title"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={editData.brand_title}
                                                onChange={(e) => setEditData('brand_title', e.target.value)}
                                                onBlur={(e) => handleCheckExists(e.target.value, true)}
                                                required
                                            />
                                            <InputError message={brandExistsError || editErrors.brand_title} className="mt-2" />
                                        </div>
                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                                            <PrimaryButton className="ms-3" disabled={editProcessing || !!brandExistsError}>Update</PrimaryButton>
                                        </div>
                                    </form>
                                </Modal>

                                {/* Delete Modal */}
                                <Modal show={confirmingDataDeletion} onClose={closeModal}>
                                    <form onSubmit={deleteDataRow} className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">Confirmation!</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Are you sure you want to delete <span className='text-lg font-medium'>{dataEdit?.brand_title}</span>?
                                        </p>
                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                                            <DangerButton className="ms-3" disabled={deleteProcessing}>Yes, Delete</DangerButton>
                                        </div>
                                    </form>
                                </Modal>
                            </div>
                            
                            {brands?.links && (
                                <div className="card-footer clearfix">
                                    <Pagination links={brands.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
