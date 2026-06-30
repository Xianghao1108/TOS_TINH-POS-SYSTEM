import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export function useUserManagement() {
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});

    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, clearErrors } =
        useForm({
            id: '',
            name: ''
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
        destroy(route('users.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    return {
        confirmingDataDeletion,
        dataEdit,
        deleteData,
        processing,

        confirmDataDeletion,
        closeModal,
        deleteDataRow
    };
}
