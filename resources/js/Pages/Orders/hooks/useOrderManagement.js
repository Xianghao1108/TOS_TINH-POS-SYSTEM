import { useState } from 'react';
import { router } from '@inertiajs/react';

export function useOrderManagement(filters = {}) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('orders.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const openDetailModal = (order) => {
        setActiveOrder(order);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setActiveOrder(null);
    };

    const confirmOrderDeletion = (order) => {
        setActiveOrder(order);
        setConfirmingDeletion(true);
    };

    const closeDeleteModal = () => {
        setConfirmingDeletion(false);
        setActiveOrder(null);
    };

    const deleteOrderRow = (e) => {
        e.preventDefault();
        router.delete(route('orders.destroy', activeOrder.id), {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal()
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        isDetailModalOpen,
        confirmingDeletion,
        activeOrder,

        handleSearch,
        openDetailModal,
        closeDetailModal,
        confirmOrderDeletion,
        closeDeleteModal,
        deleteOrderRow
    };
}
