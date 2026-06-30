import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';

export function useMakerManagement(auth, filters = {}) {
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [makerExistsError, setMakerExistsError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        maker_title: '',
        username: currentUsername,
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
        maker_title: '',
        username: currentUsername,
    });

    const { delete: destroy } = useForm();

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

    return {
        searchQuery,
        setSearchQuery,
        makerExistsError,
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
