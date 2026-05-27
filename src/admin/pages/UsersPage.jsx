import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, FileDown, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import UsersTable from '../components/UsersTable';
import * as adminService from '../../services/adminService';
import { sendProfileReminder } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';
import AddUserModal from '../components/AddUserModal';
import { exportTableToPDF } from '../utils/exportPDF';


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
        role: '',
        completion: '',
        strikes: ''
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null });
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await adminService.fetchUsers({
                search: filters.search,
                role: filters.role,
                completion: filters.completion,
                strikes: filters.strikes,
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
    }, [filters.search, filters.role, filters.completion, filters.strikes, pagination.limit, pagination.offset]);

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
                case 'SEND_PROFILE_REMINDER':
                    result = await sendProfileReminder(userId);
                    if (result.success) {
                        toast.success(result.message || 'Profile reminder email sent');
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

    const handleExportUsers = () => {
        if (users.length === 0) {
            toast.error('No users to export');
            return;
        }
        exportTableToPDF({
            title: 'Users Management',
            columns: ['Name', 'Email', 'Role', 'Status', 'Joined'],
            rows: users.map(u => [
                u.profiles?.name || 'N/A',
                u.email,
                u.role,
                u.is_suspended ? 'Suspended' : 'Active',
                new Date(u.created_at).toLocaleDateString(),
            ]),
            filename: 'users_export',
            filters: {
                Role: filters.role || 'All',
                Status: filters.strikes ? `Strikes: ${filters.strikes}` : 'All',
                Completion: filters.completion || 'All',
                ...(filters.search && { Search: filters.search }),
                ...(dateFrom && { From: dateFrom }),
                ...(dateTo && { To: dateTo }),
            },
        });
    };

    const handleAddUser = () => {
        setIsAddModalOpen(true);
    };

    const handleAddUserSubmit = async (userData) => {
        try {
            await adminService.addUser(userData);
            toast.success('User created successfully');
            setIsAddModalOpen(false);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
            throw error;
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
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-user-100.png" alt="Users Management" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Users Management
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Monitor account activity, roles, and security status.</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="flex gap-3 w-full sm:w-auto">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            title="Joined from"
                            className="flex-1 sm:flex-none bg-transparent border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-accent transition-all sm:w-36"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            title="Joined to"
                            className="flex-1 sm:flex-none bg-transparent border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-accent transition-all sm:w-36"
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={handleExportUsers}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-1.5 rounded-full transition-all text-xs sm:text-sm font-bold"
                        >
                            <FileDown size={14} />
                            Export PDF
                        </button>
                        <button 
                            onClick={handleAddUser}
                            className="flex-1 sm:flex-none flex items-center justify-center bg-accent hover:bg-accent/90 text-white px-6 py-1.5 rounded-full transition-all text-xs sm:text-sm font-bold"
                        >
                            Add User
                        </button>
                    </div>
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
                        // Reset pagination whenever any filter changes
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
            
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddUserSubmit}
            />
        </div>
    );
};

export default UsersPage;
