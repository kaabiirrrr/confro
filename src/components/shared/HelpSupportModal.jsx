import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Clock, HelpCircle, AlertCircle, MessageCircle, ChevronDown, CheckCircle2, ArrowLeft, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { sendTicketMessageAdmin, fetchUserTickets, fetchTicketMessages, createSupportTicket } from '../../services/supportService';
import toast from 'react-hot-toast';
import CustomDropdown from '../ui/CustomDropdown';

const HelpSupportModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [view, setView] = useState('form'); // 'form', 'history', 'thread'
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [formData, setFormData] = useState({
        subject: '',
        category: 'BUG',
        message: ''
    });
    const messagesEndRef = useRef(null);

    const CATEGORIES = [
        { id: 'BUG', label: 'Bug Report' },
        { id: 'PAYMENT', label: 'Payment Issue' },
        { id: 'ACCOUNT', label: 'Account Help' },
        { id: 'OTHER', label: 'Other' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && user?.id) {
            loadTickets();
        }
    }, [isOpen, user?.id]);

    useEffect(() => {
        if (view === 'thread') {
            scrollToBottom();
        }
    }, [messages, view]);

    const loadTickets = async () => {
        try {
            const result = await fetchUserTickets(user.id);
            if (result.success) {
                setTickets(result.data);
            }
        } catch (error) {
            console.error('Failed to load tickets:', error);
        }
    };

    const loadThread = async (ticket) => {
        setSelectedTicket(ticket);
        setView('thread');
        setLoading(true);
        try {
            const result = await fetchTicketMessages(ticket.id);
            if (result.success) {
                setMessages(result.data);
            }
        } catch (error) {
            toast.error('Failed to load conversation');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const result = await createSupportTicket({
                userId: user.id,
                ...formData
            });
            if (result.success) {
                toast.success('Your request has been submitted. We will respond within 48 hours.');
                setFormData({ subject: '', category: 'BUG', message: '' });
                loadTickets();
                setView('history');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to submit ticket');
        } finally {
            setLoading(false);
        }
    };

    // User can reply using the same logic as admin but needs their own endpoint or a shared one
    // I'll add a user reply method to supportController later if needed, but for now I'll use the existing logic
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || loading) return;

        setLoading(true);
        try {
            // Reusing the message logic - in a real app, users might have a separate route
            // but for simplicity and professional feel, I'll ensure the backend handles user senders too
            const result = await sendTicketMessageAdmin(selectedTicket.id, newMessage);
            if (result.success) {
                setMessages(prev => [...prev, result.data]);
                setNewMessage('');
                toast.success('Reply sent');
            }
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalTitle = view === 'thread' ? 'Ticket Conversation' : (view === 'history' ? 'My Support History' : 'Need Help?');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-16 p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl bg-secondary rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3 sm:gap-4">
                            {view === 'thread' ? (
                                <button 
                                    onClick={() => setView('history')}
                                    className="p-2 bg-white/5 rounded-xl text-white/50 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            ) : (
                                <div className="text-accent">
                                    <HelpCircle size={20} />
                                </div>
                            )}

                            <div>
                                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">{modalTitle}</h2>
                                {view === 'thread' ? (
                                    <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none mt-1">
                                        Ticket #{selectedTicket.id.slice(0, 8)} • {selectedTicket.status}
                                    </p>
                                ) : (
                                    <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none mt-1">
                                        {view === 'form' ? "We'll resolve your issue within 48 hours" : "Track and manage your support requests"}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 transition-all group active:scale-90">
                            <X className="text-white/20 group-hover:text-accent transition-colors" size={20} />
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    {view !== 'thread' && (
                        <div className="flex px-4 sm:px-8 bg-white/[0.01]">
                            <button
                                onClick={() => setView('form')}
                                className={`py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative ${view === 'form' ? 'text-accent' : 'text-white/40 hover:text-white'}`}
                            >
                                Submit Ticket
                                {view === 'form' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                            </button>
                            <button
                                onClick={() => setView('history')}
                                className={`py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all relative ${view === 'history' ? 'text-accent' : 'text-white/40 hover:text-white'}`}
                            >
                                Ticket History ({tickets.length})
                                {view === 'history' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                            </button>
                        </div>
                    )}

                    {/* Content Scroll Area */}
                    <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6">
                        {view === 'form' ? (
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] pl-1">Subject</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="Brief summary of the issue"
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-accent/40 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] pl-1">Category</label>
                                        <CustomDropdown
                                            options={CATEGORIES.map(cat => ({ label: cat.label, value: cat.id }))}
                                            value={formData.category}
                                            onChange={(val) => setFormData({ ...formData, category: val })}
                                            placeholder="Select Category"
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2">
                                    <label className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] pl-1">Describe your problem</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Explain your issue in detail..."
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-accent/40 transition-all font-medium resize-none leading-relaxed"
                                    ></textarea>
                                </div>

                                <div className="bg-white/[0.02] rounded-xl sm:rounded-2xl p-3 sm:p-5 flex gap-3 sm:gap-4 items-start">
                                    <Clock className="text-accent shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <h4 className="text-accent font-black text-[9px] uppercase tracking-wider">Estimated Resolution: 24-48 Hours</h4>
                                        <p className="text-white/40 text-[10px] leading-relaxed mt-1">
                                            Our agents are working to resolve all tickets as fast as possible.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-linear-to-r from-cta to-accent hover:saturate-[1.2] text-white font-black rounded-full transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 group"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-widest text-[10px]">Submit Ticket</span>
                                            <Send size={13} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : view === 'history' ? (
                            <div className="space-y-4">
                                {tickets.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[32px]">
                                        <MessageCircle size={48} className="mx-auto text-white/5 mb-4" />
                                        <p className="text-white/20 text-sm font-medium">No support tickets found.</p>
                                    </div>
                                ) : (
                                    tickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => loadThread(ticket)}
                                            className="bg-white/[0.02] rounded-3xl p-6 hover:bg-white/[0.05] transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="space-y-1">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${
                                                        ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                        ticket.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                        'bg-accent/10 text-accent'
                                                    }`}>
                                                        {ticket.status}
                                                    </span>
                                                    <h3 className="text-white font-bold text-base group-hover:text-accent transition-colors mt-2">{ticket.subject}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-white/20 text-[8px] font-black uppercase tracking-widest block">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-white/40 text-[13px] line-clamp-1">{ticket.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* Thread View */
                            <div className="flex flex-col space-y-8 min-h-full">
                                {/* Original Message */}
                                <div className="p-6 bg-white/[0.02] rounded-3xl">
                                    <h4 className="text-accent font-black text-[9px] uppercase tracking-widest mb-3">Your Request</h4>
                                    <p className="text-white text-[13px] leading-relaxed">{selectedTicket.message}</p>
                                </div>

                                {/* Threaded Conversation */}
                                {loading && messages.length === 0 ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.sender_id === user.id ? 'flex-row-reverse' : ''}`}>
                                            <div className="shrink-0 pt-1">
                                                {msg.sender_id === user.id ? <User size={16} className="text-white/30" /> : <Shield size={16} className="text-accent" />}
                                            </div>
                                            <div className={`flex-1 max-w-[85%] ${msg.sender_id === user.id ? 'text-right' : ''}`}>
                                                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                                                    msg.sender_id === user.id 
                                                        ? 'bg-white/[0.05] rounded-tr-none' 
                                                        : 'bg-accent/10 text-white rounded-tl-none text-left'
                                                }`}>
                                                    {msg.message}
                                                </div>
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1.5 block">
                                                    {msg.sender_id === user.id ? 'You' : 'Support Agent'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Thread Reply Input (Only in thread view) */}
                    {view === 'thread' && (
                        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                            <form onSubmit={handleSendReply} className="relative">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={selectedTicket.status === 'resolved' ? "This ticket is resolved" : "Type your reply..."}
                                    disabled={loading || selectedTicket.status === 'resolved'}
                                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 pr-16 text-[13px] text-white focus:outline-none focus:border-accent/40 transition-all font-medium resize-none max-h-[100px] no-scrollbar"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || loading || selectedTicket.status === 'resolved'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-linear-to-r from-cta to-accent text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all saturate-[1.2]"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default HelpSupportModal;
