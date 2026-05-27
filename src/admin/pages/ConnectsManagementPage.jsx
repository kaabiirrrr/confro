import { useState, useEffect } from 'react';
import { RefreshCw, Search, FileDown } from 'lucide-react';
import { 
    fetchConnectSettings, 
    updateConnectSettings, 
    fetchConnectAnalytics,
    fetchConnectLedger
} from '../../services/adminService';
import toast from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';
import { motion } from 'framer-motion';
import { exportTableToPDF } from '../utils/exportPDF';

const ConnectsManagementPage = () => {
    const [settings, setSettings] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [ledgerRefreshing, setLedgerRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const filteredLedger = ledger.filter(tx => {
        const q = search.toLowerCase();
        const matchesSearch = !q || 
            (tx.profile?.name || '').toLowerCase().includes(q) || 
            (tx.profile?.email || '').toLowerCase().includes(q) || 
            (tx.action_source || '').toLowerCase().includes(q) ||
            (tx.action || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;

        if (tx.created_at) {
            const d = new Date(tx.created_at);
            if (dateFrom && new Date(dateFrom + 'T00:00:00') > d) return false;
            if (dateTo && new Date(dateTo + 'T23:59:59') < d) return false;
        } else if (dateFrom || dateTo) {
            return false;
        }
        return true;
    });

    const handleExportPDF = () => {
        if (filteredLedger.length === 0) {
            toast.error('No transactions to export');
            return;
        }
        exportTableToPDF({
            title: 'Protocol Connects Ledger',
            columns: ['User', 'Email', 'Action', 'Type', 'Amount', 'Source', 'Ref/Desc', 'Timestamp'],
            rows: filteredLedger.map(tx => [
                tx.profile?.name || 'Unknown User',
                tx.profile?.email || '',
                tx.action_source || tx.action || '—',
                tx.type,
                `${tx.type === 'CREDIT' ? '+' : '-'}${tx.amount}`,
                tx.action_source || 'system',
                tx.description || tx.reference_id || '—',
                new Date(tx.created_at).toLocaleString()
            ]),
            filename: 'connects_ledger_export',
            filters: {
                ...(search && { Search: search }),
                ...(dateFrom && { From: dateFrom }),
                ...(dateTo && { To: dateTo })
            }
        });
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsRes, analyticsRes, ledgerRes] = await Promise.all([
                fetchConnectSettings(),
                fetchConnectAnalytics(),
                fetchConnectLedger()
            ]);
            if (settingsRes.success) setSettings(settingsRes.data);
            if (analyticsRes.success) setAnalytics(analyticsRes.data);
            if (ledgerRes.success) setLedger(ledgerRes.data);
        } catch {
            toast.error('Failed to load economy data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const res = await updateConnectSettings(settings);
            if (res.success) {
                const fresh = await fetchConnectSettings();
                if (fresh.success) setSettings(fresh.data);
                toast.success('Economy architecture updated successfully');
            } else {
                toast.error(res.message || 'Failed to commit protocol');
            }
        } catch (err) {
            toast.error('Failed to commit protocol: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const refreshLedger = async () => {
        setLedgerRefreshing(true);
        try {
            const res = await fetchConnectLedger();
            if (res.success) setLedger(res.data);
        } catch {
            toast.error('Failed to refresh ledger');
        } finally {
            setLedgerRefreshing(false);
        }
    };

    if (loading || !settings) {
        return <InfinityLoader text="Initializing Economy Engine..." />;
    }

    const totalIssued = analytics?.total_issued || 0;
    const totalUsed = analytics?.total_used || 0;
    const circulation = totalIssued - totalUsed;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <img src="/Icons/link.png" alt="Connect Economy" className="w-7 h-7 object-contain" />
                    Connect Economy
                </h1>
                <p className="text-white/40 text-xs mt-1">
                    Manage platform currency, deduction costs, and monthly distribution logic
                </p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
                {/* ── Left: Settings Form ── */}
                <div className="border border-white/10 rounded-xl p-8 relative overflow-hidden">
                    <form onSubmit={handleSave} className="space-y-8">

                        {/* Governance Mode Toggle */}
                        <div className="space-y-3">
                            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-1">
                                System Governance Mode
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSettings(p => ({ ...p, is_connect_system_enabled: true }))}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-200 ${
                                        settings.is_connect_system_enabled
                                            ? 'bg-sky-500 border-sky-500 text-white'
                                            : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'
                                    }`}
                                >
                                    <img src="/Icons/icons8-commission-64.png" alt="Monetization"
                                        className={`w-4 h-4 object-contain ${settings.is_connect_system_enabled ? 'brightness-0 invert' : 'opacity-40'}`} />
                                    <span className="font-bold text-[11px]">Monetization</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettings(p => ({ ...p, is_connect_system_enabled: false }))}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-200 ${
                                        !settings.is_connect_system_enabled
                                            ? 'bg-amber-500 border-amber-500 text-white'
                                            : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'
                                    }`}
                                >
                                    <img src="/Icons/icons8-light-100.png" alt="Free mode"
                                        className={`w-4 h-4 object-contain ${!settings.is_connect_system_enabled ? 'brightness-0 invert' : 'opacity-40'}`} />
                                    <span className="font-bold text-[11px]">Free Mode</span>
                                </button>
                            </div>
                        </div>

                        {/* Cost Architecture */}
                        <div className="space-y-3">
                            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-1">
                                Dynamic Cost Architecture
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <FormInput
                                    label="Job Posting Unit"
                                    value={settings.job_post_cost}
                                    onChange={(v) => setSettings(p => ({ ...p, job_post_cost: v }))}
                                    icon="/Icons/icons8-bag-100.png"
                                />
                                <FormInput
                                    label="Proposal Submission"
                                    value={settings.proposal_submit_cost}
                                    onChange={(v) => setSettings(p => ({ ...p, proposal_submit_cost: v }))}
                                    icon="/Icons/icons8-new-job-100.png"
                                />
                                <FormInput
                                    label="Contract Engagement"
                                    value={settings.proposal_accept_cost}
                                    onChange={(v) => setSettings(p => ({ ...p, proposal_accept_cost: v }))}
                                    icon="/Icons/icons8-contract-60.png"
                                />
                                <FormInput
                                    label="Profile Expansion"
                                    value={settings.profile_boost_cost || 0}
                                    onChange={(v) => setSettings(p => ({ ...p, profile_boost_cost: v }))}
                                    icon="/Icons/icons8-profile-100.png"
                                />
                            </div>
                        </div>

                        {/* Monthly Distribution */}
                        <div className="space-y-3">
                            <label className="text-white/40 text-[10px] font-bold uppercase tracking-widest pl-1">
                                Protocol Distribution Logic
                            </label>
                            <div className="flex items-center justify-between border border-white/10 rounded-xl px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <img src="/Icons/icons8-time-machine-100.png" alt="Monthly refills"
                                        className="w-6 h-6 object-contain opacity-60" />
                                    <div>
                                        <p className="text-white font-bold text-xs">Monthly Free Refills</p>
                                        <p className="text-white/30 text-[10px]">Global baseline for all users</p>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    value={settings.monthly_free_connects ?? 20}
                                    onChange={(e) => setSettings(p => ({ ...p, monthly_free_connects: parseInt(e.target.value) || 0 }))}
                                    className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center font-black text-sm focus:outline-none focus:border-accent/50 transition-all [appearance:textfield]"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                            {saving ? (
                                <RefreshCw className="animate-spin" size={16} />
                            ) : (
                                <>
                                    <img src="/Icons/icons8-send-96.png" alt="Commit"
                                        className="w-4 h-4 object-contain brightness-0 invert" />
                                    Commit Protocol Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* ── Right: Intelligence Sidebar ── */}
                <div className="space-y-4">
                    {/* Economy Stats */}
                    <div className="border border-white/10 rounded-xl p-6 space-y-5">
                        <div className="flex items-center gap-2">
                            <img src="/Icons/icons8-growth-100.png" alt="Economy"
                                className="w-5 h-5 object-contain opacity-70" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                Economy Intelligence
                            </h3>
                        </div>

                        {/* Total Issued */}
                        <div className="border border-sky-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="/Icons/icons8-growth-100.png" alt="Issued"
                                    className="w-3.5 h-3.5 object-contain opacity-60" />
                                <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Total Assets Issued</p>
                            </div>
                            <p className="text-white font-black text-3xl tabular-nums">{totalIssued.toLocaleString()}</p>
                        </div>

                        {/* Used + Circulation */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border border-amber-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <img src="/Icons/icons8-rupee-64.png" alt="Used"
                                        className="w-3 h-3 object-contain opacity-50" />
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Total Used</p>
                                </div>
                                <p className="text-white font-black text-xl tabular-nums">{totalUsed.toLocaleString()}</p>
                            </div>
                            <div className="border border-emerald-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <img src="/Icons/icons8-sales-growth-64.png" alt="Circulation"
                                        className="w-3 h-3 object-contain opacity-50" />
                                    <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Circulation</p>
                                </div>
                                <p className="text-white font-black text-xl tabular-nums">{circulation.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Distribution Matrix */}
                        <div className="border border-white/5 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <img src="/Icons/icons8-user-100.png" alt="Distribution"
                                    className="w-3.5 h-3.5 object-contain opacity-50" />
                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Distribution Matrix</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/40 uppercase tracking-wider">Elite Allocation</span>
                                    <span className="text-white">300 Units</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-white/40 uppercase tracking-wider">Pro Allocation</span>
                                    <span className="text-white">100 Units</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Governance Tip */}
                    <div className="border border-amber-500/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-alert-96.png" alt="Tip"
                            className="w-5 h-5 object-contain opacity-70 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-1">Governance Tip</h4>
                            <p className="text-white/40 text-[10px] leading-relaxed">
                                Maintain healthy circulation by adjusting cost maps based on platform engagement trends.
                                High net circulation may require unit cost inflation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Protocol Audit Ledger ── */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <img src="/Icons/icons8-logs-64.png" alt="Ledger"
                            className="w-5 h-5 object-contain opacity-70" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70">
                            Protocol Audit Ledger
                        </h3>
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                        {/* Dates: Row 1 on mobile */}
                        <div className="flex gap-3 w-full md:w-auto order-1 md:order-2">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                title="From Date"
                                className="flex-1 md:flex-none bg-transparent border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-accent transition-all md:w-32"
                            />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                title="To Date"
                                className="flex-1 md:flex-none bg-transparent border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-accent transition-all md:w-32"
                            />
                        </div>
                        {/* Export: Row 2 on mobile */}
                        <div className="flex gap-3 w-full md:w-auto order-2 md:order-3">
                            <button 
                                onClick={handleExportPDF}
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-accent hover:bg-accent/90 text-white px-4 py-1.5 rounded-xl transition-all text-xs font-bold"
                            >
                                <FileDown size={12} /> Export PDF
                            </button>
                        </div>
                        {/* Search & Refresh: Row 3 on mobile */}
                        <div className="flex items-center gap-3 w-full md:w-auto order-3 md:order-1">
                            <div className="relative flex-1 md:w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={12} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search ledger..."
                                    className="w-full bg-transparent border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-white text-xs focus:outline-none focus:border-accent transition-all shadow-inner"
                                />
                            </div>
                            <button
                                onClick={refreshLedger}
                                disabled={ledgerRefreshing}
                                className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 bg-transparent rounded-xl flex items-center justify-center text-white/40 hover:text-accent transition-colors"
                                title="Refresh ledger"
                            >
                                <RefreshCw size={14} className={ledgerRefreshing ? 'animate-spin text-accent' : ''} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest">User / Identity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest">Protocol Action</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest text-center">Connects</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest">Source / Ref</th>
                                <th className="px-6 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredLedger.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-white/30 text-sm">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : filteredLedger.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {tx.profile?.avatar_url ? (
                                                <img src={tx.profile.avatar_url} alt=""
                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/10" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-black flex-shrink-0">
                                                    {(tx.profile?.name || '?')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-white font-bold text-xs truncate">{tx.profile?.name || 'Unknown User'}</p>
                                                <p className="text-white/30 text-[10px] truncate">{tx.profile?.email || tx.user_id?.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                tx.type === 'CREDIT'
                                                    ? 'bg-emerald-500'
                                                    : 'bg-rose-500'
                                            }`} />
                                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                                                {tx.action_source || tx.action || '—'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-center font-black text-xs tabular-nums ${
                                        tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                                            {tx.action_source || 'system'}
                                        </p>
                                        <p className="text-white/20 text-[9px] truncate max-w-[120px]">
                                            {tx.description || tx.reference_id?.slice(0, 12) || '—'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-white/30 text-[10px] font-medium tabular-nums whitespace-nowrap">
                                        {new Date(tx.created_at).toLocaleString()}
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

// ── Form Input ──────────────────────────────────────────────────────────────
const FormInput = ({ label, value, onChange, icon }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-white/30 text-[9px] font-bold uppercase tracking-widest pl-1">{label}</label>
        <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2 hover:border-white/20 transition-all focus-within:border-accent/50">
            <img src={icon} alt={label} className="w-4 h-4 object-contain opacity-40 flex-shrink-0" />
            <input
                required
                type="number"
                value={value ?? 0}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-white text-sm font-bold text-center focus:outline-none [appearance:textfield]"
            />
        </div>
    </div>
);

export default ConnectsManagementPage;
