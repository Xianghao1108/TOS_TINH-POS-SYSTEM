import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export function useSubCategoryManagement(auth, filters = {}) {
    const currentUsername = auth?.user?.username || auth?.user?.name || 'System Admin';

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
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

    const { delete: destroy } = useForm();

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

    return {
        searchQuery,
        setSearchQuery,
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
