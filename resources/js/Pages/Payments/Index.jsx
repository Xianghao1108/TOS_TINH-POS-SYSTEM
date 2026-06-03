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

    const getProductImageUrl = (image) => {
        if (!image) return '';
        return image.image_url || (image.product_image_title ? `/storage/products/${image.product_image_title}` : '');
    };

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + Number(item.product_price) * Number(item.quantity), 0);
    }, [cart]);

    const taxAmount = subtotal * 0.11;
    const discountAmountVal = subtotal * (Number(discount || 0) / 100);
    const totalPaymentVal = Math.max(subtotal + taxAmount - discountAmountVal, 0);
    const changeDue = Math.max(Number(cashReceived || 0) - totalPaymentVal, 0);

    // Sync form data whenever dependencies change
    useEffect(() => {
        setData(prev => ({
            ...prev,
            subtotal: roundMoney(subtotal),
            discount: roundMoney(discountAmountVal),
            total: roundMoney(totalPaymentVal),
            total_payment: roundMoney(cashReceived),
            items: cart.map(item => ({
                product_id: item.id,
                quantity: Number(item.quantity),
            }))
        }));
    }, [cart, subtotal, discountAmountVal, totalPaymentVal, cashReceived]);

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

                    {/* Right Column: The Details Order Checkout Panel Card (5 Columns Width) */}
                    <div className="card d-flex flex-column h-100 mb-0 flex-grow-1 shadow-sm min-h-0 rounded-2xl border border-slate-200/65 bg-white lg:col-span-5">
                        {/* Panel Header */}
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                <i className="fas fa-shopping-basket text-[#00A86B]"></i>
                                <span>Details Order</span>
                            </h2>
                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                                {orderSequence}
                            </span>
                        </div>

                        {/* Interactive Cart Item Area */}
                        <div
                            className="flex-grow-1 min-h-0 overflow-auto p-3 bg-slate-50/50"
                            style={{ minHeight: '200px', maxHeight: 'calc(100vh - 420px)' }}
                        >
                            <div className="space-y-3">
                                {cart.length > 0 ? (
                                    cart.map(item => (
                                        <div key={item.id} className="flex items-center p-3 bg-white rounded-xl border border-slate-200/60 shadow-xs hover:shadow-sm transition">
                                            {/* Trash icon on far left */}
                                            <button 
                                                onClick={() => removeCartItem(item.id)} 
                                                className="text-slate-400 hover:text-rose-500 transition mr-2.5 p-1 flex-shrink-0"
                                                type="button"
                                                title="Remove item"
                                            >
                                                <i className="fas fa-trash-alt text-sm"></i>
                                            </button>

                                            {/* Thumbnail Image on the left */}
                                            <div className="h-11 w-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50 flex items-center justify-center border border-slate-100 mr-3">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={getProductImageUrl(item.images[0])} className="h-full w-full object-cover" alt="product thumbnail" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-green-50 text-green-600">
                                                        <i className="fas fa-box text-xs"></i>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item name and description (middle) */}
                                            <div className="flex-1 min-w-0 mr-3">
                                                <h4 className="font-bold text-slate-800 text-sm truncate" title={item.product_title}>{item.product_title}</h4>
                                                <p className="text-[11px] text-slate-400 mt-0.5 truncate" title={item.product_description || item.description}>
                                                    {item.product_description || item.description || 'No description available'}
                                                </p>
                                            </div>

                                            {/* Price and quantity incrementer (right) */}
                                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                                    ${money(Number(item.product_price) * item.quantity)}
                                                </span>
                                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-150 text-slate-500 transition-colors font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-2 py-0.5 font-semibold text-slate-700 min-w-[1.25rem] text-center bg-white border-x border-slate-100">
                                                        {String(item.quantity).padStart(2, '0')}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                        className="px-2 py-0.5 bg-slate-50 hover:bg-slate-150 text-slate-500 transition-colors font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Empty State Interface */
                                    <div className="flex min-h-[200px] flex-col items-center justify-center py-10 text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#00A86B]">
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
                        <form onSubmit={handleCheckoutSubmit} className="mt-auto flex-shrink-0 space-y-4 border-t border-slate-100 p-5 bg-white">

                            {/* Validation / error checks */}
                            {Object.keys(errors).length > 0 && (
                                <div className="p-3 rounded-xl bg-rose-50 text-xs font-semibold text-rose-600 border border-rose-100 space-y-1 shadow-sm">
                                    {Object.values(errors).map((err, idx) => (
                                        <p key={idx}>* {err}</p>
                                    ))}
                                </div>
                            )}

                            {/* Details Payment Section */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Details Payment</h3>
                                <div className="space-y-2 text-xs font-semibold text-slate-500">
                                    <div className="flex justify-between">
                                        <span>Sub total</span>
                                        <span>${money(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (11%)</span>
                                        <span>${money(taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-rose-600">
                                        <span>Discount </span>
                                        <span>-${money(discountAmountVal)}</span>
                                    </div>
                                    <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-800">Total Payment</span>
                                        <span className="text-2xl font-black text-[#00A86B] tracking-tight">
                                            ${money(totalPaymentVal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Auxiliary Option Buttons */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerSelect(!showCustomerSelect)}
                                    className={`flex items-center justify-center gap-2 py-2 px-3 border rounded-xl text-xs font-bold transition ${showCustomerSelect
                                        ? 'bg-emerald-50 text-[#00A86B] border-emerald-250'
                                        : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <i className="fas fa-user-plus text-[10px]"></i>
                                    <span>+ Customer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDiscountInput(!showDiscountInput)}
                                    className={`flex items-center justify-center gap-2 py-2 px-3 border rounded-xl text-xs font-bold transition ${showDiscountInput
                                        ? 'bg-emerald-50 text-[#00A86B] border-emerald-250'
                                        : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <i className="fas fa-tag text-[10px]"></i>
                                    <span>Discount</span>
                                </button>
                            </div>

                            {/* Conditional Customer Selector */}
                            {showCustomerSelect && (
                                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/60 space-y-1.5 shadow-sm">
                                    <label className="block text-[9px] font-bold text-slate-550 uppercase tracking-wider">Link Customer Profile</label>
                                    <select
                                        value={data.customer_id || ''}
                                        onChange={e => setData('customer_id', e.target.value || null)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/60 space-y-1.5 shadow-sm">
                                    <label className="block text-[9px] font-bold text-slate-550 uppercase tracking-wider">Custom Discount Percent (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={subtotal}
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Cash payment drawer */}
                            <div className="p-3.5 bg-emerald-50/30 border border-emerald-100/50 rounded-xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <i className="fas fa-hand-holding-usd text-[#00A86B]"></i>
                                        <span>Cash Received ($)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-24 text-right border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={cashReceived}
                                        onChange={(e) => setCashReceived(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-800 border-t border-slate-100 pt-2">
                                    <span>Change Due</span>
                                    <span className="text-sm text-[#00A86B]">${money(changeDue)}</span>
                                </div>
                            </div>

                            {/* Place an Order Button */}
                            <button
                                type="submit"
                                disabled={processing || cart.length === 0 || Number(cashReceived || 0) < totalPaymentVal}
                                className="w-full bg-[#00A86B] hover:bg-emerald-700 active:scale-[0.99] text-white py-3 px-4 rounded-full font-bold shadow-sm shadow-emerald-100 hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100"
                            >
                                {processing ? (
                                    <i className="fas fa-circle-notch fa-spin text-sm"></i>
                                ) : (
                                    <>
                                        <i className="fas fa-money-bill-wave text-sm"></i>
                                        <span>Place an Order</span>
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
