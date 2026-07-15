import { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { money } from '../utils/invoiceHelpers';

export function useInvoiceManagement(auth, invoices = {}, customers = [], pendingOrders = [], users = [], filters = {}) {
    const invoiceList = invoices.data || [];
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [editCustomerSearch, setEditCustomerSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showEditSuggestions, setShowEditSuggestions] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        staff_id: auth?.user?.id || '',
        status: '2',
        payment_method: 'cash',
        total: '0.00',
        order_ids: [],
    });

    const { 
        data: editData, 
        setData: setEditData, 
        patch: patchEdit, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: resetEdit, 
        clearErrors: clearEditErrors 
    } = useForm({
        customer_id: '',
        staff_id: '',
        status: '2',
        payment_method: 'cash',
        total: '0.00',
        order_ids: [],
    });

    const filteredCustomers = useMemo(() => {
        const query = customerSearch.toLowerCase();
        return customers.filter((customer) =>
            customer.name?.toLowerCase().includes(query) ||
            customer.phone?.includes(customerSearch)
        );
    }, [customers, customerSearch]);

    const filteredPendingOrders = useMemo(() => {
        if (!data.customer_id) return [];
        return pendingOrders.filter((order) => String(order.customer_id) === String(data.customer_id));
    }, [pendingOrders, data.customer_id]);

    const filteredEditCustomers = useMemo(() => {
        const query = editCustomerSearch.toLowerCase();
        return customers.filter((customer) =>
            customer.name?.toLowerCase().includes(query) ||
            customer.phone?.includes(editCustomerSearch)
        );
    }, [customers, editCustomerSearch]);

    const editAvailableOrders = useMemo(() => {
        if (!editData.customer_id) return [];
        
        const customerPending = pendingOrders.filter(
            (order) => String(order.customer_id) === String(editData.customer_id)
        );
        
        const currentlyLinked = (selectedInvoice && String(selectedInvoice.customer_id) === String(editData.customer_id))
            ? (selectedInvoice.orders || [])
            : [];
            
        const combined = [...currentlyLinked];
        customerPending.forEach((pendingOrder) => {
            if (!combined.some((o) => o.id === pendingOrder.id)) {
                combined.push(pendingOrder);
            }
        });
        
        return combined;
    }, [pendingOrders, editData.customer_id, selectedInvoice]);

    const stats = useMemo(() => {
        const paid = invoiceList.filter((invoice) => invoice.status === 1).length;
        const unpaid = invoiceList.filter((invoice) => invoice.status === 2).length;
        const loadedRevenue = invoiceList.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

        return [
            { label: 'Total invoices', value: invoices.total || 0, icon: 'fas fa-file-invoice-dollar', tone: 'text-slate-900 bg-white' },
            { label: 'Paid', value: paid, icon: 'fas fa-check-circle', tone: 'text-emerald-700 bg-emerald-50' },
            { label: 'Unpaid', value: unpaid, icon: 'fas fa-clock', tone: 'text-amber-700 bg-amber-50' },
            { label: 'Loaded value', value: money(loadedRevenue), icon: 'fas fa-wallet', tone: 'text-fuchsia-700 bg-fuchsia-50' },
        ];
    }, [invoiceList, invoices.total]);

    const selectedOrdersTotal = (orderIds) => pendingOrders
        .filter((order) => orderIds.includes(order.id))
        .reduce((sum, order) => sum + Number(order.total || 0), 0)
        .toFixed(2);

    const selectedEditOrdersTotal = (orderIds) => {
        const allPossibleOrders = [...pendingOrders];
        if (selectedInvoice && selectedInvoice.orders) {
            selectedInvoice.orders.forEach((order) => {
                if (!allPossibleOrders.some((o) => o.id === order.id)) {
                    allPossibleOrders.push(order);
                }
            });
        }
        return allPossibleOrders
            .filter((order) => orderIds.includes(order.id))
            .reduce((sum, order) => sum + Number(order.total || 0), 0)
            .toFixed(2);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('invoices.index'), { search: searchQuery }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearchQuery('');
        router.get(route('invoices.index'), {}, { preserveState: true, replace: true });
    };

    const openAddModal = () => {
        clearErrors();
        reset();
        setData({
            customer_id: '',
            staff_id: auth?.user?.id || users[0]?.id || '',
            status: '2',
            payment_method: 'cash',
            total: '0.00',
            order_ids: [],
        });
        setCustomerSearch('');
        setShowSuggestions(false);
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setCustomerSearch('');
        setShowSuggestions(false);
        clearErrors();
    };

    const selectCustomer = (customer) => {
        setCustomerSearch(customer.name);
        setData({
            ...data,
            customer_id: customer.id,
            order_ids: [],
            total: '0.00',
        });
        setShowSuggestions(false);
    };

    const handleCustomerSearchChange = (e) => {
        setCustomerSearch(e.target.value);
        setData({
            ...data,
            customer_id: '',
            order_ids: [],
            total: '0.00',
        });
        setShowSuggestions(true);
    };

    const toggleOrder = (orderId, checked) => {
        const nextOrderIds = checked
            ? [...data.order_ids, orderId]
            : data.order_ids.filter((id) => id !== orderId);

        setData({
            ...data,
            order_ids: nextOrderIds,
            total: selectedOrdersTotal(nextOrderIds),
        });
    };

    const submitAddInvoice = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                reset();
                closeAddModal();
            },
        });
    };

    const openEditModal = (invoice) => {
        clearEditErrors();
        setSelectedInvoice(invoice);
        
        const linkedOrderIds = invoice.orders ? invoice.orders.map((o) => o.id) : [];
        
        let normalizedMethod = invoice.payment_method || 'cash';
        if (normalizedMethod === 'qr' || normalizedMethod === 'aba_qr') {
            normalizedMethod = 'khqr';
        }
        
        setEditData({
            customer_id: invoice.customer_id || '',
            staff_id: invoice.staff_id || '',
            status: String(invoice.status),
            payment_method: normalizedMethod,
            total: Number(invoice.total || 0).toFixed(2),
            order_ids: linkedOrderIds,
        });
        setEditCustomerSearch(invoice.customer?.name || 'Walk-in Customer');
        setShowEditSuggestions(false);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditCustomerSearch('');
        setShowEditSuggestions(false);
        clearEditErrors();
        setSelectedInvoice(null);
    };

    const selectEditCustomer = (customer) => {
        setEditCustomerSearch(customer.name);
        setEditData({
            ...editData,
            customer_id: customer.id,
            order_ids: [],
            total: '0.00',
        });
        setShowEditSuggestions(false);
    };

    const handleEditCustomerSearchChange = (e) => {
        setEditCustomerSearch(e.target.value);
        setEditData({
            ...editData,
            customer_id: '',
            order_ids: [],
            total: '0.00',
        });
        setShowEditSuggestions(true);
    };

    const toggleEditOrder = (orderId, checked) => {
        const nextOrderIds = checked
            ? [...editData.order_ids, orderId]
            : editData.order_ids.filter((id) => id !== orderId);

        setEditData({
            ...editData,
            order_ids: nextOrderIds,
            total: selectedEditOrdersTotal(nextOrderIds),
        });
    };

    const submitEditInvoice = (e) => {
        e.preventDefault();
        patchEdit(route('invoices.update', selectedInvoice.id), {
            onSuccess: () => {
                closeEditModal();
            },
        });
    };

    const openDetailModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedInvoice(null);
    };

    const openDeleteModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedInvoice(null);
    };

    const handleToggleStatus = (invoice) => {
        router.patch(route('invoices.update', invoice.id), {
            status: invoice.status === 1 ? 2 : 1,
        }, {
            preserveScroll: true,
        });
    };

    const handleDeleteInvoice = () => {
        router.delete(route('invoices.destroy', selectedInvoice.id), {
            onSuccess: () => {
                closeDeleteModal();
            },
            preserveScroll: true,
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        isAddModalOpen,
        isDetailModalOpen,
        isDeleteModalOpen,
        isEditModalOpen,
        selectedInvoice,
        customerSearch,
        setCustomerSearch,
        editCustomerSearch,
        setEditCustomerSearch,
        showSuggestions,
        setShowSuggestions,
        showEditSuggestions,
        setShowEditSuggestions,

        data,
        setData,
        processing,
        errors,

        editData,
        setEditData,
        editProcessing,
        editErrors,

        filteredCustomers,
        filteredPendingOrders,
        filteredEditCustomers,
        editAvailableOrders,
        stats,

        handleSearch,
        clearSearch,
        openAddModal,
        closeAddModal,
        selectCustomer,
        handleCustomerSearchChange,
        toggleOrder,
        submitAddInvoice,
        openEditModal,
        closeEditModal,
        selectEditCustomer,
        handleEditCustomerSearchChange,
        toggleEditOrder,
        submitEditInvoice,
        openDetailModal,
        closeDetailModal,
        openDeleteModal,
        closeDeleteModal,
        handleToggleStatus,
        handleDeleteInvoice
    };
}
