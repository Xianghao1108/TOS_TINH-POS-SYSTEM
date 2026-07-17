import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { inputClass, selectClass, textareaClass, getProductImageUrl } from '../utils/productHelpers';

export function ProductEditModal({
    isOpen,
    onClose,
    onSubmit,
    editData,
    setEditData,
    dataEdit = {},
    editErrors = {},
    editProcessing,
    codeExistsError,
    selectedImages = [],
    handleFileChange,
    handleCheckCodeExists,
    deleteUploadedImage,
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                        <i className="fas fa-edit text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">Edit Product</h2>
                        <p className="mt-1 text-sm text-slate-500">Update product specifications or manage photo gallery files.</p>
                    </div>
                </div>

                {Object.keys(editErrors).length > 0 && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold">
                        <p className="font-bold mb-1">Please fix the following validation errors:</p>
                        <ul className="list-disc list-inside">
                            {Object.entries(editErrors).map(([key, val]) => (
                                <li key={key}>{key}: {val}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Display currently active file assets array for instant storage deletes */}
                    {dataEdit.images && dataEdit.images.length > 0 && (
                        <div className="col-span-1 md:col-span-2 border border-emerald-50 p-4 rounded-2xl bg-slate-50/50">
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Current Product Images</label>
                            <div className="flex flex-wrap gap-2">
                                {dataEdit.images.map((img) => (
                                    <div key={img.id} className="relative inline-block border bg-white rounded-xl p-1 border-slate-100 shadow-sm">
                                        <img 
                                            src={getProductImageUrl(img)} 
                                            className="object-cover rounded-lg" 
                                            style={{ width: '60px', height: '60px' }} 
                                            alt="Active grid item" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => deleteUploadedImage(img.id)} 
                                            className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-rose-700 transition cursor-pointer" 
                                            style={{ width: '18px', height: '18px', border: 'none' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="col-span-1 md:col-span-2 border-2 border-dashed border-cyan-100 rounded-2xl p-4 bg-slate-50/50 text-center hover:bg-slate-50 transition">
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Replace / Append Product Images</label>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer" 
                            onChange={(e) => handleFileChange(e, true)} 
                        />
                        <InputError message={editErrors.images} className="mt-2" />
                        {selectedImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 justify-center border-t border-cyan-50 pt-3">
                                {selectedImages.map((src, idx) => (
                                    <img 
                                        src={src} 
                                        key={idx} 
                                        className="object-cover rounded-xl shadow-sm border border-slate-100 bg-white" 
                                        style={{ width: '65px', height: '65px' }} 
                                        alt="Append staging previews" 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Product Title *</label>
                        <input 
                            type="text" 
                            className={inputClass(editErrors.product_title)} 
                            value={editData.product_title} 
                            onChange={e => setEditData('product_title', e.target.value)} 
                            placeholder="e.g. Organic Milk" 
                            required 
                        />
                        <InputError message={editErrors.product_title} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Product Code / Barcode *</label>
                        <input 
                            type="text" 
                            className={inputClass(codeExistsError || editErrors.product_code)} 
                            value={editData.product_code} 
                            onChange={e => setEditData('product_code', e.target.value)} 
                            onBlur={e => handleCheckCodeExists(e.target.value, true)} 
                            placeholder="e.g. 888123456789" 
                            required 
                        />
                        <InputError message={codeExistsError || editErrors.product_code} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Category *</label>
                        <select 
                            className={selectClass(editErrors.category_id)} 
                            value={editData.category_id} 
                            onChange={e => setEditData('category_id', e.target.value)} 
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.category_title || c.name}</option>)}
                        </select>
                        <InputError message={editErrors.category_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Brand *</label>
                        <select 
                            className={selectClass(editErrors.brand_id)} 
                            value={editData.brand_id} 
                            onChange={e => setEditData('brand_id', e.target.value)} 
                            required
                        >
                            <option value="">Select Brand</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.brand_title}</option>)}
                        </select>
                        <InputError message={editErrors.brand_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Maker *</label>
                        <select 
                            className={selectClass(editErrors.maker_id)} 
                            value={editData.maker_id} 
                            onChange={e => setEditData('maker_id', e.target.value)} 
                            required
                        >
                            <option value="">Select Maker</option>
                            {makers.map(m => <option key={m.id} value={m.id}>{m.maker_title}</option>)}
                        </select>
                        <InputError message={editErrors.maker_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Size *</label>
                        <select 
                            className={selectClass(editErrors.size_id)} 
                            value={editData.size_id} 
                            onChange={e => setEditData('size_id', e.target.value)} 
                            required
                        >
                            <option value="">Select Size</option>
                            {sizes.map(s => <option key={s.id} value={s.id}>{s.size_title}</option>)}
                        </select>
                        <InputError message={editErrors.size_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Unit Configuration *</label>
                        <select 
                            className={selectClass(editErrors.unit_id)} 
                            value={editData.unit_id} 
                            onChange={e => setEditData('unit_id', e.target.value)} 
                            required
                        >
                            <option value="">Select Unit</option>
                            {units.map(u => <option key={u.id} value={u.id}>{u.unit_title}</option>)}
                        </select>
                        <InputError message={editErrors.unit_id} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Status *</label>
                        <select 
                            className={selectClass(false)} 
                            value={editData.product_status} 
                            onChange={e => setEditData('product_status', e.target.value)}
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
                            className={inputClass(editErrors.product_price)} 
                            value={editData.product_price} 
                            onChange={e => setEditData('product_price', e.target.value)} 
                            placeholder="0.00" 
                            required 
                        />
                        <InputError message={editErrors.product_price} className="mt-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-800">Stock level *</label>
                        <input 
                            type="number" 
                            className={inputClass(editErrors.product_stock)} 
                            value={editData.product_stock} 
                            onChange={e => setEditData('product_stock', e.target.value)} 
                            placeholder="0" 
                            required 
                        />
                        <InputError message={editErrors.product_stock} className="mt-2" />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-800">Description</label>
                    <textarea 
                        className={textareaClass(false)} 
                        rows="3" 
                        value={editData.product_description} 
                        onChange={e => setEditData('product_description', e.target.value)} 
                        placeholder="Enter details..."
                    />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <button 
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 border-0 cursor-pointer" 
                        disabled={editProcessing || !!codeExistsError} 
                        type="submit"
                    >
                        {editProcessing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                        Update Product
                    </button>
                </div>
            </form>
        </Modal>
    );
}
