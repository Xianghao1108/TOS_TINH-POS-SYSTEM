import React from 'react';
import Breadcrumb from '@/Components/Breadcrumb';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

// Custom Hooks and Components
import { useUserManagement } from './hooks/useUserManagement';
import { UserTable } from './components/UserTable';
import { UserDeleteModal } from './components/UserDeleteModal';

export default function UserPage({ users, roles }) {
    const { auth } = usePage().props;
    const can = auth?.can ?? {};

    const {
        confirmingDataDeletion,
        dataEdit,
        deleteData,
        processing,

        confirmDataDeletion,
        closeModal,
        deleteDataRow
    } = useUserManagement();

    const handleRoleChange = (user, roleId) => {
        router.patch(route('users.update', user.id), {
            name: user.name,
            email: user.email,
            roles: [parseInt(roleId)]
        }, {
            preserveScroll: true
        });
    };

    const headWeb = 'Users';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            
            <div className="p-6 max-w-7xl mx-auto">
                {/* Page Title Section */}
                <div className="flex justify-between items-center mb-6 text-left">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-505 mt-1">Cashiers, managers and admins.</p>
                    </div>
                    <div>
                        <Link 
                            href={route('users.create')} 
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-500 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-600 focus:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm border-0 cursor-pointer"
                        >
                            + Invite User
                        </Link>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    <UserTable
                        usersList={users.data}
                        roles={roles}
                        onRoleChange={handleRoleChange}
                        can={can}
                        onDelete={confirmDataDeletion}
                    />
                    
                    {/* Pagination */}
                    {users.links && users.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <Pagination links={users.links} />
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <UserDeleteModal
                    isOpen={confirmingDataDeletion}
                    onClose={closeModal}
                    onSubmit={deleteDataRow}
                    name={dataEdit?.name || ''}
                    processing={processing}
                />
            </div>
        </AdminLayout>
    );
}
