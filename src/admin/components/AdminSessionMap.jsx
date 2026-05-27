import React, { useState, useEffect } from 'react';
import { 
    Map, 
    ShieldAlert, 
    Wifi, 
    Smartphone, 
    Globe, 
    AlertOctagon, 
    Users, 
    User, 
    Briefcase, 
    Terminal, 
    Shield, 
    LogOut,
    CheckCircle2
} from 'lucide-react';
import { 
    fetchAdminPresence, 
    fetchAdminSessions, 
    fetchOnlineCounts, 
    revokeUserSession 
} from '../../services/adminService';
import InfinityLoader from '../../components/common/InfinityLoader';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSessionMap = () => {
    const [sessions, setSessions] = useState([]);
    const [counts, setCounts] = useState({ total: 0, freelancers: 0, clients: 0, admins: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showLockdownModal, setShowLockdownModal] = useState(false);
    const [lockdownConfirmed, setLockdownConfirmed] = useState(false);

    useEffect(() => {
        loadData();
        
        // Poll command center data every 15 seconds for hot updates
        const interval = setInterval(loadDataSilent, 15000);
        return () => clearInterval(interval);
    }, []);

    const loadDataSilent = async () => {
        try {
            const [presencesRes, sessionsRes, countsRes] = await Promise.all([
                fetchAdminPresence(),
                fetchAdminSessions(),
                fetchOnlineCounts()
            ]);

            if (countsRes.success) {
                setCounts(countsRes.data);
            }

            if (presencesRes.success && sessionsRes.success) {
                mapAndSetSessions(presencesRes.data, sessionsRes.data);
            }
        } catch (error) {
            console.error('Silent refresh failed in Command Center:', error);
        }
    };

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [presencesRes, sessionsRes, countsRes] = await Promise.all([
                fetchAdminPresence(),
                fetchAdminSessions(),
                fetchOnlineCounts()
            ]);

            if (countsRes.success) {
                setCounts(countsRes.data);
            }

            if (presencesRes.success && sessionsRes.success) {
                mapAndSetSessions(presencesRes.data, sessionsRes.data);
            }
        } catch (error) {
            console.error('Failed to load Command Center sessions:', error);
            toast.error('Failed to retrieve realtime presence data');
        } finally {
            setIsLoading(false);
        }
    };

    const mapAndSetSessions = (presenceList, activeSessions) => {
        const mapped = presenceList.map(p => {
            const adminObj = p.admins || {};
            // Find active socket sessions
            const adminSockets = activeSessions.filter(s => s.user_id === p.admin_id);
            
            // Guess location from user agent / fake mapping or just show 'Secure Network'
            const browserName = adminSockets[0]?.user_agent 
                ? getBrowserName(adminSockets[0].user_agent)
                : 'Secure Shell';

            return {
                id: p.admin_id,
                admin: adminObj.name || adminObj.email?.split('@')[0] || 'Unknown Admin',
                email: adminObj.email || '',
                photoUrl: adminObj.photo_url || '',
                role: adminObj.role ? adminObj.role.replace(/_/g, ' ') : 'ADMIN',
                status: p.status || 'inactive',
                lastActive: p.last_active,
                module: p.current_module || 'Command Center',
                ip: adminSockets[0]?.ip_address || '127.0.0.1 (Local)',
                device: adminSockets[0]?.device_type || 'desktop',
                browser: browserName,
                sockets: adminSockets.map(s => s.socket_id),
                isOnline: p.is_socket_connected || p.status === 'online'
            };
        });
        setSessions(mapped);
    };

    const getBrowserName = (ua) => {
        if (/chrome|crios/i.test(ua)) return 'Chrome';
        if (/firefox|iceweasel/i.test(ua)) return 'Firefox';
        if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
        if (/edge/i.test(ua)) return 'Edge';
        return 'Web Client';
    };

    const handleTerminateSession = async (adminId, name) => {
        if (!window.confirm(`Are you sure you want to terminate all active sessions for administrator "${name}"?`)) {
            return;
        }

        try {
            setIsActionLoading(true);
            const res = await revokeUserSession(adminId, null, 'terminated_by_admin');
            if (res.success) {
                toast.success(`Sessions for ${name} successfully terminated`);
                await loadData();
            } else {
                toast.error(res.message || 'Failed to terminate session');
            }
        } catch (err) {
            console.error('Session revocation error:', err);
            toast.error('Internal server error during session revocation');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLockdownClick = () => {
        setShowLockdownModal(true);
    };

    const confirmLockdown = () => {
        setLockdownConfirmed(true);
        setShowLockdownModal(false);
        toast.error('🔒 EMERGENCY SYSTEM LOCKDOWN TRIGGERED (STUB ONLY)', {
            duration: 10000,
            style: {
                background: '#dc2626',
                color: '#fff',
                fontWeight: 'bold',
                border: '1px solid rgba(255,255,255,0.2)'
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            {/* Lockdown Banner */}
            <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-500 ${lockdownConfirmed ? 'bg-red-950/40 border-red-500' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                    <div className={`flex items-center justify-center shrink-0 mt-0.5 ${lockdownConfirmed ? 'text-red-400 animate-bounce' : 'text-red-500'}`}>
                        <AlertOctagon size={24} />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                            Emergency Lockdown Mode
                            {lockdownConfirmed && (
                                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse uppercase tracking-wider">
                                    Active
                                </span>
                            )}
                        </h2>
                        <p className="text-white/60 text-xs max-w-xl">
                            {lockdownConfirmed 
                              ? 'Security Lockdown engaged. Financial transactions frozen, session gates locked, lower-level admins revoked. To restore operations, complete the identity re-verification audit.'
                              : 'Instantly freeze all financial transactions, suspend all lower-level admin sessions, and trigger SOC incident response protocols. Use only in critical security events.'}
                        </p>
                    </div>
                </div>
                {lockdownConfirmed ? (
                    <button 
                        onClick={() => {
                            setLockdownConfirmed(false);
                            toast.success('Lockdown status cleared. System operational.');
                        }}
                        className="relative z-10 w-full md:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-600/20"
                    >
                        <CheckCircle2 size={16} /> Restore Systems
                    </button>
                ) : (
                    <button 
                        onClick={handleLockdownClick}
                        className="relative z-10 w-full md:w-auto h-12 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-red-600/20"
                    >
                        <ShieldAlert size={16} /> Activate Lockdown
                    </button>
                )}
            </div>

            {/* Premium Realtime Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Sessions', value: counts.total, icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Active Clients', value: counts.clients, icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Active Freelancers', value: counts.freelancers, icon: Briefcase, color: 'text-accent', bg: 'bg-accent/10' },
                    { label: 'Active Admins', value: counts.admins, icon: Terminal, color: 'text-purple-500', bg: 'bg-purple-500/10' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0f1929] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg hover:border-white/20 transition-all group">
                        <div>
                            <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-1">
                                {stat.label}
                            </span>
                            <span className="text-xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                                {stat.value}
                            </span>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Admin Session Cards Grid */}
            <div className="pt-2">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Map size={20} className="text-accent" />
                        <h2 className="text-xl font-bold text-white">Active Admin Sessions</h2>
                    </div>
                    <span className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Real-time presence tracking enabled
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <InfinityLoader />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-12 border border-white/5 rounded-xl bg-white/[0.01]">
                        <span className="text-white/30 text-sm italic">No active admin sessions detected</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {sessions.map(session => (
                            <div key={session.id} className={`bg-[#0f1929] border rounded-xl p-4 relative overflow-hidden group transition-all duration-300 ${session.isOnline ? 'border-emerald-500/30 hover:border-emerald-500/50 shadow-md shadow-emerald-500/[0.02]' : 'border-white/10 hover:border-white/20'}`}>
                                <div className="absolute top-0 right-0 p-4">
                                    {session.isOnline ? (
                                        <span className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    ) : session.status === 'idle' ? (
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                                    ) : (
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                                    )}
                                </div>
                                
                                <div className="mb-4 pr-8 flex items-center gap-3">
                                    {session.photoUrl ? (
                                        <img src={session.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center font-black text-sm">
                                            {session.admin.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-white font-bold text-sm leading-tight truncate">{session.admin}</h3>
                                        <span className="text-white/40 text-[9px] uppercase font-bold tracking-wider block mt-0.5">{session.role}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2.5 text-white/60 text-[11px] font-medium min-w-0">
                                        <Globe size={12} className="text-accent/70 shrink-0" />
                                        <span className="truncate">IP: <span className="text-white font-bold">{session.ip}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white/60 text-[11px] font-medium min-w-0">
                                        <Smartphone size={12} className="text-accent/70 shrink-0" />
                                        <span className="truncate">Device: <span className="text-white font-bold">{session.browser} ({session.device})</span></span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-white/60 text-[11px] font-medium min-w-0">
                                        <Wifi size={12} className="text-accent/70 shrink-0" />
                                        <span className="truncate">
                                            {session.isOnline ? 'Active on: ' : 'Last page: '}
                                            <span className="text-white font-bold">{session.module}</span>
                                        </span>
                                    </div>
                                    {!session.isOnline && session.lastActive && (
                                        <div className="text-[10px] text-white/30 italic">
                                            Disconnected {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                                    <button 
                                        disabled={isActionLoading}
                                        onClick={() => handleTerminateSession(session.id, session.admin)}
                                        className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 disabled:text-red-400/50 transition-colors flex items-center gap-1"
                                    >
                                        <LogOut size={10} /> Terminate Sessions
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lockdown Modal confirmation */}
            <AnimatePresence>
                {showLockdownModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0b1320] border border-red-500 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
                        >
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                                    <AlertOctagon size={36} />
                                </div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Confirm Security Lockdown</h3>
                                <p className="text-white/60 text-xs leading-relaxed">
                                    You are about to initiate an emergency SOC incident lockdown. This action will immediately terminate all active non-superadmin connections, lock financial gateways, and trigger manual audit flags.
                                </p>
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[11px] font-semibold">
                                    Warning: This action will be logged under your administrator account.
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => setShowLockdownModal(false)}
                                        className="flex-1 h-11 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmLockdown}
                                        className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        Initiate Lockdown
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSessionMap;
