import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import { inputClass } from '../utils/unitHelpers';

export function UnitFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    data,
    setData,
    errors = {},
    processing,
    unitExistsError,
    handleCheckExists,
    isEdit = false
}) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} noValidate className="p-6 text-left">
                <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isEdit ? 'bg-cyan-50 text-cyan-600 ring-cyan-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'} ring-1`}>
                        <i className={`fas ${isEdit ? 'fa-pen' : 'fa-ruler-combined'} text-lg`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                        <p className="mt-1 text-sm text-slate-500">Use short labels like Kg, Box, Pcs, Pack, or Bottle.</p>
                    </div>
                </div>

                <div>
                    <label htmlFor={isEdit ? 'edit_unit_title' : 'unit_title'} className="block text-sm font-semibold text-slate-800">
                        Unit title <span className="text-rose-550">*</span>
                    </label>
                    <input
                        id={isEdit ? 'edit_unit_title' : 'unit_title'}
                        type="text"
                        className={inputClass(unitExistsError || errors.unit_title)}
                        value={data.unit_title}
                        onChange={(e) => setData('unit_title', e.target.value)}
                        onBlur={(e) => handleCheckExists(e.target.value, isEdit)}
                        placeholder="Kg"
                        required
                    />
                    <InputError message={unitExistsError || errors.unit_title} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 border-0 cursor-pointer"
                        disabled={processing || !!unitExistsError}
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
