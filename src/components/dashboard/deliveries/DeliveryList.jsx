import { useState, useEffect } from 'react';
import { 
    Download, ExternalLink, Calendar, CheckCircle2, 
    MessageSquare, AlertCircle, FileText, ChevronRight,
    User, Clock, Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { approveDelivery, requestRevision, addDeliveryComment, getSignedDeliveryUrl, downloadDeliveryFile } from '../../../services/apiService';
import { supabase } from '../../../lib/supabase';
import DeliveryComments from './DeliveryComments';
import InputModal from '../../common/InputModal';

export default function DeliveryList({ deliveries, isClient, onUpdate }) {
    const [selectedId, setSelectedId] = useState(deliveries?.[0]?.id || null);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [revisionModalOpen, setRevisionModalOpen] = useState(false);

    const activeDelivery = deliveries?.find(d => d.id === selectedId) || deliveries?.[0];

    const handleAction = async (action, feedback) => {
        if (!activeDelivery) return;
        setLoading(true);
        try {
            let res;
            if (action === 'approve') {
                res = await approveDelivery(activeDelivery.id);
                toast.success('Work delivery approved!');
            } else {
                res = await requestRevision(activeDelivery.id, feedback);
                toast.success('Revision requested');
            }
            if (onUpdate) onUpdate(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    if (!deliveries || deliveries.length === 0) {
        return (
            <div className="bg-transparent border-none p-12 flex flex-col items-center justify-center text-center">
                <FileText className="w-12 h-12 text-white/5 mb-4" />
                <h3 className="text-white font-bold opacity-40">No work delivered yet</h3>
                <p className="text-white/20 text-sm max-w-xs mt-1 font-medium">When the freelancer submits work, it will appear here for review.</p>
            </div>
        );
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = 2;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleDownload = async (path, fileName) => {
        // Fallback: extract filename from path if f.file_name was somehow missing
        let finalFileName = fileName;
        
        // Always try to ensure an extension even if fileName is provided but lacks it
        if (path && (!finalFileName || !finalFileName.includes('.'))) {
            const parts = path.split('/');
            const lastPart = parts[parts.length - 1];
            
            // If we have a timestamped name like 123-file.png, extract file.png
            if (lastPart.includes('-')) {
                const extracted = lastPart.split('-').slice(1).join('-');
                if (extracted.includes('.')) {
                    finalFileName = extracted;
                } else if (lastPart.includes('.')) {
                    // If splitting by dash removed the extension, use the whole last part
                    finalFileName = lastPart;
                }
            } else if (lastPart.includes('.')) {
                finalFileName = lastPart;
            }
        }
        
        // Final fallback to prevent UUID filenames
        if (!finalFileName) finalFileName = 'work-delivery-file';

        console.log('[Download] Starting for:', { path, finalFileName });
        if (!path) {
            toast.error('File path missing');
            return;
        }

        try {
            toast('Starting download...', { icon: '📥' });
            
            // Fetch as blob to ensure backend-controlled headers are respected
            const blob = await downloadDeliveryFile(path, finalFileName);
            
            // Create local URL for the blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Forces the browser to use our filename
            link.setAttribute('download', finalFileName);
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error('[Download] Failed:', err);
            toast.error('Download failed');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Sidebar: Version List */}
            <div className="lg:col-span-4 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider opacity-60">Deliveries History</h3>
                    <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {deliveries.length} Versions
                    </span>
                </div>
                {deliveries.map((d) => (
                    <button
                        key={d.id}
                        onClick={() => setSelectedId(d.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            selectedId === d.id 
                            ? 'bg-accent/10 border-accent/20' 
                            : 'bg-transparent border-transparent hover:bg-white/5'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-white text-sm">Version {d.version}</span>
                            <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-md ${
                                d.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                d.status === 'revision_requested' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-blue-500/10 text-blue-400'
                            }`}>
                                {d.status}
                            </span>
                        </div>
                        <p className="text-white/40 text-xs truncate mb-2">{d.message}</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/20">
                            <Calendar size={10} />
                            {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                        </div>
                    </button>
                ))}
            </div>

            {/* Main view: Active Delivery */}
            <div className="lg:col-span-8 space-y-6">
                {activeDelivery && (
                    <div className="bg-transparent border-none p-0 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-1.5">Delivery Review</h2>
                                <p className="text-white/20 text-xs font-medium">Submitted {new Date(activeDelivery.created_at).toLocaleString()}</p>
                            </div>
                            {activeDelivery.final_approval_time && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-bold uppercase">
                                    <CheckCircle2 size={14} />
                                    Approved {formatDistanceToNow(new Date(activeDelivery.final_approval_time), { addSuffix: true })}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <h4 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-3">Freelancer Message</h4>
                            <div className="bg-transparent border border-white/10 p-4 rounded-xl">
                                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{activeDelivery.message}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Attachments */}
                            <div>
                                <h4 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-3">Files ({activeDelivery.delivery_files?.length || 0})</h4>
                                <div className="space-y-2">
                                    {activeDelivery.delivery_files?.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-transparent border border-white/10 rounded-xl group transition-all hover:bg-white/5">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-xs font-medium truncate">{f.file_name}</p>
                                                    <p className="text-white/20 text-[10px]">{formatBytes(f.file_size)}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDownload(f.file_url, f.file_name)}
                                                className="p-2 text-white/20 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!activeDelivery.delivery_files || activeDelivery.delivery_files.length === 0) && (
                                        <p className="text-white/20 text-xs italic py-2">No files attached</p>
                                    )}
                                </div>
                            </div>

                            {/* Links */}
                            <div>
                                <h4 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-3">External Links</h4>
                                {activeDelivery.work_link ? (
                                    <div className="p-4 bg-transparent border border-accent/20 rounded-xl group hover:bg-accent/5 transition-all cursor-pointer">
                                        <a href={activeDelivery.work_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-accent">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                                                    <ExternalLink size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold tracking-tight">Open Work Preview</p>
                                                    <p className="text-[10px] opacity-60 truncate max-w-[150px]">{activeDelivery.work_link}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} />
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-white/20 text-xs italic py-2">No links provided</p>
                                )}
                            </div>
                        </div>

                        {/* Stats / Metadata */}
                        <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5 mb-8">
                            <div className="flex items-center gap-2 text-[10px] text-white/40">
                                <Clock size={12} />
                                Revision Count: {activeDelivery.revision_count || 0}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-white/40">
                                <Play size={12} />
                                Type: <span className="uppercase text-accent">{activeDelivery.delivery_type}</span>
                            </div>
                        </div>

                        {/* Collaborative Comments */}
                        <div className="mt-auto pt-6 border-t border-white/5">
                            <DeliveryComments 
                                deliveryId={activeDelivery.id} 
                                comments={activeDelivery.delivery_comments || []}
                                onCommentAdded={onUpdate}
                            />
                        </div>

                        {/* Client Actions */}
                        {isClient && activeDelivery.status === 'submitted' && (
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-xl hover:bg-green-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <CheckCircle2 size={16} />
                                    <span className="text-xs uppercase tracking-widest">Approve Delivery</span>
                                </button>
                                <button
                                    onClick={() => setRevisionModalOpen(true)}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold rounded-xl hover:bg-yellow-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <MessageSquare size={16} />
                                    <span className="text-xs uppercase tracking-widest">Request Revision</span>
                                </button>
                            </div>
                        )}
                        
                        <InputModal
                            isOpen={revisionModalOpen}
                            onClose={() => setRevisionModalOpen(false)}
                            title="Request Revision"
                            subtitle="Provide feedback to the freelancer"
                            placeholder="Enter your feedback here..."
                            type="textarea"
                            confirmLabel="Send Feedback"
                            icon={MessageSquare}
                            onSubmit={async (feedback) => {
                                await handleAction('revision', feedback);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
