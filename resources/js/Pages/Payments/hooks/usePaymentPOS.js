import { useState, useMemo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { roundMoney } from '../utils/paymentHelpers';

export function usePaymentPOS(products = [], customers = []) {
    const [productSearch, setProductSearch] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Products');
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState('');
    const [cashReceived, setCashReceived] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'qr', 'card'
    const [transactionReference, setTransactionReference] = useState('');
    const [checkoutCurrency, setCheckoutCurrency] = useState('USD');
    
    // KHQR States
    const [khqrPaymentData, setKhqrPaymentData] = useState(null);
    const [khqrModalOpen, setKhqrModalOpen] = useState(false);
    const [khqrTimeLeft, setKhqrTimeLeft] = useState(600);
    const [khqrStatus, setKhqrStatus] = useState('pending');
    const [khqrLoading, setKhqrLoading] = useState(false);
    const [showDebug, setShowDebug] = useState(true);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: null,
        subtotal: 0,
        discount: 0,
        total: 0,
        total_payment: 0,
        items: [],
    });

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + Number(item.product_price) * Number(item.quantity), 0);
    }, [cart]);

    const discountAmountVal = subtotal * (Number(discount || 0) / 100);
    const totalPaymentVal = Math.max(subtotal - discountAmountVal, 0);

    // Dynamic change due calculation
    const changeDue = useMemo(() => {
        if (paymentMethod !== 'cash') return 0;
        return Math.max(Number(cashReceived || 0) - totalPaymentVal, 0);
    }, [cashReceived, totalPaymentVal, paymentMethod]);

    // Handle payment method toggle effects (auto-fill cash received for digital options)
    useEffect(() => {
        if (paymentMethod !== 'cash') {
            setCashReceived(totalPaymentVal.toString());
        } else {
            setCashReceived('');
        }
    }, [paymentMethod, totalPaymentVal]);

    // Sync form data whenever dependencies change
    useEffect(() => {
        setData(prev => ({
            ...prev,
            subtotal: roundMoney(subtotal),
            discount: roundMoney(discountAmountVal),
            total: roundMoney(totalPaymentVal),
            total_payment: roundMoney(Number(cashReceived || 0)),
            items: cart.map(item => ({
                product_id: item.id,
                quantity: Number(item.quantity),
            }))
        }));
    }, [cart, subtotal, discountAmountVal, totalPaymentVal, cashReceived]);

    // Product search and category filter logic
    const filteredProducts = useMemo(() => {
        let result = products;

        const keyword = productSearch.toLowerCase().trim();
        if (keyword) {
            result = result.filter(p =>
                p.product_title?.toLowerCase().includes(keyword) ||
                p.product_code?.toLowerCase().includes(keyword)
            );
        }

        if (selectedCategory !== 'All Products') {
            result = result.filter(p =>
                p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        return result;
    }, [products, productSearch, selectedCategory]);

    const addProductToCart = (product) => {
        setCart(currentCart => {
            const existing = currentCart.find(item => item.id === product.id);
            if (existing) {
                return currentCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(Number(item.quantity) + 1, Number(product.product_stock)) }
                        : item
                );
            }
            return [...currentCart, { ...product, quantity: 1 }];
        });
    };

    const updateCartQuantity = (productId, qty) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const maxStock = Number(product.product_stock);
        const safeQty = Math.max(1, Math.min(Number(qty || 1), maxStock));
        setCart(currentCart =>
            currentCart.map(item =>
                item.id === productId ? { ...item, quantity: safeQty } : item
            )
        );
    };

    const removeCartItem = (productId) => {
        setCart(currentCart => currentCart.filter(item => item.id !== productId));
    };

    // Countdown Timer Effect
    useEffect(() => {
        if (!khqrModalOpen || !khqrPaymentData || khqrStatus !== 'pending') return;

        const calculateTimeLeft = () => {
            const diff = Math.max(0, Math.ceil((khqrPaymentData.expiry_ms - Date.now()) / 1000));
            setKhqrTimeLeft(diff);
            if (diff <= 0) {
                setKhqrStatus('expired');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [khqrModalOpen, khqrPaymentData, khqrStatus]);

    // Polling Effect
    useEffect(() => {
        if (!khqrModalOpen || !khqrPaymentData || khqrStatus !== 'pending') return;

        const pollStatus = async () => {
            try {
                const response = await axios.get(`/api/payment-status/${khqrPaymentData.payment_id}`);
                const status = response.data.payment_status;
                if (status === 'paid') {
                    setKhqrStatus('paid');
                } else if (status === 'failed') {
                    setKhqrStatus('failed');
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        const interval = setInterval(pollStatus, 2000);

        return () => clearInterval(interval);
    }, [khqrModalOpen, khqrPaymentData, khqrStatus]);

    // Auto-refresh effect on payment success
    useEffect(() => {
        if (khqrStatus === 'paid') {
            const timer = setTimeout(() => {
                setCart([]);
                setDiscount('');
                setCashReceived('');
                setProductSearch('');
                setTransactionReference('');
                setKhqrModalOpen(false);
                setKhqrPaymentData(null);
                window.location.reload();
            }, 1000); // 1 second delay so cashier sees success checkmark, then auto-closes/redirects
            return () => clearTimeout(timer);
        }
    }, [khqrStatus]);

    // Simulate webhook payment
    const triggerSimulatePayment = async (statusType) => {
        if (!khqrPaymentData) return;
        try {
            await axios.post('/api/payment-webhook', {
                md5: khqrPaymentData.md5,
                status: statusType,
            });
        } catch (err) {
            console.error('Simulation error:', err);
            alert('Failed to simulate payment.');
        }
    };

    // Initiate KHQR checkout
    const handleKHQRCheckout = async () => {
        setKhqrLoading(true);
        try {
            const response = await axios.post('/api/create-payment', {
                currency: checkoutCurrency,
                customer_id: data.customer_id,
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }))
            });

            setKhqrPaymentData(response.data);
            setKhqrStatus('pending');
            setIsPaymentModalOpen(false);
            setKhqrModalOpen(true);
        } catch (error) {
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert(errMsg);
        } finally {
            setKhqrLoading(false);
        }
    };

    // Execute backend checkout POST submission
    const handleConfirmPayment = () => {
        if (cart.length === 0) return;
        
        if (paymentMethod === 'cash' && Number(cashReceived || 0) < totalPaymentVal) {
            alert('Received payment must be greater than or equal to the grand total.');
            return;
        }

        post('/payments', {
            onSuccess: () => {
                setCart([]);
                setDiscount('');
                setCashReceived('');
                setProductSearch('');
                setTransactionReference('');
                setIsPaymentModalOpen(false);
                reset();
            }
        });
    };

    return {
        productSearch,
        setProductSearch,
        selectedCategory,
        setSelectedCategory,
        cart,
        setCart,
        discount,
        setDiscount,
        cashReceived,
        setCashReceived,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        paymentMethod,
        setPaymentMethod,
        transactionReference,
        setTransactionReference,
        checkoutCurrency,
        setCheckoutCurrency,
        
        khqrPaymentData,
        setKhqrPaymentData,
        khqrModalOpen,
        setKhqrModalOpen,
        khqrTimeLeft,
        khqrStatus,
        setKhqrStatus,
        khqrLoading,
        showDebug,
        setShowDebug,

        data,
        setData,
        processing,
        errors,
        reset,

        subtotal,
        discountAmountVal,
        totalPaymentVal,
        changeDue,
        filteredProducts,

        addProductToCart,
        updateCartQuantity,
        removeCartItem,
        triggerSimulatePayment,
        handleKHQRCheckout,
        handleConfirmPayment
    };
}
