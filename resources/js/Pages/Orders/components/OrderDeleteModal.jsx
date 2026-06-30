import React from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export function OrderDeleteModal({ isOpen, onClose, onSubmit, activeOrder }) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6 relative text-left">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition border-0 bg-transparent cursor-pointer"
                >
                    <i className="fas fa-times"></i>
                </button>
                <h2 className="text-lg font-bold text-red-600 mb-3">Danger Alert!</h2>
                <p className="text-sm text-gray-650 mb-6">
                    Are you sure you want to completely remove transaction logs for invoice 
                    <strong className="text-red-650 font-semibold ml-1">#INV-{activeOrder?.id}</strong>? 
                    This structural step cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Abort</SecondaryButton>
                    <DangerButton onClick={onSubmit}>Yes, Wipe Record</DangerButton>
                </div>
            </div>
        </Modal>
    );
}
