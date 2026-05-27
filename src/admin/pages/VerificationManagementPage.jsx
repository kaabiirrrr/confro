import { useState, useEffect, useCallback } from 'react';
import {
    ShieldCheck, RefreshCw, Search, Eye, Check, X,
    Mail, Clock, AlertCircle, FileText, ChevronDown, FileDown
} from 'lucide-react';
import {
    getVerificationList, adminApproveVerification,
    adminRejectVerification, sendVerificationReminder
} from '../../services/apiService';
import toast from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';
import { exportTableToPDF } from '../utils/exportPDF';

const TABS = ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'];

const TAB_LABELS = {
    NOT_SUBMITTED: 'Not Submitted',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

const TAB_COLORS = {
    NOT_SUBMITTED: 'text-slate-400 border-slate-400',
    PENDING: 'text-yellow-400 border-yellow-400',
    APPROVED: 'text-emerald-400 border-emerald-400',
    REJECTED: 'text-red-400 border-red-400',
};

const BADGE_STYLES = {
    NOT_SUBMITTED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${BADGE_STYLES[status] || BADGE_STYLES.PENDING}`}>
        {TAB_LABELS[status] || status}
    </span>
);

const Avatar = ({ name, url }) => url ? (
    <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover bg-white/10 shrink-0" />
) : (
    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-bold uppercase shrink-0">
        {(name || '?').charAt(0)}
    </div>
);

export default function VerificationManagementPage({ role }) {
    const [tab, setTab] = useState('NOT_SUBMITTED');
    const [allData, setAllData] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [reminderLoading, setReminderLoading] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const isClient = role === 'CLIENT';
    const accentColor = isClient ? 'text-accent' : 'text-blue-400';

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getVerificationList(role, 'ALL');
            setAllData(res.data || []);
            setStats(res.stats || {});
        } catch {
            toast.error(`Failed to load ${role.toLowerCase()} verifications`);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => { load(); }, [load]);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const filtered = allData.filter(u => {
        if (u.status !== tab) return false;
        const q = search.toLowerCase();
        const matchesSearch = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;

        const dateStr = tab === 'NOT_SUBMITTED' ? u.profile_created_at : u.submitted_at;
        if (dateStr) {
            const d = new Date(dateStr);
            if (dateFrom && new Date(dateFrom + 'T00:00:00') > d) return false;
            if (dateTo && new Date(dateTo + 'T23:59:59') < d) return false;
        } else if (dateFrom || dateTo) {
            return false;
        }
        return true;
    });

    const handleExportPDF = () => {
        if (filtered.length === 0) {
            toast.error('No verification records to export');
            return;
        }
        const columns = tab === 'NOT_SUBMITTED'
            ? ['Name', 'Email', 'Role', 'Joined', 'Last Reminder']
            : tab === 'REJECTED'
            ? ['Name', 'Email', 'Role', 'Status', 'Doc Type', 'Submitted', 'Reviewed', 'Reason']
            : ['Name', 'Email', 'Role', 'Status', 'Doc Type', 'Submitted', 'Reviewed'];

        const rows = filtered.map(u => {
            if (tab === 'NOT_SUBMITTED') {
                return [
                    u.name || '—',
                    u.email,
                    u.role || role,
                    formatDate(u.profile_created_at),
                    u.last_reminder_sent_at ? formatDate(u.last_reminder_sent_at) : 'Never'
                ];
            } else {
                const base = [
                    u.name || '—',
                    u.email,
                    u.role || role,
                    TAB_LABELS[u.status] || u.status,
                    u.document_type || '—',
                    formatDate(u.submitted_at),
                    formatDate(u.updated_at)
                ];
                if (tab === 'REJECTED') {
                    base.push(u.admin_notes || '—');
                }
                return base;
            }
        });

        exportTableToPDF({
            title: `${isClient ? 'Client' : 'Freelancer'} Verification - ${TAB_LABELS[tab]}`,
            columns,
            rows,
            filename: `${isClient ? 'client' : 'freelancer'}_verification_${tab.toLowerCase()}_export`,
            filters: {
                Tab: TAB_LABELS[tab],
                ...(search && { Search: search }),
                ...(dateFrom && { From: dateFrom }),
                ...(dateTo && { To: dateTo }),
            }
        });
    };

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            await adminApproveVerification(id);
            toast.success('Verification approved');
            setSelected(null);
            load();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        if (!rejectNotes.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        setActionLoading(true);
        try {
            await adminRejectVerification(id, rejectNotes);
            toast.success('Verification rejected');
            setSelected(null);
            setRejectNotes('');
            load();
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReminder = async (user) => {
        setReminderLoading(user.user_id);
        try {
            await sendVerificationReminder(user.user_id, role);
            toast.success(`Reminder sent to ${user.email}`);
            load();
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to send reminder';
            toast.error(msg);
        } finally {
            setReminderLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div>
                        <h1 className={`text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3`}>
                            <ShieldCheck className={accentColor} size={24} />
                            {isClient ? 'Client' : 'Freelancer'} Verification
                        </h1>
                        <p className="text-white/40 text-xs mt-1">
                            Manage identity verification for all {role.toLowerCase()}s
                        </p>
                    </div>
                    {/* Mobile-only Refresh Button */}
                    <button
                        onClick={load}
                        className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center text-white/40 hover:text-accent transition-all group"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </div>

                {/* Date pickers + Export PDF — right side of header */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    <div className="flex gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 xl:flex-none">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                title="From Date"
                                className="w-full xl:w-36 h-10 px-3 bg-transparent border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-accent transition-all [color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-white/30 uppercase tracking-widest">From</span>
                        </div>
                        <div className="relative flex-1 xl:flex-none">
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                title="To Date"
                                className="w-full xl:w-36 h-10 px-3 bg-transparent border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-accent transition-all [color-scheme:dark]"
                            />
                            <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-white/30 uppercase tracking-widest">To</span>
                        </div>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="w-full sm:w-auto xl:flex-none h-10 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 rounded-xl transition-all text-xs font-bold active:scale-95"
                    >
                        <FileDown size={14} /> Export PDF
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { key: 'not_submitted', label: 'Not Submitted', tab: 'NOT_SUBMITTED', icon: '/Icons/icons8-user-100.png', color: 'text-slate-300', border: 'border-white/10', tint: 'invert(1) opacity(0.4)' },
                    { key: 'pending',       label: 'Pending Review', tab: 'PENDING',       icon: '/Icons/icons8-clock-80.png', color: 'text-yellow-400', border: 'border-yellow-500/20', tint: '' },
                    { key: 'approved',      label: 'Approved',       tab: 'APPROVED',      icon: '/Icons/icons8-verified-48.png', color: 'text-emerald-400', border: 'border-emerald-500/20', tint: '' },
                    { key: 'rejected',      label: 'Rejected',       tab: 'REJECTED',      icon: '/Icons/icons8-alert-96.png', color: 'text-red-400', border: 'border-red-500/20', tint: '' },
                ].map(s => (
                    <div
                        key={s.key}
                        onClick={() => setTab(s.tab)}
                        className={`cursor-pointer border ${s.border} rounded-xl p-4 sm:p-5 flex items-center gap-3 hover:bg-white/5 transition-all ${tab === s.tab ? 'ring-1 ring-white/10' : ''}`}
                    >
                        <img src={s.icon} alt={s.label} className="w-8 h-8 object-contain flex-shrink-0"
                            style={s.tint ? { filter: s.tint } : {}} />
                        <div className="min-w-0">
                            <p className={`text-xl sm:text-2xl font-black ${s.color} leading-none`}>{stats[s.key] ?? '—'}</p>
                            <p className="text-white/40 text-[10px] sm:text-xs font-medium mt-1 truncate">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 overflow-x-auto no-scrollbar">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`relative pb-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${tab === t ? TAB_COLORS[t] : 'text-white/30 hover:text-white/50'
                            }`}>
                        {TAB_LABELS[t]}
                        <span className="ml-1.5 text-[10px] opacity-60">
                            ({allData.filter(u => u.status === t).length})
                        </span>
                        {tab === t && <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${TAB_COLORS[t].replace('text-', 'bg-')}`} />}
                    </button>
                ))}
            </div>

            {/* Search Bar Row */}
            <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-full h-12 bg-transparent border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-all shadow-inner"
                    />
                </div>
                <button
                    onClick={load}
                    className="hidden md:flex flex-shrink-0 w-12 h-12 items-center justify-center text-white/40 hover:text-accent transition-all group"
                    title="Refresh"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </button>
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-white/30 text-[10px] uppercase tracking-widest">
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                {tab !== 'NOT_SUBMITTED' && <th className="px-5 py-3 font-medium">Doc Type</th>}
                                {tab !== 'NOT_SUBMITTED' && <th className="px-5 py-3 font-medium">Submitted</th>}
                                {tab !== 'NOT_SUBMITTED' && <th className="px-5 py-3 font-medium">Reviewed</th>}
                                {tab === 'NOT_SUBMITTED' && <th className="px-5 py-3 font-medium">Joined</th>}
                                {tab === 'NOT_SUBMITTED' && <th className="px-5 py-3 font-medium">Last Reminder</th>}
                                {tab === 'REJECTED' && <th className="px-5 py-3 font-medium">Reason</th>}
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr><td colSpan="6" className="py-16 text-center">
                                    <InfinityLoader fullScreen={false}/>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-2 text-white/20">
                                        <ShieldCheck size={32} />
                                        <p className="text-sm">No {TAB_LABELS[tab].toLowerCase()} users</p>
                                    </div>
                                </td></tr>
                            ) : filtered.map(u => (
                                <tr key={u.user_id} className="hover:bg-white/[0.02] transition">
                                    {/* User */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={u.name} url={u.avatar_url} />
                                            <div>
                                                <p className="text-white text-sm font-medium">{u.name || '—'}</p>
                                                <p className="text-white/30 text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Status */}
                                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                                    {/* Role */}
                                    <td className="px-5 py-4">
                                        <span className={`text-xs font-bold uppercase ${(u.role || role) === 'CLIENT' ? 'text-blue-400' : 'text-accent'}`}>
                                            {u.role || role}
                                        </span>
                                    </td>
                                    {/* Doc Type — non NOT_SUBMITTED */}
                                    {tab !== 'NOT_SUBMITTED' && (
                                        <td className="px-5 py-4 text-white/50 text-xs uppercase font-medium">
                                            {u.document_type || '—'}
                                        </td>
                                    )}
                                    {/* Submitted — non NOT_SUBMITTED */}
                                    {tab !== 'NOT_SUBMITTED' && (
                                        <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">{formatDate(u.submitted_at)}</td>
                                    )}
                                    {/* Reviewed — non NOT_SUBMITTED */}
                                    {tab !== 'NOT_SUBMITTED' && (
                                        <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">{formatDate(u.updated_at)}</td>
                                    )}
                                    {/* Joined — NOT_SUBMITTED only */}
                                    {tab === 'NOT_SUBMITTED' && (
                                        <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">{formatDate(u.profile_created_at)}</td>
                                    )}
                                    {/* Last Reminder — NOT_SUBMITTED only */}
                                    {tab === 'NOT_SUBMITTED' && (
                                        <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">
                                            {u.last_reminder_sent_at ? (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {formatDate(u.last_reminder_sent_at)}
                                                </span>
                                            ) : <span className="text-white/20">Never</span>}
                                        </td>
                                    )}
                                    {/* Rejection Reason — REJECTED only */}
                                    {tab === 'REJECTED' && (
                                        <td className="px-5 py-4 text-red-400/70 text-xs max-w-[160px] truncate">
                                            {u.admin_notes || '—'}
                                        </td>
                                    )}
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(tab === 'NOT_SUBMITTED' || tab === 'REJECTED') && (
                                                <button
                                                    onClick={() => handleReminder(u)}
                                                    disabled={reminderLoading === u.user_id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg text-xs font-bold transition disabled:opacity-40"
                                                >
                                                    {reminderLoading === u.user_id
                                                        ? <RefreshCw size={11} className="animate-spin" />
                                                        : <Mail size={11} />}
                                                    Remind
                                                </button>
                                            )}
                                            {tab === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => { setSelected(u); setRejectNotes(''); }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-white/40 hover:text-blue-500 rounded-full text-xs font-bold transition-all"
                                                    >
                                                        <Eye size={11} /> Review
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(u.verification_id)}
                                                        disabled={actionLoading}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition disabled:opacity-40"
                                                    >
                                                        <Check size={11} /> Approve
                                                    </button>
                                                </>
                                            )}
                                            {tab === 'APPROVED' && (
                                                <button
                                                    onClick={() => setSelected(u)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-white/40 hover:text-blue-500 rounded-full text-xs font-bold transition-all"
                                                >
                                                    <Eye size={11} /> View
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex justify-center items-start pt-8 sm:pt-12 p-4 bg-black/80 overflow-y-auto no-scrollbar">
                    <div className="bg-secondary border border-white/10 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl my-auto sm:my-0">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <Avatar name={selected.name} url={selected.avatar_url} />
                                <div>
                                    <p className="text-white font-bold">{selected.name || '—'}</p>
                                    <p className="text-white/30 text-xs">{selected.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={selected.status} />
                                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-blue-500 transition">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Document Images — show all uploaded docs in a grid */}
                            <div className="space-y-2">
                                <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Documents</p>
                                {(() => {
                                    const docs = [
                                        { url: selected.document_front_url, label: 'Front' },
                                        { url: selected.document_back_url, label: 'Back' },
                                        { url: selected.selfie_url, label: 'Selfie' },
                                    ].filter(d => d.url);

                                    if (docs.length === 0) {
                                        return (
                                            <div className="py-8 text-center text-white/20 text-sm border border-white/5 rounded-xl">
                                                No documents uploaded
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className={`grid gap-3 ${docs.length === 1 ? 'grid-cols-1' : docs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                            {docs.map((doc, i) => (
                                                <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                                                    className="block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 bg-white/5 transition group relative">
                                                    <div className="aspect-[4/3]">
                                                        {doc.url.toLowerCase().endsWith('.pdf') ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-white/30">
                                                                <FileText size={24} />
                                                                <span className="text-[10px]">PDF</span>
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={doc.url}
                                                                alt={doc.label}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/20 text-xs">Failed to load</div>'; }}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/70 text-[10px] font-bold text-center py-1.5 uppercase tracking-widest">
                                                        {doc.label}
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* OCR Extracted Data */}
                            {(selected.extracted_name || selected.extracted_dob || selected.extracted_gender || selected.extracted_id_number) && (
                                <div className="space-y-3">
                                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded text-[9px]">OCR</span>
                                        Extracted Data
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Extracted Name', value: selected.extracted_name },
                                            { label: 'Date of Birth', value: selected.extracted_dob },
                                            { label: 'Gender', value: selected.extracted_gender },
                                            { label: 'ID Number', value: selected.extracted_id_number },
                                        ].filter(f => f.value).map(f => (
                                            <div key={f.label} className="border border-white/10 rounded-xl px-4 py-3">
                                                <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-1">{f.label}</p>
                                                <p className="text-white text-sm font-medium">{f.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Verification Details */}
                            {[
                                { label: 'Document Type', value: selected.document_type },
                                { label: 'Submitted', value: formatDate(selected.submitted_at) },
                                { label: 'Full Name', value: selected.full_name },
                                { label: 'Date of Birth', value: selected.dob },
                                { label: 'Gender', value: selected.gender },
                                { label: 'Aadhaar', value: selected.aadhaar_number ? `XXXX-XXXX-${selected.aadhaar_number.slice(-4)}` : null },
                                { label: 'PAN', value: selected.pan_number ? `${selected.pan_number.slice(0, 2)}XXXX${selected.pan_number.slice(-2)}` : null },
                                { label: 'Driving License', value: selected.driving_license_number },
                            ].filter(f => f.value).length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Document Type', value: selected.document_type },
                                        { label: 'Submitted', value: formatDate(selected.submitted_at) },
                                        { label: 'Full Name', value: selected.full_name },
                                        { label: 'Date of Birth', value: selected.dob },
                                        { label: 'Gender', value: selected.gender },
                                        { label: 'Aadhaar', value: selected.aadhaar_number ? `XXXX-XXXX-${selected.aadhaar_number.slice(-4)}` : null },
                                        { label: 'PAN', value: selected.pan_number ? `${selected.pan_number.slice(0, 2)}XXXX${selected.pan_number.slice(-2)}` : null },
                                        { label: 'Driving License', value: selected.driving_license_number },
                                    ].filter(f => f.value).map(f => (
                                        <div key={f.label} className="border border-white/10 rounded-xl px-4 py-3">
                                            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-1">{f.label}</p>
                                            <p className="text-white text-sm font-medium">{f.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Admin Notes / Rejection Reason */}
                            {selected.admin_notes && (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                    <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest mb-1">Rejection Reason</p>
                                    <p className="text-red-300/70 text-sm">{selected.admin_notes}</p>
                                </div>
                            )}

                            {/* Reject reason input (only for PENDING) */}
                            {selected.status === 'PENDING' && (
                                <div className="space-y-2">
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                        Rejection Reason <span className="text-red-400">*</span>
                                    </p>
                                    <textarea
                                        value={rejectNotes}
                                        onChange={e => setRejectNotes(e.target.value)}
                                        placeholder="Required if rejecting — explain why..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-red-400/50 transition-all placeholder:text-white/20"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {selected.status === 'PENDING' && (
                            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => handleReject(selected.verification_id)}
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold text-sm transition disabled:opacity-40"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selected.verification_id)}
                                    disabled={actionLoading}
                                    className="px-8 py-2.5 bg-emerald-500 text-white hover:bg-emerald-400 rounded-xl font-bold text-sm transition disabled:opacity-40 flex items-center gap-2"
                                >
                                    {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
