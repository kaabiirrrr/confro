import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft, Image, FileText } from 'lucide-react';
import { getMyConversations, getMessages, uploadChatFile } from '../../../../services/apiService';
    connectSocket, joinConversation, leaveConversation, sendSocketMessage,
    onNewMessage, emitTyping, emitStopTyping, onUserTyping, onUserStopTyping,
    markMessagesRead, onOnlineUsers, onMessageBlocked
} from '../../../../services/socketService';

import AudioCallModal from '../../../shared/AudioCallModal';
import VideoCallModal from '../../../shared/VideoCallModal';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../../lib/supabase';
import { logger } from '../../../../utils/logger';
import InfinityLoader from '../../../common/InfinityLoader';


const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '🙌', '🔥', '✅', '👀', '🎉', '💯'];

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showAudioCall, setShowAudioCall] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id);
            await connectSocket();
            loadConversations();

            // Listen for online users
            onOnlineUsers(users => setOnlineUsers(users));

            // MODERATION FEEDBACK: Listen for blocked messages
            onMessageBlocked((data) => {
                logger.warn('[Chat] Message BLOCKED:', data);
                toast.error(`Message Blocked: ${data.reason}`, {
                    duration: 5000,
                    icon: '🚫'
                });
                // Find and remove the most recent optimistic message
                setMessages(prev => {
                    const optimisticIdx = [...prev].reverse().findIndex(m => m._optimistic);
                    if (optimisticIdx !== -1) {
                        const realIdx = prev.length - 1 - optimisticIdx;
                        return prev.filter((_, i) => i !== realIdx);
                    }
                    return prev;
                });
            });
        };
        init();
    }, []);


    const loadConversations = async () => {
        try {
            const res = await getMyConversations();
            if (res.success) setConversations(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const openConversation = useCallback(async (conv) => {
        if (activeConv?.id) leaveConversation(activeConv.id);
        setActiveConv(conv);
        setMessages([]);
        setMobileShowChat(true);

        joinConversation(conv.id);
        markMessagesRead(conv.id);

        try {
            const res = await getMessages(conv.id);
            if (res.success) setMessages(res.data || []);
        } catch (err) {
            toast.error('Failed to load messages');
        }

        // Listen for new messages in this conversation
        onNewMessage((msg) => {
            if (msg.conversation_id === conv.id) {
                setMessages(prev => [...prev, msg]);
                markMessagesRead(conv.id);
            }
            // Update last message in conversation list
            setConversations(prev => prev.map(c =>
                c.id === msg.conversation_id
                    ? { ...c, last_message: msg.message_text || '📎 attachment', last_message_at: msg.created_at }
                    : c
            ));
        });

        // Typing indicators
        onUserTyping(({ userId }) => {
            const partner = getPartner(conv);
            if (userId === partner?.id) setPartnerTyping(true);
        });
        onUserStopTyping(({ userId }) => {
            const partner = getPartner(conv);
            if (userId === partner?.id) setPartnerTyping(false);
        });
    }, [activeConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, partnerTyping]);

    const getPartner = (conv) => {
        if (!conv || !currentUserId) return null;
        if (conv.client_id === currentUserId) return { ...conv.freelancer, id: conv.freelancer_id };
        return { ...conv.client, id: conv.client_id };
    };

    const handleTyping = () => {
        if (!activeConv) return;
        emitTyping(activeConv.id);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => emitStopTyping(activeConv.id), 2000);
    };

    const handleSend = async () => {
        if (!text.trim() || !activeConv) return;
        const msgText = text;
        setText('');
        setIsSending(true);
        try {
            sendSocketMessage(activeConv.id, { message_text: msgText, message_type: 'text' });
            emitStopTyping(activeConv.id);
        } catch (err) {
            toast.error('Failed to send message');
            setText(msgText);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeConv) return;
        try {
            const res = await uploadChatFile(file);
            if (res.success) {
                sendSocketMessage(activeConv.id, {
                    message_text: null,
                    message_type: res.data.type,
                    file_url: res.data.url,
                    file_name: res.data.name
                });
            }
        } catch (err) {
            toast.error('File upload failed');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatConvTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return formatTime(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredConvs = conversations.filter(c => {
        const partner = getPartner(c);
        return partner?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const activePartner = getPartner(activeConv);
    const isPartnerOnline = activePartner && onlineUsers.includes(activePartner.id);

    return (
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12 space-y-8">
            <div className="mb-0">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Intelligence Relay</h1>
                <p className="text-white/40 text-sm mt-1 font-medium">Coordinate real-time communications and signal exchanges with global talent.</p>
            </div>

            <div className="flex h-[calc(100vh-280px)] min-h-[600px] rounded-2xl border border-white/10 overflow-hidden bg-secondary shadow-2xl shadow-black/40">

                {/* ─── LEFT SIDEBAR ─────────────────────────────────── */}
                <div className={`w-full md:w-96 border-r border-white/5 flex flex-col glass ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>

                    {/* Header */}
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] text-white font-black uppercase tracking-[0.2em] opacity-40">Active Nodes</h2>
                            <span className="px-2 py-1 bg-accent/10 text-accent text-[8px] font-black uppercase tracking-widest rounded-md border border-accent/20 shadow-lg shadow-accent/5">
                                {conversations.length} SECURE CHANNELS
                            </span>
                        </div>
                        <div className="relative group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-secondary/50 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold text-white placeholder-white/10 focus:outline-none focus:border-accent/40 focus:bg-secondary transition-all"
                                placeholder="IDENTIFY CONVERSATION..."
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <InfinityLoader size={40} />
                                <p className="text-[10px] text-white/10 font-black uppercase tracking-widest">Synchronizing Channels...</p>
                            </div>
                        ) : filteredConvs.length === 0 ? (
                            <div className="text-center py-20 px-10">
                                <Search className="mx-auto text-white/5 mb-4" size={40} strokeWidth={1} />
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-relaxed">No secure channels match your current search parameters.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredConvs.map(conv => {
                                    const partner = getPartner(conv);
                                    const isOnline = partner && onlineUsers.includes(partner.id);
                                    const isActive = activeConv?.id === conv.id;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => openConversation(conv)}
                                            className={`w-full flex items-center gap-4 px-6 py-6 hover:bg-white/[0.03] transition-all text-left group ${isActive ? 'bg-accent/[0.07] border-l-2 border-l-accent' : 'border-l-2 border-l-transparent'}`}
                                        >
                                            <div className="relative shrink-0">
                                                <div className={`p-0.5 rounded-full border-2 transition-colors ${isActive ? 'border-accent/50' : 'border-transparent group-hover:border-white/10'}`}>
                                                    {partner?.avatar_url ? (
                                                        <img src={partner.avatar_url} alt={partner.name} className="w-12 h-12 rounded-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 font-black text-sm transition-all shadow-inner">
                                                            {(partner?.name || '?')[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                {isOnline && (
                                                   <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary shadow-lg shadow-green-500/20" title="Node Active" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-black text-[11px] uppercase tracking-wider transition-colors ${isActive ? 'text-accent' : 'text-white/80 group-hover:text-white'}`}>
                                                        {partner?.name || 'Vetted Entity'}
                                                    </p>
                                                    <span className="text-white/20 text-[9px] font-black uppercase tracking-tighter shrink-0 ml-2">
                                                        {formatConvTime(conv.last_message_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   <p className={`text-[11px] font-medium truncate leading-tight ${isActive ? 'text-white/60' : 'text-white/30'}`}>
                                                        {conv.last_message || 'CHANNEL INITIALIZED'}
                                                   </p>
                                                   {conv.unread_count > 0 && (
                                                       <span className="shrink-0 w-5 h-5 bg-accent text-white text-[9px] font-black rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 animate-pulse">
                                                           {conv.unread_count}
                                                       </span>
                                                   )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT CHAT PANEL ─────────────────────────────────── */}
                <div className={`flex-1 flex flex-col bg-secondary/30 relative ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
                    </div>

                    {!activeConv ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 z-10 animate-in fade-in duration-700">
                             <div className="w-24 h-24 rounded-[2.5rem] bg-accent/5 border border-accent/10 flex items-center justify-center mb-8 shadow-inner shadow-accent/5">
                                 <Send size={40} className="text-accent/20" strokeWidth={1} />
                             </div>
                             <h3 className="text-white font-bold text-lg tracking-tight mb-2 uppercase tracking-[0.2em] opacity-80">Encryption Node Standby</h3>
                             <p className="text-white/20 text-[10px] max-w-xs font-black uppercase tracking-widest leading-relaxed">Select an active operational node to re-establish secure communication signals.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col z-10">
                            {/* Chat Header */}
                            <div className="flex items-center gap-4 px-8 py-6 border-b border-white/5 bg-secondary/80 backdrop-blur-md sticky top-0">
                                <button onClick={() => setMobileShowChat(false)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="relative group">
                                    <div className="p-0.5 rounded-full border border-white/10">
                                        {activePartner?.avatar_url ? (
                                            <img src={activePartner.avatar_url} alt={activePartner.name} className="w-11 h-11 rounded-full object-cover grayscale-[0.2]" />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-black text-sm">
                                                {(activePartner?.name || '?')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {isPartnerOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary shadow-lg shadow-green-500/20" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-white font-black text-sm uppercase tracking-wider truncate">{activePartner?.name || 'Secure Entitiy'}</p>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Global Talent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isPartnerOnline ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-white/10'}`} />
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isPartnerOnline ? 'text-green-500/60' : 'text-white/20'}`}>
                                            {isPartnerOnline ? 'Transmitting Active' : 'Signal Terminated'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowAudioCall(true)} className="w-11 h-11 flex items-center justify-center text-white/30 hover:text-accent hover:bg-accent/5 border border-transparent hover:border-accent/10 rounded-xl transition-all active:scale-95" title="Initialize Audio Signal">
                                        <Phone size={18} />
                                    </button>
                                    <button onClick={() => setShowVideoCall(true)} className="w-11 h-11 flex items-center justify-center text-white/30 hover:text-accent hover:bg-accent/5 border border-transparent hover:border-accent/10 rounded-xl transition-all active:scale-95" title="Initialize Visual Signal">
                                        <Video size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                {messages.map((msg, idx) => {
                                    const isMine = msg.sender_id === currentUserId;
                                    const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1]?.created_at).toDateString();
                                    return (
                                        <div key={msg.id || idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {showDate && (
                                                <div className="flex items-center justify-center my-10 relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-white/5" />
                                                    </div>
                                                    <div className="relative px-6 bg-secondary text-[9px] text-white/10 font-bold uppercase tracking-[0.3em]">
                                                        {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group/msg`}>
                                                <div className={`relative max-w-[75%] md:max-w-[72%] transition-all duration-300 hover:shadow-2xl`}
                                                    style={{
                                                        padding: msg.message_type === 'image' ? '6px' : '12px 18px',
                                                        borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                                        background: isMine ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                                        backdropFilter: isMine ? 'blur(20px) saturate(180%)' : 'blur(40px) saturate(200%)',
                                                        WebkitBackdropFilter: isMine ? 'blur(20px) saturate(180%)' : 'blur(40px) saturate(200%)',
                                                        border: isMine ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                        boxShadow: isMine ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                                                        color: isMine ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                                                    }}
                                                >
                                                    {msg.message_type === 'image' && msg.file_url ? (
                                                        <div className="space-y-4">
                                                           <a href={msg.file_url} target="_blank" rel="noreferrer" className="block relative group/img overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                                                               <img src={msg.file_url} alt="attachment" className="max-w-full max-h-[400px] object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                  <Image size={32} className="text-white drop-shadow-lg" />
                                                               </div>
                                                           </a>
                                                        </div>
                                                    ) : msg.message_type === 'document' && msg.file_url ? (
                                                        <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl hover:bg-black/30 transition-all border border-white/5 group/file">
                                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover/file:bg-accent/20 group-hover/file:text-accent transition-all">
                                                               <FileText size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-4">
                                                               <p className="text-[11px] font-black uppercase tracking-wider truncate mb-0.5">{msg.file_name || 'Secure Asset'}</p>
                                                               <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Finalized Document</p>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <p className="text-[13px] leading-[1.7] font-medium whitespace-pre-wrap">{msg.message_text}</p>
                                                    )}
                                                    
                                                    <div className={`mt-3 flex items-center gap-2 ${isMine ? 'justify-end' : 'justify-start opacity-40 group-hover/msg:opacity-100 transition-opacity'}`}>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${isMine ? 'text-white/60' : 'text-white/20'}`}>
                                                            {formatTime(msg.created_at)}
                                                        </p>
                                                        {isMine && (
                                                           <div className={`flex items-center ${msg.is_read ? 'text-blue-400' : 'text-white/20'}`}>
                                                                <Check size={10} strokeWidth={3} className="-mr-0.5" />
                                                                <Check size={10} strokeWidth={3} />
                                                           </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {partnerTyping && (
                                    <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div style={{
                                            padding: '12px 18px',
                                            borderRadius: '20px 20px 20px 4px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            backdropFilter: 'blur(40px) saturate(200%)',
                                            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <div className="flex gap-1.5 items-center">
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                ))}
                                                <span className="ml-2 text-[9px] text-white/20 font-black uppercase tracking-widest">Partner Transmitting...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            {/* Message Input Area */}
                            <div className="p-8 border-t border-white/5 bg-secondary/80 backdrop-blur-md">
                                <div className="relative bg-secondary/50 border border-white/10 rounded-[2rem] px-8 py-5 focus-within:border-accent/40 focus-within:bg-secondary focus-within:shadow-2xl focus-within:shadow-accent/5 transition-all group/input flex items-end gap-6 shadow-xl shadow-black/20">
                                    
                                    {/* Action Hub */}
                                    <div className="flex items-center gap-4 border-r border-white/5 pr-6 self-center mb-1">
                                       <button onClick={() => setShowEmoji(!showEmoji)} className="text-white/20 hover:text-accent transition-all active:scale-90 relative">
                                            <Smile size={22} strokeWidth={1.5} />
                                            {showEmoji && (
                                                <div className="absolute bottom-12 left-0 bg-secondary border border-border rounded-2xl p-4 flex flex-wrap gap-2 w-56 z-50 shadow-3xl animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-xl">
                                                    {EMOJI_LIST.map(e => (
                                                        <button key={e} onClick={() => { setText(t => t + e); setShowEmoji(false); }} className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl text-xl transition-all hover:scale-110">
                                                            {e}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                        <button onClick={() => fileInputRef.current?.click()} className="text-white/20 hover:text-orange-400 transition-all active:scale-90">
                                            <Paperclip size={22} strokeWidth={1.5} />
                                        </button>
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.zip" />
                                    </div>

                                    {/* Transmission Interface */}
                                    <textarea
                                        value={text}
                                        onChange={e => { setText(e.target.value); handleTyping(); }}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                        className="flex-1 bg-transparent text-white placeholder-white/10 text-sm font-medium resize-none focus:outline-none max-h-40 overflow-y-auto py-2.5 leading-[1.6]"
                                        placeholder="Transmit high-priority command or message..."
                                        style={{ scrollbarWidth: 'none' }}
                                    />

                                    {/* Execution Trigger */}
                                    <button
                                        onClick={handleSend}
                                        disabled={!text.trim() || isSending}
                                        className="mb-1 w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale disabled:shadow-none shrink-0"
                                    >
                                        {isSending ? <InfinityLoader size={20} /> : <Send size={20} strokeWidth={2.5} />}
                                    </button>
                                </div>
                                <div className="mt-4 flex justify-center gap-10">
                                    <div className="flex items-center gap-2 opacity-20">
                                       <div className="w-1 h-1 rounded-full bg-white" />
                                       <p className="text-[8px] font-black uppercase tracking-[0.3em]">End-to-End Encryption Protocol Active</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-20">
                                       <div className="w-1 h-1 rounded-full bg-white" />
                                       <p className="text-[8px] font-black uppercase tracking-[0.3em]">Real-time Signal Sync</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Call Modals (External Assets) */}
                {showAudioCall && activeConv && (
                    <AudioCallModal
                        targetUser={activePartner}
                        onClose={() => setShowAudioCall(false)}
                    />
                )}
                {showVideoCall && activeConv && (
                    <VideoCallModal
                        targetUser={activePartner}
                        onClose={() => setShowVideoCall(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Messages;
