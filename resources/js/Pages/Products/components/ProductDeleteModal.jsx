import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export function ProductDeleteModal({ isOpen, onClose, onSubmit, productTitle }) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} className="p-6 text-left">
                <h2 className="text-lg font-medium text-gray-900">
                    Are you sure you want to delete this product record?
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Permanently delete <span className="font-bold text-slate-800">"{productTitle}"</span> from the catalog. This action cannot be reversed.
                </p>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <DangerButton className="ms-3" type="submit">
                        Delete Product
                    </DangerButton>
                </div>
            </form>
        </Modal>
    );
}
