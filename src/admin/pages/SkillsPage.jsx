import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, Edit3, X, Check, ChevronDown } from 'lucide-react';
import { fetchSkills, addSkill, updateSkill, deleteSkill } from '../../services/adminService';
import toast from 'react-hot-toast';
import InfinityLoader from '../../components/common/InfinityLoader';
import { AnimatePresence, motion } from 'framer-motion';

const CATEGORIES = [
    'Development',
    'Design',
    'Marketing',
    'Writing',
    'Video & Animation',
    'Data Science',
    'Finance',
    'Music & Audio',
    'Business',
    'Other',
];

const CATEGORY_COLORS = {
    Development:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Design:            'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Marketing:         'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Writing:           'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Video & Animation': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'Data Science':    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Finance:           'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Music & Audio':   'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Business:          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Other:             'bg-white/5 text-white/40 border-white/10',
};

const SkillsPage = () => {
    const [skills, setSkills]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [searchTerm, setSearchTerm]   = useState('');
    const [filterCat, setFilterCat]     = useState('');
    const [catOpen, setCatOpen]         = useState(false);

    // Add form
    const [showAdd, setShowAdd]         = useState(false);
    const [newName, setNewName]         = useState('');
    const [newCat, setNewCat]           = useState('Development');
    const [adding, setAdding]           = useState(false);

    // Edit inline
    const [editId, setEditId]           = useState(null);
    const [editName, setEditName]       = useState('');
    const [editCat, setEditCat]         = useState('');
    const [saving, setSaving]           = useState(false);

    // Bulk select
    const [selected, setSelected]       = useState(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);

    useEffect(() => { loadSkills(); }, []);

    const loadSkills = async () => {
        setLoading(true);
        try {
            const res = await fetchSkills();
            setSkills(res.data || []);
        } catch {
            toast.error('Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return skills.filter(sk => {
            const matchSearch = !s || sk.name?.toLowerCase().includes(s) || sk.category?.toLowerCase().includes(s);
            const matchCat    = !filterCat || sk.category === filterCat;
            return matchSearch && matchCat;
        });
    }, [skills, searchTerm, filterCat]);

    // Stats
    const byCategory = useMemo(() => {
        const map = {};
        skills.forEach(sk => { map[sk.category] = (map[sk.category] || 0) + 1; });
        return map;
    }, [skills]);

    // ── Add ──────────────────────────────────────────────────────────────────
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setAdding(true);
        try {
            await addSkill({ name: newName.trim(), category: newCat });
            toast.success('Skill added');
            setNewName('');
            setNewCat('Development');
            setShowAdd(false);
            loadSkills();
        } catch {
            toast.error('Failed to add skill');
        } finally {
            setAdding(false);
        }
    };

    // ── Edit ─────────────────────────────────────────────────────────────────
    const startEdit = (skill) => {
        setEditId(skill.id);
        setEditName(skill.name);
        setEditCat(skill.category);
    };

    const cancelEdit = () => { setEditId(null); setEditName(''); setEditCat(''); };

    const handleSaveEdit = async (id) => {
        if (!editName.trim()) return;
        setSaving(true);
        try {
            await updateSkill(id, { name: editName.trim(), category: editCat });
            toast.success('Skill updated');
            cancelEdit();
            loadSkills();
        } catch {
            toast.error('Failed to update skill');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete single ─────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm('Delete this skill?')) return;
        try {
            await deleteSkill(id);
            toast.success('Skill deleted');
            loadSkills();
        } catch {
            toast.error('Failed to delete skill');
        }
    };

    // ── Bulk delete ───────────────────────────────────────────────────────────
    const handleBulkDelete = async () => {
        if (!selected.size) return;
        if (!confirm(`Delete ${selected.size} selected skill(s)?`)) return;
        setBulkDeleting(true);
        try {
            await Promise.all([...selected].map(id => deleteSkill(id)));
            toast.success(`${selected.size} skill(s) deleted`);
            setSelected(new Set());
            loadSkills();
        } catch {
            toast.error('Some deletions failed');
        } finally {
            setBulkDeleting(false);
        }
    };

    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(s => s.id)));
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                        <img src="/Icons/icons8-skills-100.png" alt="Skills" className="w-7 h-7 object-contain" />
                        Skill Management
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Configure available talent skills and categories · {skills.length} total
                    </p>
                </div>
                <div className="w-full sm:w-auto flex items-center gap-2 flex-wrap self-end sm:self-auto">
                    {selected.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                            {bulkDeleting ? 'Deleting…' : `Delete ${selected.size} selected`}
                        </button>
                    )}
                    <button
                        onClick={() => { setShowAdd(v => !v); setEditId(null); }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all"
                    >
                        {showAdd ? 'Cancel' : 'Add Skill'}
                    </button>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
                {Object.entries(byCategory).slice(0, 4).map(([cat, count]) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
                        style={{ borderRadius: '12px' }}
                        className={`border p-3 sm:p-4 text-left transition-all w-[calc(50%-4px)] sm:w-40 min-h-[64px] sm:min-h-[72px] ${
                            filterCat === cat
                                ? 'border-accent/40 bg-accent/5'
                                : 'border-white/10 hover:border-white/20'
                        }`}
                    >
                        <p className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">{cat}</p>
                        <p className="text-white font-black text-lg sm:text-xl mt-0.5">{count}</p>
                    </button>
                ))}
            </div>

            {/* ── Add form ── */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="border border-white/10 rounded-xl p-5"
                    >
                        <h3 className="text-sm font-bold text-white mb-4">Add New Skill</h3>
                        <form onSubmit={handleAdd} className="flex flex-col gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Skill Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. React.js, Python, UI Design"
                                    className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-white/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Category</label>
                                <select
                                    value={newCat}
                                    onChange={e => setNewCat(e.target.value)}
                                    className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full sm:w-auto sm:self-end px-6 py-2.5 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all text-sm disabled:opacity-50"
                            >
                                {adding ? 'Adding…' : 'Create Skill'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Search + Filter bar ── */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search skills by name or category…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-white/20"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Category filter dropdown */}
                <div className="relative w-full sm:w-auto">
                    <button
                        onClick={() => setCatOpen(v => !v)}
                        className="w-full sm:w-auto flex items-center gap-2 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 hover:border-white/20 transition-all sm:min-w-[160px] justify-between"
                    >
                        <span>{filterCat || 'All Categories'}</span>
                        <ChevronDown size={14} className={`text-white/40 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {catOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute top-full mt-1.5 right-0 z-50 w-52 bg-secondary border border-white/10 rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => { setFilterCat(''); setCatOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!filterCat ? 'text-accent bg-accent/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                >
                                    All Categories
                                </button>
                                <div className="h-px bg-white/5" />
                                {CATEGORIES.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { setFilterCat(c); setCatOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filterCat === c ? 'text-accent bg-accent/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {c}
                                        {byCategory[c] ? <span className="ml-2 text-white/30 text-xs">({byCategory[c]})</span> : null}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Skills Table ── */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                {/* Table header with select-all */}
                <div className="px-6 py-3 border-b border-white/5 flex items-center gap-4">
                    <input
                        type="checkbox"
                        checked={filtered.length > 0 && selected.size === filtered.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-accent cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        {filtered.length} skill{filtered.length !== 1 ? 's' : ''}
                        {filterCat ? ` in ${filterCat}` : ''}
                        {searchTerm ? ` matching "${searchTerm}"` : ''}
                    </span>
                </div>

                {loading ? (
                    <div className="py-16 flex justify-center">
                        <InfinityLoader fullScreen={false} text="Loading catalog…" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-white/30 text-sm">
                        No skills found matching your search
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {filtered.map(skill => (
                            <div
                                key={skill.id}
                                className={`flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group ${selected.has(skill.id) ? 'bg-accent/[0.03]' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.has(skill.id)}
                                    onChange={() => toggleSelect(skill.id)}
                                    className="w-4 h-4 accent-accent cursor-pointer flex-shrink-0"
                                />

                                {editId === skill.id ? (
                                    /* ── Inline edit mode ── */
                                    <div className="flex flex-1 items-center gap-3 flex-wrap">
                                        <input
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="flex-1 min-w-[160px] bg-transparent border border-accent/40 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                                        />
                                        <select
                                            value={editCat}
                                            onChange={e => setEditCat(e.target.value)}
                                            className="bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                                        >
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleSaveEdit(skill.id)}
                                                disabled={saving}
                                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                title="Save"
                                            >
                                                <Check size={15} />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1.5 text-white/40 hover:bg-white/5 rounded-lg transition-colors"
                                                title="Cancel"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Normal view ── */
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm truncate">{skill.name}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider flex-shrink-0 ${CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.Other}`}>
                                            {skill.category}
                                        </span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => startEdit(skill)}
                                                className="p-1.5 text-white/30 hover:text-accent transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(skill.id)}
                                                className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsPage;
