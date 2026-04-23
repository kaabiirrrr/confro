import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import UsersTable from '../components/UsersTable';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';


const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 10,
        offset: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        role: ''
    });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await adminService.fetchUsers({
                ...filters,
                limit: pagination.limit,
                offset: pagination.offset
            });
            if (result.success) {
                setUsers(result.data);
                setPagination(prev => ({
                    ...prev,
                    total: result.pagination.total
                }));
            }
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit, pagination.offset]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadUsers();
        }, 150); // Reduced debounce for "instant" feel
        return () => clearTimeout(timer);
    }, [loadUsers]);

    const handleAction = async (userId, type, payload) => {
        try {
            let result;
            switch (type) {
                case 'TOGGLE_STATUS':
                    result = await adminService.toggleUserStatus(userId, payload);
                    if (result.success) {
                        toast.success(result.message);
                        loadUsers();
                    }
                    break;
                case 'RESET_PASSWORD':
                    result = await adminService.resetUserPassword(userId);
                    if (result.success) {
                        toast.success('Password reset email sent to user');
                    }
                    break;
                case 'DELETE':
                    setConfirmModal({ isOpen: true, userId });
                    break;
                case 'VERIFY':
                    result = await adminService.verifyUser(userId);
                    if (result.success) {
                        toast.success('User verified successfully');
                        loadUsers();
                    }
                    break;
                case 'CLEAR_STRIKES':
                    if (window.confirm('Reset all policy strikes and warnings for this user?')) {
                        result = await adminService.enforceModerationAction(userId, 'CLEAR_STRIKES');
                        if (result.success) {
                            toast.success('Policy strikes cleared');
                            loadUsers();
                        }
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error(`Error performing ${type}:`, error);
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const confirmDelete = async () => {
        try {
            const result = await adminService.deleteUser(confirmModal.userId);
            if (result.success) {
                toast.success('User deleted successfully');
                loadUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Deletion failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-user-100.png" alt="Users Management" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Users Management
                    </h1>
                    <p className="text-white/50 text-xs sm:text-sm">Monitor account activity, roles, and security status.</p>
                </motion.div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white px-3 sm:px-4 py-2 rounded-full border border-white/10 transition-all text-xs sm:text-sm font-medium">
                        <Download size={14} />
                        Export
                    </button>
                    <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-3 sm:px-4 py-2 rounded-full transition-all text-xs sm:text-sm font-bold shadow-lg shadow-accent/20">
                        <UserPlus size={14} />
                        Add User
                    </button>
                </div>
            </div>

            {/* Table wrapper */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <UsersTable
                    users={users}
                    loading={loading}
                    onAction={handleAction}
                    pagination={pagination}
                    filters={filters}
                    onFilterChange={(newFilters) => {
                        setFilters(newFilters);
                        setPagination(prev => ({ ...prev, offset: 0 }));
                    }}
                    onPageChange={(newOffset) => setPagination(prev => ({ ...prev, offset: newOffset }))}
                />
            </motion.div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, userId: null })}
                onConfirm={confirmDelete}
                title="Delete User?"
                message="Are you absolutely sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                icon={<img src="/Icons/icons8-delete-user-100.png" alt="Delete Alert" className="w-16 h-16 object-contain drop-shadow-sm" />}
            />
        </div>
    );
};

export default UsersPage;
