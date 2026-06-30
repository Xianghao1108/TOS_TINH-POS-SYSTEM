import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export function UserDeleteModal({ isOpen, onClose, onSubmit, name, processing }) {
    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit} className="p-6 text-left">
                <h2 className="text-lg font-medium text-gray-900">
                    Confirmation
                </h2>
                <p className="mt-1 text-sm text-gray-650">
                    Are you sure you want to delete user <span className="font-semibold">{name}</span>?
                </p>
                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <DangerButton className="ms-3" disabled={processing} type="submit">Delete</DangerButton>
                </div>
            </form>
        </Modal>
    );
}
