import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, UserPlus, Trash2, ShieldCheck, Mail, Shield, Key, Eye, X } from 'lucide-react';
import { motion } from 'framer-motion';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';

const AdminManagementPage = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ email: '', role: 'ADMIN', password: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const handleViewAdmin = (admin) => {
        setSelectedAdmin(admin);
        setIsViewModalOpen(true);
    };

    const loadAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const result = await adminService.fetchAdmins();
            if (result.success) {
                setAdmins(result.data);
            }
        } catch (error) {
            console.error('Error loading admins:', error);
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            const result = await adminService.addAdmin(newAdmin);
            if (result.success) {
                toast.success(result.message || 'Admin added successfully');
                setIsAddModalOpen(false);
                setNewAdmin({ email: '', role: 'ADMIN', password: '' });
                loadAdmins();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add admin');
        }
    };

    const handleRemoveAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to remove this admin?')) return;
        try {
            const result = await adminService.removeAdmin(id);
            if (result.success) {
                toast.success('Admin removed successfully');
                loadAdmins();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove admin');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            const result = await adminService.updateAdminRole(id, newRole);
            if (result.success) {
                toast.success(`Role updated to ${newRole}`);
                loadAdmins();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };



    const filteredAdmins = admins.filter(admin => {
        const name = (admin.name || '').toLowerCase();
        const email = (admin.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <img src="/Icons/icons8-critical-thinking-80.png" alt="Admin Management" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        Admin Management
                    </h1>
                    <p className="text-white/40 text-xs mt-1">Add or remove system administrators and manage their permissions across the platform.</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white text-xs focus:outline-none focus:border-accent transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent text-white px-6 h-11 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 shrink-0"
                    >
                        <UserPlus size={16} />
                        Add New Admin
                    </button>
                </div>
            </div>

            {/* Admin Table / Cards */}
            <div className="bg-transparent border border-white/10 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-white/40 text-[10px] uppercase tracking-widest font-black border-b border-white/10">
                                <th className="px-6 py-5">Administrator</th>
                                <th className="px-6 py-5">Role</th>
                                <th className="px-6 py-5">Joined At</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-white/30">Loading administrators...</td></tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-white/30">No administrators found</td></tr>
                            ) : filteredAdmins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold shadow-inner shrink-0 border border-accent/10">
                                                {admin.photo_url ? (
                                                    <img src={admin.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                                ) : admin.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm tracking-tight">{admin.name || admin.email.split('@')[0]}</div>
                                                <div className="text-white/30 text-xs font-medium">{admin.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <CustomDropdown
                                            options={[
                                                { label: 'ADMIN', value: 'ADMIN' },
                                                { label: 'SUPER ADMIN', value: 'SUPER_ADMIN' }
                                            ]}
                                            value={admin.role}
                                            onChange={(val) => handleRoleChange(admin.id, val)}
                                            variant="accent"
                                            className="text-[10px] font-black uppercase tracking-widest w-40 !rounded-xl"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-white/40 text-sm font-medium">
                                        {new Date(admin.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleViewAdmin(admin)} className="p-2 text-white/30 hover:text-white transition-colors"><Eye size={18} /></button>
                                            <button onClick={() => handleRemoveAdmin(admin.id)} className="p-2 text-white/30 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-white/5">
                    {loading ? (
                        <div className="px-4 py-12 text-center text-white/30 text-sm font-medium">Loading administrators...</div>
                    ) : filteredAdmins.length === 0 ? (
                        <div className="px-4 py-12 text-center text-white/30 text-sm font-medium">No administrators found</div>
                    ) : filteredAdmins.map((admin) => (
                        <div key={admin.id} className="p-5 space-y-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center text-accent font-black shrink-0 border border-accent/10">
                                        {admin.photo_url ? (
                                            <img src={admin.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : admin.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-sm truncate leading-tight">{admin.name || admin.email.split('@')[0]}</p>
                                        <p className="text-white/40 text-xs truncate max-w-[160px] font-medium">{admin.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => handleViewAdmin(admin)} className="p-2 text-white/30 hover:text-white transition-colors"><Eye size={18} /></button>
                                    <button onClick={() => handleRemoveAdmin(admin.id)} className="p-2 text-white/30 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] uppercase font-black text-white/20 tracking-widest">Joined On</span>
                                    <span className="text-white/40 text-[10px] font-bold">{new Date(admin.created_at).toLocaleDateString()}</span>
                                </div>
                                <CustomDropdown
                                    options={[
                                        { label: 'ADMIN', value: 'ADMIN' },
                                        { label: 'SUPER ADMIN', value: 'SUPER_ADMIN' }
                                    ]}
                                    value={admin.role}
                                    onChange={(val) => handleRoleChange(admin.id, val)}
                                    variant="accent"
                                    className="w-full text-[10px] font-black uppercase tracking-widest !rounded-xl h-11"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-secondary border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
                    >
                        <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 flex items-center gap-3">
                            <UserPlus className="text-accent" />
                            Add Admin
                        </h2>
                        <p className="text-white/50 text-sm mb-6">Enter details to grant or update administrative access. If the user doesn't exist, they will be created.</p>

                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@email.com"
                                        value={newAdmin.email}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Role</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                    <CustomDropdown
                                        options={[
                                            { label: 'Standard Admin', value: 'ADMIN' },
                                            { label: 'Super Admin', value: 'SUPER_ADMIN' }
                                        ]}
                                        value={newAdmin.role}
                                        onChange={(val) => setNewAdmin({ ...newAdmin, role: val })}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Initial Password / Credentials</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-4 text-white/40" size={18} />
                                    <textarea
                                        required
                                        placeholder="Enter initial password or credentials..."
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-accent hover:bg-accent/90 text-white rounded-full transition-all font-bold shadow-lg shadow-accent/20"
                                >
                                    Add Admin
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-secondary border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
                    >
                        <button 
                            onClick={() => setIsViewModalOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold border-2 border-accent/20 shadow-inner mb-4">
                                {selectedAdmin.photo_url ? (
                                    <img src={selectedAdmin.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    selectedAdmin.email.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h2 className="text-lg sm:text-2xl font-bold text-white text-center">{selectedAdmin.name || selectedAdmin.email.split('@')[0]}</h2>
                            <p className="text-white/50 text-sm mt-1">{selectedAdmin.role.replace('_', ' ')}</p>
                        </div>

                        <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Email Address</span>
                                <span className="text-white text-sm">{selectedAdmin.email}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Joined Date</span>
                                <span className="text-white text-sm">{new Date(selectedAdmin.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                    <span className="text-emerald-400 text-xs font-bold uppercase">Active</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsViewModalOpen(false)}
                            className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all font-bold"
                        >
                            Close Details
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminManagementPage;
