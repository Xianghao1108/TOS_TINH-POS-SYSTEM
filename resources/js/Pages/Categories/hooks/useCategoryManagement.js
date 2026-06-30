import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export function useCategoryManagement(filters = {}) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, clearErrors } =
        useForm({
            id: '',
            name: '',
        });

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData('id', data.id);
        setDeleteData('name', data.name);
        setConfirmingDataDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        destroy(route('categories.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('categories.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    return {
        searchQuery,
        setSearchQuery,
        confirmingDataDeletion,
        dataEdit,
        deleteData,
        processing,

        confirmDataDeletion,
        closeModal,
        deleteDataRow,
        handleSearch
    };
}
