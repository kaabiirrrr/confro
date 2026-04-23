import { useState, useEffect } from 'react';
import { Search, Info, CheckCircle, XCircle, ShieldAlert, UserX, UserCheck, Trash2, Clock, AlertTriangle } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import InfinityLoader from '../../components/common/InfinityLoader';

const ModerationPage = () => {
    const [activeTab, setActiveTab] = useState('reports'); // reports, violations, offenders
    const [reports, setReports] = useState([]);
    const [violations, setViolations] = useState([]);
    const [offenders, setOffenders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab, statusFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'reports') {
                const result = await adminService.fetchModerationReports({ status: statusFilter });
                if (result.success) setReports(result.data);
            } else if (activeTab === 'violations') {
                const result = await adminService.fetchViolations({ severity: statusFilter });
                if (result.success) setViolations(result.data);
            } else if (activeTab === 'offenders') {
                const result = await adminService.fetchRepeatOffenders();
                if (result.success) setOffenders(result.data);
            }
        } catch (err) {
            console.error(`Failed to fetch ${activeTab}`, err);
            toast.error(`Failed to load ${activeTab}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (report, newStatus) => {
        let confirmationMessage = `Set report to ${newStatus}?`;
        if (newStatus === 'ACTION_TAKEN') {
            confirmationMessage = `WARNING: Taking action will PERMANENTLY BAN the user or DELETE the content. Proceed?`;
        }
        if (!window.confirm(confirmationMessage)) return;

        const notes = prompt(`Admin notes:`, report.admin_notes || '');
        if (notes === null) return;

        try {
            const result = await adminService.resolveModerationReport(report.id, { status: newStatus, admin_notes: notes });
            if (result.success) {
                toast.success('Report updated');
                loadData();
            }
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const handleManualAction = async (userId, action) => {
        const reason = prompt(`Enter reason for ${action}:`, '');
        if (reason === null) return;

        try {
            const result = await adminService.enforceModerationAction(userId, action, reason);
            if (result.success) {
                toast.success(`User ${action} successful`);
                loadData();
            }
        } catch (err) {
            toast.error('Enforcement failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="text-accent w-8 h-8" />
                        Revenue Protection & Moderation
                    </h1>
                    <p className="text-white/40 text-[11px] font-medium mt-1 uppercase tracking-widest">
                        Track and enforce platform trust, safety, and communication policies
                    </p>
                </div>

                
                {/* Underline Tabs (Modern Style) */}
                <div className="flex items-center border-b border-white/10 w-full sm:w-auto">
                    {[
                        { id: 'reports', label: 'USER REPORTS', icon: Info },
                        { id: 'violations', label: 'AI VIOLATIONS', icon: AlertTriangle },
                        { id: 'offenders', label: 'OFFENDERS LIST', icon: UserX },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-widest transition-all relative ${
                                activeTab === tab.id ? 'text-accent' : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div 
                                    layoutId="activeTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_rgba(122,167,255,0.8)]" 
                                />
                            )}
                        </button>
                    ))}
                </div>

            </div>

            {/* Sub-Header / Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent"
                    />
                </div>
                {activeTab !== 'offenders' && (
                    <CustomDropdown
                        options={activeTab === 'reports' ? [
                            { label: 'All Statuses', value: '' },
                            { label: 'Pending', value: 'PENDING' },
                            { label: 'Investigating', value: 'INVESTIGATING' },
                            { label: 'Action Taken', value: 'ACTION_TAKEN' }
                        ] : [
                            { label: 'All Severity', value: '' },
                            { label: 'High Severity', value: 'HIGH' },
                            { label: 'Medium Severity', value: 'MEDIUM' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        variant="transparent"
                        className="w-full sm:w-48"
                    />
                )}
            </div>

            {/* Content Display */}
            <div className="border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.table 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-full text-left text-sm"
                        >
                            <thead className="border-b border-white/10 text-white/60">
                                {activeTab === 'reports' && (
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Target</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Reporter</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Reason</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                                    </tr>
                                )}
                                {activeTab === 'violations' && (
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">User</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Flagged Content</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Severity</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Time</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Detection</th>
                                    </tr>
                                )}
                                {activeTab === 'offenders' && (
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">User</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Total Strikes</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Management</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="px-6 py-20 text-center text-white/40">
                                        <InfinityLoader fullScreen={false} size="md" text="Loading data..." />
                                    </td></tr>
                                ) : (activeTab === 'reports' ? reports : activeTab === 'violations' ? violations : offenders).length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-20 text-center text-white/30 italic">No {activeTab} found.</td></tr>
                                ) : (
                                    (activeTab === 'reports' ? reports : activeTab === 'violations' ? violations : offenders).map(item => (
                                        <tr key={item.id || item.user_id} className="hover:bg-white/[0.02] transition-colors group">
                                            {/* --- USER REPORTS TAB --- */}
                                            {activeTab === 'reports' && (
                                                <>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-medium">{item.reported?.profiles?.name || 'Unknown User'}</span>
                                                            <span className="text-[10px] text-white/40 uppercase font-black mt-0.5 tracking-tighter">{item.item_type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-white/60">{item.reporter?.profiles?.name || 'Anonymous'}</td>
                                                    <td className="px-6 py-5 max-w-xs truncate text-white/50">{item.reason}</td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                                            item.status === 'PENDING' ? 'bg-red-500/10 text-red-500' : 
                                                            item.status === 'INVESTIGATING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleResolve(item, 'ACTION_TAKEN')} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg" title="Ban / Remove"><XCircle size={18} /></button>
                                                            <button onClick={() => handleResolve(item, 'DISMISSED')} className="p-2 hover:bg-white/10 text-white/40 rounded-lg" title="Dismiss"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}

                                            {/* --- AI VIOLATIONS TAB --- */}
                                            {activeTab === 'violations' && (
                                                <>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <img src={item.user?.avatar_url || '/placeholder.png'} className="w-8 h-8 rounded-full border border-white/10" />
                                                            <span className="text-white font-medium">{item.user?.name || 'System User'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <code className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
                                                            {item.message || 'Blocked Attempt'}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                            item.severity === 'HIGH' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
                                                        }`}>
                                                            {item.severity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-white/40 text-xs">
                                                        {new Date(item.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <span className="text-[10px] font-bold text-white/20 uppercase">AI-MOD-LAMA3</span>
                                                    </td>
                                                </>
                                            )}

                                            {/* --- REPEAT OFFENDERS TAB --- */}
                                            {activeTab === 'offenders' && (
                                                <>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <img src={item.avatar_url || '/placeholder.png'} className="w-8 h-8 rounded-full border border-white/10" />
                                                            <span className="text-white font-medium">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-black ${item.warning_count >= 3 ? 'text-red-500' : 'text-amber-500'}`}>
                                                                {item.warning_count} / 5
                                                            </span>
                                                            <div className="flex gap-0.5">
                                                                {[1,2,3,4,5].map(s => (
                                                                    <div key={s} className={`w-1 h-3 rounded-full ${s <= item.warning_count ? (s >= 5 ? 'bg-red-500' : 'bg-amber-500') : 'bg-white/10'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                                            item.is_banned ? 'bg-red-500 text-white' : 
                                                            item.is_restricted ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/10 text-green-500'
                                                        }`}>
                                                            {item.is_banned ? 'BANNED' : item.is_restricted ? 'RESTRICTED' : 'ACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {item.is_banned ? (
                                                                <button onClick={() => handleManualAction(item.user_id, 'UNBAN')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-bold hover:bg-green-500/20 transition-all uppercase">
                                                                    <UserCheck size={12} /> Restore
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => handleManualAction(item.user_id, 'CLEAR_STRIKES')} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-[10px] font-bold hover:text-white" title="Reset Strikes">
                                                                        Reset
                                                                    </button>
                                                                    <button onClick={() => handleManualAction(item.user_id, 'BAN')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold hover:bg-red-500/20 transition-all uppercase">
                                                                        <UserX size={12} /> Permaban
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </motion.table>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ModerationPage;
