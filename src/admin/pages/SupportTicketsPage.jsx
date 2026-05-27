import React, { useState, useEffect, useCallback } from 'react';
import { Download, CheckCircle, Clock, Filter, Mail, User, Tag, Eye, UserPlus, AlertCircle, FileDown, Search, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllTicketsAdmin, updateTicketStatusAdmin, assignTicketAdmin } from '../../services/supportService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';
import { exportTableToPDF } from '../utils/exportPDF';

const SupportTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const loadTickets = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchAllTicketsAdmin({ status: statusFilter });
            if (result.success) {
                setTickets(result.data);
            }
        } catch (error) {
            console.error('Error loading tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const result = await updateTicketStatusAdmin(id, newStatus);
            if (result.success) {
                toast.success(`Ticket marked as ${newStatus}`);
                setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            toast.error('Failed to update ticket status');
        }
    };

    const handleAssign = async (id) => {
        try {
            const result = await assignTicketAdmin(id);
            if (result.success) {
                toast.success('Ticket assigned to you');
                loadTickets(); // Refresh to get admin info
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign ticket');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleExportPDF = () => {
        const result = tickets.filter(t => {
            const d = new Date(t.created_at);
            if (dateFrom && d < new Date(dateFrom)) return false;
            if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
            return true;
        });
        if (result.length === 0) { toast.error('No data to export'); return; }
        exportTableToPDF({
            title: 'Support Tickets',
            filename: 'support_tickets',
            columns: ['User', 'Email', 'Subject', 'Category', 'Priority', 'Status', 'Date'],
            rows: result.map(t => [
                t.profiles?.name || 'Unknown',
                t.profiles?.email || 'N/A',
                t.subject || '',
                t.category || '',
                t.priority || '',
                t.status?.replace('_', ' ') || '',
                new Date(t.created_at).toLocaleDateString()
            ]),
            filters: { Status: statusFilter === 'all' ? 'All' : statusFilter, From: dateFrom || '—', To: dateTo || '—' }
        });
        toast.success('PDF exported');
    };

    const filteredTickets = tickets.filter(t => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            (t.profiles?.name || '').toLowerCase().includes(q) ||
            (t.profiles?.email || '').toLowerCase().includes(q) ||
            (t.subject || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between w-full md:w-auto"
                >
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <img src="/Icons/icons8-question-mark-100.png" alt="Support Tickets" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                            Support Tickets
                        </h1>
                        <p className="text-white/40 text-xs mt-1">Manage and resolve user-submitted help and support requests.</p>
                    </div>
                    {/* Mobile-only Refresh Button */}
                    <button
                        onClick={loadTickets}
                        className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center text-white/40 hover:text-accent transition-all group"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </motion.div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    {/* Dates: Row 1 on mobile */}
                    <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                        <div className="relative flex-1 sm:w-36">
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                className="w-full h-10 px-3 bg-transparent border border-white/10 rounded-xl text-xs text-white/70 focus:outline-none focus:border-accent [color-scheme:dark]" />
                            <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-white/30 uppercase tracking-widest">From</span>
                        </div>
                        <div className="relative flex-1 sm:w-36">
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                className="w-full h-10 px-3 bg-transparent border border-white/10 rounded-xl text-xs text-white/70 focus:outline-none focus:border-accent [color-scheme:dark]" />
                            <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-white/30 uppercase tracking-widest">To</span>
                        </div>
                    </div>

                    {/* CustomDropdown & Export: Row 2 on mobile */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-2 sm:order-3">
                        <div className="w-full sm:w-auto sm:flex-initial">
                            <CustomDropdown
                                options={[
                                    { label: 'All Status', value: 'all' },
                                    { label: 'Pending', value: 'pending' },
                                    { label: 'In Progress', value: 'in_progress' },
                                    { label: 'Resolved', value: 'resolved' },
                                    { label: 'Rejected', value: 'rejected' }
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                variant="transparent"
                                className="w-full sm:w-44"
                            />
                        </div>
                        <button onClick={handleExportPDF}
                            className="w-full sm:w-auto sm:flex-initial flex items-center justify-center gap-2 h-10 px-4 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0">
                            <FileDown size={14} /> Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar Row */}
            <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 bg-transparent border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-all shadow-inner"
                    />
                </div>
                <button
                    onClick={loadTickets}
                    className="hidden md:flex flex-shrink-0 w-12 h-12 items-center justify-center text-white/40 hover:text-accent transition-all group"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>

            {/* Mobile Card List — only visible on mobile */}
            <div className="sm:hidden space-y-2">
                {loading ? (
                    <div className="py-12 flex justify-center">
                        <InfinityLoader fullScreen={false} text="Loading tickets..."/>
                    </div>
                ) : tickets.length === 0 ? (
                    <p className="text-center text-white/40 py-12 font-medium">No support tickets found.</p>
                ) : (
                    filteredTickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => navigate(`/admin/support-tickets/${ticket.id}`)}
                            className="flex items-center gap-3 px-4 py-3 border border-white/10 rounded-xl bg-white/[0.02] active:bg-white/[0.05] transition-colors cursor-pointer"
                        >
                            {/* Avatar */}
                            {ticket.profiles?.avatar_url ? (
                                <img
                                    src={ticket.profiles.avatar_url}
                                    alt={ticket.profiles.name}
                                    className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 flex-shrink-0">
                                    <User size={14} />
                                </div>
                            )}

                            {/* Name + Subject */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate leading-tight">
                                    {ticket.profiles?.name || 'Unknown User'}
                                </p>
                                <p className="text-white/40 text-[10px] truncate leading-tight">
                                    {ticket.subject}
                                </p>
                            </div>

                            {/* Priority */}
                            <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest ${
                                ticket.priority === 'high' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                                {ticket.priority}
                            </span>

                            {/* Status badge */}
                            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                ticket.status === 'resolved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : ticket.status === 'in_progress'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : ticket.status === 'rejected'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                                {ticket.status === 'resolved' ? <CheckCircle size={8} /> : <Clock size={8} />}
                                {ticket.status.replace('_', ' ')}
                            </span>

                            {/* View arrow */}
                            <Eye size={14} className="flex-shrink-0 text-white/30" />
                        </motion.div>
                    ))
                )}
            </div>

            {/* Desktop Table — hidden on mobile */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden sm:block bg-transparent border border-white/10 rounded-xl overflow-hidden"
            >
                <div className="overflow-x-auto admin-table-wrap">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-white/50 text-[11px] font-black uppercase tracking-widest border-b border-white/10">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-white/40">
                                            <InfinityLoader fullScreen={false} text="Loading tickets..."/>
                                        </td>
                                    </tr>
                                ) : tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-white/40 font-medium">
                                            No support tickets found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <motion.tr
                                            key={ticket.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            layout
                                            className="hover:bg-white/[0.03] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {ticket.profiles?.avatar_url ? (
                                                        <img 
                                                            src={ticket.profiles.avatar_url} 
                                                            alt={ticket.profiles.name} 
                                                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                                                            <User size={18} />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-semibold text-sm group-hover:text-accent transition-colors">
                                                            {ticket.profiles?.name || 'Unknown User'}
                                                        </span>
                                                        <span className="text-white/40 text-[11px] flex items-center gap-1">
                                                            <Mail size={10} />
                                                            {ticket.profiles?.email || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${
                                                        ticket.priority === 'high' 
                                                            ? 'text-red-400' 
                                                            : ticket.priority === 'normal'
                                                            ? 'text-blue-400'
                                                            : 'text-white/40'
                                                    }`}>
                                                        {ticket.priority}
                                                    </span>
                                                    {ticket.escalated && (
                                                        <span className="text-[9px] text-red-500/80 font-bold flex items-center gap-1">
                                                            <AlertCircle size={10} />
                                                            ESCALATED (&gt;48h)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs cursor-pointer" onClick={() => navigate(`/admin/support-tickets/${ticket.id}`)}>
                                                    <h3 className="text-white text-sm font-bold mb-0.5 line-clamp-1 group-hover:text-accent transition-colors">{ticket.subject}</h3>
                                                    <div className="flex items-center gap-2">
                                                         <span className="text-white/40 text-[10px] font-bold uppercase">{ticket.category}</span>
                                                         <span className="text-white/20">•</span>
                                                         <span className="text-white/40 text-[10px]">{formatDate(ticket.created_at).split(',')[0]}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                                                    ticket.status === 'resolved'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : ticket.status === 'in_progress'
                                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        : ticket.status === 'rejected'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {ticket.status === 'resolved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {ticket.assigned_admin ? (
                                                    <div className="flex items-center gap-2">
                                                        {ticket.assigned_admin.avatar_url ? (
                                                            <img src={ticket.assigned_admin.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                                                                <User size={12} />
                                                            </div>
                                                        )}
                                                        <span className="text-white/70">{ticket.assigned_admin.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-white/20 italic text-xs">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/support-tickets/${ticket.id}`)}
                                                        className="p-2 text-white/40 hover:text-white transition-colors active:scale-95 group/btn"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                    
                                                    {!ticket.assigned_to && (
                                                        <button
                                                            onClick={() => handleAssign(ticket.id)}
                                                            className="p-2 text-white/40 hover:text-accent transition-colors active:scale-95 group/btn"
                                                            title="Assign to Me"
                                                        >
                                                            <UserPlus size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    )}

                                                    {ticket.status !== 'resolved' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                                                            className="p-2 text-white/40 hover:text-emerald-400 transition-colors active:scale-95 group/btn"
                                                            title="Mark as Resolved"
                                                        >
                                                            <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default SupportTicketsPage;
