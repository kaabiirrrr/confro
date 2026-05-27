import { useState, useEffect } from 'react';
import { X, Edit3, Trash2, RefreshCw, Eye, MousePointer2 } from 'lucide-react';
import {
    createAnnouncement, fetchAnnouncements, updateAnnouncement,
    deleteAnnouncement, fetchOfferAnalytics
} from '../../services/adminService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../../components/ui/CustomDropdown';
import InfinityLoader from '../../components/common/InfinityLoader';

// Pill toggle component matching system accent style
const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            checked ? 'bg-accent' : 'bg-slate-200 dark:bg-white/10'
        }`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
    </button>
);

const EMPTY = { offer_name: '', title: '', message: '', target_role: 'ALL', is_limited: false, end_time: '', type: 'offer', is_active: true };

const OffersPage = () => {
    const [offers, setOffers]           = useState([]);
    const [analytics, setAnalytics]     = useState({});
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [form, setForm]               = useState(EMPTY);
    const [editId, setEditId]           = useState(null);
    const [showForm, setShowForm]       = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [offersRes, analyticsRes] = await Promise.all([
                fetchAnnouncements(),
                fetchOfferAnalytics()
            ]);
            if (offersRes.success) setOffers(offersRes.data || []);
            if (analyticsRes.success) setAnalytics(analyticsRes.data || {});
        } catch { toast.error('Failed to load offers'); }
        finally { setLoading(false); }
    };

    const getStats = (id) => analytics[id] || { views: 0, clicks: 0, engagement_rate: '0.0' };

    const totalViews  = Object.values(analytics).reduce((s, c) => s + (c.views  || 0), 0);
    const totalClicks = Object.values(analytics).reduce((s, c) => s + (c.clicks || 0), 0);
    const activeCount = offers.filter(o => o.is_active).length;

    const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
    const openEdit   = (o) => {
        setForm({
            offer_name: o.offer_name || '',
            title: o.title || '',
            message: o.message || '',
            target_role: o.target_role || 'ALL',
            is_limited: o.is_limited || false,
            end_time: o.end_time ? o.end_time.slice(0, 16) : '',
            type: o.type || 'offer',
            is_active: o.is_active !== false
        });
        setEditId(o.id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editId) {
                await updateAnnouncement(editId, form);
                toast.success('Offer updated');
            } else {
                await createAnnouncement(form);
                toast.success('Offer published');
            }
            setShowForm(false);
            setEditId(null);
            setForm(EMPTY);
            loadAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save offer');
        } finally { setSaving(false); }
    };

    const handleToggleActive = async (o) => {
        try {
            await updateAnnouncement(o.id, { is_active: !o.is_active });
            toast.success(o.is_active ? 'Offer deactivated' : 'Offer activated');
            loadAll();
        } catch { toast.error('Failed to update status'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this offer permanently?')) return;
        try {
            await deleteAnnouncement(id);
            toast.success('Offer deleted');
            loadAll();
        } catch { toast.error('Failed to delete offer'); }
    };

    const filtered = offers.filter(o => {
        if (filterStatus === 'active') return o.is_active;
        if (filterStatus === 'inactive') return !o.is_active;
        return true;
    });

    const isExpired = (o) => o.end_time && new Date(o.end_time) < new Date();

    const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '—';

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <img src="/Icons/icons8-offer-100.png" alt="Offers" className="w-7 h-7 object-contain" />
                            Platform Offers
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1 hidden sm:block">Manage promotional banners and limited-time deals</p>
                    </div>
                    {/* Refresh inline with title on mobile */}
                    <button
                        onClick={loadAll}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors sm:hidden"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
                <p className="text-slate-500 dark:text-white/40 text-xs sm:hidden">Manage promotional banners and limited-time deals</p>
                {/* Buttons: full-width on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                        onClick={openCreate}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all text-center"
                    >
                        Create Offer
                    </button>
                    <button
                        onClick={loadAll}
                        className="hidden sm:block p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Offers', value: offers.length, icon: '/Icons/icons8-offer-100.png' },
                    { label: 'Active Now',   value: activeCount,   icon: '/Icons/icons8-check-file-64.png' },
                    { label: 'Total Views',  value: totalViews,    icon: '/Icons/icons8-review-100.png' },
                    { label: 'Total Clicks', value: totalClicks,   icon: '/Icons/icons8-facebook-like-100.png' },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="border border-slate-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <img src={icon} alt={label} className="w-4 h-4 object-contain opacity-50" />
                            <p className="text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                        </div>
                        <p className="text-slate-800 dark:text-white font-black text-2xl">{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
                {/* ── Offers List ── */}
                <div className="space-y-4">
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 pb-0 w-full">
                        {[
                            { id: 'all',      label: 'All' },
                            { id: 'active',   label: 'Active' },
                            { id: 'inactive', label: 'Inactive' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterStatus(tab.id)}
                                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative text-center ${
                                    filterStatus === tab.id ? 'text-accent' : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                                {filterStatus === tab.id && (
                                    <motion.div layoutId="offerTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <InfinityLoader fullScreen={false} text="Loading offers..." />
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                            <img src="/Icons/icons8-offer-100.png" alt="No offers" className="w-10 h-10 object-contain opacity-10 mx-auto mb-3" />
                            <p className="text-slate-400 dark:text-white/30 text-sm">No offers found</p>
                            <button onClick={openCreate} className="mt-3 text-accent text-xs font-bold hover:underline">Create your first offer</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(offer => {
                                const stats   = getStats(offer.id);
                                const expired = isExpired(offer);
                                return (
                                    <div key={offer.id} className={`border rounded-xl p-5 transition-all ${
                                        offer.is_active && !expired ? 'border-accent/20 bg-accent/[0.02]' : 'border-slate-200 dark:border-white/10'
                                    }`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    {expired ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/30 border border-slate-200 dark:border-white/10 uppercase">Expired</span>
                                                    ) : offer.is_active ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">Live</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 border border-slate-200 dark:border-white/10 uppercase">Paused</span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                                                        offer.target_role === 'ALL'        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                        offer.target_role === 'FREELANCER' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        {offer.target_role === 'ALL' ? 'Everyone' : offer.target_role}
                                                    </span>
                                                    {offer.is_limited && (
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase">Countdown</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-800 dark:text-white font-bold text-sm truncate">{offer.title}</p>
                                                {offer.offer_name && (
                                                    <p className="text-slate-500 dark:text-white/40 text-[11px] truncate">{offer.offer_name}</p>
                                                )}
                                                <p className="text-slate-500 dark:text-white/50 text-xs mt-1 line-clamp-2">{offer.message}</p>
                                                <p className="text-slate-400 dark:text-white/25 text-[10px] mt-2">Expires: {formatDate(offer.end_time)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Toggle checked={offer.is_active} onChange={() => handleToggleActive(offer)} />
                                                <button onClick={() => openEdit(offer)} className="p-1.5 text-slate-400 dark:text-white/30 hover:text-accent transition-colors" title="Edit">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(offer.id)} className="p-1.5 text-slate-400 dark:text-white/30 hover:text-red-500 transition-colors" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-white/40 text-[10px]">
                                                <Eye size={11} />
                                                <span>{stats.views} views</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-white/40 text-[10px]">
                                                <MousePointer2 size={11} />
                                                <span>{stats.clicks} clicks</span>
                                            </div>
                                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400/70 font-bold">
                                                {stats.engagement_rate}% CTR
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Right Sidebar ── */}
                <div className="space-y-4">
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <img src="/Icons/icons8-growth-100.png" alt="Engagement" className="w-4 h-4 object-contain opacity-60" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Engagement Highs</h3>
                        </div>
                        <div className="border border-slate-100 dark:border-white/5 rounded-xl p-4">
                            <p className="text-slate-400 dark:text-white/30 text-[9px] font-bold uppercase tracking-widest mb-1">Most Engaged</p>
                            <p className="text-slate-800 dark:text-white font-bold text-xs truncate">
                                {offers.length > 0
                                    ? [...offers].sort((a, b) => parseFloat(getStats(b.id).engagement_rate) - parseFloat(getStats(a.id).engagement_rate))[0]?.title || 'No data'
                                    : 'No data'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border border-amber-500/20 rounded-xl p-4">
                                <img src="/Icons/icons8-review-100.png" alt="Views" className="w-4 h-4 object-contain opacity-50 mb-2" />
                                <p className="text-amber-600 dark:text-amber-500/60 text-[9px] font-bold uppercase tracking-widest">Global Views</p>
                                <p className="text-slate-800 dark:text-white font-black text-lg">{totalViews}</p>
                            </div>
                            <div className="border border-emerald-500/20 rounded-xl p-4">
                                <img src="/Icons/icons8-facebook-like-100.png" alt="Clicks" className="w-4 h-4 object-contain opacity-50 mb-2" />
                                <p className="text-emerald-600 dark:text-emerald-500/60 text-[9px] font-bold uppercase tracking-widest">Global Clicks</p>
                                <p className="text-slate-800 dark:text-white font-black text-lg">{totalClicks}</p>
                            </div>
                        </div>
                    </div>
                    <div className="border border-amber-500/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-alert-96.png" alt="Tip" className="w-5 h-5 object-contain opacity-70 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-amber-500 font-bold text-[10px] uppercase tracking-widest mb-1">Strategy Tip</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                Use high-contrast headings and clear calls-to-action. Toggle offers on/off without deleting them to A/B test performance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Full-screen Create / Edit Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            className="w-full max-w-xl bg-secondary border border-white/10 rounded-xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <img src="/Icons/icons8-offer-100.png" alt="Offer" className="w-5 h-5 object-contain" />
                                    {editId ? 'Edit Offer' : 'Create New Offer'}
                                </h3>
                                <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                                    className="p-1.5 text-white/40 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Target Audience</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'ALL',        label: 'Everyone',    icon: '/Icons/icons8-user-100.png' },
                                                { id: 'FREELANCER', label: 'Freelancers', icon: '/Icons/icons8-account-male-96.png' },
                                                { id: 'CLIENT',     label: 'Clients',     icon: '/Icons/icons8-bag-100.png' }
                                            ].map(role => (
                                                <button key={role.id} type="button"
                                                    onClick={() => setForm(f => ({ ...f, target_role: role.id }))}
                                                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                                                        form.target_role === role.id
                                                            ? 'bg-accent border-accent text-white'
                                                            : 'border-white/10 text-white/40 hover:border-white/20'
                                                    }`}
                                                >
                                                    <img src={role.icon} alt={role.label}
                                                        className={`w-4 h-4 object-contain ${form.target_role === role.id ? 'brightness-0 invert' : 'opacity-40'}`} />
                                                    {role.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Promotion Name</label>
                                            <input required type="text" value={form.offer_name}
                                                onChange={e => setForm(f => ({ ...f, offer_name: e.target.value }))}
                                                placeholder="e.g. Easter Special 2024"
                                                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-white/20" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Banner Heading</label>
                                            <input required type="text" value={form.title}
                                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                                placeholder="LIMITED FLASH SALE!"
                                                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-white/20" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Marketing Message</label>
                                        <textarea required rows={3} value={form.message}
                                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                            placeholder="Get 40% off your next transaction. Hurry!"
                                            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all resize-none placeholder:text-white/20" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Offer Expiry</label>
                                            <input required type="datetime-local" value={form.end_time}
                                                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                                                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all [color-scheme:dark]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Display Mode</label>
                                            <CustomDropdown
                                                options={[
                                                    { label: 'Static Banner', value: 'false' },
                                                    { label: 'Countdown Banner', value: 'true' }
                                                ]}
                                                value={String(form.is_limited)}
                                                onChange={val => setForm(f => ({ ...f, is_limited: val === 'true' }))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border border-white/10 rounded-xl px-4 py-3">
                                        <div>
                                            <p className="text-white text-sm font-bold">Publish immediately</p>
                                            <p className="text-white/30 text-xs">Show to users right away</p>
                                        </div>
                                        <Toggle checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} />
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button"
                                            onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                                            className="flex-1 py-2.5 border border-white/10 text-white/60 font-bold rounded-xl hover:bg-white/5 transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={saving}
                                            className="flex-1 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {saving
                                                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                : <>{editId ? 'Save Changes' : 'Go Live'}</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OffersPage;
