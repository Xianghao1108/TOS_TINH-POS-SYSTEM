import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export function ProductDeleteModal({ isOpen, onClose, onSubmit, productTitle, processing, error }) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} className="p-6 text-left">
                <h2 className="text-lg font-medium text-gray-900">
                    Are you sure you want to delete this product record?
                </h2>

                <p className="mt-1 text-sm text-gray-650">
                    Permanently delete <span className="font-bold text-slate-800">"{productTitle}"</span> from the catalog. This action cannot be reversed.
                </p>

                {error && (
                    <div className="mt-4 p-3 bg-rose-50 border border-rose-250 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2">
                        <i className="fas fa-exclamation-circle mt-0.5 shrink-0"></i>
                        <span>{error}</span>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose} disabled={processing}>Cancel</SecondaryButton>
                    <DangerButton className="ms-3" disabled={processing} type="submit">
                        {processing ? 'Deleting...' : 'Delete Product'}
                    </DangerButton>
                </div>
            </form>
        </Modal>
    );
}
