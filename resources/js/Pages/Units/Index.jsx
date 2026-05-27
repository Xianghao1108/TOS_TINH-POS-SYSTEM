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

export default function UnitsPage({ auth, units, filters }) {
    const datasList = units?.data || units || [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    
    // Live validation state for checking if unit exists
    const [unitExistsError, setUnitExistsError] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    // Form for Add Modal
    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
        unit_title: '',
        username: currentUsername
    });

    // Form for Edit Modal
    const { data: editData, setData: setEditData, patch: patchEdit, processing: editProcessing, errors: editErrors, reset: editReset, clearErrors: editClearErrors, setError: setEditError } = useForm({
        id: '',
        unit_title: '',
        username: currentUsername
    });

    // Form for Delete Action
    const { delete: destroy, processing: deleteProcessing } = useForm();

    const headWeb = 'Unit List';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('units.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    // -----------------------------------------------------------
    // Custom Function: Check if Unit Exists via Axios
    // -----------------------------------------------------------
    const handleCheckExists = async (value, isEdit = false, currentId = null) => {
        setUnitExistsError('');
        if (!value) return;

        try {
            const response = await axios.post(route('units.check'), { unit_title: value });
            if (response.data.exists) {
                // If we are editing, ignore the error if the name belongs to the current item we are editing
                if (isEdit && dataEdit.unit_title === value) return;
                
                setUnitExistsError('This unit title already exists in the database.');
            }
        } catch (error) {
            console.error("Error checking unit existence:", error);
        }
    };

    // Add Modal Functions
    const openAddModal = () => {
        reset();
        clearErrors();
        setUnitExistsError('');
        setIsModalOpen(true);
    };

    const closeAddModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submitAdd = (e) => {
        e.preventDefault();
        if (unitExistsError) return; // Prevent submission if exists

        post(route('units.store'), {
            onSuccess: () => closeAddModal(),
        });
    };

    // Edit Modal Functions
    const openEditModal = (item) => {
        setDataEdit(item);
        setEditData({
            id: item.id,
            unit_title: item.unit_title || '',
            username: item.username || currentUsername
        });
        editClearErrors();
        setUnitExistsError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editReset();
        editClearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (unitExistsError) return; // Prevent submission if exists

        patchEdit(route('units.update', editData.id), {
            onSuccess: () => closeEditModal(),
        });
    };

    // Delete Modal Functions
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
        destroy(route('units.destroy', dataEdit.id), {
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
                                    Units Management
                                </h3>
                                <div className="card-tools d-flex align-items-center">
                                    <button onClick={openAddModal} className="btn btn-primary btn-sm mr-2">
                                        <i className="fas fa-plus"></i> Add Unit
                                    </button>
                                    <form onSubmit={handleSearch} className="input-group input-group-sm" style={{ width: '150px' }}>
                                        <input 
                                            type="text" 
                                            name="table_search" 
                                            className="form-control float-right" 
                                            placeholder="Search units..." 
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
                                            <th>Unit Title</th>
                                            <th>Created By</th>
                                            <th>Created At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datasList.length > 0 ?
                                            datasList.map((item, k) => (
                                                <tr key={item.id}>
                                                    <td>{item?.id}</td>
                                                    <td>{item?.unit_title}</td>
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
                                            ))
                                            :
                                            <tr>
                                                <td colSpan={5} className="text-center">There are no records found!</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>

                                {/* Add Modal Form */}
                                <Modal show={isModalOpen} onClose={closeAddModal}>
                                    <form onSubmit={submitAdd} noValidate className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Add New Unit
                                        </h2>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="unit_title" value="Unit Title (e.g., Kg, Box, Pcs)" />
                                            <TextInput
                                                id="unit_title"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.unit_title}
                                                onChange={(e) => setData('unit_title', e.target.value)}
                                                onBlur={(e) => handleCheckExists(e.target.value)}
                                                placeholder="Enter unit title"
                                            />
                                            {/* Show custom live error OR Laravel backend error */}
                                            <InputError message={unitExistsError || errors.unit_title} className="mt-2" />
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeAddModal}>Cancel</SecondaryButton>
                                            <PrimaryButton className="ms-3" disabled={processing || !!unitExistsError}>Save</PrimaryButton>
                                        </div>
                                    </form>
                                </Modal>

                                {/* Edit Modal Form */}
                                <Modal show={isEditModalOpen} onClose={closeEditModal}>
                                    <form onSubmit={submitEdit} noValidate className="p-6">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Edit Unit
                                        </h2>
                                        
                                        <div className="mt-4">
                                            <InputLabel htmlFor="edit_unit_title" value="Unit Title" />
                                            <TextInput
                                                id="edit_unit_title"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={editData.unit_title}
                                                onChange={(e) => setEditData('unit_title', e.target.value)}
                                                onBlur={(e) => handleCheckExists(e.target.value, true, editData.id)}
                                                placeholder="Enter unit title"
                                            />
                                            <InputError message={unitExistsError || editErrors.unit_title} className="mt-2" />
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeEditModal}>Cancel</SecondaryButton>
                                            <PrimaryButton className="ms-3" disabled={editProcessing || !!unitExistsError}>Update</PrimaryButton>
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
                                            Are you sure you want to delete the unit <span className='text-lg font-medium'>{dataEdit?.unit_title}</span>?
                                        </p>
                                        <div className="mt-6 flex justify-end">
                                            <SecondaryButton onClick={closeModal}>No</SecondaryButton>
                                            <DangerButton className="ms-3" disabled={deleteProcessing}>Yes, Delete</DangerButton>
                                        </div>
                                    </form>
                                </Modal>
                            </div>

                            {units?.links && (
                                <div className="card-footer clearfix">
                                    <Pagination links={units.links} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
