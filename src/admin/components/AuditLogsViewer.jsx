import { useState, useEffect } from 'react';
import { FileText, Search, FileDown, RefreshCw } from 'lucide-react';
import InfinityLoader from '../../components/common/InfinityLoader';
import { fetchRBACLogs } from '../../services/adminService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { exportTableToPDF } from '../utils/exportPDF';

const AuditLogsViewer = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const response = await fetchRBACLogs();
            if (response.success && response.data && response.data.length > 0) {
                setLogs(response.data);
            } else {
                setLogs([]);
            }
        } catch (err) {
            setError('Failed to fetch audit logs');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            log.action.toLowerCase().includes(searchLower) ||
            log.admins?.name?.toLowerCase().includes(searchLower) ||
            log.admins?.email?.toLowerCase().includes(searchLower) ||
            (log.target_resource && log.target_resource.toLowerCase().includes(searchLower))
        );
        if (!matchesSearch) return false;

        if (log.created_at) {
            const d = new Date(log.created_at);
            if (dateFrom && new Date(dateFrom + 'T00:00:00') > d) return false;
            if (dateTo && new Date(dateTo + 'T23:59:59') < d) return false;
        } else if (dateFrom || dateTo) {
            return false;
        }
        return true;
    });

    const handleExportPDF = () => {
        if (filteredLogs.length === 0) {
            toast.error('No audit logs to export');
            return;
        }
        exportTableToPDF({
            title: 'Compliance Audit Logs',
            columns: ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Entity/Target', 'IP Address'],
            rows: filteredLogs.map(log => [
                new Date(log.created_at).toLocaleString('en-IN'),
                log.admins?.name || 'System',
                log.admins?.email || '',
                log.action,
                log.target_resource || '-',
                log.ip_address || '-'
            ]),
            filename: 'audit_logs_export',
            filters: {
                ...(searchTerm && { Search: searchTerm }),
                ...(dateFrom && { From: dateFrom }),
                ...(dateTo && { To: dateTo })
            }
        });
    };

    return (
        <div className="animate-in fade-in pb-20">
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-accent" />
                        Compliance Audit Logs
                    </h2>
                    <p className="text-slate-400 dark:text-white/40 text-xs mt-1">Immutable record of all administrative actions for compliance and security monitoring.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Dates: Row 1 on mobile */}
                    <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            title="From Date"
                            className="flex-1 sm:flex-none bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-accent transition-all sm:w-36 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            title="To Date"
                            className="flex-1 sm:flex-none bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1.5 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-accent transition-all sm:w-36 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                    </div>
                    {/* Export: Row 2 on mobile */}
                    <div className="flex gap-3 w-full sm:w-auto order-2 sm:order-3">
                        <button 
                            onClick={handleExportPDF}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-1.5 rounded-full transition-all text-xs sm:text-sm font-bold active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                            <FileDown size={14} /> Export PDF
                        </button>
                    </div>
                    {/* Search & Refresh: Row 3 on mobile */}
                    <div className="flex items-center gap-3 w-full sm:w-auto order-3 sm:order-1">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={14} />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search logs..." 
                                className="w-full py-1.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-full pl-9 pr-4 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-accent transition-colors placeholder:text-slate-400 dark:placeholder:text-white/30 shadow-inner"
                            />
                        </div>
                        <button
                            onClick={loadLogs}
                            className="flex-shrink-0 w-9 h-9 bg-transparent rounded-full flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-accent transition group"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <InfinityLoader />
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-red-400 text-sm">{error}</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 md:py-8 text-center px-4">
                        <img 
                            src="/Icons/ChatGPT%20Image%20May%2021,%202026,%2004_52_04%20PM.png" 
                            alt="No Audit Logs" 
                            className="w-48 h-48 md:w-80 md:h-80 object-contain opacity-90 mb-4 drop-shadow-xl"
                        />
                        <p className="text-slate-800 dark:text-white text-base md:text-xl font-bold">No audit logs found</p>
                        <p className="text-slate-400 dark:text-white/40 text-xs md:text-sm mt-2 max-w-xs md:max-w-md">
                            No administrative actions have been recorded yet or match your current search filter.
                        </p>
                    </div>
                ) : (
                    <div className="min-w-[800px]">
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 dark:text-white/40 text-[10px] uppercase tracking-widest font-black border-b border-slate-200 dark:border-white/10">
                                    <th className="py-4 px-4">Timestamp</th>
                                    <th className="py-4 pr-4">Admin</th>
                                    <th className="py-4 pr-4">Action</th>
                                    <th className="py-4 pr-4">Entity/Target</th>
                                    <th className="py-4 px-4 text-right">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-4 text-slate-500 dark:text-white/60 text-xs font-medium whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="py-4 pr-4 whitespace-nowrap">
                                            <div className="text-slate-800 dark:text-white text-sm font-bold">{log.admins?.name || 'System'}</div>
                                            <div className="text-slate-400 dark:text-white/40 text-[10px]">{log.admins?.email}</div>
                                        </td>
                                        <td className="py-4 pr-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${log.action.includes('403') || log.action.includes('FAILED') ? 'bg-red-500/20 text-red-400' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 text-slate-700 dark:text-white/80 text-xs whitespace-nowrap">
                                            {log.target_resource || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-right text-slate-400 dark:text-white/40 text-xs font-mono whitespace-nowrap">
                                            {log.ip_address || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogsViewer;
