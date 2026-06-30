import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { fieldClass } from '../utils/subCategoryHelpers';

export function SubCategoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    subtitle,
    iconClass,
    iconBgClass,
    data,
    setData,
    errors = {},
    processing,
    categories = [],
    isEdit = false
}) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} noValidate className="p-6 text-left">
                <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBgClass} ring-1`}>
                        <i className={`fas ${iconClass} text-lg`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="category_id" className="block text-sm font-semibold text-slate-800">
                            Parent category <span className="text-rose-500">*</span>
                        </label>
                        <select
                            id="category_id"
                            className={fieldClass(errors.category_id)}
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                        >
                            <option value="">Select a parent category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.category_title || cat.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category_id} className="mt-2" />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                            Sub-category title <span className="text-rose-550">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            className={fieldClass(errors.name)}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Sparkling drinks"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 border-0 cursor-pointer"
                        disabled={processing}
                        type="submit"
                    >
                        {processing && <i className="fas fa-circle-notch fa-spin text-xs"></i>}
                        {isEdit ? 'Update' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
