import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Search } from 'lucide-react';
import InfinityLoader from '../../components/common/InfinityLoader';
import { fetchRBACLogs } from '../../services/adminService';
import { formatDistanceToNow } from 'date-fns';

const AuditLogsViewer = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
        return (
            log.action.toLowerCase().includes(searchLower) ||
            log.admins?.name?.toLowerCase().includes(searchLower) ||
            log.admins?.email?.toLowerCase().includes(searchLower) ||
            (log.target_resource && log.target_resource.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="animate-in fade-in pb-20">
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText size={20} className="text-accent" />
                        Compliance Audit Logs
                    </h2>
                    <p className="text-white/40 text-xs mt-1">Immutable record of all administrative actions for compliance and security monitoring.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search logs..." 
                            className="w-full sm:w-64 h-10 bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 text-white text-xs focus:outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none justify-center h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer">
                            <Filter size={14} /> Filter
                        </button>
                        <button className="flex-1 sm:flex-none justify-center h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer">
                            <Download size={14} /> Export CSV
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
                        <p className="text-white text-base md:text-xl font-bold">No audit logs found</p>
                        <p className="text-white/40 text-xs md:text-sm mt-2 max-w-xs md:max-w-md">
                            No administrative actions have been recorded yet or match your current search filter.
                        </p>
                    </div>
                ) : (
                    <div className="min-w-[800px]">
                    <div className="border border-white/10 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-white/40 text-[10px] uppercase tracking-widest font-black border-b border-white/10">
                                    <th className="py-4 px-4">Timestamp</th>
                                    <th className="py-4 pr-4">Admin</th>
                                    <th className="py-4 pr-4">Action</th>
                                    <th className="py-4 pr-4">Entity/Target</th>
                                    <th className="py-4 px-4 text-right">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-4 text-white/60 text-xs font-medium whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="py-4 pr-4 whitespace-nowrap">
                                            <div className="text-white text-sm font-bold">{log.admins?.name || 'System'}</div>
                                            <div className="text-white/40 text-[10px]">{log.admins?.email}</div>
                                        </td>
                                        <td className="py-4 pr-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${log.action.includes('403') || log.action.includes('FAILED') ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 text-white/80 text-xs whitespace-nowrap">
                                            {log.target_resource || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-right text-white/40 text-xs font-mono whitespace-nowrap">
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
