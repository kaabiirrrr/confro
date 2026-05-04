import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft, FileText, Check, CheckCheck, MessageCircle, Plus, X, UserSearch, Trash2, BellOff, Bell, Flag, Ban } from 'lucide-react';
import { getMyConversations, getMessages, uploadChatFile, getOrCreateConversation, getFreelancers, clearConversation, blockUser, muteConversation, getMuteStatus, getBlockStatus, getBlockedUsers, unblockUser, reportUser, getConversationRequests, acceptConversationRequest, rejectConversationRequest, getOnlineUsers, getCallLogs } from '../../../services/apiService';
import {
    connectSocket, joinConversation, leaveConversation, sendSocketMessage,
    onNewMessage, emitTyping, emitStopTyping, onUserTyping, onUserStopTyping,
    markMessagesRead, onOnlineUsers, onSocketError, onMessagesRead, requestOnlineUsers,
    onUserOnline, onUserOffline, getSocket, onMessageBlocked, onChatBlocked
} from '../../../services/socketService';

import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';
import InfinityLoader from '../../common/InfinityLoader';

import analytics from '../../../services/analytics.service';
import CustomDropdown from '../../ui/CustomDropdown';


const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '🙌', '🔥', '✅', '👀', '🎉', '💯'];

const Messages = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const targetedUserId = searchParams.get('userId');
    const targetedUserName = searchParams.get('userName');
    const targetedConvId = searchParams.get('conv');

    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserId, setCurrentUserId] = useState(() => {
        // Try to get user ID synchronously from supabase session cache
        try {
            const stored = localStorage.getItem('sb-ogtkjtbvbkyddutnmcov-auth-token');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed?.user?.id || null;
            }
        } catch { }
        return null;
    });
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const [showChatMenu, setShowChatMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [mutedConvs, setMutedConvs] = useState(new Set());
    const chatMenuRef = useRef(null);

    const [sidebarTab, setSidebarTab] = useState('chats'); // 'chats' | 'requests' | 'blocked' | 'calls'
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    const [callLogs, setCallLogs] = useState([]);
    const [callLogsLoading, setCallLogsLoading] = useState(false);

    // Per-conversation mute status from backend (overrides local Set)
    const [convMuteStatus, setConvMuteStatus] = useState({}); // { [convId]: boolean }

    // Block status for active partner
    const [isPartnerBlocked, setIsPartnerBlocked] = useState(false);

    // Blocked users modal
    const [showBlockedModal, setShowBlockedModal] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockedLoading, setBlockedLoading] = useState(false);

    const [showNewMsg, setShowNewMsg] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [startingConv, setStartingConv] = useState(null);

    // ─── ENTERPRISE ENFORCEMENT: Gating State ─────────────────────
    const [chatGating, setChatGating] = useState({ isBlocked: false, current: 0, limit: 15 });
    const [unfundedContract, setUnfundedContract] = useState(null);
    // ─────────────────────────────────────────────────────────────

    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);
    const fileInputRef = useRef(null);
    const activeConvIdRef = useRef(null);
    const newMessageHandlerRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) setShowChatMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadConversations = async () => {
        try {
            const res = await getMyConversations();
            const convs = (res.success && res.data) ? res.data : [];
            setConversations(convs);
            return convs;
        } catch {
            setConversations([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Request presence for all conversations in the list
    const requestPresenceForConversations = useCallback((convs) => {
        const sock = getSocket();
        if (!sock || !convs?.length) return;
        convs.forEach(c => sock.emit('get-partner-presence', c.id));
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const uid = user?.id;
            setCurrentUserId(uid);

            // Listen for per-conversation presence responses
            const sock_pre = getSocket();
            if (sock_pre) {
                sock_pre.on('partner-presence', ({ conversationId, isOnline }) => {
                    setOnlineUsers(prev => {
                        const next = new Set(prev);
                        if (isOnline) next.add(String(conversationId));
                        else next.delete(String(conversationId));
                        return next;
                    });
                });
            }

            await connectSocket();

            // After connecting, register the listener again (socket may have been recreated)
            const sock = getSocket();
            if (sock) {
                sock.off('partner-presence');
                sock.on('partner-presence', ({ conversationId, isOnline }) => {
                    setOnlineUsers(prev => {
                        const next = new Set(prev);
                        if (isOnline) next.add(String(conversationId));
                        else next.delete(String(conversationId));
                        return next;
                    });
                });
            }

            onSocketError(err => console.error('Socket error:', err));

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

            // CHAT GATING: Listen for 15-msg limit breach
            onChatBlocked((data) => {
                logger.warn('[Chat] Limit Reached:', data);
                setChatGating({ isBlocked: true, current: data.current, limit: data.limit });
                toast.error(data.message, { duration: 6000, icon: '🔒' });
            });

            const convs = await loadConversations();

            // Request per-conversation presence for the sidebar dots
            setTimeout(() => requestPresenceForConversations(convs), 500);

            if (targetedConvId && convs.length > 0) {
                const t = convs.find(c => String(c.id) === String(targetedConvId));
                if (t) openConversation(t, uid);
            }
        };
        init();
    }, []);

    // Re-join conversation room on socket reconnect
    useEffect(() => {
        const sock = getSocket();
        if (!sock) return;
        const onReconnect = () => {
            if (activeConvIdRef.current) {
                console.log('[Messages] Reconnected — re-joining conversation:', activeConvIdRef.current);
                joinConversation(activeConvIdRef.current);
                // Re-request presence for all conversations
                requestPresenceForConversations(conversations);
            }
        };
        sock.on('connect', onReconnect);
        return () => sock.off('connect', onReconnect);
    }, []);

    useEffect(() => {
        if (currentUserId && targetedUserId && conversations.length > 0 && !activeConv) {
            const t = conversations.find(c => c.client_id === targetedUserId || c.freelancer_id === targetedUserId);
            if (t) openConversation(t, currentUserId);
        }
    }, [currentUserId, targetedUserId, conversations, activeConv]);

    const openConversation = useCallback(async (conv, uidOverride) => {
        if (activeConv?.id) leaveConversation(activeConv.id);
        setActiveConv(conv);
        setMessages([]);
        setMobileShowChat(true);
        setShowChatMenu(false);
        setIsPartnerBlocked(false);
        setChatGating({ isBlocked: false, current: 0, limit: 15 }); // Reset gating for new conv
        setUnfundedContract(null);

        // Check if contract is unfunded/new (Grandfathering check logic can be added here or rely on socket)
        if (conv.contract_id && !conv.contracts?.is_grandfathered) {
             // In a real app, we'd check funding status here to show the banner immediately
             setUnfundedContract(conv.contracts);
        }

        setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('conv', conv.id); return n; });

        // Track active conv ID for reconnect handler
        activeConvIdRef.current = conv.id;

        const isDummy = String(conv.id).startsWith('dummy-');
        if (!isDummy) { joinConversation(conv.id); markMessagesRead(conv.id); }

        // Request presence for this specific conversation
        const sock = getSocket();
        if (sock && !isDummy) sock.emit('get-partner-presence', conv.id);

        // Fetch mute status from backend
        if (!isDummy) {
            getMuteStatus(conv.id)
                .then(res => {
                    if (res?.success) {
                        setConvMuteStatus(prev => ({ ...prev, [conv.id]: res.data?.muted ?? false }));
                    }
                })
                .catch(() => { }); // silent fail
        }

        if (!isDummy) {
            try {
                const res = await getMessages(conv.id);
                if (res.success && res.data) {
                    setMessages(res.data.map(m => ({ ...m, message_text: m.message_text || m.content || '' })));
                }
            } catch { toast.error('Failed to load messages'); }
        }

        const resolvedUid = uidOverride || currentUserId;

        // Remove previous listener before attaching new one (prevents stacking)
        if (newMessageHandlerRef.current) {
            getSocket()?.off('new-message', newMessageHandlerRef.current);
        }

        const handleNewMessage = (msg) => {
            const msgConvId = msg.conversationId || msg.conversation_id;
            const normalized = { ...msg, message_text: msg.message_text || msg.content || '' };
            const partner = conv.client_id === resolvedUid
                ? { ...conv.freelancer, id: conv.freelancer_id }
                : { ...conv.client, id: conv.client_id };
            const belongs = msgConvId === conv.id || msg.sender_id === partner?.id || msg.receiver_id === resolvedUid;
            if (belongs) {
                setMessages(prev => {
                    const hasOptimistic = prev.some(m => m._optimistic && m.sender_id === normalized.sender_id && m.message_text === normalized.message_text);
                    if (hasOptimistic) {
                        return prev.map(m =>
                            m._optimistic && m.sender_id === normalized.sender_id && m.message_text === normalized.message_text
                                ? normalized : m
                        );
                    }
                    if (prev.some(m => m.id && m.id === normalized.id)) return prev;
                    return [...prev, normalized];
                });
                markMessagesRead(conv.id);
            }
            setConversations(prev => prev.map(c =>
                c.id === (msgConvId || conv.id)
                    ? { ...c, last_message: normalized.message_text || 'attachment', last_message_at: msg.created_at }
                    : c
            ));
        };

        newMessageHandlerRef.current = handleNewMessage;
        getSocket()?.on('new-message', handleNewMessage);

        onUserTyping(({ userId }) => { if (userId === getPartner(conv)?.id) setPartnerTyping(true); });
        onUserStopTyping(({ userId }) => { if (userId === getPartner(conv)?.id) setPartnerTyping(false); });
        onMessagesRead(({ conversationId }) => {
            if (conversationId === conv.id) setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        });
    }, [activeConv]);

    useEffect(() => {
        if (sidebarTab === 'requests') loadRequests();
        if (sidebarTab === 'blocked') loadBlockedUsers();
        if (sidebarTab === 'calls') loadCallLogs();
    }, [sidebarTab]);

    const getPartner = (conv) => {
        if (!conv || !currentUserId) return null;
        if (conv.client_id === currentUserId) return { ...conv.freelancer, id: conv.freelancer_id, user_id: conv.freelancer?.user_id || conv.freelancer_id };
        return { ...conv.client, id: conv.client_id, user_id: conv.client?.user_id || conv.client_id };
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

        // Optimistic update — show message immediately without waiting for server echo
        const optimisticMsg = {
            id: `optimistic-${Date.now()}`,
            conversation_id: activeConv.id,
            sender_id: currentUserId,
            message_text: msgText,
            message_type: 'text',
            created_at: new Date().toISOString(),
            is_read: false,
            _optimistic: true,
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const partner = getPartner(activeConv);
            sendSocketMessage(activeConv.id, {
                message_text: msgText,
                content: msgText,        // fallback for backends using 'content'
                text: msgText,           // fallback for backends using 'text'
                message_type: 'text',
                receiverId: partner?.id
            });
            analytics.trackFeature('message_sent', '/messages', { conversationId: activeConv.id });
            emitStopTyping(activeConv.id);

        } catch {
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            setText(msgText);
            toast.error('Failed to send message');
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
                const partner = getPartner(activeConv);
                sendSocketMessage(activeConv.id, { message_text: null, message_type: res.data.type, file_url: res.data.url, file_name: res.data.name, receiverId: partner?.id });
            }
        } catch { toast.error('File upload failed'); }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    const formatConvTime = (d) => {
        if (!d) return '';
        const dt = new Date(d), now = new Date();
        return dt.toDateString() === now.toDateString() ? formatTime(d) : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleUserSearch = useCallback(async (q) => {
        setUserSearch(q);
        if (!q.trim()) { setUserResults([]); return; }
        setSearchingUsers(true);
        try {
            const res = await getFreelancers({ search: q, limit: 8 });
            // Handle both { success, data: [...] } and direct array responses
            const raw = res?.data ?? res ?? [];
            const results = Array.isArray(raw) ? raw : [];
            // Normalize each result to ensure it has an 'id' field, and filter out the current user
            const normalized = results
                .map(u => ({
                    ...u,
                    id: u.id || u.user_id || u.profile_id || u.userId || u.freelancer_id,
                }))
                .filter(u => u.id && u.id !== currentUserId);

            if (normalized.length > 0) {
                console.log('[Messages] Search result sample:', normalized[0]);
            }
            setUserResults(normalized);
        }
        catch { setUserResults([]); }
        finally { setSearchingUsers(false); }
    }, []);

    const handleStartConversation = async (user) => {
        // Resolve ID from multiple possible field names the API might return
        const userId = user?.id || user?.user_id || user?.profile_id || user?.freelancer_id || user?.userId;
        if (!userId) {
            console.warn('[Messages] Cannot start conversation — user object:', user);
            toast.error('Cannot start conversation: missing user ID');
            return;
        }
        if (userId === currentUserId) {
            toast.error('Cannot start a conversation with yourself');
            return;
        }
        setStartingConv(userId);
        try {
            const res = await getOrCreateConversation(userId);
            const conv = res?.data ?? res;
            if (conv) {
                setConversations(prev => prev.find(c => c.id === conv.id) ? prev : [{ ...conv, freelancer: user, client: user, unread_count: 0, last_message: '' }, ...prev]);
                setShowNewMsg(false); setUserSearch(''); setUserResults([]);
                openConversation({ ...conv, freelancer: user, client: user });
            }
        } catch (err) { toast.error('Could not start conversation'); console.error('[Messages] getOrCreateConversation error:', err); }
        finally { setStartingConv(null); }
    };

    const handleClearChat = async () => {
        if (!activeConv) return;
        try { await clearConversation(activeConv.id); setMessages([]); toast.success('Chat cleared'); }
        catch { toast.error('Failed to clear chat'); }
        setShowChatMenu(false);
    };

    const handleBlock = async () => {
        const partner = getPartner(activeConv);
        if (!partner?.id) return;
        try {
            if (isPartnerBlocked) {
                await unblockUser(partner.id);
                setIsPartnerBlocked(false);
                toast.success(`${partner.name || 'User'} has been unblocked`);
            } else {
                await blockUser(partner.id);
                setIsPartnerBlocked(true);
                toast.success(`${partner.name || 'User'} has been blocked`);
            }
        } catch { toast.error(isPartnerBlocked ? 'Failed to unblock user' : 'Failed to block user'); }
        setShowChatMenu(false);
    };

    const handleMute = async () => {
        if (!activeConv) return;
        try {
            const res = await muteConversation(activeConv.id);
            // Backend returns new mute state
            const newMuted = res?.data?.muted ?? res?.muted ?? !convMuteStatus[activeConv.id];
            setConvMuteStatus(prev => ({ ...prev, [activeConv.id]: newMuted }));
            // Keep local Set in sync for sidebar indicator
            setMutedConvs(prev => {
                const next = new Set(prev);
                newMuted ? next.add(activeConv.id) : next.delete(activeConv.id);
                return next;
            });
            toast.success(newMuted ? 'Notifications muted' : 'Notifications unmuted');
        } catch { toast.error('Failed to update mute setting'); }
        setShowChatMenu(false);
    };

    const handleReport = async () => {
        if (!activeConv || !reportReason.trim()) return;
        const partner = getPartner(activeConv);
        try { await reportUser(partner?.id, reportReason); toast.success('Report submitted'); setShowReportModal(false); setReportReason(''); }
        catch { toast.error('Failed to submit report'); }
    };

    const loadRequests = async () => {
        setRequestsLoading(true);
        try {
            const res = await getConversationRequests();
            setRequests((res.success && res.data) ? res.data : []);
        } catch { setRequests([]); }
        finally { setRequestsLoading(false); }
    };

    const handleAcceptRequest = async (convId) => {
        try {
            await acceptConversationRequest(convId);
            setRequests(prev => prev.filter(r => r.id !== convId));
            toast.success('Request accepted');
            // Reload conversations to include the newly accepted one
            loadConversations();
        } catch { toast.error('Failed to accept request'); }
    };

    const handleRejectRequest = async (convId) => {
        try {
            await rejectConversationRequest(convId);
            setRequests(prev => prev.filter(r => r.id !== convId));
            toast.success('Request declined');
        } catch { toast.error('Failed to decline request'); }
    };

    const loadBlockedUsers = async () => {
        setBlockedLoading(true);
        try {
            const res = await getBlockedUsers();
            setBlockedUsers((res.success && res.data) ? res.data : []);
        } catch { setBlockedUsers([]); }
        finally { setBlockedLoading(false); }
    };

    const handleUnblock = async (userId) => {
        try {
            await unblockUser(userId);
            setBlockedUsers(prev => prev.filter(u => (u.id || u.user_id) !== userId));
            toast.success('User unblocked');
        } catch { toast.error('Failed to unblock user'); }
    };

    const openBlockedModal = () => { setShowBlockedModal(true); loadBlockedUsers(); };

    const loadCallLogs = async () => {
        setCallLogsLoading(true);
        try {
            const res = await getCallLogs();
            setCallLogs((res.success && res.data) ? res.data : []);
        } catch { setCallLogs([]); }
        finally { setCallLogsLoading(false); }
    };

    const filteredConvs = conversations.filter(c => getPartner(c)?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const activePartner = getPartner(activeConv);
    // Check both id and user_id since backend may use either in the online-users array
    const isPartnerOnline = activeConv && onlineUsers.has(String(activeConv.id));

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Page header — compact, no wasted space */}

            <div className="flex flex-1 min-h-0 overflow-hidden relative mx-0 sm:mx-4 mb-0 sm:mb-4 mt-0 sm:mt-1 rounded-none sm:rounded-[28px] backdrop-blur-3xl shadow-2xl" 
                style={{ 
                    background: 'var(--color-primary)', // Airy background
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
                }}>
                {/* LEFT SIDEBAR */}
                <div className={`w-full md:w-80 min-h-0 flex flex-col relative z-20 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`} 
                    style={{ 
                        borderRight: '1px solid var(--color-border)', 
                        background: 'var(--color-secondary)',
                        backdropFilter: 'blur(10px)'
                    }}>
                    {/* Sidebar header */}
                    <div className="px-4 pt-4 pb-2">
                        {/* Chats / Requests tabs — Match DashboardHome style */}
                        <div className="flex items-center gap-2 sm:gap-3 border-b border-white/5 mb-4 px-1">
                            {[
                                { key: 'chats', label: 'Chats', count: conversations.length },
                                { key: 'requests', label: 'Req', count: requests.length },
                                { key: 'blocked', label: 'Block', count: blockedUsers.length },
                                { key: 'calls', label: 'Calls', count: callLogs.length },
                            ].map(({ key, label, count }) => (
                                <button key={key} onClick={() => setSidebarTab(key)}
                                    className={`pb-3 text-[10px] sm:text-[11px] font-bold tracking-[0.1em] transition-all relative group/tab uppercase flex items-center gap-1 sm:gap-1.5 ${sidebarTab === key ? "text-accent" : "text-white/40 hover:text-white/80"}`}>
                                    {label}
                                    {count > 0 && (
                                        <span className={`min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center transition-colors ${sidebarTab === key ? 'bg-accent/20 text-accent' : 'bg-white/5 text-white/30'}`}>
                                            {count}
                                        </span>
                                    )}
                                    {sidebarTab === key ? (
                                        <motion.div
                                            layoutId="activeSidebarTabUnderline"
                                            className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent rounded-full"
                                        />
                                    ) : (
                                        <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-accent/0 group-hover/tab:bg-accent/40 transition-all duration-300 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {sidebarTab === 'chats' && (
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 group">
                                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400/30 group-focus-within:text-blue-400/70 transition-colors" />
                                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-xs text-light-text placeholder-text-muted rounded-xl transition-all focus:outline-none border-none"
                                        style={{ background: 'var(--color-hover)' }}
                                        onFocus={e => { e.target.style.border = '1px solid var(--color-accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)'; }}
                                        onBlur={e => { e.target.style.border = '1px solid var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        placeholder="Search conversations..." />
                                </div>
                                <button onClick={() => { setShowNewMsg(p => !p); setUserSearch(''); setUserResults([]); }}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95 border-none"
                                    style={{ background: showNewMsg ? 'rgba(37,99,235,0.1)' : 'var(--color-hover)', color: showNewMsg ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                                    {showNewMsg ? <X size={14} /> : <Plus size={14} />}
                                </button>
                            </div>
                        )}

                        {sidebarTab === 'chats' && showNewMsg && (
                            <div className="mt-3 rounded-2xl overflow-hidden backdrop-blur-xl" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                                <div className="relative">
                                    <UserSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50" />
                                    <input autoFocus value={userSearch} onChange={e => handleUserSearch(e.target.value)}
                                        placeholder="Search by name..." className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs text-light-text placeholder-text-muted focus:outline-none" />
                                </div>
                                {searchingUsers && <div className="flex items-center justify-center py-4"><InfinityLoader/></div>}
                                {!searchingUsers && userResults.length > 0 && (
                                    <div className="max-h-44 overflow-y-auto" style={{ borderTop: '1px solid rgba(59,130,246,0.08)' }}>
                                        {userResults.map(u => {
                                            const uid = u?.id || u?.user_id || u?.profile_id || u?.userId;
                                            return (
                                                <button key={uid || u.email} onClick={() => handleStartConversation(u)} disabled={startingConv === uid}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 transition text-left disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/5">
                                                    {u.avatar_url || u.image
                                                        ? <img src={u.avatar_url || u.image} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" style={{ border: '1px solid var(--color-border)' }} />
                                                        : <div className="w-7 h-7 rounded-full flex items-center justify-center text-accent text-xs font-bold shrink-0" style={{ background: 'rgba(37,99,235,0.08)' }}>{u.name?.[0]?.toUpperCase()}</div>
                                                    }
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-light-text text-xs font-semibold truncate">{u.name}</p>
                                                        {u.title && <p className="text-text-muted text-[10px] truncate">{u.title}</p>}
                                                    </div>
                                                    {startingConv === uid ? <InfinityLoader/> : <Plus size={12} className="text-accent shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                {!searchingUsers && userSearch && userResults.length === 0 && <p className="text-white/20 text-xs text-center py-3">No users found</p>}
                            </div>
                        )}
                    </div>

                    {/* Conversation list OR Requests list */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-0.5">
                        {sidebarTab === 'requests' ? (requestsLoading ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3">
                                <InfinityLoader/>
                                <p className="text-xs text-white/20">Loading requests...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-30">
                                <MessageCircle size={36} strokeWidth={1} className="text-blue-400/50" />
                                <p className="text-xs text-white/40">No pending requests</p>
                            </div>
                        ) : requests.map(req => {
                            const sender = req.other_user || req.sender || req.client || req.freelancer || {};
                            const senderName = sender.name || req.sender_name || 'Unknown';
                            const senderAvatar = sender.avatar_url || req.sender_avatar || null;
                            return (
                                <div key={req.id} className="px-4 py-4 rounded-2xl transition-all" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                    <div className="flex items-center gap-3 mb-4">
                                        {senderAvatar
                                            ? <img src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '1px solid var(--color-border)' }} />
                                            : <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: 'rgba(37,99,235,0.05)', color: 'var(--color-accent)' }}>{(senderName)[0].toUpperCase()}</div>
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className="text-light-text text-xs font-semibold truncate">{senderName}</p>
                                            <p className="text-text-muted text-[10px] mt-0.5">Wants to message you</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRejectRequest(req.id)}
                                            className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 border-none"
                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                                            Decline
                                        </button>
                                        <button onClick={() => handleAcceptRequest(req.id)}
                                            className="flex-1 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 border-none"
                                            style={{ background: 'var(--accent)', color: '#fff' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                        ) : sidebarTab === 'blocked' ? (
                            blockedLoading ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3">
                                    <InfinityLoader/>
                                    <p className="text-xs text-text-muted">Loading...</p>
                                </div>
                            ) : blockedUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-30">
                                    <Ban size={36} strokeWidth={1} className="text-accent/50" />
                                    <p className="text-xs text-text-muted">No blocked users</p>
                                </div>
                            ) : blockedUsers.map(u => {
                                const uid = u.id || u.user_id || u.blocked_id || u.blocked?.id;
                                const name = u.name || u.blocked_name || u.blocked?.name || u.email?.split('@')[0] || 'Unknown';
                                const avatar = u.avatar_url || u.blocked_avatar || u.blocked?.avatar_url || null;
                                return (
                                    <div key={uid} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)' }}>
                                        {avatar
                                            ? <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '1px solid rgba(239,68,68,0.1)' }} />
                                            : <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>{name[0].toUpperCase()}</div>
                                        }
                                        <p className="flex-1 text-xs font-semibold truncate" style={{ color: 'var(--color-text-secondary)' }}>{name}</p>
                                        <button onClick={() => handleUnblock(uid)}
                                            className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 shrink-0 border-none"
                                            style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--color-accent)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.15)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.08)'}>
                                            Unblock
                                        </button>
                                    </div>
                                );
                            })
                        ) : sidebarTab === 'calls' ? (
                            callLogsLoading ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3">
                                    <InfinityLoader/>
                                    <p className="text-xs text-text-muted">Loading...</p>
                                </div>
                            ) : callLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-30">
                                    <Phone size={36} strokeWidth={1} className="text-accent/50" />
                                    <p className="text-xs text-text-muted">No call history</p>
                                </div>
                            ) : callLogs.map(log => {
                                const isOutgoing = log.direction === 'outgoing';
                                const other = isOutgoing ? log.receiver : log.caller;
                                const name = other?.name || 'Unknown';
                                const avatar = other?.avatar_url || null;
                                const statusColor = log.status === 'completed' ? '#22c55e' : log.status === 'missed' ? '#ef4444' : 'var(--color-text-muted)';
                                return (
                                    <div key={log.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                                        <div className="relative shrink-0">
                                            {avatar
                                                ? <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" style={{ border: '1px solid var(--color-border)' }} />
                                                : <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(37,99,235,0.05)', color: 'var(--color-accent)' }}>{name[0].toUpperCase()}</div>
                                            }
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-black/5" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                                                {log.call_type === 'video' ? <Video size={10} color="var(--color-accent)" /> : <Phone size={10} color="var(--color-accent)" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span style={{ color: isOutgoing ? 'var(--color-accent)' : statusColor, fontSize: 10 }}>{isOutgoing ? '↗' : '↙'}</span>
                                                <p className="text-xs font-semibold truncate text-light-text">{name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium capitalize" style={{ color: statusColor }}>{log.status || 'completed'}</span>
                                                {log.duration_formatted && log.duration_formatted !== '0:00' && (
                                                    <span className="text-[10px] text-text-muted">{log.duration_formatted}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[9px] shrink-0 text-text-muted/60">
                                            {log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                                        <InfinityLoader/>
                                        <p className="text-xs text-text-muted">Loading...</p>
                                    </div>
                                ) : filteredConvs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-30">
                                        <MessageCircle size={36} strokeWidth={1} className="text-accent/50" />
                                        <p className="text-xs text-text-muted">No conversations yet</p>
                                    </div>
                                ) : filteredConvs.map(conv => {
                                    const partner = getPartner(conv);
                                    const isOnline = onlineUsers.has(String(conv.id));
                                    const isActive = activeConv?.id === conv.id;
                                    return (
                                        <button key={conv.id} onClick={() => openConversation(conv)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group relative active:scale-[0.98]"
                                            style={{
                                                background: isActive ? 'rgba(37,99,235,0.06)' : 'transparent',
                                                border: 'none',
                                                boxShadow: isActive ? 'inset 0 1px 0 rgba(0,0,0,0.02)' : 'none',
                                            }}
                                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--color-hover)'; } }}
                                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; } }}
                                        >
                                            {/* Active identifier - subtle glow */}
                                            {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-accent shadow-[0_0_12px_rgba(37,99,235,0.3)]" />}

                                            <div className="relative shrink-0">
                                                {partner?.avatar_url
                                                    ? <img src={partner.avatar_url} alt={partner.name} className="w-12 h-12 rounded-full object-cover transition-transform group-hover:scale-105" style={{ border: '1px solid var(--color-border)' }} />
                                                    : <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-transform group-hover:scale-105" style={{ background: 'rgba(37,99,235,0.05)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>{(partner?.name || '?')[0].toUpperCase()}</div>
                                                }
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2`}
                                                    style={{ background: isOnline ? '#22c55e' : 'var(--color-text-muted)', borderColor: 'var(--color-secondary)' }} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="font-semibold text-xs truncate" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-light-text)' }}>{partner?.name || 'User'}</p>
                                                    <div className="flex items-center gap-1 shrink-0 ml-1">
                                                        {mutedConvs.has(conv.id) && <BellOff size={9} className="text-text-muted/40" />}
                                                        <span className="text-[9px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{formatConvTime(conv.last_message_at)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] truncate" style={{ color: isActive ? 'rgba(37,99,235,0.6)' : 'var(--color-text-muted)' }}>{conv.last_message || 'Start a conversation'}</p>
                                            </div>

                                            {conv.unread_count > 0 && (
                                                <span className="shrink-0 w-4.5 h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                                    style={{ background: 'var(--color-accent)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT CHAT PANEL */}
                <div className={`flex-1 min-h-0 flex flex-col relative overflow-hidden ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`} style={{ background: 'var(--color-primary)' }}>
                    {!activeConv ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                            {/* Illustration */}
                            <div className="relative mb-6">
                                <div style={{ width: 100, height: 100, borderRadius: 32, background: 'var(--color-secondary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.02)', backdropFilter: 'blur(10px)' }}>
                                    <MessageCircle size={40} color="var(--accent)" strokeWidth={1} />
                                </div>
                                {/* Floating dots */}
                                {[{ top: -10, right: -10, size: 10, delay: '0s' }, { top: 10, right: -25, size: 6, delay: '0.4s' }, { top: -20, right: 15, size: 5, delay: '0.8s' }].map((d, i) => (
                                    <div key={i} style={{ position: 'absolute', top: d.top, right: d.right, width: d.size, height: d.size, borderRadius: '50%', background: 'var(--accent)', opacity: 0.1, animation: `pulse 2s ${d.delay} infinite` }} />
                                ))}
                            </div>
                            <h3 style={{ color: 'var(--color-light-text)', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Your messages</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 12, lineHeight: 1.6, maxWidth: 200 }}>
                                Select a conversation or start a new one to begin messaging
                            </p>
                            <button onClick={() => { setShowNewMsg(true); setSidebarTab('chats'); }}
                                className="px-8 py-3 rounded-2xl bg-accent text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-lg shadow-accent/10 active:scale-95 border-none mt-8">
                                + New Message
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Premium Chat Header */}
                            <div className="flex items-center gap-3 px-6 py-4 relative z-20 shrink-0 backdrop-blur-3xl" style={{ background: 'var(--color-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                                <button onClick={() => setMobileShowChat(false)} className="md:hidden p-1.5 rounded-lg transition" style={{ color: 'var(--color-text-muted)', background: 'var(--color-hover)' }}>
                                    <ArrowLeft size={16} />
                                </button>
                                <div className="relative">
                                    {activePartner?.avatar_url
                                        ? <img src={activePartner.avatar_url} alt={activePartner.name} className="w-11 h-11 rounded-full object-cover" style={{ border: '1px solid var(--color-border)' }} />
                                        : <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base" style={{ background: 'rgba(37,99,235,0.05)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>{(activePartner?.name || '?')[0].toUpperCase()}</div>
                                    }
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2" style={{ background: isPartnerOnline ? '#22c55e' : 'var(--color-text-muted)', borderColor: 'var(--color-secondary)', boxShadow: isPartnerOnline ? '0 0 8px rgba(34,197,94,0.3)' : 'none' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm tracking-tight truncate text-light-text">{activePartner?.name || 'User'}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {partnerTyping
                                            ? <span className="text-[11px] font-medium" style={{ color: 'var(--color-accent)' }}>typing...</span>
                                            : <span className="text-[11px] font-medium" style={{ color: isPartnerOnline ? '#22c55e' : 'var(--color-text-muted)' }}>{isPartnerOnline ? 'Online now' : 'Offline'}</span>
                                        }
                                        {isPartnerOnline && !partnerTyping && <span className="w-1 h-1 rounded-full bg-green-400 animate-ping" />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[{ icon: <Phone size={16} />, label: 'Audio Call', type: 'audio' }, { icon: <Video size={16} />, label: 'Video Call', type: 'video' }].map(({ icon, label, type }) => (
                                        <button key={type} onClick={() => { if (!isPartnerOnline) { toast.error(`${activePartner?.name || 'User'} is offline`); return; } window.__startCall?.(activePartner?.id, type, activePartner?.name, activePartner?.avatar_url, activeConv?.id); }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border-none"
                                            style={{ color: isPartnerOnline ? 'var(--color-accent)' : 'var(--color-text-muted)', cursor: isPartnerOnline ? 'pointer' : 'not-allowed', background: 'transparent' }}
                                            onMouseEnter={e => { if (isPartnerOnline) { e.currentTarget.style.background = 'var(--color-hover)'; e.currentTarget.style.color = 'var(--color-accent)'; } }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isPartnerOnline ? 'var(--color-accent)' : 'var(--color-text-muted)'; }}
                                            title={isPartnerOnline ? label : 'User is offline'}>{icon}</button>
                                    ))}
                                    {/* Start Meeting button */}
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams();
                                            if (activePartner?.id) params.set('clientId', activePartner.id);
                                            if (activeConv?.id) params.set('conversationId', activeConv.id);
                                            navigate(`/meeting/create?${params.toString()}`);
                                        }}
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border-none"
                                        style={{ color: 'rgba(255,255,255,0.5)', background: 'transparent' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--accent)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                                        title="Start Meeting">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
                                    </button>
                                    <div className="w-px h-5 mx-1" style={{ background: 'var(--color-border)' }} />
                                    <div className="relative" ref={chatMenuRef}>
                                        <button onClick={() => {
                                            const opening = !showChatMenu;
                                            setShowChatMenu(opening);
                                            // Fetch block status when opening the menu
                                            if (opening && activePartner?.id) {
                                                getBlockStatus(activePartner.id)
                                                    .then(res => setIsPartnerBlocked(res?.data?.blocked ?? false))
                                                    .catch(() => { });
                                            }
                                        }} className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border-none bg-transparent"
                                            style={{ color: 'var(--color-text-muted)' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-hover)'; e.currentTarget.style.color = 'var(--color-light-text)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                            <MoreVertical size={18} />
                                        </button>
                                        {showChatMenu && (
                                            <div className="absolute right-0 top-11 w-52 rounded-2xl shadow-2xl z-50 overflow-hidden" 
                                                style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)', backdropFilter: 'blur(20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}>
                                                {[
                                                    { icon: convMuteStatus[activeConv?.id] ? <Bell size={13} /> : <BellOff size={13} />, label: convMuteStatus[activeConv?.id] ? 'Unmute notifications' : 'Mute notifications', action: handleMute },
                                                    { icon: <Trash2 size={13} />, label: 'Clear chat', action: handleClearChat },
                                                    { icon: <Flag size={13} />, label: 'Report user', action: () => { setShowChatMenu(false); setShowReportModal(true); } },
                                                    { icon: <Ban size={13} />, label: isPartnerBlocked ? 'Unblock user' : 'Block user', action: handleBlock, danger: !isPartnerBlocked },
                                                    { icon: <Ban size={13} />, label: 'Blocked users', action: () => { setShowChatMenu(false); openBlockedModal(); } },
                                                ].map(({ icon, label, action, danger }) => (
                                                    <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition border-none bg-transparent"
                                                        style={{ color: danger ? '#ef4444' : 'var(--color-text-secondary)' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-hover)'; e.currentTarget.style.color = danger ? '#dc2626' : 'var(--color-light-text)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = danger ? '#ef4444' : 'var(--color-text-secondary)'; }}>
                                                        {icon}{label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 scrollbar-hide flex flex-col" style={{ background: 'var(--color-primary)' }}>
                                {/* GATING BANNER */}
                                {unfundedContract && !chatGating.isBlocked && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                        className="mx-2 mb-4 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg"
                                        style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                                <Bell size={14} className="animate-bounce" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-light-text">Action Required: Secure Project Escrow</p>
                                                <p className="text-[10px] text-text-muted">Chat is limited to 15 messages for unfunded contracts.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate(`/checkout?contractId=${activeConv.contract_id}`)}
                                            className="px-4 py-1.5 rounded-xl bg-accent text-white text-[10px] font-bold hover:scale-105 transition-all">
                                            Fund Now
                                        </button>
                                    </motion.div>
                                )}

                                {chatGating.isBlocked && (
                                    <div className="mx-2 mb-6 p-6 rounded-[24px] text-center border-2 border-dashed border-red-500/20 bg-red-500/5 group">
                                        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Ban size={24} className="text-red-500" />
                                        </div>
                                        <h4 className="text-sm font-bold text-red-500 mb-1">Conversation Gated</h4>
                                        <p className="text-xs text-text-muted mb-6 px-4">The 15-message limit for this unfunded contract has been reached. Please secure the milestone escrow to continue the discussion.</p>
                                        <button onClick={() => navigate(`/checkout?contractId=${activeConv.contract_id}`)}
                                            className="px-8 py-3 rounded-2xl bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all">
                                            Fund Milestone to Unlock
                                        </button>
                                    </div>
                                )}

                                {messages.map((msg, idx) => {
                                    const isMine = msg.sender_id === currentUserId;
                                    const showDate = idx === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1]?.created_at).toDateString();
                                    const prevMsg = messages[idx - 1];
                                    const nextMsg = messages[idx + 1];
                                    const isGrouped = prevMsg && prevMsg.sender_id === msg.sender_id && !showDate;
                                    const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                                    return (
                                        <div key={msg.id || idx} style={{ marginTop: isGrouped ? 2 : 12 }}>
                                            {showDate && (
                                                <div className="flex items-center gap-3 py-3">
                                                    <div className="h-px flex-1" style={{ background: 'rgba(59,130,246,0.08)' }} />
                                                    <span className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(59,130,246,0.1)', letterSpacing: '0.05em' }}>
                                                        {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <div className="h-px flex-1" style={{ background: 'rgba(59,130,246,0.08)' }} />
                                                </div>
                                            )}
                                            <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                {/* Receiver avatar — only on last in group */}
                                                {!isMine && (
                                                    <div style={{ width: 28, flexShrink: 0, alignSelf: 'flex-end', marginBottom: 2 }}>
                                                        {isLastInGroup ? (
                                                            activePartner?.avatar_url
                                                                ? <img src={activePartner.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} />
                                                                : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{(activePartner?.name || '?')[0].toUpperCase()}</div>
                                                        ) : null}
                                                    </div>
                                                )}
                                                <div style={{
                                                    maxWidth: '72%',
                                                    padding: msg.message_type === 'image' ? '6px' : '12px 18px',
                                                    borderRadius: isMine
                                                        ? isGrouped ? '20px 6px 6px 20px' : '20px 6px 20px 20px'
                                                        : isGrouped ? '6px 20px 20px 6px' : '6px 20px 20px 20px',
                                                    background: isMine
                                                        ? 'var(--color-accent)'
                                                        : 'var(--color-secondary)',
                                                    border: isMine ? 'none' : '1px solid var(--color-border)',
                                                    boxShadow: isMine ? '0 4px 12px rgba(37,99,235,0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
                                                    color: isMine ? '#fff' : 'var(--color-light-text)',
                                                    position: 'relative'
                                                }}>
                                                    {msg.message_type === 'call' ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}>
                                                            <div style={{ width: 32, height: 32, borderRadius: 10, background: isMine ? 'rgba(255,255,255,0.15)' : 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                {msg.call_type === 'video'
                                                                    ? <Video size={15} className={isMine ? 'text-white' : 'text-accent'} />
                                                                    : <Phone size={15} className={isMine ? 'text-white' : 'text-accent'} />
                                                                }
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: 12.5, fontWeight: 600, color: isMine ? '#fff' : 'var(--color-light-text)', margin: 0 }}>
                                                                    {msg.call_type === 'video' ? 'Video call' : 'Audio call'}
                                                                </p>
                                                                <p style={{ fontSize: 11, color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)', margin: 0, marginTop: 1 }}>
                                                                    {msg.call_duration
                                                                        ? `${Math.floor(msg.call_duration / 60)}:${String(msg.call_duration % 60).padStart(2, '0')}`
                                                                        : msg.message_text || 'Ended'
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : msg.message_type === 'image' && msg.file_url ? (
                                                        <a href={msg.file_url} target="_blank" rel="noreferrer">
                                                            <img src={msg.file_url} alt="attachment" style={{ borderRadius: 10, maxWidth: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
                                                        </a>
                                                    ) : msg.message_type === 'document' && msg.file_url ? (
                                                        <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', textDecoration: 'none' }}>
                                                            <FileText size={14} color={isMine ? 'rgba(255,255,255,0.8)' : '#60a5fa'} style={{ flexShrink: 0 }} />
                                                            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.file_name || 'Document'}</span>
                                                        </a>
                                                    ) : (
                                                        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: isMine ? '#fff' : 'var(--color-light-text)', margin: 0, wordBreak: 'break-word' }}>{msg.message_text || msg.content}</p>
                                                    )}
                                                    {isLastInGroup && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, justifyContent: 'flex-end' }}>
                                                            <span style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)' }}>{formatTime(msg.created_at)}</span>
                                                            {isMine && <span style={{ color: msg.is_read ? '#fff' : 'rgba(255,255,255,0.4)' }}>{msg.is_read ? <CheckCheck size={11} /> : <Check size={11} />}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {partnerTyping && (
                                    <div className="flex items-end gap-2 justify-start animate-in fade-in slide-in-from-left-4 duration-300" style={{ marginTop: 8 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                                            {(activePartner?.name || '?')[0].toUpperCase()}
                                        </div>
                                        <div style={{
                                            padding: '10px 14px',
                                            borderRadius: '6px 16px 16px 16px',
                                            background: 'var(--color-secondary)',
                                            border: '1px solid var(--color-border)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                        }}>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', opacity: 0.5, display: 'inline-block', animation: `bounce 1.2s ${i * 0.15}s infinite` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Premium Input */}
                            <div className="px-6 pb-6 pt-4 shrink-0" style={{ background: 'transparent' }}>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1 flex flex-col">
                                        {/* GATING COUNTER */}
                                        {unfundedContract && !chatGating.isBlocked && (
                                            <div className="flex items-center justify-end px-4 mb-2">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${messages.filter(m => !m._optimistic).length >= 12 ? 'text-red-400 bg-red-400/5' : 'text-accent bg-accent/5'}`}>
                                                    {messages.filter(m => !m._optimistic).length} / 15 messages used
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-end gap-3 px-5 py-3.5 rounded-[24px] transition-all relative backdrop-blur-3xl shadow-sm"
                                            style={{ 
                                                background: 'var(--color-primary)', 
                                                border: '1px solid var(--color-border)',
                                                opacity: chatGating.isBlocked ? 0.4 : 1 
                                            }}
                                            onFocusCapture={e => { if (chatGating.isBlocked) return; e.currentTarget.style.border = '1px solid var(--color-accent)'; e.currentTarget.style.background = 'var(--color-secondary)'; }}
                                            onBlurCapture={e => { e.currentTarget.style.border = '1px solid var(--color-border)'; e.currentTarget.style.background = 'var(--color-secondary)'; }}>
                                            <button disabled={chatGating.isBlocked} onClick={() => setShowEmoji(!showEmoji)} className="shrink-0 self-center transition-all border-none bg-transparent" style={{ color: 'var(--color-text-muted)', padding: 0 }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
                                                <Smile size={20} strokeWidth={1.5} />
                                            </button>
                                            {showEmoji && (
                                                <div className="absolute bottom-16 left-0 p-4 flex flex-wrap gap-2 w-64 z-50 rounded-3xl shadow-xl animate-in slide-in-from-bottom-2 duration-300" 
                                                    style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                                                    {EMOJI_LIST.map(e => (
                                                        <button key={e} onClick={() => { setText(t => t + e); setShowEmoji(false); }} className="w-9 h-9 flex items-center justify-center rounded-xl text-lg transition hover:scale-110 hover:bg-black/5 dark:hover:bg-white/5 border-none bg-transparent" style={{ cursor: 'pointer' }}>{e}</button>
                                                    ))}
                                                </div>
                                            )}
                                            <textarea disabled={chatGating.isBlocked} value={text} onChange={e => { setText(e.target.value); handleTyping(); }} onKeyDown={handleKeyDown}
                                                rows={1} className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-24 overflow-y-auto py-1.5 leading-relaxed self-center border-none placeholder:text-text-secondary/70"
                                                style={{ color: 'var(--color-light-text)', caretColor: 'var(--color-accent)' }}
                                                placeholder={chatGating.isBlocked ? "Input locked for unfunded project" : "Type a message..."} />
                                            <button disabled={chatGating.isBlocked} onClick={() => fileInputRef.current?.click()} className="shrink-0 self-center transition-all border-none bg-transparent" style={{ color: 'var(--color-text-muted)', padding: 0 }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
                                                <Paperclip size={20} strokeWidth={1.5} />
                                            </button>
                                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.zip" />
                                        </div>
                                    </div>
                                    <button onClick={handleSend} disabled={!text.trim() || isSending || chatGating.isBlocked}
                                        className="shrink-0 w-12 h-12 flex items-center justify-center transition-all active:scale-90 self-end disabled:opacity-20 disabled:cursor-not-allowed border-none bg-transparent"
                                        style={{ color: text.trim() && !chatGating.isBlocked ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                                        onMouseEnter={e => { if (text.trim() && !isSending && !chatGating.isBlocked) e.currentTarget.style.color = 'var(--color-accent)'; }}
                                        onMouseLeave={e => { if (text.trim() && !isSending && !chatGating.isBlocked) e.currentTarget.style.color = 'var(--color-accent)'; }}>
                                        {isSending ? <InfinityLoader/> : <Send size={22} strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Blocked Users Modal */}
                {showBlockedModal && (
                    <div className="absolute inset-0 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300" style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <div className="w-full max-w-sm rounded-[32px] p-8 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-300" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.1)' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-light-text font-semibold text-lg">Blocked Users</h3>
                                <button onClick={() => setShowBlockedModal(false)} className="w-9 h-9 rounded-full flex items-center justify-center transition border-none bg-transparent" style={{ color: 'var(--color-text-muted)' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-light-text)'; e.currentTarget.style.background = 'var(--color-hover)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                                    <X size={18} />
                                </button>
                            </div>
                            {blockedLoading ? (
                                <div className="flex items-center justify-center py-12"><InfinityLoader/></div>
                            ) : blockedUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 opacity-40 gap-3">
                                    <Ban size={40} strokeWidth={1} />
                                    <p className="text-sm font-medium">No blocked users</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                    {blockedUsers.map(u => {
                                        const uid = u.id || u.user_id || u.blocked_id || u.blocked?.id;
                                        const name = u.name || u.blocked_name || u.blocked?.name || u.username || u.email?.split('@')[0] || 'Unknown';
                                        const avatar = u.avatar_url || u.blocked_avatar || u.blocked?.avatar_url || u.image || null;
                                        return (
                                            <div key={uid} className="flex items-center gap-3 p-3.5 rounded-2xl transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ background: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
                                                {avatar
                                                    ? <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '1px solid var(--color-border)' }} />
                                                    : <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'rgba(37,99,235,0.05)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>{name[0].toUpperCase()}</div>
                                                }
                                                <p className="flex-1 text-sm font-medium text-light-text truncate">{name}</p>
                                                <button onClick={() => handleUnblock(uid)}
                                                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all border-none bg-accent/10 text-accent hover:bg-accent/20">
                                                    Unblock
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {showReportModal && (
                    <div className="absolute inset-0 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300" style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <div className="w-full max-w-sm rounded-[32px] p-8 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-300" style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.1)' }}>
                            <h3 className="text-light-text font-semibold text-lg mb-1">Report User</h3>
                            <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>Tell us what's wrong with this conversation.</p>
                            <div className="mb-4">
                                <CustomDropdown
                                    options={[
                                        { label: 'Spam or unwanted messages', value: 'spam' },
                                        { label: 'Harassment or abuse', value: 'harassment' },
                                        { label: 'Scam or fraud', value: 'scam' },
                                        { label: 'Inappropriate content', value: 'inappropriate' },
                                        { label: 'Other', value: 'other' }
                                    ]}
                                    value={reportReason}
                                    onChange={val => setReportReason(val)}
                                    placeholder="Select a reason..."
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="flex-1 py-3 rounded-2xl text-sm font-medium transition border-none bg-transparent text-text-muted hover:bg-black/5 dark:hover:bg-white/5">Cancel</button>
                                <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-3 rounded-2xl text-sm font-bold transition disabled:opacity-40 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none">Submit Report</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
