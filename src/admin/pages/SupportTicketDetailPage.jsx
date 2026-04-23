import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, User, CheckCircle, Clock,
    AlertCircle, MessageSquare, Tag, Calendar,
    UserPlus, Shield, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchTicketDetailsAdmin,
    sendTicketMessageAdmin,
    assignTicketAdmin,
    updateTicketStatusAdmin
} from '../../services/supportService';
import { toast } from 'react-hot-toast';

const SupportTicketDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadTicketDetails = useCallback(async () => {
        try {
            const result = await fetchTicketDetailsAdmin(id);
            if (result.success) {
                setTicket(result.data);
            }
        } catch (error) {
            console.error('Error loading ticket details:', error);
            toast.error('Failed to load ticket details');
            navigate('/admin/support-tickets');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadTicketDetails();
    }, [loadTicketDetails]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const result = await sendTicketMessageAdmin(id, newMessage);
            if (result.success) {
                setTicket(prev => ({
                    ...prev,
                    messages: [...(prev.messages || []), result.data]
                }));
                setNewMessage('');
                toast.success('Message sent');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleAssign = async () => {
        try {
            const result = await assignTicketAdmin(id);
            if (result.success) {
                toast.success('Ticket assigned to you');
                loadTicketDetails();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to assign ticket');
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const result = await updateTicketStatusAdmin(id, newStatus);
            if (result.success) {
                toast.success(`Ticket marked as ${newStatus}`);
                setTicket(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/40 font-medium">Loading ticket conversation...</p>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/support-tickets')}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span className="font-bold text-[10px] uppercase tracking-widest">Back to All Tickets</span>
                </button>

                <div className="flex items-center gap-3">
                    {!ticket.assigned_to && (
                        <button
                            onClick={handleAssign}
                            className="flex items-center gap-2 bg-accent/10 text-accent hover:bg-accent hover:text-white px-4 py-1.5 rounded-full border border-accent/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                            <UserPlus size={14} />
                            Assign to Me
                        </button>
                    )}
                    {ticket.status !== 'resolved' && (
                        <button
                            onClick={() => handleStatusUpdate('resolved')}
                            className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-1.5 rounded-full border border-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                        >
                            <CheckCircle size={14} />
                            Mark Resolved
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
                {/* Left Column: Chat History */}
                <div className="lg:col-span-2 flex flex-col bg-transparent border border-white/10 rounded-2xl overflow-hidden h-full">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-accent">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">Conversation Thread</h2>
                                <p className="text-white/40 text-[11px] font-black uppercase tracking-widest mt-0.5">Ticket #{ticket.id.slice(0, 8)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                        {/* Original Subject & Message */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                {ticket.profiles?.avatar_url ? (
                                    <img src={ticket.profiles.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                        <User size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 max-w-[85%]">
                                <div className="bg-transparent border border-white/10 p-5 rounded-3xl rounded-tl-none shadow-xl">
                                    <h4 className="text-accent font-black text-[10px] uppercase tracking-[0.2em] mb-2">{ticket.profiles?.name} (Customer)</h4>
                                    <h3 className="text-white font-bold mb-3 text-base">{ticket.subject}</h3>
                                    <p className="text-white/70 text-[13px] leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                                </div>
                                <span className="text-white/20 text-[10px] font-black uppercase mt-2 block tracking-widest">{new Date(ticket.created_at).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Threaded Replies */}
                        {ticket.messages?.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.sender_id === ticket.user_id ? '' : 'flex-row-reverse text-right'}`}>
                                <div className="flex-shrink-0">
                                    {msg.sender?.avatar_url ? (
                                        <img src={msg.sender.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                            <Shield size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className={`flex-1 max-w-[85%] ${msg.sender_id === ticket.user_id ? '' : 'flex flex-col items-end'}`}>
                                    <div className={`p-5 rounded-3xl shadow-xl w-fit min-w-[200px] border ${msg.sender_id === ticket.user_id
                                            ? 'bg-transparent border-white/10 rounded-tl-none'
                                            : 'bg-transparent border-accent/20 rounded-tr-none text-left'
                                        }`}>
                                        <h4 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-2 ${msg.sender_id === ticket.user_id ? 'text-white/40' : 'text-accent'
                                            }`}>
                                            {msg.sender?.name || (msg.sender_id === ticket.user_id ? 'Customer' : 'Agent')}
                                            {msg.sender_id !== ticket.user_id && ' (Support Agent)'}
                                        </h4>
                                        <p className="text-white/80 text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <span className="text-white/20 text-[10px] font-black uppercase mt-2 block tracking-widest">{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    <div className="p-6 bg-white/[0.02] border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your reply to the user..."
                                className="flex-1 bg-transparent text-white p-2 min-h-[44px] max-h-[120px] focus:outline-none transition-all resize-none text-[13px] placeholder:text-white/20 scrollbar-hide flex items-center"
                                disabled={sending || ticket.status === 'resolved'}
                                rows={1}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending || ticket.status === 'resolved'}
                                className="p-3 bg-accent text-white rounded-full hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all flex-shrink-0"
                            >
                                {sending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </form>
                        {ticket.status === 'resolved' && (
                            <p className="text-white/30 text-xs text-center mt-4 flex items-center justify-center gap-2">
                                <CheckCircle size={14} />
                                This ticket is resolved. Reopen to send further messages.
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column: Information Panel */}
                <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                    {/* Status Card */}
                    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-white/40 font-black text-[11px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Tag size={14} className="text-accent" />
                            Ticket Details
                        </h3>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-xs font-bold uppercase">Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${ticket.status === 'resolved'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : ticket.status === 'in_progress'
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {ticket.status === 'resolved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-xs font-bold uppercase">Priority</span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm ${ticket.priority === 'high'
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-xs font-bold uppercase">Category</span>
                                <span className="text-white text-[10px] font-black uppercase bg-white/5 px-2 py-1 rounded tracking-widest">
                                    {ticket.category}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <span className="text-white/40 text-[10px] uppercase font-black flex items-center gap-1">
                                    <Calendar size={12} />
                                    Created
                                </span>
                                <span className="text-white/60 text-xs font-bold">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-white/40 font-black text-[11px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <User size={14} className="text-accent" />
                            Customer Info
                        </h3>

                        <div className="flex flex-col items-center text-center p-4">
                            {ticket.profiles?.avatar_url ? (
                                <img src={ticket.profiles.avatar_url} className="w-16 h-16 rounded-full object-cover shadow-xl mb-3" alt="" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-3">
                                    <User size={30} />
                                </div>
                            )}
                            <h4 className="text-white font-bold text-lg mb-1">{ticket.profiles?.name}</h4>
                            <p className="text-white/40 text-xs mb-4 line-clamp-1">{ticket.profiles?.email}</p>

                            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest border border-white/10 w-full justify-center">
                                View Profile
                                <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Assignment Card */}
                    <div className="bg-transparent border border-white/5 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-white/40 font-black text-[11px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Shield size={14} className="text-accent" />
                            Assignment
                        </h3>

                        {ticket.assigned_admin ? (
                            <div className="flex items-center gap-3 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl">
                                {ticket.assigned_admin.avatar_url ? (
                                    <img src={ticket.assigned_admin.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                        <Shield size={16} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Handled by</p>
                                    <p className="text-white font-bold text-sm">{ticket.assigned_admin.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-500/[0.03] border border-red-500/10 rounded-xl text-center">
                                <p className="text-red-400/60 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                                    <AlertCircle size={12} />
                                    No Agent Assigned
                                </p>
                                <p className="text-white/30 text-[10px]">Unassigned tickets have lower visibility.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTicketDetailPage;
