import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export function useCustomerManagement(filters = {}) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        username: '',
        email: '',
        phone: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/customers', { search: searchQuery }, { preserveState: true });
    };

    const openAddModal = () => {
        clearErrors();
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (customer) => {
        clearErrors();
        setData({
            username: customer.username,
            email: customer.email,
            phone: customer.phone,
        });
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (customer) => {
        setSelectedCustomer(customer);
        setIsDeleteModalOpen(true);
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post('/customers', {
            onSuccess: () => {
                reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        put(`/customers/${selectedCustomer.id}`, {
            onSuccess: () => {
                reset();
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
            },
        });
    };

    const handleDelete = () => {
        destroy(`/customers/${selectedCustomer.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedCustomer(null);
            },
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        isAddModalOpen,
        setIsAddModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        selectedCustomer,

        data,
        setData,
        processing,
        errors,

        handleSearch,
        openAddModal,
        openEditModal,
        openDeleteModal,
        submitAdd,
        submitEdit,
        handleDelete
    };
}
