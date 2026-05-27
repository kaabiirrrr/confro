import { useState, useEffect } from 'react';
import { X, Edit3, Trash2, RefreshCw } from 'lucide-react';
import {
    createAnnouncement, fetchAnnouncements,
    updateAnnouncement, deleteAnnouncement
} from '../../services/adminService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import InfinityLoader from '../../components/common/InfinityLoader';

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

const EMPTY = { title: '', message: '', target_role: 'ALL', type: 'announcement', is_active: true, end_time: '' };

const AUDIENCE = [
    { id: 'ALL',        label: 'Everyone',    icon: '/Icons/icons8-user-100.png' },
    { id: 'FREELANCER', label: 'Freelancers', icon: '/Icons/icons8-account-male-96.png' },
    { id: 'CLIENT',     label: 'Clients',     icon: '/Icons/icons8-bag-100.png' },
];

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [saving, setSaving]               = useState(false);
    const [form, setForm]                   = useState(EMPTY);
    const [editId, setEditId]               = useState(null);
    const [showForm, setShowForm]           = useState(false);
    const [filterStatus, setFilterStatus]   = useState('all');

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const res = await fetchAnnouncements();
            if (res.success) setAnnouncements(res.data || []);
        } catch { toast.error('Failed to load announcements'); }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
    const openEdit = (a) => {
        setForm({ title: a.title || '', message: a.message || '', target_role: a.target_role || 'ALL', type: a.type || 'announcement', is_active: a.is_active !== false, end_time: a.end_time ? a.end_time.slice(0, 16) : '' });
        setEditId(a.id); setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (editId) { await updateAnnouncement(editId, form); toast.success('Updated'); }
            else { await createAnnouncement(form); toast.success('Published'); }
            setShowForm(false); setEditId(null); setForm(EMPTY); loadAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleToggle = async (a) => {
        try { await updateAnnouncement(a.id, { is_active: !a.is_active }); toast.success(a.is_active ? 'Deactivated' : 'Activated'); loadAll(); }
        catch { toast.error('Failed to update'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this announcement permanently?')) return;
        try { await deleteAnnouncement(id); toast.success('Deleted'); loadAll(); }
        catch { toast.error('Failed to delete'); }
    };

    const filtered = announcements.filter(a => {
        if (filterStatus === 'active') return a.is_active;
        if (filterStatus === 'inactive') return !a.is_active;
        return true;
    });

    const activeCount = announcements.filter(a => a.is_active).length;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <img src="/Icons/icons8-announcement-100.png" alt="Announcements" className="w-7 h-7 object-contain" />
                            Platform Announcements
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1 hidden sm:block">Broadcast general updates, news, and platform changes to users</p>
                    </div>
                    {/* Refresh inline with title on mobile */}
                    <button onClick={loadAll}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors sm:hidden"
                        title="Refresh">
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
                <p className="text-slate-500 dark:text-white/40 text-xs sm:hidden">Broadcast general updates, news, and platform changes to users</p>
                {/* Buttons: full-width on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                        onClick={openCreate}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all text-center"
                    >
                        New Announcement
                    </button>
                    <button onClick={loadAll}
                        className="hidden sm:block p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors"
                        title="Refresh">
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Total',  value: announcements.length,              icon: '/Icons/icons8-announcement-100.png' },
                    { label: 'Active', value: activeCount,                        icon: '/Icons/icons8-check-file-64.png' },
                    { label: 'Paused', value: announcements.length - activeCount, icon: '/Icons/icons8-clock-80.png' },
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

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
                {/* List */}
                <div className="space-y-4">
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 w-full">
                        {[{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'inactive', label: 'Inactive' }].map(tab => (
                            <button key={tab.id} onClick={() => setFilterStatus(tab.id)}
                                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative text-center ${
                                    filterStatus === tab.id ? 'text-accent' : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                                }`}>
                                {tab.label}
                                {filterStatus === tab.id && <motion.div layoutId="annTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <InfinityLoader fullScreen={false} text="Loading Announcements..." />
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                            <img src="/Icons/icons8-announcement-100.png" alt="Empty" className="w-10 h-10 object-contain opacity-10 mx-auto mb-3" />
                            <p className="text-slate-400 dark:text-white/30 text-sm">No announcements found</p>
                            <button onClick={openCreate} className="mt-3 text-accent text-xs font-bold hover:underline">Create your first announcement</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(ann => (
                                <div key={ann.id} className={`border rounded-xl p-5 transition-all ${
                                    ann.is_active ? 'border-accent/20 bg-accent/[0.02]' : 'border-slate-200 dark:border-white/10'
                                }`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                {ann.is_active ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">Live</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40 border border-slate-200 dark:border-white/10 uppercase">Paused</span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                                                    ann.target_role === 'ALL'        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                    ann.target_role === 'FREELANCER' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                                    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {ann.target_role === 'ALL' ? 'Everyone' : ann.target_role}
                                                </span>
                                            </div>
                                            <p className="text-slate-800 dark:text-white font-bold text-sm truncate">{ann.title}</p>
                                            <p className="text-slate-500 dark:text-white/50 text-xs mt-1 line-clamp-2">{ann.message}</p>
                                            <p className="text-slate-400 dark:text-white/25 text-[10px] mt-2">Published: {formatDate(ann.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Toggle checked={ann.is_active} onChange={() => handleToggle(ann)} />
                                            <button onClick={() => openEdit(ann)} className="p-1.5 text-slate-400 dark:text-white/30 hover:text-accent transition-colors" title="Edit">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(ann.id)} className="p-1.5 text-slate-400 dark:text-white/30 hover:text-red-500 transition-colors" title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="border border-accent/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-alert-96.png" alt="Tip" className="w-5 h-5 object-contain opacity-70 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-accent font-bold text-[10px] uppercase tracking-widest mb-1">Platform Updates</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                Use this section for non-promotional news, maintenance notices, and general feature releases. Toggle on/off without deleting.
                            </p>
                        </div>
                    </div>
                    <div className="border border-amber-500/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-light-100.png" alt="Tip" className="w-5 h-5 object-contain opacity-60 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-amber-500 font-bold text-[10px] uppercase tracking-widest mb-1">Best Practice</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                Keep headlines short and clear. Target specific audiences to avoid notification fatigue.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            className="w-full max-w-xl bg-white dark:bg-secondary border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <img src="/Icons/icons8-announcement-100.png" alt="Ann" className="w-5 h-5 object-contain" />
                                    {editId ? 'Edit Announcement' : 'New Announcement'}
                                </h3>
                                <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                                    className="p-1.5 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Target Audience</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {AUDIENCE.map(role => (
                                                <button key={role.id} type="button"
                                                    onClick={() => setForm(f => ({ ...f, target_role: role.id }))}
                                                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                                                        form.target_role === role.id
                                                            ? 'bg-accent border-accent text-white'
                                                            : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-300 dark:hover:border-white/20'
                                                    }`}>
                                                    <img src={role.icon} alt={role.label}
                                                        className={`w-4 h-4 object-contain ${form.target_role === role.id ? 'brightness-0 invert' : 'opacity-40'}`} />
                                                    {role.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Headline</label>
                                        <input required type="text" value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            placeholder="What's new on the platform?"
                                            className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-slate-300 dark:placeholder:text-white/20" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Content</label>
                                        <textarea required rows={4} value={form.message}
                                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                            placeholder="Describe the update in detail..."
                                            className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent/50 transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-white/20" />
                                    </div>

                                    <div className="flex items-center justify-between border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3">
                                        <div>
                                            <p className="text-slate-800 dark:text-white text-sm font-bold">Publish immediately</p>
                                            <p className="text-slate-400 dark:text-white/30 text-xs">Show to users right away</p>
                                        </div>
                                        <Toggle checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} />
                                    </div>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button"
                                            onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                                            className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={saving}
                                            className="flex-1 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                            {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>{editId ? 'Save Changes' : 'Publish'}</>}
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

export default AnnouncementsPage;
