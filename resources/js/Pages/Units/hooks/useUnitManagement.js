import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';

export function useUnitManagement(auth, filters = {}) {
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [unitExistsError, setUnitExistsError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        unit_title: '',
        username: currentUsername
    });

    const { 
        data: editData, 
        setData: setEditData, 
        patch: patchEdit, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: editReset, 
        clearErrors: editClearErrors 
    } = useForm({
        id: '',
        unit_title: '',
        username: currentUsername
    });

    const { delete: destroy } = useForm();

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('units.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const handleCheckExists = async (value, isEdit = false) => {
        setUnitExistsError('');
        if (!value) return;

        try {
            const response = await axios.post(route('units.check'), { unit_title: value });
            if (response.data.exists) {
                if (isEdit && dataEdit.unit_title === value) return;
                setUnitExistsError('This unit title already exists in the database.');
            }
        } catch (error) {
            console.error('Error checking unit existence:', error);
        }
    };

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
        setUnitExistsError('');
    };

    const submitAdd = (e) => {
        e.preventDefault();
        if (unitExistsError) return;
        post(route('units.store'), { onSuccess: () => closeAddModal() });
    };

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
        setUnitExistsError('');
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (unitExistsError) return;
        patchEdit(route('units.update', editData.id), { onSuccess: () => closeEditModal() });
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
        destroy(route('units.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return {
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
    };
}
