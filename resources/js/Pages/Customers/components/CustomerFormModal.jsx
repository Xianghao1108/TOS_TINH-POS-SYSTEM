import React from 'react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';

export function CustomerFormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    submitText = 'Save',
    data,
    setData,
    errors = {},
    processing
}) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center text-left">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition border-0 bg-transparent cursor-pointer"
                    type="button"
                >
                    <i className="fas fa-times text-lg"></i>
                </button>
            </div>
            
            <form onSubmit={onSubmit} className="p-6 space-y-4 text-left">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        value={data.username}
                        onChange={e => setData('username', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <InputError message={errors.username} className="mt-1" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                        type="text"
                        value={data.phone}
                        onChange={e => setData('phone', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <InputError message={errors.phone} className="mt-1" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer border-0"
                    >
                        {submitText}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
