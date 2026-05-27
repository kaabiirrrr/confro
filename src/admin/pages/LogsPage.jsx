import { useState, useEffect } from 'react';
import { ScrollText, Search, Filter, History, User, Calendar, FileDown } from 'lucide-react';
import { fetchAdminLogs } from '../../services/adminService';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';
import { exportTableToPDF } from '../utils/exportPDF';

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

    const handleExportPDF = () => {
        if (logs.length === 0) { toast.error('No logs to export'); return; }
        exportTableToPDF({
            title: 'Admin Activity Logs',
            filename: 'admin_activity_logs',
            columns: ['Time', 'Admin', 'Email', 'Action', 'Target', 'Description'],
            rows: logs.map(log => [
                log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A',
                log.admin?.name || 'Admin',
                log.admin?.email || log.admin_email || '',
                log.action_type?.replace(/_/g, ' ') || '',
                log.target_id || 'N/A',
                log.description || '',
            ]),
            filters: {
                'Admin Email': filter.admin_email,
                'Action Type': filter.action_type,
                'From': filter.start_date,
                'To': filter.end_date,
            },
        });
        toast.success('PDF exported successfully');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                            <img src="/Icons/icons8-logs-64.png" alt="Admin Logs" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                            Admin Activity Logs
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs sm:text-sm mt-1 font-medium">A transparent audit trail of all administrative actions across the network</p>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
                    >
                        <FileDown size={14} /> Export PDF
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-0 bg-transparent border-none rounded-none">
                    {/* Admin Email Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20 group-focus-within:text-accent transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by admin email..."
                            value={filter.admin_email}
                            onChange={(e) => setFilter({ ...filter, admin_email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-accent transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
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
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20" size={16} />
                            <input
                                type="date"
                                value={filter.start_date}
                                onChange={(e) => setFilter({ ...filter, start_date: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-white focus:outline-none focus:border-accent transition-all [color-scheme:light] dark:[color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-4 px-1 bg-primary text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">From</span>
                        </div>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20" size={16} />
                            <input
                                type="date"
                                value={filter.end_date}
                                onChange={(e) => setFilter({ ...filter, end_date: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-white focus:outline-none focus:border-accent transition-all [color-scheme:light] dark:[color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-4 px-1 bg-primary text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest">To</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-500 dark:text-white/60 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-white/10">
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Admin Email</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-white/40">
                                    <InfinityLoader fullScreen={false} text="Loading history..."/>
                                </td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-white/40">No activity logged yet</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-slate-800 dark:text-white text-sm font-medium">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </span>
                                            <span className="text-slate-400 dark:text-white/40 text-[10px]">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shadow-sm">
                                                {log.admin?.photo_url ? (
                                                    <img src={log.admin.photo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-accent font-bold">
                                                        {(log.admin?.name || log.admin_email || 'S').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-800 dark:text-white text-sm font-medium">{log.admin?.name || 'Admin'}</span>
                                                <span className="text-slate-400 dark:text-white/40 text-[11px]">{log.admin?.email || log.admin_email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={`text-[11px] font-bold uppercase tracking-tight ${getActionColor(log.action_type)}`}>
                                                {log.action_type.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-slate-400 dark:text-white/30 text-[9px] uppercase">{log.target_type || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-slate-500 dark:text-white/40 text-xs font-mono bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">{log.target_id || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-slate-600 dark:text-white/70 text-sm max-w-sm line-clamp-2 hover:line-clamp-none transition-all cursor-default">{log.description}</p>
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
