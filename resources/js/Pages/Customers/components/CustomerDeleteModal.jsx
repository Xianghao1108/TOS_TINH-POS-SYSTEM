import React from 'react';
import Modal from '@/Components/Modal';

export function CustomerDeleteModal({ isOpen, onClose, onSubmit, selectedCustomer }) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="sm">
            {selectedCustomer && (
                <div className="p-6 relative text-left">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition border-0 bg-transparent cursor-pointer"
                        type="button"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-red-650">Delete Customer</h2>
                    <p className="text-gray-700 mb-6 font-medium">
                        Are you sure you want to delete customer <strong>{selectedCustomer.username}</strong>? This action cannot be undone.
                    </p>
                    
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer border-0"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
