import { useState, useEffect } from 'react';
import { 
    HandCoins, TrendingUp, Info, 
    ShieldCheck, Zap, RefreshCw, Briefcase, 
    FileText, UserCheck, Users, History,
    Database, Eye, MousePointer2, Send
} from 'lucide-react';
import { 
    fetchConnectSettings, 
    updateConnectSettings, 
    fetchConnectAnalytics,
    fetchConnectLedger
} from '../../services/adminService';
import toast from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';
import { motion } from 'framer-motion';

const ConnectsManagementPage = () => {
    const [settings, setSettings] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

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
        } catch (error) {
            toast.error('Failed to load economy data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        try {
            setSaving(true);
            await updateConnectSettings(settings);
            const freshData = await fetchConnectSettings();
            if (freshData.success) setSettings(freshData.data);
            toast.success('Economy architecture updated successfully');
        } catch (err) {
            console.error('Failed to update settings:', err);
            toast.error('Failed to commit protocol: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading || !settings) {
        return <InfinityLoader text="Initializing Economy Engine..." />;
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section - Matched to Offers */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <HandCoins size={24} className="text-accent" /> Connect economy
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Manage platform currency, deduction costs, and monthly distribution logic
                    </p>
                </motion.div>
                
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                {/* Main Action Section */}
                <div className="bg-transparent border border-white/10 rounded-[32px] p-10 relative overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/20">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                        <Database size={300} />
                    </div>

                    <form onSubmit={handleSave} className="space-y-10 relative z-10">
                        {/* Status Guard / Audience Toggle Style */}
                        <div className="space-y-4">
                            <label className="text-white/20 text-[10px] font-bold pl-1">System governance mode</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, is_connect_system_enabled: true }))}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-full border transition-all duration-300 ${settings.is_connect_system_enabled
                                        ? 'bg-[#38BDF8] border-[#38BDF8] text-white shadow-lg shadow-sky-500/10'
                                        : 'bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <ShieldCheck size={14} className={settings.is_connect_system_enabled ? 'text-white' : 'text-[#38BDF8]'} />
                                    <span className="font-bold text-[10px]">Monetization</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, is_connect_system_enabled: false }))}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-full border transition-all duration-300 ${!settings.is_connect_system_enabled
                                        ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                                        : 'bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <Zap size={14} className={!settings.is_connect_system_enabled ? 'text-white' : 'text-amber-500'} />
                                    <span className="font-bold text-[10px]">Free mode</span>
                                </button>
                            </div>
                        </div>

                        {/* Cost Architecture Grid */}
                        <div className="space-y-6">
                            <label className="text-white/20 text-[10px] font-bold pl-1">Dynamic cost architecture</label>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <FormInput 
                                    label="Job Posting Unit" 
                                    value={settings.job_post_cost} 
                                    onChange={(v) => setSettings(p => ({...p, job_post_cost: v}))} 
                                    icon={<Briefcase size={16} />}
                                    placeholder="0"
                                />
                                <FormInput 
                                    label="Proposal Submission" 
                                    value={settings.proposal_submit_cost} 
                                    onChange={(v) => setSettings(p => ({...p, proposal_submit_cost: v}))} 
                                    icon={<FileText size={16} />}
                                    placeholder="0"
                                />
                                <FormInput 
                                    label="Contract Engagement" 
                                    value={settings.proposal_accept_cost} 
                                    onChange={(v) => setSettings(p => ({...p, proposal_accept_cost: v}))} 
                                    icon={<UserCheck size={16} />}
                                    placeholder="0"
                                />
                                <FormInput 
                                    label="Profile Expansion" 
                                    value={settings.profile_boost_cost || 0} 
                                    onChange={(v) => setSettings(p => ({...p, profile_boost_cost: v}))} 
                                    icon={<Zap size={16} />}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Monthly Distro Section */}
                        <div className="space-y-4">
                            <label className="text-white/20 text-[10px] font-bold pl-1">Protocol distribution logic</label>
                            <div className="p-0 bg-transparent flex flex-row items-center justify-between gap-6 group">
                                <div className="flex items-center gap-3">
                                    <RefreshCw size={22} className="text-accent animate-spin-slow group-hover:scale-110 transition-transform" />
                                    <div>
                                        <h4 className="text-white font-bold text-[11px] tracking-tight">Monthly free refills</h4>
                                        <p className="text-white/20 text-[8px] font-bold">Global baseline</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="number" 
                                        value={settings.monthly_free_connects ?? 20}
                                        onChange={(e) => setSettings(p => ({...p, monthly_free_connects: parseInt(e.target.value) || 0}))}
                                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-center font-black text-sm focus:outline-none focus:border-accent/50 transition-all [appearance:textfield]"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-2.5 bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 text-[11px] disabled:opacity-50 shadow-lg shadow-sky-500/10 hover:-translate-y-0.5"
                        >
                            {saving ? (
                                <RefreshCw className="animate-spin" size={16} />
                            ) : (
                                <>
                                    <Send size={14} />
                                    Commit protocol changes
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Intelligence Sidebar */}
                <div className="space-y-6">
                    <div className="bg-transparent border border-white/10 rounded-[32px] p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-8 text-accent">
                            <TrendingUp size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Economy Intelligence</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <SidebarStat 
                                label="Total Assets Issued" 
                                value={analytics?.total_issued || 0} 
                                icon={<TrendingUp size={14} className="text-sky-400" />} 
                                borderColor="border-sky-500/20"
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <SidebarStat 
                                    label="Total Used" 
                                    value={analytics?.total_used || 0} 
                                    icon={<Eye size={14} className="text-[#B8860B]" />} 
                                    borderColor="border-[#B8860B]/20"
                                    small
                                />
                                <SidebarStat 
                                    label="Circulation" 
                                    value={(analytics?.total_issued || 0) - (analytics?.total_used || 0)} 
                                    icon={<MousePointer2 size={14} className="text-emerald-500" />} 
                                    borderColor="border-emerald-500/20"
                                    small
                                />
                            </div>

                            <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                                <div className="flex items-center gap-2 text-white/60 font-black text-[10px] uppercase tracking-widest">
                                    <Users size={14} className="text-accent" />
                                    Distribution Matrix
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px] font-bold">
                                        <span className="text-white/40 uppercase tracking-widest">Elite Allocation</span>
                                        <span className="text-white">300 Units</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-bold">
                                        <span className="text-white/40 uppercase tracking-widest">Pro Allocation</span>
                                        <span className="text-white">100 Units</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-transparent border border-amber-500/10 rounded-[24px] p-6 flex gap-4 items-start shadow-xl shadow-amber-500/[0.02]">
                        <Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1.5">
                            <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.15em]">Governance Tip</h4>
                            <p className="text-white/40 text-[9px] font-medium leading-relaxed uppercase tracking-wider">
                                Maintain healthy circulation by adjusting cost maps based on platform engagement trends. High net circulation may require unit cost inflation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-transparent border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <History size={18} className="text-accent" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Protocol Audit Ledger</h3>
                    </div>
                    <button 
                        onClick={async () => {
                            const res = await fetchConnectLedger();
                            if (res.success) setLedger(res.data);
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all transform active:rotate-180 duration-500"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-5 text-[9px] font-black text-white/30 uppercase tracking-widest">User / Identity</th>
                                <th className="px-8 py-5 text-[9px] font-black text-white/30 uppercase tracking-widest">Protocol Action</th>
                                <th className="px-8 py-5 text-[9px] font-black text-white/30 uppercase tracking-widest text-center">Connects</th>
                                <th className="px-8 py-5 text-[9px] font-black text-white/30 uppercase tracking-widest">Source / Ref</th>
                                <th className="px-8 py-5 text-[9px] font-black text-white/30 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {(ledger || []).map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {tx.profile?.avatar_url ? (
                                                <img src={tx.profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-black flex-shrink-0">
                                                    {(tx.profile?.name || '?')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-white font-bold text-xs tracking-tight truncate">{tx.profile?.name || 'Unknown User'}</span>
                                                <span className="text-white/30 text-[9px] font-medium tracking-wider truncate">{tx.profile?.email || tx.user_id?.slice(0,8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'CREDIT' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`} />
                                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{tx.action_source || tx.action || '—'}</span>
                                        </div>
                                    </td>
                                    <td className={`px-8 py-5 text-center font-black text-xs tabular-nums ${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">{tx.action_source || 'system'}</span>
                                            <span className="text-white/20 text-[8px] font-medium truncate max-w-[120px]">{tx.description || tx.reference_id?.slice(0,12) || '--'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-white/30 text-[9px] font-bold tabular-nums">
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

// Helper Components - Matched to Offers aesthetics
const FormInput = ({ label, value, onChange, icon, placeholder }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-white/20 text-[8px] font-bold pl-1">{label}</label>
        <div className="relative group flex items-center bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1.5 hover:border-white/10 transition-all">
            <div className="text-white/20 group-focus-within:text-accent transition-colors flex-shrink-0">
                {icon}
            </div>
            <input
                required
                type="number"
                value={value ?? 0}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                placeholder={placeholder}
                className="w-full bg-transparent border-none text-white text-xs focus:outline-none transition-all font-bold text-center [appearance:textfield] px-2"
            />
        </div>
    </div>
);

const SidebarStat = ({ label, value, icon, borderColor, small }) => (
    <div className={`bg-transparent rounded-2xl ${small ? 'p-4' : 'p-6'} border ${borderColor} flex flex-col gap-2 transition-all hover:bg-white/[0.02]`}>
        <div className="flex items-center gap-2">
            {icon}
            <p className="text-white/30 text-[8px] font-black uppercase tracking-widest">{label}</p>
        </div>
        <p className={`text-white font-black ${small ? 'text-xl' : 'text-3xl'} tracking-tighter tabular-nums`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
    </div>
);

export default ConnectsManagementPage;
