import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { inputClass } from '../utils/sizeHelpers';

export function SizeFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    data,
    setData,
    errors = {},
    processing,
    sizeExistsError,
    handleCheckExists,
    isEdit = false
}) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} noValidate className="p-6 text-left">
                <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isEdit ? 'bg-cyan-50 text-cyan-600 ring-cyan-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'} ring-1`}>
                        <i className={`fas ${isEdit ? 'fa-pen' : 'fa-expand-arrows-alt'} text-lg`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                        <p className="mt-1 text-sm text-slate-500">Use compact labels like S, M, L, 500ml, or 1kg.</p>
                    </div>
                </div>

                <div>
                    <label htmlFor={isEdit ? 'edit_size_title' : 'size_title'} className="block text-sm font-semibold text-slate-800">
                        Size title <span className="text-rose-550">*</span>
                    </label>
                    <input
                        id={isEdit ? 'edit_size_title' : 'size_title'}
                        type="text"
                        className={inputClass(sizeExistsError || errors.size_title)}
                        value={data.size_title}
                        onChange={(e) => setData('size_title', e.target.value)}
                        onBlur={(e) => handleCheckExists(e.target.value, isEdit)}
                        placeholder="M"
                        required
                    />
                    <InputError message={sizeExistsError || errors.size_title} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 border-0 cursor-pointer"
                        disabled={processing || !!sizeExistsError}
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
