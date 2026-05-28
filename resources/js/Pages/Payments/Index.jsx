import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

export default function PaymentsIndex({ products = [], customers = [] }) {
    const [productSearch, setProductSearch] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Products');
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState('');
    const [cashReceived, setCashReceived] = useState('');
    const [showCustomerSelect, setShowCustomerSelect] = useState(false);
    const [showDiscountInput, setShowDiscountInput] = useState(false);
    const [orderSequence] = useState('Order #8832');

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: null,
        subtotal: 0,
        discount: 0,
        total: 0,
        total_payment: 0,
        items: [],
    });

    const money = (value) => Number(value || 0).toFixed(2);
    const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + Number(item.product_price) * Number(item.quantity), 0);
    }, [cart]);

    const discountAmount = Math.min(Number(discount || 0), subtotal);
    const total = Math.max(subtotal - discountAmount, 0);
    const changeDue = Math.max(Number(cashReceived || 0) - total, 0);

    // Sync form data whenever dependencies change
    useEffect(() => {
        setData(prev => ({
            ...prev,
            subtotal: roundMoney(subtotal),
            discount: roundMoney(discountAmount),
            total: roundMoney(total),
            total_payment: roundMoney(cashReceived),
            items: cart.map(item => ({
                product_id: item.id,
                quantity: Number(item.quantity),
            }))
        }));
    }, [cart, subtotal, discountAmount, total, cashReceived]);

    // Available categories list
    const categories = ['All Products', 'Beverages', 'Snacks', 'Bakery', 'Dairy', 'Pantry'];

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

    const handleBarcodeScan = (e) => {
        e.preventDefault();
        const code = barcodeInput.trim();
        if (!code) return;

        const found = products.find(p => p.product_code?.toLowerCase() === code.toLowerCase());
        if (found) {
            addProductToCart(found);
            setBarcodeInput('');
        } else {
            alert(`Product with code/barcode "${code}" not found in catalog.`);
        }
    };

    const handleCheckoutSubmit = (e) => {
        e.preventDefault();
        post('/payments', {
            onSuccess: () => {
                setCart([]);
                setDiscount('');
                setCashReceived('');
                setProductSearch('');
                reset();
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Payments" />

            {/* Global Page Wrapper (mint-themed background) */}
            <div className="flex min-h-[calc(100vh-66px)] flex-col bg-[#F2F9F5] p-2 pt-2 font-sans lg:h-[calc(100vh-66px)] lg:min-h-0 lg:p-3 lg:pt-3">
                {/* Primary Split Pane Columns */}
                <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-12 lg:items-stretch">

                    {/* Left Column: Product Catalog Workspace (7 Columns Width) */}
                    <div className="flex flex-col gap-4 lg:col-span-7 lg:min-h-0">

                        {/* Top Control Row */}
                        <div className="bg-white rounded-2xl border border-green-100/50 p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
                            {/* Search Input */}
                            <div className="relative w-full sm:flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-green-600"></i>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search product..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="block w-full pl-9 pr-4 py-2.5 bg-[#F2F9F5] border-0 rounded-xl text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-green-600 transition-all duration-150"
                                />
                            </div>
                        </div>

                        {/* Category Filter Tab Ribbon */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-green-200">
                            {categories.map(cat => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-150 ${isActive
                                            ? 'bg-[#166534] text-white shadow-md'
                                            : 'bg-white hover:bg-green-50 text-gray-600 border border-green-100/50 shadow-xs'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Product Catalog Matrix Grid */}
                        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 pb-2 sm:grid-cols-2 md:grid-cols-3 lg:min-h-0 lg:flex-1">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => {
                                    const cartItem = cart.find(item => item.id === product.id);
                                    const remainingStock = Number(product.product_stock) - Number(cartItem?.quantity || 0);
                                    const isLowStock = remainingStock < 5;

                                    const catName = product.category?.name?.toLowerCase() || '';
                                    let productIcon = 'fa-box-open';
                                    if (catName.includes('beverage') || product.product_title?.toLowerCase().includes('cola') || product.product_title?.toLowerCase().includes('water')) {
                                        productIcon = 'fa-coffee';
                                    } else if (catName.includes('snack') || product.product_title?.toLowerCase().includes('chip') || product.product_title?.toLowerCase().includes('snack')) {
                                        productIcon = 'fa-cookie';
                                    } else if (catName.includes('bakery') || product.product_title?.toLowerCase().includes('bread')) {
                                        productIcon = 'fa-bread-slice';
                                    } else if (catName.includes('dairy') || product.product_title?.toLowerCase().includes('cheese') || product.product_title?.toLowerCase().includes('milk')) {
                                        productIcon = 'fa-cheese';
                                    } else if (catName.includes('pantry') || product.product_title?.toLowerCase().includes('egg')) {
                                        productIcon = 'fa-egg';
                                    }

                                    return (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-2xl border border-green-100/50 shadow-xs hover:shadow-md hover:border-green-300 transition-all duration-200 flex flex-col justify-between p-4 overflow-hidden relative group"
                                        >
                                            {/* Micro badge header row */}
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-bold tracking-wider text-green-700 uppercase bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                                                    {product.category?.name || 'General'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => addProductToCart(product)}
                                                    disabled={remainingStock <= 0}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 hover:bg-[#166534] text-[#166534] hover:text-white border border-green-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <i className="fas fa-plus text-xs"></i>
                                                </button>
                                            </div>

                                            {/* Center Graphics Asset */}
                                            <div className="h-20 flex items-center justify-center my-2 bg-green-50/20 rounded-xl border border-dashed border-green-100/30 group-hover:bg-green-50/50 transition-colors">
                                                <i className={`fas ${productIcon} text-3xl text-green-600 transition-transform duration-300 group-hover:scale-110`}></i>
                                            </div>

                                            {/* Footer Details Block */}
                                            <div className="mt-2 space-y-1.5">
                                                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{product.product_title}</h3>

                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-base font-extrabold text-[#166534]">
                                                        ${money(product.product_price)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {remainingStock} in stock
                                                    </span>
                                                </div>

                                                {/* Inventory Stock Warning Badge */}
                                                {isLowStock && (
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                                                            LOW STOCK / {remainingStock} remaining
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-16 text-center text-gray-400 italic bg-white rounded-2xl border border-green-150/30 shadow-xs">
                                    <i className="fas fa-folder-open text-4xl text-green-200 mb-3 block"></i>
                                    <span>No active products found matching the criteria.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: The Current Order Checkout Panel Card (5 Columns Width) */}
                    <div className="card d-flex flex-column h-100 mb-0 flex-grow-1 shadow-sm min-h-0 rounded-2xl border border-green-100/50 bg-white lg:col-span-5">
                        {/* Panel Header */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <i className="fas fa-shopping-basket text-green-600"></i>
                                <span>Current Order</span>
                            </h2>
                            <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                                {orderSequence}
                            </span>
                        </div>

                        {/* Interactive Cart Item Area */}
                        <div
                            className="flex-grow-1 min-h-0 overflow-auto p-2"
                            style={{ minHeight: '200px', maxHeight: 'calc(100vh - 420px)' }}
                        >
                            <div className="space-y-3">
                                {cart.length > 0 ? (
                                    cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-green-100/50 bg-[#F2F9F5]/40 p-3 shadow-xs">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <span className="block truncate text-sm font-bold text-gray-800">{item.product_title}</span>
                                                <span className="mt-0.5 block text-xs font-semibold text-green-700">${money(item.product_price)} each</span>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-2">
                                                {/* Quantity Adjusters */}
                                                <div className="flex h-8 items-center overflow-hidden rounded-lg border border-green-200 bg-white shadow-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                        className="flex h-full w-8 items-center justify-center text-xs font-bold text-green-700 transition-colors hover:bg-green-50"
                                                    >
                                                        <i className="fas fa-minus text-[9px]"></i>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartQuantity(item.id, e.target.value)}
                                                        className="h-full w-10 border-0 p-0 text-center text-xs font-bold text-gray-800 focus:ring-0"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                        className="flex h-full w-8 items-center justify-center text-xs font-bold text-green-700 transition-colors hover:bg-green-50"
                                                    >
                                                        <i className="fas fa-plus text-[9px]"></i>
                                                    </button>
                                                </div>

                                                {/* Remove Trash icon */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCartItem(item.id)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                    title="Remove item"
                                                >
                                                    <i className="fas fa-trash-alt text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Empty State Interface */
                                    <div className="flex min-h-[200px] flex-col items-center justify-center py-10 text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-700">
                                            <i className="fas fa-shopping-basket text-2xl"></i>
                                        </div>
                                        <p className="max-w-[240px] text-sm font-semibold text-gray-500">
                                            Cart is empty. Scan or tap a product to add it to the current transaction.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Form & Checkout Operations */}
                        <form onSubmit={handleCheckoutSubmit} className="mt-auto flex-shrink-0 space-y-3 border-t border-gray-100 p-4">

                            {/* Validation / error checks */}
                            {Object.keys(errors).length > 0 && (
                                <div className="p-3 rounded-xl bg-red-50 text-xs font-semibold text-red-600 border border-red-100 space-y-1 shadow-sm">
                                    {Object.values(errors).map((err, idx) => (
                                        <p key={idx}>* {err}</p>
                                    ))}
                                </div>
                            )}

                            {/* Invoice Summary Calculation Panel */}
                            <div className="bg-[#F2F9F5] border border-green-100 rounded-2xl p-4 space-y-2.5 text-sm shadow-xs">
                                <div className="flex justify-between text-gray-500 font-semibold">
                                    <span>Subtotal</span>
                                    <span>${money(subtotal / 1.1)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-semibold">
                                    <span>Tax (10%)</span>
                                    <span>${money(subtotal - (subtotal / 1.1))}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-red-600 font-semibold">
                                        <span>Discount</span>
                                        <span>-${money(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-green-200/50 my-1"></div>
                                <div className="flex justify-between items-baseline font-bold text-gray-900">
                                    <span className="text-base">Total</span>
                                    <span className="text-3xl font-extrabold text-[#166534]">${money(total)}</span>
                                </div>
                            </div>

                            {/* Auxiliary Quick Action Option Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerSelect(!showCustomerSelect)}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 border rounded-xl text-sm font-bold transition-all duration-150 ${showCustomerSelect
                                        ? 'bg-green-50 text-[#166534] border-green-200'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <i className="fas fa-user-plus"></i>
                                    <span>+ Customer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-4 border rounded-xl text-sm font-bold transition-all duration-150 ${showDiscountInput
                                        ? 'bg-green-50 text-[#166534] border-green-200'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <i className="fas fa-tag"></i>
                                    <span>Discount</span>
                                </button>
                            </div>

                            {/* Conditional Customer Selector */}
                            {showCustomerSelect && (
                                <div className="p-3 bg-[#F2F9F5]/50 rounded-xl border border-green-100/50 space-y-1.5 shadow-inner">
                                    <label className="block text-[10px] font-bold text-green-800 uppercase tracking-wider">Link Customer Profile</label>
                                    <select
                                        value={data.customer_id || ''}
                                        onChange={e => setData('customer_id', e.target.value || null)}
                                        className="w-full bg-white border border-green-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value="">-- Guest Checkout --</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.username} {c.phone ? `(${c.phone})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Conditional Discount Input */}
                            {showDiscountInput && (
                                <div className="p-3 bg-[#F2F9F5]/50 rounded-xl border border-green-100/50 space-y-1.5 shadow-inner">
                                    <label className="block text-[10px] font-bold text-green-800 uppercase tracking-wider">Deduct Discount Amount ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={subtotal}
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full bg-white border border-green-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Cash payment drawer */}
                            <div className="p-4 bg-green-50/40 border border-green-100/50 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                                        <i className="fas fa-hand-holding-usd text-green-600"></i>
                                        <span>Cash Received ($)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-28 text-right border border-green-200 rounded-lg px-2.5 py-1 text-sm font-bold text-green-950 bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-green-900 border-t border-green-100/50 pt-2.5">
                                    <span>Change Due</span>
                                    <span className="text-base text-green-700">${money(changeDue)}</span>
                                </div>
                            </div>

                            {/* Final Checkout Button */}
                            <button
                                type="submit"
                                disabled={processing || cart.length === 0 || Number(cashReceived || 0) < total}
                                className="w-full bg-[#166534] hover:bg-[#14532d] active:bg-[#0f3d21] text-white py-4 px-4 rounded-2xl font-bold shadow-lg shadow-green-900/10 hover:shadow-green-900/20 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {processing ? (
                                    <i className="fas fa-circle-notch fa-spin text-lg"></i>
                                ) : (
                                    <>
                                        <i className="fas fa-money-bill-wave text-lg"></i>
                                        <span>Complete Payment</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
