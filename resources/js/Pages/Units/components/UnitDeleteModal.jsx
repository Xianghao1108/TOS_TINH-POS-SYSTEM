import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export function UnitDeleteModal({ isOpen, onClose, onSubmit, unitTitle, processing }) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} className="p-6 text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-650">
                    <i className="fas fa-trash text-lg"></i>
                </div>
                <h2 className="text-lg font-bold text-slate-950">Delete unit?</h2>
                <p className="mt-2 text-sm text-slate-650">
                    Are you sure you want to delete <span className="font-bold text-slate-900">{unitTitle}</span>?
                </p>
                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>No</SecondaryButton>
                    <DangerButton className="ms-3" disabled={processing} type="submit">Yes, Delete</DangerButton>
                </div>
            </form>
        </Modal>
    );
}
