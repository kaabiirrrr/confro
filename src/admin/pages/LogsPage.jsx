import { useState, useEffect } from 'react';
import { ScrollText, Search, Filter, History, User, Calendar } from 'lucide-react';
import { fetchAdminLogs } from '../../services/adminService';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        action_type: '',
        admin_email: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            loadLogs();
        }, 150);
        return () => clearTimeout(timer);
    }, [filter]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const response = await fetchAdminLogs(filter);
            setLogs(response.data);
        } catch (error) {
            console.error('Logs error:', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (type) => {
        if (type.includes('DELETE') || type.includes('REMOVE')) return 'text-red-400';
        if (type.includes('UPDATE') || type.includes('CHANGE')) return 'text-yellow-400';
        if (type.includes('CREATE') || type.includes('ADD')) return 'text-green-400';
        return 'text-blue-400';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 sm:gap-4 tracking-tight">
                            <img src="/Icons/icons8-logs-64.png" alt="Admin Logs" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                            Admin Activity Logs
                        </h1>
                        <p className="text-white/40 text-xs sm:text-sm mt-1 font-medium">A transparent audit trail of all administrative actions across the network</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/[0.02] border border-white/5 p-4 sm:p-6 rounded-[24px] backdrop-blur-md">
                    {/* Admin Email Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by admin email..."
                            value={filter.admin_email}
                            onChange={(e) => setFilter({ ...filter, admin_email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-accent focus:bg-white/[0.08] transition-all placeholder:text-white/20"
                        />
                    </div>

                    {/* Action Type Filter */}
                    <div className="w-full">
                        <CustomDropdown
                            options={[
                                { label: 'All Actions', value: '' },
                                { label: 'Manage Admins', value: 'ADMIN_ADD' },
                                { label: 'Verification', value: 'VERIFICATION_UPDATE' },
                                { label: 'Withdrawals', value: 'WITHDRAWAL_PROCESS' },
                                { label: 'Settings', value: 'SETTINGS_UPDATE' },
                                { label: 'Job Deletions', value: 'JOB_DELETE' }
                            ]}
                            value={filter.action_type}
                            onChange={(val) => setFilter({ ...filter, action_type: val })}
                            variant="transparent"
                            className="w-full"
                        />
                    </div>

                    {/* Date Filters */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input
                                type="date"
                                value={filter.start_date}
                                onChange={(e) => setFilter({ ...filter, start_date: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-white focus:outline-none focus:border-accent transition-all [color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-4 px-1 bg-[#0A0F1E] text-[9px] font-black text-white/30 uppercase tracking-widest">From</span>
                        </div>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input
                                type="date"
                                value={filter.end_date}
                                onChange={(e) => setFilter({ ...filter, end_date: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-white focus:outline-none focus:border-accent transition-all [color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-4 px-1 bg-[#0A0F1E] text-[9px] font-black text-white/30 uppercase tracking-widest">To</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-white/60 text-xs uppercase tracking-wider font-semibold border-b border-white/10">
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Admin Email</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40">
                                    <InfinityLoader fullScreen={false} size="md" text="Loading history..." />
                                </td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40">No activity logged yet</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </span>
                                            <span className="text-white/40 text-[10px]">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shadow-lg shadow-black/20">
                                                {log.admin?.photo_url ? (
                                                    <img src={log.admin.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-accent font-bold">
                                                        {(log.admin?.name || log.admin_email || 'S').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-medium">{log.admin?.name || 'Admin'}</span>
                                                <span className="text-white/40 text-[11px]">{log.admin?.email || log.admin_email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={`text-[11px] font-bold uppercase tracking-tight ${getActionColor(log.action_type)}`}>
                                                {log.action_type.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-white/30 text-[9px] uppercase">{log.target_type || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-white/40 text-xs font-mono bg-white/5 px-2 py-1 rounded">{log.target_id || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white/70 text-sm max-w-sm line-clamp-2 hover:line-clamp-none transition-all cursor-default">{log.description}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;
