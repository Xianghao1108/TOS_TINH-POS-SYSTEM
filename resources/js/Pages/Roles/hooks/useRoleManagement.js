import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export function useRoleManagement() {
    const [searchQuery, setSearchQuery] = useState(new URLSearchParams(window.location.search).get('search') || '');
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, clearErrors } =
        useForm({
            id: '',
            name: ''
        });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('roles.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const confirmDataDeletion = (item) => {
        setDataEdit(item);
        setDeleteData('id', item.id);
        setDeleteData('name', item.name);
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
        destroy(route('roles.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        confirmingDataDeletion,
        dataEdit,
        deleteData,
        processing,

        handleSearch,
        confirmDataDeletion,
        closeModal,
        deleteDataRow
    };
}
