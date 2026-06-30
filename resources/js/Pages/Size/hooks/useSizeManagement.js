import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';

export function useSizeManagement(auth, filters = {}) {
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [sizeExistsError, setSizeExistsError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        size_title: '',
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
        size_title: '',
        username: currentUsername,
    });

    const { delete: destroy } = useForm();

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('sizes.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const handleCheckExists = async (value, isEdit = false) => {
        setSizeExistsError('');
        if (!value) return;

        try {
            const response = await axios.post(route('sizes.check'), { size_title: value });
            if (response.data.exists) {
                if (isEdit && dataEdit.size_title === value) return;
                setSizeExistsError('This size title already exists in the database.');
            }
        } catch (error) {
            console.error('Error checking size existence:', error);
        }
    };

    const openAddModal = () => {
        reset();
        clearErrors();
        setSizeExistsError('');
        setIsModalOpen(true);
    };

    const closeAddModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
        setSizeExistsError('');
    };

    const submitAdd = (e) => {
        e.preventDefault();
        if (sizeExistsError) return;
        post(route('sizes.store'), { onSuccess: () => closeAddModal() });
    };

    const openEditModal = (item) => {
        setDataEdit(item);
        setEditData({
            id: item.id,
            size_title: item.size_title || '',
            username: item.username || currentUsername,
        });
        editClearErrors();
        setSizeExistsError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editReset();
        editClearErrors();
        setSizeExistsError('');
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (sizeExistsError) return;
        patchEdit(route('sizes.update', editData.id), { onSuccess: () => closeEditModal() });
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
        destroy(route('sizes.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        sizeExistsError,
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
