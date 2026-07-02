import { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { money } from '../utils/invoiceHelpers';

export function useInvoiceManagement(auth, invoices = {}, customers = [], pendingOrders = [], users = [], filters = {}) {
    const invoiceList = invoices.data || [];
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        staff_id: auth?.user?.id || '',
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

    const openDetailModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailModalOpen(true);
    };

    const openDeleteModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDeleteModalOpen(true);
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
                setIsDeleteModalOpen(false);
                setSelectedInvoice(null);
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
        selectedInvoice,
        customerSearch,
        setCustomerSearch,
        showSuggestions,
        setShowSuggestions,

        data,
        setData,
        processing,
        errors,

        filteredCustomers,
        filteredPendingOrders,
        stats,

        handleSearch,
        clearSearch,
        openAddModal,
        closeAddModal,
        selectCustomer,
        handleCustomerSearchChange,
        toggleOrder,
        submitAddInvoice,
        openDetailModal,
        openDeleteModal,
        handleToggleStatus,
        handleDeleteInvoice
    };
}
