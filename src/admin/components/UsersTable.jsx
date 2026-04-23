import React from 'react';
import {
    MoreVertical,
    Shield,
    ShieldAlert,
    Mail,
    Trash2,
    UserCheck,
    UserX,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    Search,
    ExternalLink,
    ShieldOff,
    Flag
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../../components/ui/CustomDropdown';

const UsersTable = ({
    users,
    onAction,
    pagination,
    onPageChange,
    loading,
    filters,
    onFilterChange
}) => {
    const [activeMenu, setActiveMenu] = React.useState(null);
    const navigate = useNavigate();

    const getRoleBadge = (role) => {
        const styles = {
            ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            CLIENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            FREELANCER: 'bg-accent/10 text-accent border-accent/20'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                {role}
            </span>
        );
    };

    const getStatusBadge = (user) => {
        if (user.is_banned) {
            return (
                <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                    <ShieldAlert size={12} />
                    Disabled
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                <Shield size={12} />
                Active
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Table Header / Filters */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 w-full sm:min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-accent/50 transition-all shadow-inner"
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-48">
                    <CustomDropdown
                        options={[
                            { label: 'All Roles', value: '' },
                            { label: 'Clients', value: 'CLIENT' },
                            { label: 'Freelancers', value: 'FREELANCER' },
                            { label: 'Admins', value: 'ADMIN' }
                        ]}
                        value={filters.role}
                        onChange={(val) => onFilterChange({ ...filters, role: val })}
                        variant="transparent"
                        className="w-full"
                    />
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto admin-table-wrap">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/10 text-white/50 text-xs font-semibold uppercase tracking-wider">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role & Status</th>
                            <th className="px-6 py-4">Strikes</th>
                            <th className="px-6 py-4">Profile Progress</th>

                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4">Last Login</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="px-6 py-8 h-20 bg-white/[0.02]"></td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-white/30 italic">
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-accent font-bold shadow-lg border border-accent/20">
                                                {user.profile?.avatar_url ? (
                                                    <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    user.profile?.name?.[0] || user.email[0].toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                                                    {user.profile?.name || 'Incomplete Profile'}
                                                </div>
                                                <div className="text-xs text-white/40">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {getRoleBadge(user.role)}
                                            <div className="w-fit">{getStatusBadge(user)}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-black ${user.profile?.warning_count >= 3 ? 'text-red-500' : 'text-amber-500/70'}`}>
                                                {user.profile?.warning_count || 0}/5
                                            </span>
                                            {user.profile?.warning_count > 0 && (
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <div key={s} className={`w-0.5 h-2.5 rounded-full ${s <= user.profile.warning_count ? (s >= 5 ? 'bg-red-500' : 'bg-amber-500') : 'bg-white/10'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {(() => {
                                            const pct = user.profile?.profile_completion_percentage || 0;
                                            const isClient = user.role === 'CLIENT';
                                            const isComplete = isClient
                                                ? user.profile?.is_client_profile_complete
                                                : user.profile?.profile_completed;

                                            const barColor = pct >= 100
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                : pct >= 50
                                                    ? 'bg-gradient-to-r from-accent to-blue-400'
                                                    : 'bg-gradient-to-r from-amber-500 to-orange-400';

                                            return (
                                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                                                className={`h-full rounded-full ${barColor}`}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-bold tabular-nums ${
                                                            pct >= 100 ? 'text-green-400' :
                                                            pct >= 50  ? 'text-accent'     :
                                                                         'text-amber-400'
                                                        }`}>
                                                            {pct}%
                                                        </span>
                                                    </div>
                                                    {isComplete ? (
                                                        <span className="text-[10px] font-semibold text-green-400/80 flex items-center gap-1">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                            Complete
                                                        </span>
                                                    ) : pct === 0 ? (
                                                        <span className="text-[10px] font-medium text-white/20">Not started</span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-white/30">In progress</span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-white/60">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-white/60">
                                        {formatDate(user.last_login)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all active:scale-90"
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            <AnimatePresence>
                                                {activeMenu === user.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setActiveMenu(null)}
                                                        />
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            className="absolute right-0 mt-2 w-52 bg-secondary border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setActiveMenu(null);
                                                                    if (user.role === 'FREELANCER') {
                                                                        navigate(`/freelancer/${user.id}`);
                                                                    } else {
                                                                        navigate(`/admin/users/${user.id}`);
                                                                    }
                                                                }}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-accent/80 hover:text-accent hover:bg-white/5 transition-colors"
                                                            >
                                                                <ExternalLink size={16} /> View Profile
                                                            </button>
                                                            <div className="h-px bg-white/5 my-1" />
                                                            <button
                                                                onClick={() => { onAction(user.id, 'RESET_PASSWORD'); setActiveMenu(null); }}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-accent hover:bg-white/5 transition-colors"
                                                            >
                                                                <RefreshCcw size={16} /> Reset Password
                                                            </button>
                                                            <button
                                                                onClick={() => { onAction(user.id, 'TOGGLE_STATUS', !user.is_banned); setActiveMenu(null); }}
                                                                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${user.is_banned ? 'text-green-400/70 hover:text-green-400' : 'text-orange-400/70 hover:text-orange-400'} hover:bg-white/5`}
                                                            >
                                                                {user.is_banned ? <UserCheck size={16} /> : <UserX size={16} />}
                                                                {user.is_banned ? 'Enable Account' : 'Disable Account'}
                                                            </button>
                                                            {user.profile?.warning_count > 0 && (
                                                                <button
                                                                    onClick={() => { onAction(user.id, 'CLEAR_STRIKES'); setActiveMenu(null); }}
                                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400/70 hover:text-amber-400 hover:bg-white/5 transition-colors"
                                                                >
                                                                    <ShieldOff size={16} /> Clear Strikes
                                                                </button>
                                                            )}
                                                            <div className="h-px bg-white/5 my-1" />

                                                            <button
                                                                onClick={() => { onAction(user.id, 'DELETE'); setActiveMenu(null); }}
                                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                                                            >
                                                                <Trash2 size={16} /> Delete User
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 sm:p-6 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="text-[10px] sm:text-xs font-semibold text-white/40 uppercase tracking-widest">
                    <span className="hidden sm:inline">Showing </span>
                    <span className="text-white">{(pagination.offset || 0) + 1}</span>–<span className="text-white">{Math.min((pagination.offset || 0) + pagination.limit, pagination.total)}</span>
                    <span className="hidden sm:inline"> of </span><span className="sm:hidden"> / </span>
                    <span className="text-white">{pagination.total}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={pagination.offset === 0 || loading}
                        onClick={() => onPageChange(pagination.offset - pagination.limit)}
                        className="p-2 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-white transition-all active:scale-90"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        disabled={(pagination.offset + pagination.limit) >= pagination.total || loading}
                        onClick={() => onPageChange(pagination.offset + pagination.limit)}
                        className="p-2 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg text-white transition-all active:scale-90"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsersTable;
