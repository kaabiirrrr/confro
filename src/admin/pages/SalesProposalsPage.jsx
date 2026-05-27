import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, XCircle, Trash2, Edit3, Sparkles, X, Plus, Search, Filter, RefreshCw, FileDown } from 'lucide-react';
import { getAdminSalesProposals, updateSalesProposalStatus, deleteSalesProposal } from '../../services/apiService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { exportTableToPDF } from '../utils/exportPDF';
import InfinityLoader from '../../components/common/InfinityLoader';

const SalesProposalsPage = () => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // Modal states
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [actionData, setActionData] = useState({
        status: 'REVIEWED',
        admin_comment: '',
        custom_price: '',
        custom_connects: '',
        custom_duration: 'monthly',
        custom_features: ''
    });
    const [submittingAction, setSubmittingAction] = useState(false);

    useEffect(() => {
        loadProposals();
    }, [filterStatus]);

    const loadProposals = async () => {
        try {
            setLoading(true);
            const data = await getAdminSalesProposals(filterStatus);
            if (data.success) {
                setProposals(data.data || []);
            } else {
                toast.error('Failed to load proposals.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching proposals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this custom proposal request?')) return;
        try {
            const data = await deleteSalesProposal(id);
            if (data.success) {
                toast.success('Proposal request deleted.');
                loadProposals();
            } else {
                toast.error('Failed to delete.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error deleting proposal');
        }
    };

    const handleOpenActionModal = (proposal) => {
        setSelectedProposal(proposal);
        setActionData({
            status: proposal.status || 'REVIEWED',
            admin_comment: proposal.admin_comment || '',
            custom_price: proposal.custom_price || '',
            custom_connects: proposal.custom_connects || '',
            custom_duration: proposal.custom_duration || 'monthly',
            custom_features: proposal.custom_features ? proposal.custom_features.join('\n') : ''
        });
        setIsActionModalOpen(true);
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        setSubmittingAction(true);

        const featuresArray = actionData.custom_features
            .split('\n')
            .map(f => f.trim())
            .filter(f => f !== '');

        const payload = {
            status: actionData.status,
            admin_comment: actionData.admin_comment,
            custom_price: actionData.custom_price ? parseFloat(actionData.custom_price) : null,
            custom_connects: actionData.custom_connects ? parseInt(actionData.custom_connects) : null,
            custom_duration: actionData.custom_duration,
            custom_features: featuresArray.length > 0 ? featuresArray : null
        };

        try {
            const data = await updateSalesProposalStatus(selectedProposal.id, payload);
            if (data.success) {
                toast.success('Proposal request updated successfully!');
                setIsActionModalOpen(false);
                loadProposals();
            } else {
                toast.error(data.message || 'Failed to update proposal.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error updating proposal.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider shrink-0">
                        <Clock size={10} /> Pending
                    </span>
                );
            case 'REVIEWED':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider shrink-0">
                        <Sparkles size={10} /> Proposed
                    </span>
                );
            case 'RESOLVED':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0">
                        <CheckCircle2 size={10} /> Accepted
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider shrink-0">
                        <XCircle size={10} /> Rejected
                    </span>
                );
            default:
                return null;
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

    const filteredProposals = proposals.filter(p => {
        const matchSearch = p.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.needs.toLowerCase().includes(searchQuery.toLowerCase());
        const d = p.created_at ? new Date(p.created_at) : null;
        const matchFrom = !dateFrom || (d && d >= new Date(dateFrom));
        const matchTo = !dateTo || (d && d <= new Date(dateTo + 'T23:59:59'));
        return matchSearch && matchFrom && matchTo;
    });

    const handleExportPDF = () => {
        if (filteredProposals.length === 0) { toast.error('No proposals to export'); return; }
        exportTableToPDF({
            title: 'Custom Proposals Requests',
            columns: ['Email', 'Status', 'Custom Price', 'Connects', 'Duration', 'Submitted'],
            rows: filteredProposals.map(p => [
                p.profile?.name ? `${p.profile.name} (${p.email})` : p.email,
                p.status || '—',
                p.custom_price ? `₹${p.custom_price}` : '—',
                p.custom_connects || '—',
                p.custom_duration || '—',
                p.created_at ? new Date(p.created_at).toLocaleDateString() : '—',
            ]),
            filename: 'sales_proposals',
            filters: {
                Status: filterStatus || 'All',
                ...(searchQuery && { Search: searchQuery }),
                ...(dateFrom && { From: dateFrom }),
                ...(dateTo && { To: dateTo }),
            },
        });
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-transparent">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                            <FileText size={24} className="text-accent" /> Custom Proposals Requests
                        </h1>
                        <p className="text-white/40 text-xs mt-1">
                            View custom plans requests submitted by enterprise users and create specialized proposals for them
                        </p>
                    </div>
                    {/* Mobile-only Refresh Button */}
                    <button
                        onClick={loadProposals}
                        className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center text-white/40 hover:text-accent transition-all group"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 w-full mb-6">
                {/* Status Tabs (Underlined, flat styled like Reference Image) */}
                <div className="flex overflow-x-auto gap-8 pt-2 no-scrollbar">
                    {[
                        { id: '', label: 'All Requests' },
                        { id: 'PENDING', label: 'Pending' },
                        { id: 'REVIEWED', label: 'Proposed' },
                        { id: 'RESOLVED', label: 'Accepted' },
                        { id: 'REJECTED', label: 'Rejected' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`pb-3 text-xs font-bold uppercase tracking-wider relative transition-all whitespace-nowrap cursor-pointer ${
                                filterStatus === tab.id
                                    ? 'text-accent'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {filterStatus === tab.id && (
                                <motion.div 
                                    layoutId="activeSalesTabUnderline" 
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" 
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Dates & Export */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pb-3">
                    {/* Dates */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            title="From date"
                            className="flex-1 sm:flex-none bg-transparent border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-accent transition-all sm:w-36"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            title="To date"
                            className="flex-1 sm:flex-none bg-transparent border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-accent transition-all sm:w-36"
                        />
                    </div>
                    {/* Export */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleExportPDF}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                        >
                            <FileDown size={14} />
                            Export PDF
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
                        placeholder="Search by email or needs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 bg-transparent border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-all shadow-inner"
                    />
                </div>
                <button
                    onClick={loadProposals}
                    className="hidden md:flex flex-shrink-0 w-12 h-12 items-center justify-center text-white/40 hover:text-accent transition-all group"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <InfinityLoader fullScreen={false} text="Fetching proposal requests…" />
                </div>
            ) : filteredProposals.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.01]">
                    <AlertCircle className="mx-auto text-white/25 mb-3" size={32} />
                    <p className="text-white/30 text-sm font-medium">No custom proposals found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className="bg-transparent border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all duration-200"
                        >
                            <div className="border-b border-white/5 pb-4 mb-4">
                                {/* Row: avatar + name/email | edit + delete */}
                                <div className="flex items-center justify-between gap-3">
                                    {/* Left: avatar + name/email */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {proposal.profile?.avatar_url ? (
                                            <img
                                                src={proposal.profile.avatar_url}
                                                alt={proposal.profile.name || proposal.email}
                                                className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0 self-center"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0 self-center">
                                                {(proposal.profile?.name || proposal.email || '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex flex-col justify-center gap-0.5">
                                            {proposal.profile?.name && (
                                                <p className="text-sm font-bold text-white leading-none truncate">{proposal.profile.name}</p>
                                            )}
                                            <p className={`leading-none truncate ${proposal.profile?.name ? 'text-[11px] text-white/40' : 'text-sm font-bold text-white'}`}>
                                                {proposal.email}
                                            </p>
                                            <span className="text-[10px] text-white/30 leading-none">
                                                Submitted on: {formatDate(proposal.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Right: edit + delete inline */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleOpenActionModal(proposal)}
                                            className="p-1.5 text-white/50 hover:text-accent transition-colors"
                                            title="Update & Custom Offer"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(proposal.id)}
                                            className="p-1.5 text-white/50 hover:text-rose-400 transition-colors"
                                            title="Delete Request"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-[9px] font-black uppercase tracking-wider text-white/25 mb-1.5">Organizational Needs</h4>
                                    <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{proposal.needs}</p>
                                </div>

                                {proposal.admin_comment && (
                                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 mt-2">
                                        <h4 className="text-[9px] font-black uppercase tracking-wider text-accent mb-1.5">Admin Comment</h4>
                                        <p className="text-xs text-white/60 leading-relaxed">{proposal.admin_comment}</p>
                                    </div>
                                )}

                                {proposal.custom_price && (
                                    <div className="bg-accent/5 border border-accent/15 rounded-xl p-4 mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-white/25 block mb-1">Proposed Price</span>
                                            <span className="text-sm font-bold text-accent">₹{proposal.custom_price}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-white/25 block mb-1">Connects Credits</span>
                                            <span className="text-sm font-bold text-white">{proposal.custom_connects}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-white/25 block mb-1">Billing Term</span>
                                            <span className="text-sm font-bold text-white uppercase">{proposal.custom_duration}</span>
                                        </div>
                                        {proposal.accepted_at && (
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-white/25 block mb-1">Accepted Date</span>
                                                <span className="text-xs font-semibold text-emerald-400">{formatDate(proposal.accepted_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {proposal.custom_features && proposal.custom_features.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="text-[9px] font-black uppercase tracking-wider text-white/25 mb-1">Features Offered</h4>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {proposal.custom_features.map((feature, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/5 text-white/60">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status badge — bottom right */}
                                <div className="flex justify-end pt-2">
                                    {getStatusBadge(proposal.status)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action / Proposal Builder Modal */}
            <AnimatePresence>
                {isActionModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ y: -50, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: -50, scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg border border-white/10 rounded-xl p-6 shadow-2xl bg-secondary overflow-y-auto max-h-[90vh]"
                        >
                            <button
                                onClick={() => setIsActionModalOpen(false)}
                                className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-accent transition-colors"
                            >
                                <X size={16} />
                            </button>

                            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                                <Sparkles size={16} className="text-accent" /> Update Custom Proposal
                            </h2>
                            <p className="text-[10px] text-white/30 mb-5">Set status, leave notes, or construct a custom plan offer.</p>

                            <form onSubmit={handleActionSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Status</label>
                                    <CustomDropdown
                                        options={[
                                            { label: 'Pending', value: 'PENDING' },
                                            { label: 'Proposed', value: 'REVIEWED' },
                                            { label: 'Rejected', value: 'REJECTED' }
                                        ]}
                                        value={actionData.status}
                                        onChange={(val) => setActionData({ ...actionData, status: val })}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Admin Comment / Response</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:border-accent/50 outline-none transition-all placeholder:text-white/20 resize-none"
                                        placeholder="Add response details, reasons, or pricing instructions..."
                                        value={actionData.admin_comment}
                                        onChange={(e) => setActionData({ ...actionData, admin_comment: e.target.value })}
                                    />
                                </div>

                                <div className="border-t border-white/5 pt-4">
                                    <h3 className="text-xs font-bold text-accent mb-3 flex items-center gap-1.5">
                                        <Plus size={14} /> Custom Plan Builder (Optional)
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Custom Price (₹)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:border-accent/50 outline-none transition-all placeholder:text-white/20"
                                                placeholder="999"
                                                value={actionData.custom_price}
                                                onChange={(e) => setActionData({ ...actionData, custom_price: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Connects Credits</label>
                                            <input
                                                type="number"
                                                className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:border-accent/50 outline-none transition-all placeholder:text-white/20"
                                                placeholder="150"
                                                value={actionData.custom_connects}
                                                onChange={(e) => setActionData({ ...actionData, custom_connects: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Duration</label>
                                            <CustomDropdown
                                                options={[
                                                    { label: 'Monthly', value: 'monthly' },
                                                    { label: 'Yearly', value: 'yearly' }
                                                ]}
                                                value={actionData.custom_duration}
                                                onChange={(val) => setActionData({ ...actionData, custom_duration: val })}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 pl-1 block mb-1.5">Features Included (One per line)</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-secondary border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:border-accent/50 outline-none transition-all placeholder:text-white/20 resize-none"
                                            placeholder={"150 Connects per month\nCustom Profile Badges\nFeatured Proposals"}
                                            value={actionData.custom_features}
                                            onChange={(e) => setActionData({ ...actionData, custom_features: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsActionModalOpen(false)}
                                        className="px-5 py-2 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingAction}
                                        className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center gap-1.5"
                                    >
                                        {submittingAction ? (
                                            <span className="w-3.5 h-3.5 border border-white/25 border-t-white rounded-full animate-spin"></span>
                                        ) : 'Save Updates'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SalesProposalsPage;
