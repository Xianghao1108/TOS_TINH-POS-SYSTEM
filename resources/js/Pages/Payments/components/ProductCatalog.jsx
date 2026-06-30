import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductCatalog({
    productSearch,
    setProductSearch,
    selectedCategory,
    setSelectedCategory,
    filteredProducts = [],
    cart = [],
    onAddToCart
}) {
    const categories = ['All Products', 'Beverages', 'Snacks', 'Bakery', 'Dairy', 'Pantry'];

    return (
        <div className="flex flex-col gap-4 lg:col-span-7 lg:min-h-0 text-left">
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
            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1 pb-2 sm:grid-cols-2 md:grid-cols-3 lg:min-h-0 lg:flex-1 content-start">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            cart={cart}
                            onAddToCart={onAddToCart}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center text-gray-400 italic bg-white rounded-2xl border border-green-150/30 shadow-xs">
                        <i className="fas fa-folder-open text-4xl text-green-200 mb-3 block"></i>
                        <span>No active products found matching the criteria.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
