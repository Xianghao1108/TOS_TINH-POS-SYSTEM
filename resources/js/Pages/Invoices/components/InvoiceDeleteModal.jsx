import React from 'react';
import Modal from '@/Components/Modal';
import { invoiceNo } from '../utils/invoiceHelpers';

export function InvoiceDeleteModal({ isOpen, onClose, onSubmit, selectedInvoice }) {
    return (
        <Modal show={isOpen && !!selectedInvoice} onClose={onClose} maxWidth="md">
            {selectedInvoice && (
                <div className="p-6 text-left">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                        <i className="fas fa-trash text-lg"></i>
                    </div>
                    <h2 className="text-xl font-bold text-slate-950">Delete invoice?</h2>
                    <p className="mt-2 text-sm text-slate-650">
                        This will delete {invoiceNo(selectedInvoice.id)} and detach its connected orders.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={onSubmit} 
                            className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 cursor-pointer border-0"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
