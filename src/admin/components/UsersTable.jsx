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
    Flag,
    CheckCircle2,
    ChevronDown
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchUserPresenceList } from '../../services/adminService';

const ADMIN_ROLES = new Set([
    'ADMIN', 'SUPER_ADMIN', 'MODERATOR',
    'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VERIFICATION_ADMIN'
]);

// ── Custom Dropdown ────────────────────────────────────────────────────────────
const CustomDropdown = ({ value, onChange, options, placeholder }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-1 sm:gap-2 bg-white dark:bg-[#0f1929] border border-slate-200 dark:border-white/10 rounded-xl px-2 sm:px-4 py-2.5 text-[10px] sm:text-sm text-slate-700 dark:text-white focus:outline-none focus:border-accent/50 transition-all cursor-pointer whitespace-nowrap min-w-0 sm:min-w-[160px]"
            >
                <span className="flex-1 text-left truncate">
                    {selected ? selected.label : <span className="text-slate-400 dark:text-white/40">{placeholder}</span>}
                </span>
                <ChevronDown size={14} className={`text-slate-400 dark:text-white/40 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full mt-1.5 left-0 z-50 min-w-full bg-white dark:bg-[#0f1929] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-lg dark:shadow-2xl"
                    >
                        {/* Clear option */}
                        <button
                            type="button"
                            onClick={() => { onChange(''); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors ${!value ? 'text-accent bg-accent/10' : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            {placeholder}
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-white/5" />
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors ${value === opt.value ? 'text-accent bg-accent/10' : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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
    const [presenceMap, setPresenceMap] = React.useState({});

    React.useEffect(() => {
        const loadPresence = async () => {
            try {
                const res = await fetchUserPresenceList();
                if (res.success) {
                    const pMap = {};
                    res.data.forEach(p => {
                        pMap[p.user_id] = p;
                    });
                    setPresenceMap(pMap);
                }
            } catch (err) {
                console.error('[Presence] Failed to fetch user presence list:', err);
            }
        };

        loadPresence();
        const presenceInterval = setInterval(loadPresence, 60000);
        return () => clearInterval(presenceInterval);
    }, []);

    // All filtering is now server-side — just use users directly
    const filteredUsers = users || [];

    // ── Badge helpers ──────────────────────────────────────────────────────
    const getRoleBadge = (role) => {
        let cls;
        if (role === 'FREELANCER') {
            cls = 'bg-accent/20 text-accent border-accent/30';
        } else if (role === 'CLIENT') {
            cls = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        } else if (ADMIN_ROLES.has(role)) {
            cls = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        } else {
            cls = 'bg-white/10 text-white/50 border-white/10';
        }
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
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
            <span className="flex items-center gap-1.5 text-white text-xs font-medium bg-green-500 px-2.5 py-1 rounded-full border border-green-600">
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
        <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
            {/* Table Header / Filters */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex flex-col gap-3">
                {/* Search */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all"
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                    />
                </div>

                {/* Dropdowns — aligned right */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between">
                    <div className="flex-1 min-w-0">
                        <CustomDropdown
                            value={filters.role || ''}
                            onChange={(val) => onFilterChange({ ...filters, role: val })}
                            placeholder="All Roles"
                            options={[
                                { value: 'CLIENT', label: 'Clients' },
                                { value: 'FREELANCER', label: 'Freelancers' },
                                { value: 'ADMIN', label: 'Admins' },
                            ]}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CustomDropdown
                            value={filters.completion || ''}
                            onChange={(val) => onFilterChange({ ...filters, completion: val })}
                            placeholder="Completion"
                            options={[
                                { value: 'complete', label: 'Complete (100%)' },
                                { value: 'inprogress', label: 'In Progress (1–99%)' },
                                { value: 'notstarted', label: 'Not Started (0%)' },
                            ]}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CustomDropdown
                            value={filters.strikes || ''}
                            onChange={(val) => onFilterChange({ ...filters, strikes: val })}
                            placeholder="Strikes"
                            options={[
                                { value: 'nostrikes', label: 'No Strikes (0)' },
                                { value: 'hasstrikes', label: 'Has Strikes (1+)' },
                                { value: 'highrisk', label: 'High Risk (3+)' },
                            ]}
                        />
                    </div>
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
                            <th className="px-6 py-4">Last Login</th>
                            <th className="px-6 py-4">Verified</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="8" className="px-6 py-8 h-20 bg-white/[0.02]"></td>
                                </tr>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-white/30 italic">
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-white/5 group">
                                    {/* User */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-accent font-bold shadow-lg border border-accent/20">
                                                    {user.profile?.avatar_url ? (
                                                        <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.profile?.name?.[0] || user.email[0].toUpperCase()
                                                    )}
                                                </div>
                                                
                                                {/* Pulse/Glowing presence dot */}
                                                {(() => {
                                                    const p = presenceMap[user.id];
                                                    const status = p?.status || 'offline';
                                                    const isConnected = p?.is_socket_connected || status === 'active' || status === 'online';
                                                    
                                                    if (isConnected) {
                                                        return (
                                                            <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-[#0f1929]"></span>
                                                            </span>
                                                        );
                                                    }
                                                    if (status === 'idle') {
                                                        return (
                                                            <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 ring-2 ring-[#0f1929]"></span>
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400 ring-2 ring-[#0f1929]"></span>
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white group-hover:text-accent transition-colors flex items-center gap-2">
                                                    {user.profile?.name || 'Incomplete Profile'}
                                                    
                                                    {/* Inactivity Alert (if offline for a long time) */}
                                                    {(() => {
                                                        const p = presenceMap[user.id];
                                                        if (p && p.status === 'offline') {
                                                            const lastSeen = new Date(p.last_seen);
                                                            const diffMs = Date.now() - lastSeen.getTime();
                                                            const diffDays = diffMs / (1000 * 60 * 60 * 24);
                                                            if (diffDays > 30) {
                                                                return (
                                                                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase">
                                                                        Dormant
                                                                    </span>
                                                                );
                                                            }
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                                <div className="text-xs text-white/40 flex flex-col gap-0.5 mt-0.5">
                                                    <span>{user.email}</span>
                                                    {/* Show last seen if offline or current page if active */}
                                                    {(() => {
                                                        const p = presenceMap[user.id];
                                                        if (p) {
                                                            if (p.is_socket_connected || p.status === 'active' || p.status === 'online') {
                                                                return p.current_page ? (
                                                                    <span className="text-accent text-[10px] font-semibold truncate max-w-[180px] block">
                                                                        Viewing: {p.current_page}
                                                                    </span>
                                                                ) : null;
                                                            } else if (p.last_seen) {
                                                                return (
                                                                    <span className="text-white/30 text-[10px]">
                                                                        Last seen {new Date(p.last_seen).toLocaleDateString()}
                                                                    </span>
                                                                );
                                                            }
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role & Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {getRoleBadge(user.role)}
                                            <div className="w-fit">{getStatusBadge(user)}</div>
                                        </div>
                                    </td>

                                    {/* Strikes */}
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

                                    {/* Profile Progress */}
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

                                            const getDropoffDetail = (p, r) => {
                                                if (p >= 100) return null;
                                                if (p === 0) return 'SignUp completed, 0%';
                                                if (p < 30) return 'Needs basic info';
                                                if (p < 60) return 'Needs bio/skills';
                                                if (p < 90) return 'Needs verification';
                                                return 'Needs final review';
                                            };

                                            const dropoff = getDropoffDetail(pct, user.role);

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
                                                        <span className={`text-xs font-bold tabular-nums ${pct >= 100 ? 'text-green-400' : pct >= 50 ? 'text-accent' : 'text-amber-400'}`}>
                                                            {pct}%
                                                        </span>
                                                    </div>
                                                    {(isComplete || pct >= 100) ? (
                                                        <span className="text-[10px] font-semibold text-green-400/80 flex items-center gap-1">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                                            Complete
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] font-medium text-white/30">Incomplete</span>
                                                            {dropoff && (
                                                                <span className="text-[9px] font-semibold text-amber-500/80 uppercase tracking-wide">
                                                                    {dropoff}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </td>

                                    {/* Last Login */}
                                    <td className="px-6 py-4 text-xs font-medium text-white/60 whitespace-nowrap">
                                        {formatDate(user.last_login)}
                                    </td>

                                    {/* Verified */}
                                    <td className="px-6 py-4">
                                        {(() => {
                                            // Check all possible verification signals
                                            const isVerified =
                                                user.profile?.is_verified === true ||
                                                user.is_verified === true ||
                                                user.email_confirmed === true ||
                                                user.profile?.verification_status === 'APPROVED' ||
                                                user.profile?.is_email_verified === true ||
                                                user.profile?.email_verified === true;

                                            return isVerified ? (
                                                <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-500/15 px-2.5 py-1 rounded-full border border-green-500/25 w-fit whitespace-nowrap">
                                                    <CheckCircle2 size={12} />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-white/25 text-sm">—</span>
                                            );
                                        })()}
                                    </td>

                                    {/* Joined */}
                                    <td className="px-6 py-4 text-xs font-medium text-white/60 whitespace-nowrap">
                                        {formatDate(user.created_at)}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                                                className="p-2 text-white/40 hover:text-accent transition-colors active:scale-90"
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
                                                            className="absolute right-0 mt-2 w-52 bg-secondary border border-white/10 rounded-xl z-20 py-1 overflow-hidden"
                                                        >
                                                            <button
                                                                onClick={() => { setActiveMenu(null); if (user.role === 'FREELANCER') { navigate(`/freelancer/${user.id}`); } else { navigate(`/admin/users/${user.id}`); } }}
                                                                className="w-full flex items-center px-4 py-2.5 text-sm text-accent/80 hover:text-accent hover:bg-white/5 transition-colors"
                                                            >
                                                                View Profile
                                                            </button>
                                                            <div className="h-px bg-white/5 my-1" />
                                                            <button
                                                                onClick={() => { onAction(user.id, 'RESET_PASSWORD'); setActiveMenu(null); }}
                                                                className="w-full flex items-center px-4 py-2.5 text-sm text-white/70 hover:text-accent hover:bg-white/5 transition-colors"
                                                            >
                                                                Reset Password
                                                            </button>
                                                            {(user.profile?.profile_completion_percentage || 0) < 100 && (
                                                                <button
                                                                    onClick={() => { onAction(user.id, 'SEND_PROFILE_REMINDER'); setActiveMenu(null); }}
                                                                    className="w-full flex items-center px-4 py-2.5 text-sm text-white/70 hover:text-accent hover:bg-white/5 transition-colors"
                                                                >
                                                                    Send Profile Reminder
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => { onAction(user.id, 'TOGGLE_STATUS', !user.is_banned); setActiveMenu(null); }}
                                                                className={`w-full flex items-center px-4 py-2.5 text-sm transition-colors ${user.is_banned ? 'text-green-400/70 hover:text-green-400' : 'text-orange-400/70 hover:text-orange-400'} hover:bg-white/5`}
                                                            >
                                                                {user.is_banned ? 'Enable Account' : 'Disable Account'}
                                                            </button>
                                                            {user.profile?.warning_count > 0 && (
                                                                <button
                                                                    onClick={() => { onAction(user.id, 'CLEAR_STRIKES'); setActiveMenu(null); }}
                                                                    className="w-full flex items-center px-4 py-2.5 text-sm text-amber-400/70 hover:text-amber-400 hover:bg-white/5 transition-colors"
                                                                >
                                                                    Clear Strikes
                                                                </button>
                                                            )}
                                                            <div className="h-px bg-white/5 my-1" />
                                                            <button
                                                                onClick={() => { onAction(user.id, 'DELETE'); setActiveMenu(null); }}
                                                                className="w-full flex items-center px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                                                            >
                                                                Delete User
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
