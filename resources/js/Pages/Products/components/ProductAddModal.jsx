import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { inputClass, selectClass, textareaClass } from '../utils/productHelpers';

export function ProductAddModal({
    isOpen,
    onClose,
    onSubmit,
    data,
    setData,
    errors = {},
    processing,
    codeExistsError,
    selectedImages = [],
    handleFileChange,
    handleCheckCodeExists,
    categories = [],
    sizes = [],
    units = [],
    makers = [],
    brands = []
}) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} noValidate className="p-6 max-h-[85vh] overflow-y-auto text-left">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <i className="fas fa-plus text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">Add New Product</h2>
                        <p className="mt-1 text-sm text-slate-500">Fill in the fields to list a new item in inventory.</p>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold">
                        <p className="font-bold mb-1">Please fix the following validation errors:</p>
                        <ul className="list-disc list-inside">
                            {Object.entries(errors).map(([key, val]) => (
                                <li key={key}>{key}: {val}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2 border-2 border-dashed border-emerald-100 rounded-2xl p-4 bg-slate-50/50 text-center hover:bg-slate-50 transition">
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Upload Product Images (JPEG, PNG, JPG) *</label>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" 
                            onChange={(e) => handleFileChange(e, false)} 
                        />
                        <InputError message={errors.images} className="mt-2" />
                        {selectedImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 justify-center border-t border-emerald-50 pt-3">
                                {selectedImages.map((src, idx) => (
                                    <img 
                                        src={src} 
                                        key={idx} 
                                        className="object-cover rounded-xl shadow-sm border border-slate-100 bg-white" 
                                        style={{ width: '65px', height: '65px' }} 
                                        alt="Preview block" 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Product Title *</label>
                        <input 
                            type="text" 
                            className={inputClass(errors.product_title)} 
                            value={data.product_title} 
                            onChange={e => setData('product_title', e.target.value)} 
                            placeholder="e.g. Organic Milk" 
                        />
                        <InputError message={errors.product_title} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Product Code / Barcode *</label>
                        <input 
                            type="text" 
                            className={inputClass(codeExistsError || errors.product_code)} 
                            value={data.product_code} 
                            onChange={e => setData('product_code', e.target.value)} 
                            onBlur={e => handleCheckCodeExists(e.target.value, false)} 
                            placeholder="e.g. 888123456789" 
                        />
                        <InputError message={codeExistsError || errors.product_code} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Category *</label>
                        <select 
                            className={selectClass(errors.category_id)} 
                            value={data.category_id} 
                            onChange={e => setData('category_id', e.target.value)}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.category_title || c.name}</option>)}
                        </select>
                        <InputError message={errors.category_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Brand *</label>
                        <select 
                            className={selectClass(errors.brand_id)} 
                            value={data.brand_id} 
                            onChange={e => setData('brand_id', e.target.value)}
                        >
                            <option value="">Select Brand</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.brand_title}</option>)}
                        </select>
                        <InputError message={errors.brand_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Maker *</label>
                        <select 
                            className={selectClass(errors.maker_id)} 
                            value={data.maker_id} 
                            onChange={e => setData('maker_id', e.target.value)}
                        >
                            <option value="">Select Maker</option>
                            {makers.map(m => <option key={m.id} value={m.id}>{m.maker_title}</option>)}
                        </select>
                        <InputError message={errors.maker_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Size *</label>
                        <select 
                            className={selectClass(errors.size_id)} 
                            value={data.size_id} 
                            onChange={e => setData('size_id', e.target.value)}
                        >
                            <option value="">Select Size</option>
                            {sizes.map(s => <option key={s.id} value={s.id}>{s.size_title}</option>)}
                        </select>
                        <InputError message={errors.size_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Unit Configuration *</label>
                        <select 
                            className={selectClass(errors.unit_id)} 
                            value={data.unit_id} 
                            onChange={e => setData('unit_id', e.target.value)}
                        >
                            <option value="">Select Unit</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.unit_title}</option>)}
                        </select>
                        <InputError message={errors.unit_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Status *</label>
                        <select 
                            className={selectClass(false)} 
                            value={data.product_status} 
                            onChange={e => setData('product_status', e.target.value)}
                        >
                            <option value="1">In Stock</option>
                            <option value="2">Out of Stock</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Price ($) *</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className={inputClass(errors.product_price)} 
                            value={data.product_price} 
                            onChange={e => setData('product_price', e.target.value)} 
                            placeholder="0.00" 
                        />
                        <InputError message={errors.product_price} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Initial Stock *</label>
                        <input 
                            type="number" 
                            className={inputClass(errors.product_stock)} 
                            value={data.product_stock} 
                            onChange={e => setData('product_stock', e.target.value)} 
                            placeholder="0" 
                        />
                        <InputError message={errors.product_stock} className="mt-2" />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-800">Description</label>
                    <textarea 
                        className={textareaClass(false)} 
                        rows="3" 
                        value={data.product_description} 
                        onChange={e => setData('product_description', e.target.value)} 
                        placeholder="Enter details..."
                    />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <button 
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 border-0 cursor-pointer" 
                        disabled={processing || !!codeExistsError} 
                        type="submit"
                    >
                        {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                        Save Product
                    </button>
                </div>
            </form>
        </Modal>
    );
}
