import { useState } from 'react';
import { Send, User, Loader2 } from 'lucide-react';
import { addDeliveryComment } from '../../../services/apiService';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function DeliveryComments({ deliveryId, comments, onCommentAdded }) {
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await addDeliveryComment(deliveryId, newComment);
            setNewComment('');
            if (onCommentAdded) onCommentAdded(res.data);
            toast.success('Comment added');
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">Collaboration Thread</h4>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((c, idx) => (
                    <div key={c.id || idx} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {c.profiles?.avatar_url ? (
                            <img src={c.profiles.avatar_url} className="w-8 h-8 rounded-full border border-white/10 shrink-0" alt="" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <User size={14} className="text-white/20" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-xs font-bold">{c.profiles?.name || 'User'}</span>
                                <span className="text-white/20 text-[10px]">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                            </div>
                            <p className="text-white/60 text-sm leading-relaxed">{c.comment}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="py-4 text-center">
                        <p className="text-white/20 text-xs italic">No comments yet. Start the conversation.</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative mt-4">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or feedback..."
                    className="w-full bg-secondary border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white text-sm focus:border-accent/40 outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50"
                >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
            </form>
        </div>
    );
}
