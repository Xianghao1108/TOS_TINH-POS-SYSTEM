import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Helper function to get initials from a name
const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Helper function to get a random/fixed color for avatar based on name
const getAvatarColor = (name) => {
    const colors = [
        'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 
        'bg-teal-500', 'bg-orange-500', 'bg-yellow-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function UserPage({ users }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {}; 

    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [dataEdit, setDataEdit] = useState({});
    const { data: deleteData, setData: setDeleteData, delete: destroy, processing, reset, clearErrors } =
        useForm({
            id: '',
            name: ''
        });

    const confirmDataDeletion = (data) => {
        setDataEdit(data);
        setDeleteData('id', data.id);
        setDeleteData('name', data.name);
        setConfirmingDataDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setDataEdit({});
        clearErrors();
        reset();
    };

    const deleteDataRow = (e) => {
        e.preventDefault();
        destroy(route('users.destroy', dataEdit.id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const headWeb = 'Users';

    return (
        <AdminLayout>
            <Head title={headWeb} />
            
            <div className="p-6 max-w-7xl mx-auto">
                {/* Page Title Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-500 mt-1">Cashiers, managers and admins.</p>
                    </div>
                    <div>
                        <Link 
                            href={route('users.create')} 
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-500 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-600 focus:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                        >
                            + Invite User
                        </Link>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">User ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.data.length > 0 ? (
                                    users.data.map((item, k) => {
                                        const roleName = item?.roles?.[0]?.name || 'User';
                                        
                                        // Mock status since it's not in the original db schema
                                        // You can replace this with actual status if it exists in your DB
                                        const status = item.id % 2 === 0 ? 'Inactive' : 'Active'; 
                                        
                                        return (
                                            <tr key={k} className="hover:bg-gray-50/50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-700">#{item.id}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(item.name)}`}>
                                                            {getInitials(item.name)}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{item.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                        {roleName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {status === 'Active' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-3">
                                                        {can['user-edit'] && (
                                                            <Link href={route('users.edit', item.id)} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </Link>
                                                        )}
                                                        {/* Adding delete button for completeness, matching original functionality */}
                                                        <button onClick={() => confirmDataDeletion(item)} type="button" className="text-gray-400 hover:text-red-600 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <Pagination links={users.links} />
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <Modal show={confirmingDataDeletion} onClose={closeModal}>
                    <form onSubmit={deleteDataRow} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">
                            Confirmation
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Are you sure you want to delete user <span className="font-semibold">{deleteData.name}</span>?
                        </p>
                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                            <DangerButton className="ms-3" disabled={processing}>Delete</DangerButton>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
