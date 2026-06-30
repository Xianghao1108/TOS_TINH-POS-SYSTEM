import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';

export function useBrandManagement(auth, filters = {}) {
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [brandExistsError, setBrandExistsError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        brand_title: '',
        maker_id: '',
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
        brand_title: '',
        maker_id: '',
        username: currentUsername,
    });

    const { delete: destroy } = useForm();

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('brands.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

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
            console.error('Error checking brand existence:', error);
        }
    };

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
        setBrandExistsError('');
    };

    const submitAdd = (e) => {
        e.preventDefault();
        if (brandExistsError) return;
        post(route('brands.store'), { onSuccess: () => closeAddModal() });
    };

    const openEditModal = (item) => {
        setDataEdit(item);
        setEditData({
            id: item.id,
            brand_title: item.brand_title || '',
            maker_id: item.maker_id || (item.maker ? item.maker.id : ''),
            username: item.username || currentUsername,
        });
        editClearErrors();
        setBrandExistsError('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editReset();
        editClearErrors();
        setBrandExistsError('');
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (brandExistsError) return;
        patchEdit(route('brands.update', editData.id), { onSuccess: () => closeEditModal() });
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
        destroy(route('brands.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        brandExistsError,
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
