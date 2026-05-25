import React, { useState, useEffect } from 'react';
import { Shield, Plus, Check, X, AlertTriangle, Edit2, Save, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InfinityLoader from '../../components/common/InfinityLoader';
import { fetchAdminRoles, fetchAdminPermissions, updateRolePermissions } from '../../services/adminService';

const RoleBuilder = () => {
    const [roles, setRoles] = useState([]);
    const [permissionModules, setPermissionModules] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // New Role Modal state
    const [showNewRoleModal, setShowNewRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                fetchAdminRoles(),
                fetchAdminPermissions()
            ]);
            
            if (rolesRes.success) {
                setRoles(rolesRes.data);
                if (rolesRes.data.length > 0) setSelectedRole(rolesRes.data[0]);
            }
            
            if (permsRes.success) {
                // Group permissions by module
                const grouped = permsRes.data.reduce((acc, curr) => {
                    if (!acc[curr.module]) {
                        acc[curr.module] = {
                            id: curr.module,
                            label: curr.module.charAt(0).toUpperCase() + curr.module.slice(1).replace('_', ' '),
                            permissions: []
                        };
                    }
                    acc[curr.module].permissions.push(curr.action);
                    return acc;
                }, {});
                setPermissionModules(Object.values(grouped));
            }
        } catch (err) {
            setError('Failed to load RBAC configuration');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePermission = (module, action) => {
        const perm = `${module}:${action}`;
        let updatedPerms = [...(selectedRole.permissions || [])];

        if (updatedPerms.includes('*')) {
            const allPerms = permissionModules.flatMap(m => m.permissions.map(a => `${m.id}:${a}`));
            updatedPerms = allPerms.filter(p => p !== perm);
        } else {
            if (updatedPerms.includes(perm)) {
                updatedPerms = updatedPerms.filter(p => p !== perm);
            } else {
                updatedPerms.push(perm);
            }
        }

        setSelectedRole({ ...selectedRole, permissions: updatedPerms });
        setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, permissions: updatedPerms } : r));
    };

    const hasPermission = (module, action) => {
        if (!selectedRole) return false;
        if (selectedRole.permissions?.includes('*')) return true;
        return selectedRole.permissions?.includes(`${module}:${action}`);
    };

    const handleCreateRole = () => {
        if (!newRoleName.trim()) return;
        
        const newRole = {
            id: `temp_${Date.now()}`,
            name: newRoleName,
            description: newRoleDesc,
            isSystem: false,
            risk: 'low',
            permissions: []
        };
        
        setRoles([...roles, newRole]);
        setSelectedRole(newRole);
        setShowNewRoleModal(false);
        setNewRoleName('');
        setNewRoleDesc('');
    };

    const handleSaveAccessChanges = async () => {
        if (!selectedRole || selectedRole.id.startsWith('temp_')) {
            setError('Cannot save permissions for a temporary role. Please create it fully first.');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            setSuccessMsg(null);
            const res = await updateRolePermissions(selectedRole.id, selectedRole.permissions);
            if (res.success) {
                setSuccessMsg('Permissions updated successfully!');
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                throw new Error(res.message || 'Failed to update permissions');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to save changes');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <InfinityLoader />
            </div>
        );
    }

    if (error && !selectedRole) {
        return (
            <div className="flex items-center justify-center h-[500px] text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in pb-20">
            {/* Top Side: Roles */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-white text-xl font-bold">Roles Management</h2>
                    <button 
                        onClick={() => setShowNewRoleModal(true)}
                        className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-full border border-accent flex items-center justify-center gap-2 text-sm font-bold transition-all w-full sm:w-auto"
                    >
                        <Plus size={16} /> New Role
                    </button>
                </div>
                
                {/* Error/Success Messages */}
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>}
                {successMsg && <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm">{successMsg}</div>}

                {/* Horizontal scrollable roles */}
                <div className="flex w-full overflow-x-auto no-scrollbar gap-4 pb-4 pt-2 px-1 -mx-1">
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role)}
                            className={`flex flex-col gap-1.5 md:gap-2 p-3 md:p-5 rounded-xl md:rounded-2xl border min-w-[180px] md:min-w-[280px] transition-all text-left group ${
                                selectedRole?.id === role.id 
                                    ? 'bg-accent/10 border-accent text-white shadow-lg shadow-accent/5' 
                                    : 'bg-transparent border-white/10 hover:border-white/20 text-white hover:bg-white/[0.02]'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {role.isSystem ? (
                                        <Lock size={14} className={`shrink-0 ${selectedRole?.id === role.id ? 'text-accent' : 'text-white/40'}`} />
                                    ) : (
                                        <Shield size={14} className={`shrink-0 ${selectedRole?.id === role.id ? 'text-accent' : 'text-white/40'}`} />
                                    )}
                                    <span className="font-bold text-sm truncate">{role.name}</span>
                                </div>
                                {role.risk === 'critical' && (
                                    <AlertTriangle size={14} className={`shrink-0 ${selectedRole?.id === role.id ? 'text-red-400' : 'text-red-400/50'}`} />
                                )}
                            </div>
                            <span className="text-xs text-white/50 line-clamp-1 leading-relaxed">
                                {role.description || 'Custom role permissions'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Down Side: Table Format Access */}
            {selectedRole && (
                <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {selectedRole.name} Access Control
                                {selectedRole.isSystem && (
                                    <span className="bg-white/10 text-white/60 text-[10px] font-black uppercase px-2 py-0.5 rounded">System Role</span>
                                )}
                            </h3>
                            <p className="text-white/40 text-xs mt-1">Configure module-level permissions for this role below.</p>
                        </div>
                        <button 
                            onClick={handleSaveAccessChanges}
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                        >
                            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Access Changes'}
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-white/10 rounded-xl mb-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-white/40 text-[10px] uppercase tracking-widest font-black border-b border-white/10 bg-white/[0.02]">
                                    <th className="py-4 px-6 w-1/4 min-w-[200px]">Module Area</th>
                                    <th className="py-4 px-6">Available Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {permissionModules.map(module => (
                                    <tr key={module.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-5 px-6 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm font-bold">{module.label}</span>
                                                    <span className="text-white/30 text-[10px] font-mono mt-1">{module.id} module</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-wrap gap-3">
                                                {module.permissions.map(action => {
                                                    const hasAccess = hasPermission(module.id, action);
                                                    return (
                                                        <label 
                                                            key={action}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                                                                hasAccess 
                                                                    ? 'bg-accent/10 border-accent/30 text-white' 
                                                                    : 'bg-transparent border-white/10 hover:border-white/20 text-white/60 hover:text-white'
                                                            }`}
                                                        >
                                                            <div className="relative flex items-center justify-center">
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={hasAccess}
                                                                    onChange={() => togglePermission(module.id, action)}
                                                                    className="sr-only"
                                                                />
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                                    hasAccess 
                                                                        ? 'bg-accent border-accent text-white' 
                                                                        : 'bg-transparent border-white/20 text-transparent'
                                                                }`}>
                                                                    <Check size={10} strokeWidth={4} />
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-medium">
                                                                {action.replace(/_/g, ' ')}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* New Role Modal */}
            <AnimatePresence>
                {showNewRoleModal && (
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
                            className="bg-secondary border border-white/10 rounded-2xl w-full max-w-md relative shadow-2xl"
                        >
                            <div className="p-6 relative">
                                <button 
                                    onClick={() => setShowNewRoleModal(false)} 
                                    className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Shield className="text-accent" size={20} /> Create New Role
                                </h3>
                                <p className="text-white/40 text-xs mt-1 pr-6">Define a custom role name and base description before configuring access.</p>
                            </div>
                            <div className="p-6 pt-0 space-y-4">
                                <div>
                                    <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wider">Role Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Content Moderator" 
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-colors" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-xs font-bold mb-2 uppercase tracking-wider">Description</label>
                                    <textarea 
                                        placeholder="What is this role responsible for?" 
                                        value={newRoleDesc}
                                        onChange={(e) => setNewRoleDesc(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-colors min-h-[100px] resize-none" 
                                    />
                                </div>
                            </div>
                            <div className="p-6 pt-2 flex justify-end gap-3 rounded-b-2xl">
                                <button 
                                    onClick={() => setShowNewRoleModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateRole}
                                    disabled={!newRoleName.trim()}
                                    className="px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:hover:bg-accent text-white rounded-full border border-accent text-sm font-bold transition-all flex items-center gap-2"
                                >
                                    Create Role
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleBuilder;
