import { useState, useEffect, useCallback } from 'react';
import { X, Edit3, Trash2, RefreshCw, MessageSquare, CheckCircle, Clock, Save, Download, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminFAQs, updateFAQ, deleteFAQ } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import InfinityLoader from '../../components/common/InfinityLoader';

const FAQManagementPage = () => {
    const [faqs, setFaqs]               = useState([]);
    const [loading, setLoading]         = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm]   = useState('');
    const [dateFrom, setDateFrom]       = useState('');
    const [dateTo, setDateTo]           = useState('');
    const [editModal, setEditModal]     = useState({ isOpen: false, faq: null });
    const [answer, setAnswer]           = useState('');
    const [question, setQuestion]       = useState('');
    const [status, setStatus]           = useState('pending');
    const [saving, setSaving]           = useState(false);

    const loadFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAdminFAQs(statusFilter);
            if (result.success) setFaqs(result.data);
        } catch {
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { loadFaqs(); }, [loadFaqs]);

    const handleOpenEdit = (faq) => {
        setEditModal({ isOpen: true, faq });
        setQuestion(faq.question);
        setAnswer(faq.answer || '');
        setStatus(faq.status);
    };

    const handleUpdate = async () => {
        if (!question.trim()) { toast.error('Question cannot be empty'); return; }
        setSaving(true);
        try {
            const result = await updateFAQ(editModal.faq.id, { question, answer, status });
            if (result.success) {
                toast.success('FAQ updated successfully');
                setFaqs(prev => prev.map(f => f.id === editModal.faq.id ? result.data : f));
                setEditModal({ isOpen: false, faq: null });
            }
        } catch {
            toast.error('Failed to update FAQ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this FAQ entry permanently?')) return;
        try {
            const result = await deleteFAQ(id);
            if (result.success) {
                toast.success('FAQ entry deleted');
                setFaqs(prev => prev.filter(f => f.id !== id));
            }
        } catch {
            toast.error('Failed to delete FAQ');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    }) : '—';

    const handleExportPDF = () => {
        if (filtered.length === 0) { toast.error('No FAQ data to export'); return; }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();

        // Header bar
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, pageW, 22, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('FAQ Management Report', 14, 14);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Exported: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - 14, 14, { align: 'right' });

        // Filter summary
        const filterParts = [];
        if (statusFilter) filterParts.push(`Status: ${statusFilter}`);
        if (searchTerm) filterParts.push(`Search: ${searchTerm}`);
        if (dateFrom) filterParts.push(`From: ${dateFrom}`);
        if (dateTo) filterParts.push(`To: ${dateTo}`);
        let yOffset = 28;
        if (filterParts.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Filters: ${filterParts.join('  |  ')}`, 14, yOffset);
            yOffset += 8;
        }

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Total: ${filtered.length}   Published: ${filtered.filter(f => f.status === 'published').length}   Pending: ${filtered.filter(f => f.status === 'pending').length}`, 14, yOffset + 4);

        autoTable(doc, {
            startY: yOffset + 10,
            head: [['#', 'Question', 'Answer', 'Status', 'Date Added']],
            body: filtered.map((f, i) => [
                i + 1,
                f.question || '—',
                f.answer   || 'Awaiting response…',
                f.status   ? f.status.charAt(0).toUpperCase() + f.status.slice(1) : '—',
                formatDate(f.created_at),
            ]),
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8, textColor: [30, 41, 59], valign: 'top' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 8,  halign: 'center' },
                1: { cellWidth: 52 },
                2: { cellWidth: 80 },
                3: { cellWidth: 22, halign: 'center' },
                4: { cellWidth: 28, halign: 'center' },
            },
            margin: { left: 14, right: 14 },
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text('ConnectFreelance — Confidential', 14, doc.internal.pageSize.getHeight() - 8);
            doc.text(`Page ${i} of ${pageCount}`, pageW - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
        }

        doc.save(`FAQ_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success('PDF exported successfully');
    };

    const totalCount     = faqs.length;
    const publishedCount = faqs.filter(f => f.status === 'published').length;
    const pendingCount   = faqs.filter(f => f.status === 'pending').length;

    const filtered = faqs.filter(f => {
        const matchStatus = !statusFilter || f.status === statusFilter;
        const q = searchTerm.toLowerCase();
        const matchSearch = !q ||
            (f.question || '').toLowerCase().includes(q) ||
            (f.answer || '').toLowerCase().includes(q);
        const d = f.created_at ? new Date(f.created_at) : null;
        const matchFrom = !dateFrom || (d && d >= new Date(dateFrom));
        const matchTo = !dateTo || (d && d <= new Date(dateTo + 'T23:59:59'));
        return matchStatus && matchSearch && matchFrom && matchTo;
    });

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:block">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <img src="/Icons/icons8-faq-80.png" alt="FAQ" className="w-7 h-7 object-contain" />
                            FAQ Management
                        </h1>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1 hidden sm:block">Manage Frequently Asked Questions and answer user-submitted inquiries</p>
                    </div>
                    {/* Refresh inline with title on mobile */}
                    <button
                        onClick={loadFaqs}
                        className="p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors sm:hidden"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
                <p className="text-slate-500 dark:text-white/40 text-xs sm:hidden">Manage Frequently Asked Questions and answer user-submitted inquiries</p>
                {/* Buttons: full-width on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5"
                        title="Export as PDF"
                    >
                        <Download size={14} />
                        Export PDF
                    </button>
                    <button
                        onClick={loadFaqs}
                        className="hidden sm:block p-2 text-slate-400 dark:text-white/40 hover:text-accent transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin text-accent' : ''} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Total FAQs',  value: totalCount,     icon: '/Icons/icons8-faq-80.png' },
                    { label: 'Published',   value: publishedCount, icon: '/Icons/icons8-check-file-64.png' },
                    { label: 'Pending',     value: pendingCount,   icon: '/Icons/icons8-clock-80.png' },
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
                {/* FAQ List */}
                <div className="space-y-4">
                    {/* Filter tabs + search + date */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 w-full">
                            {[
                                { id: '',          label: 'All' },
                                { id: 'published', label: 'Published' },
                                { id: 'pending',   label: 'Pending' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all relative text-center ${
                                        statusFilter === tab.id
                                            ? 'text-accent'
                                            : 'text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                    {statusFilter === tab.id && (
                                        <motion.div layoutId="faqTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            {/* Dates: Row 1 on mobile */}
                            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                                <div className="relative flex-1 sm:w-36">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        title="From date"
                                        className="w-full h-10 px-3 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white focus:outline-none focus:border-accent [color-scheme:dark]"
                                    />
                                    <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest">From</span>
                                </div>
                                <div className="relative flex-1 sm:w-36">
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        title="To date"
                                        className="w-full h-10 px-3 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-white focus:outline-none focus:border-accent [color-scheme:dark]"
                                    />
                                    <span className="absolute -top-2 left-2 px-1 bg-transparent text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest">To</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar Row */}
                    <div className="flex items-center gap-3 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" size={16} />
                            <input
                                type="text"
                                placeholder="Search questions or answers..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full h-12 bg-transparent border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent transition-all shadow-inner"
                            />
                        </div>
                        <button
                            onClick={loadFaqs}
                            className="hidden md:flex flex-shrink-0 w-12 h-12 items-center justify-center text-slate-400 dark:text-white/40 hover:text-accent transition-all group"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin text-accent' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        </button>
                    </div>

                    {loading ? (
                        <InfinityLoader fullScreen={false} text="Loading FAQs..." />
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                            <img src="/Icons/icons8-faq-80.png" alt="No FAQs" className="w-10 h-10 object-contain opacity-10 mx-auto mb-3" />
                            <p className="text-slate-400 dark:text-white/30 text-sm">No FAQ entries found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(faq => (
                                <div
                                    key={faq.id}
                                    className={`border rounded-xl p-5 transition-all ${
                                        faq.status === 'published'
                                            ? 'border-accent/20 bg-accent/[0.02]'
                                            : 'border-slate-200 dark:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                {faq.status === 'published' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                                                        <CheckCircle size={9} /> Published
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase flex items-center gap-1">
                                                        <Clock size={9} /> Pending
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-800 dark:text-white font-bold text-sm">{faq.question}</p>
                                            <p className="text-slate-500 dark:text-white/50 text-xs mt-1 line-clamp-2 italic">
                                                {faq.answer || <span className="text-slate-400 dark:text-white/25">Awaiting response…</span>}
                                            </p>
                                            <p className="text-slate-400 dark:text-white/25 text-[10px] mt-2">Added: {formatDate(faq.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => handleOpenEdit(faq)}
                                                className="p-1.5 text-slate-400 dark:text-white/30 hover:text-accent transition-colors"
                                                title="Edit / Answer"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(faq.id)}
                                                className="p-1.5 text-slate-400 dark:text-white/30 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
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
                            <h4 className="text-accent font-bold text-[10px] uppercase tracking-widest mb-1">Help Center</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                Published FAQs appear in the public help center. Answer pending questions promptly to improve user experience.
                            </p>
                        </div>
                    </div>
                    <div className="border border-amber-500/20 rounded-xl p-5 flex gap-3 items-start">
                        <img src="/Icons/icons8-light-100.png" alt="Tip" className="w-5 h-5 object-contain opacity-60 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-amber-500 font-bold text-[10px] uppercase tracking-widest mb-1">Best Practice</h4>
                            <p className="text-slate-500 dark:text-white/40 text-[10px] leading-relaxed">
                                Keep answers concise and clear. Use plain language so all users can understand the response easily.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit / Answer Modal */}
            <AnimatePresence>
                {editModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            className="w-full max-w-xl bg-white dark:bg-secondary border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <MessageSquare size={18} className="text-accent" />
                                    {editModal.faq?.answer ? 'Refine FAQ' : 'Answer Question'}
                                </h3>
                                <button
                                    onClick={() => setEditModal({ isOpen: false, faq: null })}
                                    className="p-1.5 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Question</label>
                                    <textarea
                                        rows={3}
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        placeholder="Enter the question..."
                                        className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent/50 transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-white/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Official Answer</label>
                                    <textarea
                                        rows={5}
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                        placeholder="Provide a detailed answer for users..."
                                        className="w-full bg-transparent border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-accent/50 transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-white/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">Publication Status</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'pending',   label: 'Pending' },
                                            { id: 'published', label: 'Published' },
                                        ].map(s => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setStatus(s.id)}
                                                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                                                    status === s.id
                                                        ? 'bg-accent border-accent text-white'
                                                        : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setEditModal({ isOpen: false, faq: null })}
                                        className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={saving}
                                        className="flex-1 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving
                                            ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            : <><Save size={14} /> Save Changes</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FAQManagementPage;
