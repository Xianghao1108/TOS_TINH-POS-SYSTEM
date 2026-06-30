import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export function RoleDeleteModal({ isOpen, onClose, onSubmit, deleteData, processing }) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} className="p-6 text-left">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                        <i className="fas fa-exclamation-triangle text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">Confirm Deletion</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Are you sure you want to delete the role <span className="font-semibold text-slate-800">{deleteData.name}</span>? This will remove all associated permission linkages.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <DangerButton disabled={processing} type="submit">Delete Role</DangerButton>
                </div>
            </form>
        </Modal>
    );
}
