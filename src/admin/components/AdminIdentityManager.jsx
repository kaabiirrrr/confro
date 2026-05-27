import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, MoreVertical, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import InfinityLoader from '../../components/common/InfinityLoader';
import { fetchAdmins, fetchAdminRoles, updateAdminRole, removeAdmin, fetchAdminPresence } from '../../services/adminService';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

const AdminIdentityManager = () => {
    const [admins, setAdmins] = useState([]);
    const [roles, setRoles] = useState([]);
    const [presenceMap, setPresenceMap] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // New Admin states
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminRole, setNewAdminRole] = useState('ADMIN');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [createError, setCreateError] = useState(null);

    // Edit & Remove states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [editRoleValue, setEditRoleValue] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        loadData();

        // Poll admin presence every 30 seconds
        const presenceInterval = setInterval(async () => {
            try {
                const presenceRes = await fetchAdminPresence();
                if (presenceRes.success) {
                    const pMap = {};
                    presenceRes.data.forEach(p => {
                        pMap[p.admin_id] = p;
                    });
                    setPresenceMap(pMap);
                }
            } catch (err) {
                console.error('Failed to poll admin presence:', err);
            }
        }, 30000);

        return () => clearInterval(presenceInterval);
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [adminsRes, rolesRes, presenceRes] = await Promise.all([
                fetchAdmins(),
                fetchAdminRoles(),
                fetchAdminPresence()
            ]);
            if (adminsRes.success) setAdmins(adminsRes.data || []);
            if (rolesRes.success) setRoles(rolesRes.data || []);
            if (presenceRes.success) {
                const pMap = {};
                presenceRes.data.forEach(p => {
                    pMap[p.admin_id] = p;
                });
                setPresenceMap(pMap);
            }
        } catch (err) {
            setError('Failed to fetch admin users');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInviteClick = () => {
        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminRole(roles.length > 0 ? roles[0].name.toUpperCase().replace(' ', '_') : 'ADMIN');
        setCreateError(null);
        setShowInviteModal(true);
    };
    const closeInviteModal = () => setShowInviteModal(false);

    const handleCreateAdmin = async () => {
        if (!newAdminEmail || !newAdminRole || !newAdminPassword) {
            setCreateError("Email, role, and password are required.");
            return;
        }
        if (newAdminPassword.length < 6) {
            setCreateError("Password must be at least 6 characters.");
            return;
        }
        try {
            setIsActionLoading(true);
            setCreateError(null);
            const { addAdmin } = await import('../../services/adminService');
            const res = await addAdmin({ email: newAdminEmail, role: newAdminRole, password: newAdminPassword });
            if (res.success) {
                await loadData();
                closeInviteModal();
            } else {
                setCreateError(res.message || "Failed to create admin");
            }
        } catch (err) {
            console.error(err);
            setCreateError(err.response?.data?.message || err.message || "An error occurred");
        } finally {
            setIsActionLoading(false);
        }
    };

    const toggleDropdown = (adminId) => {
        setActiveDropdown(activeDropdown === adminId ? null : adminId);
    };

    const openEditModal = (admin) => {
        setSelectedAdmin(admin);
        setEditRoleValue(admin.role);
        setActiveDropdown(null);
        setShowEditModal(true);
    };
    const closeEditModal = () => { setShowEditModal(false); setSelectedAdmin(null); };

    const handleEditRole = async () => {
        if (!selectedAdmin) return;
        try {
            setIsActionLoading(true);
            const res = await updateAdminRole(selectedAdmin.id, editRoleValue);
            if (res.success) { await loadData(); closeEditModal(); }
        } catch (error) {
            console.error("Failed to update role", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const openRemoveModal = (admin) => {
        setSelectedAdmin(admin);
        setActiveDropdown(null);
        setShowRemoveModal(true);
    };
    const closeRemoveModal = () => { setShowRemoveModal(false); setSelectedAdmin(null); };

    const handleRemoveAdmin = async () => {
        if (!selectedAdmin) return;
        try {
            setIsActionLoading(true);
            const res = await removeAdmin(selectedAdmin.id);
            if (res.success) { await loadData(); closeRemoveModal(); }
        } catch (error) {
            console.error("Failed to remove admin", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Shared modal input classes
    const inputCls = "w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent placeholder:text-slate-400 dark:placeholder:text-white/30";
    const labelCls = "block text-slate-500 dark:text-white/60 text-xs font-bold mb-2 uppercase tracking-wider";
    const cancelBtnCls = "px-4 py-2 rounded-xl text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-bold transition-all";

    return (
        <div className="animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users size={20} className="text-accent" />
                        Admin Directory
                    </h2>
                    <p className="text-slate-400 dark:text-white/40 text-xs mt-1">Manage active platform administrators and their assigned roles.</p>
                </div>
                <div className="flex w-full md:w-auto">
                    <button
                        onClick={handleInviteClick}
                        className="h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 w-full md:w-auto active:scale-95"
                    >
                        <Plus size={14} /> Create Admin
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto admin-table-wrap pb-32">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <InfinityLoader />
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-400 text-sm">{error}</div>
                ) : admins.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 dark:text-white/40 text-sm">No admins found</div>
                ) : (
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden min-w-[600px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-slate-400 dark:text-white/40 text-[10px] uppercase tracking-widest font-black border-b border-slate-200 dark:border-white/10">
                                        <th className="py-4 px-4 whitespace-nowrap">Admin Name</th>
                                        <th className="hidden md:table-cell py-4 pr-4 whitespace-nowrap">Email</th>
                                        <th className="py-4 pr-4 whitespace-nowrap">Role</th>
                                        <th className="hidden sm:table-cell py-4 pr-4 whitespace-nowrap">Last Active</th>
                                        <th className="hidden sm:table-cell py-4 pr-4 whitespace-nowrap">Created</th>
                                        <th className="py-4 px-4 text-right whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {admins.map(admin => {
                                        const p = presenceMap[admin.id];
                                        const status = p?.status || 'inactive';
                                        const isOnline = p?.is_socket_connected || status === 'online';
                                        
                                        return (
                                            <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors relative">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="relative flex-shrink-0">
                                                            {admin.photo_url ? (
                                                                <img src={admin.photo_url} alt={admin.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-white/10" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white text-xs font-bold">
                                                                    {admin.name ? admin.name.charAt(0).toUpperCase() : admin.email.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Custom Pulse Status Dot */}
                                                            {isOnline ? (
                                                                <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-1 ring-white dark:ring-gray-900"></span>
                                                                </span>
                                                            ) : status === 'idle' ? (
                                                                <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 ring-1 ring-white dark:ring-gray-900"></span>
                                                                </span>
                                                            ) : (
                                                                <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400 ring-1 ring-white dark:ring-gray-900"></span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-slate-800 dark:text-white text-sm font-bold truncate">{admin.name || 'Unknown'}</span>
                                                            {p?.current_module ? (
                                                                <span className="text-accent dark:text-accent/80 text-[10px] font-bold truncate flex items-center gap-1 mt-0.5 animate-pulse">
                                                                    <span className="w-1 h-1 rounded-full bg-accent"></span>
                                                                    {p.current_module}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 dark:text-white/35 text-[10px] md:hidden mt-0.5 truncate">{admin.email}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell py-4 pr-4 whitespace-nowrap">
                                                    <span className="text-slate-500 dark:text-white/60 text-sm">{admin.email}</span>
                                                </td>
                                                <td className="py-4 pr-2">
                                                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] sm:text-xs font-bold uppercase tracking-wider max-w-full">
                                                        <Shield size={10} className="hidden sm:inline flex-shrink-0" />
                                                        <span className="truncate">{admin.role?.replace(/_/g, ' ')}</span>
                                                    </span>
                                                </td>
                                                <td className="hidden sm:table-cell py-4 pr-4 whitespace-nowrap">
                                                    <span className="text-slate-500 dark:text-white/60 text-xs font-semibold">
                                                        {isOnline ? (
                                                            <span className="text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Active Now</span>
                                                        ) : p?.last_active ? (
                                                            formatDistanceToNow(new Date(p.last_active), { addSuffix: true })
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="hidden sm:table-cell py-4 pr-4 whitespace-nowrap">
                                                    <span className="text-slate-400 dark:text-white/40 text-xs">
                                                        {admin.created_at ? formatDistanceToNow(new Date(admin.created_at), { addSuffix: true }) : '-'}
                                                    </span>
                                                </td>
                                            <td className="py-4 px-4 text-right whitespace-nowrap relative">
                                                <button
                                                    onClick={() => toggleDropdown(admin.id)}
                                                    className="text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                <AnimatePresence>
                                                    {activeDropdown === admin.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                                                            className="absolute right-0 top-12 mt-1 w-48 bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                                                        >
                                                            <div className="p-1">
                                                                <button
                                                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors"
                                                                    onClick={() => openEditModal(admin)}
                                                                >
                                                                    <Edit2 size={14} /> Edit Role
                                                                </button>
                                                                <button
                                                                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors mt-1"
                                                                    onClick={() => openRemoveModal(admin)}
                                                                >
                                                                    <Trash2 size={14} /> Remove Admin
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                )}
            </div>

            {/* Create Admin Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            className="bg-white dark:bg-secondary border border-slate-200 dark:border-white/10 rounded-xl w-full max-w-md relative shadow-xl"
                        >
                            <div className="p-6 relative">
                                <button onClick={closeInviteModal} className="absolute top-6 right-6 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create New Admin</h3>
                                <p className="text-slate-400 dark:text-white/40 text-xs mt-1 pr-6">Create a new admin user with a specific role and password.</p>
                            </div>

                            {createError && (
                                <div className="px-6 mb-2">
                                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 px-3 py-2 rounded-lg text-xs">
                                        {createError}
                                    </div>
                                </div>
                            )}

                            <div className="p-6 pt-0 space-y-4">
                                <div>
                                    <label className={labelCls}>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="admin@connect.com"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Minimum 6 characters"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Assign Role</label>
                                    <select
                                        value={newAdminRole}
                                        onChange={(e) => setNewAdminRole(e.target.value)}
                                        className={inputCls + " appearance-none"}
                                    >
                                        {roles.length > 0 ? (
                                            roles.map(role => (
                                                <option key={role.id} value={role.name.toUpperCase().replace(' ', '_')}>
                                                    {role.name}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="ADMIN">Admin</option>
                                                <option value="SUPER_ADMIN">Super Admin</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="p-6 pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                                <button onClick={closeInviteModal} className={cancelBtnCls}>Cancel</button>
                                <button
                                    onClick={handleCreateAdmin}
                                    disabled={isActionLoading}
                                    className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
                                >
                                    {isActionLoading ? <InfinityLoader size="sm" /> : 'Create Admin'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Role Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            className="bg-white dark:bg-secondary border border-slate-200 dark:border-white/10 rounded-xl w-full max-w-md relative shadow-xl"
                        >
                            <div className="p-6 relative">
                                <button onClick={closeEditModal} className="absolute top-6 right-6 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Edit Admin Role</h3>
                                <p className="text-slate-400 dark:text-white/40 text-xs mt-1 pr-6">Change access permissions for {selectedAdmin?.email}.</p>
                            </div>
                            <div className="p-6 pt-0 space-y-4">
                                <div>
                                    <label className={labelCls}>Assign Role</label>
                                    <select
                                        value={editRoleValue}
                                        onChange={(e) => setEditRoleValue(e.target.value)}
                                        className={inputCls + " appearance-none"}
                                    >
                                        {roles.length > 0 ? (
                                            roles.map(role => (
                                                <option key={role.id} value={role.name.toUpperCase().replace(' ', '_')}>
                                                    {role.name}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="ADMIN">Admin</option>
                                                <option value="SUPER_ADMIN">Super Admin</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="p-6 pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
                                <button onClick={closeEditModal} className={cancelBtnCls}>Cancel</button>
                                <button
                                    onClick={handleEditRole}
                                    disabled={isActionLoading}
                                    className="px-6 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95"
                                >
                                    {isActionLoading ? <InfinityLoader size="sm" /> : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remove Admin Modal */}
            <AnimatePresence>
                {showRemoveModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            className="bg-white dark:bg-[#1a1212] border border-red-100 dark:border-red-500/20 rounded-xl w-full max-w-md relative shadow-xl"
                        >
                            <div className="p-6 relative">
                                <button onClick={closeRemoveModal} className="absolute top-6 right-6 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Remove Admin?</h3>
                                </div>
                                <p className="text-slate-500 dark:text-white/60 text-sm mt-3">
                                    Are you sure you want to remove <span className="text-slate-800 dark:text-white font-bold">{selectedAdmin?.email}</span> from the platform? They will lose all access immediately.
                                </p>
                            </div>
                            <div className="p-6 pt-2 flex justify-end gap-3 border-t border-red-50 dark:border-red-500/10">
                                <button onClick={closeRemoveModal} className={cancelBtnCls}>Cancel</button>
                                <button
                                    onClick={handleRemoveAdmin}
                                    disabled={isActionLoading}
                                    className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
                                >
                                    {isActionLoading ? <InfinityLoader size="sm" /> : 'Yes, Remove Admin'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminIdentityManager;
