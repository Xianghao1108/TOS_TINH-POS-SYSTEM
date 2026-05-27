import React, { useState, useMemo } from 'react';

// Example Icon Components (Using simple SVGs to avoid extra dependencies)
const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m-4-16v16M8 4v16M16 4v16m4-16v16" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default function POSInterface({ products = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [barcodeScan, setBarcodeScan] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);

    // Extract unique categories from products
    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return ['All', ...new Set(cats)];
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBarcode = product.barcode?.toLowerCase().includes(barcodeScan.toLowerCase());
            const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
            
            return matchesSearch && matchesBarcode && matchesCategory;
        });
    }, [products, searchTerm, barcodeScan, activeCategory]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQuantity = item.quantity + delta;
                return { ...item, quantity: Math.max(1, newQuantity) };
            }
            return item;
        }));
    };

    // Calculations
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;

    return (
        <div className="flex h-full min-h-[500px] bg-gray-50 overflow-hidden font-sans">
            {/* Left Side (2/3 width) - Product Browser */}
            <div className="w-2/3 flex flex-col h-full border-r border-gray-200 bg-gray-50">
                
                {/* Header / Toolbar */}
                <div className="p-6 bg-white border-b border-gray-200 flex-shrink-0 space-y-4">
                    <div className="flex space-x-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search products by name..." 
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BarcodeIcon />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Scan or enter barcode" 
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                                value={barcodeScan}
                                onChange={(e) => setBarcodeScan(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                                    activeCategory === category 
                                    ? 'bg-green-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const isLowStock = product.stock <= (product.lowStockThreshold || 5);
                            
                            return (
                                <div 
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                                >
                                    {/* Top Half: Image Area */}
                                    <div className="h-40 bg-green-50 flex items-center justify-center relative">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="h-full w-full object-contain p-4 mix-blend-multiply" />
                                        ) : (
                                            <ImageIcon />
                                        )}
                                        
                                        {/* Conditional Badge */}
                                        {isLowStock && (
                                            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                                Low
                                            </span>
                                        )}
                                    </div>

                                    {/* Bottom Half: Info Area */}
                                    <div className="p-4 flex-1 flex flex-col relative bg-white">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                            {product.category || 'Uncategorized'}
                                        </span>
                                        <h3 className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-lg font-extrabold text-green-600">
                                                ${parseFloat(product.price).toFixed(2)}
                                            </span>
                                            <span className="text-xs font-medium text-gray-400">
                                                {product.stock} in stock
                                            </span>
                                        </div>

                                        {/* Hover Action Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 bg-green-500 text-white text-center py-3 font-semibold text-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                                            Add to cart
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <SearchIcon className="w-12 h-12 text-gray-300" />
                            <p className="text-lg">No products found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side (1/3 width) - Current Order Cart Panel */}
            <div className="w-1/3 flex flex-col h-full bg-white relative shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-white">
                    <h2 className="text-2xl font-bold text-gray-800">Current Order</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        {totalItems} items &middot; Cashier #21
                    </p>
                </div>

                {/* Cart Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {cart.length === 0 ? (
                        /* Empty State */
                        <div className="h-full flex items-center justify-center">
                            <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-4 bg-white/50">
                                <div className="bg-gray-50 p-4 rounded-full border border-gray-100">
                                    <CartIcon />
                                </div>
                                <p className="text-gray-400 font-medium">
                                    Cart is empty <br/>
                                    <span className="text-sm font-normal">Scan or tap a product to add</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Cart Items */
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex-1 pr-4">
                                        <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                                        <div className="text-green-600 font-bold mt-1">${parseFloat(item.price).toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">-</button>
                                            <span className="px-3 py-1 font-semibold text-sm bg-white min-w-[2rem] text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-500 p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Footer Calculations */}
                <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-500 text-sm font-medium">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-sm font-medium">
                            <span>Tax (10%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                            <span className="text-gray-800 font-bold text-lg">Total</span>
                            <span className="text-4xl font-black text-green-600 tracking-tight">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 transform ${
                            cart.length > 0 
                            ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/30 hover:-translate-y-0.5 active:translate-y-0' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={cart.length === 0}
                    >
                        Complete Payment
                    </button>
                </div>

            </div>
        </div>
    );
}
