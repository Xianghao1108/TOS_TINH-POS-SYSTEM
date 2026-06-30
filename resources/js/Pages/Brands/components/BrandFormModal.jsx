import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { inputClass } from '../utils/brandHelpers';

export function BrandFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    data,
    setData,
    errors = {},
    processing,
    brandExistsError,
    handleCheckExists,
    makers = [],
    isEdit = false
}) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} noValidate className="p-6 text-left">
                <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isEdit ? 'bg-cyan-50 text-cyan-600 ring-cyan-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'} ring-1`}>
                        <i className={`fas ${isEdit ? 'fa-pen' : 'fa-tags'} text-lg`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                        <p className="mt-1 text-sm text-slate-500">Connect each brand to its maker for organized product browsing.</p>
                    </div>
                </div>

                <div>
                    <label htmlFor={isEdit ? 'edit_maker_id' : 'maker_id'} className="block text-sm font-semibold text-slate-800">
                        Maker <span className="text-rose-500">*</span>
                    </label>
                    <select
                        id={isEdit ? 'edit_maker_id' : 'maker_id'}
                        className={inputClass(errors.maker_id)}
                        value={data.maker_id}
                        onChange={(e) => setData('maker_id', e.target.value)}
                        required
                    >
                        <option value="">Select a Maker</option>
                        {makers && makers.map((maker) => (
                            <option key={maker.id} value={maker.id}>{maker.maker_title}</option>
                        ))}
                    </select>
                    <InputError message={errors.maker_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label htmlFor={isEdit ? 'edit_brand_title' : 'brand_title'} className="block text-sm font-semibold text-slate-800">
                        Brand title <span className="text-rose-550">*</span>
                    </label>
                    <input
                        id={isEdit ? 'edit_brand_title' : 'brand_title'}
                        type="text"
                        className={inputClass(brandExistsError || errors.brand_title)}
                        value={data.brand_title}
                        onChange={(e) => setData('brand_title', e.target.value)}
                        onBlur={(e) => handleCheckExists(e.target.value, isEdit)}
                        placeholder="Sprite"
                        required
                    />
                    <InputError message={brandExistsError || errors.brand_title} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 border-0 cursor-pointer"
                        disabled={processing || !!brandExistsError}
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
