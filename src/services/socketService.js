import { io } from 'socket.io-client';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

import { getSocketUrl } from '../utils/authUtils';
 
const API_URL = getSocketUrl();

let socket = null;
let _connecting = false;
var _pendingQueue = []; // Use var to avoid TDZ issues in module exports



export async function connectSocket() {
    if (socket?.connected) return socket;

    // Prevent multiple simultaneous connection attempts
    if (_connecting) {
        // Wait for existing connection attempt
        await new Promise(resolve => {
            const check = setInterval(() => {
                if (socket?.connected || !_connecting) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
            setTimeout(() => { clearInterval(check); resolve(); }, 5000);
        });
        if (socket?.connected) return socket;
    }

    _connecting = true;

    try {
        // Wait for valid session (up to 3s)
        let session = null;
        for (let i = 0; i < 6; i++) {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.access_token) { session = data.session; break; }
            await new Promise(r => setTimeout(r, 500));
        }
        if (!session?.access_token) throw new Error('Not authenticated');

        // If socket exists with wrong token, disconnect it first
        if (socket) {
            socket.disconnect();
            socket = null;
        }

        socket = io(API_URL, {
            auth: { token: session.access_token },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            timeout: 10000,
        });

        // Wait for connection
        await new Promise((resolve, reject) => {
            const t = setTimeout(() => {
                logger.error('[Socket] Handshake timed out after 10s', { url: API_URL });
                reject(new Error('Connection timeout'));
            }, 10000);
            
            socket.once('connect', () => { 
                clearTimeout(t); 
                logger.log('[Socket] Handshake successful');
                resolve(); 
            });
            
            socket.once('connect_error', (err) => { 
                clearTimeout(t); 
                logger.error('[Socket] Handshake error:', err.message);
                reject(err); 
            });
        });

        socket.on('connect', () => {
            logger.log('[Socket] Connected:', socket.id);
            
            // Flush the pending listeners queue
            while (_pendingQueue.length > 0) {
                const { event, cb } = _pendingQueue.shift();
                socket.off(event, cb);
                socket.on(event, cb);
            }
            
            // Flush any listeners registered before connection

            _pendingOnlineUsersListeners.forEach(cb => {
                socket.off('online-users', cb);
                socket.on('online-users', cb);
            });
            _pendingOnlineUsersListeners.length = 0;
            // Re-request online users on every reconnect
            setTimeout(() => socket.emit('get-online-users'), 200);

            // Heartbeat — immediate ping on connect, then every 30s
            socket.emit('heartbeat');
            const heartbeatInterval = setInterval(() => {
                if (socket.connected) socket.emit('heartbeat');
            }, 30000);
            socket.once('disconnect', () => clearInterval(heartbeatInterval));
        });

        socket.on('disconnect', (reason) => {
            logger.log('[Socket] Disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            logger.error('[Socket] Connection Error:', err);
        });

        socket.onAny((event) => {
            if (event.startsWith('call') || event === 'incoming-call') {
                logger.log('[Socket] Call event:', event);
            }
        });

        let lastToken = null;
        supabase.auth.onAuthStateChange((event, sess) => {
            if (event === 'TOKEN_REFRESHED' && sess?.access_token && socket) {
                if (lastToken === sess.access_token) return; // guard against loop
                lastToken = sess.access_token;
                socket.auth = { token: sess.access_token };
                // Update auth without full reconnect — avoids triggering another auth event
                socket.io.opts.auth = { token: sess.access_token };
            }
        });

        return socket;
    } finally {
        _connecting = false;
    }
}

export function getSocket() { return socket; }

export function disconnectSocket() {
    if (socket) { socket.disconnect(); socket = null; }
}

export function joinConversation(id) { socket?.emit('join-conversation', id); }
export function leaveConversation(id) { socket?.emit('leave-conversation', id); }
export function sendSocketMessage(conversationId, data) { socket?.emit('send-message', { conversationId, ...data }); }
export function onNewMessage(cb) { 
    if (socket) {
        socket.on('new-message', cb); 
    } else {
        _pendingQueue.push({ event: 'new-message', cb });
    }
    return () => socket?.off('new-message', cb); 
}

export function onSocketError(cb) { 
    if (socket) {
        socket.on('error', cb); 
    } else {
        _pendingQueue.push({ event: 'error', cb });
    }
    return () => socket?.off('error', cb); 
}

export function onMessageBlocked(cb) { 
    if (socket) {
        socket.on('message-blocked', cb); 
    } else {
        _pendingQueue.push({ event: 'message-blocked', cb });
    }
    return () => socket?.off('message-blocked', cb); 
}

export function onChatBlocked(cb) { 
    if (socket) {
        socket.on('chat-blocked', cb); 
    } else {
        _pendingQueue.push({ event: 'chat-blocked', cb });
    }
    return () => socket?.off('chat-blocked', cb); 
}

export function emitTyping(id) { socket?.emit('typing', { conversationId: id }); }
export function emitStopTyping(id) { socket?.emit('stop-typing', { conversationId: id }); }
export function onUserTyping(cb) { socket?.on('user-typing', cb); return () => socket?.off('user-typing', cb); }
export function onUserStopTyping(cb) { socket?.on('user-stop-typing', cb); return () => socket?.off('user-stop-typing', cb); }
export function markMessagesRead(id) { socket?.emit('mark-read', { conversationId: id }); }
export function onMessagesRead(cb) { socket?.on('messages-read', cb); return () => socket?.off('messages-read', cb); }
export function requestOnlineUsers() { socket?.emit('get-online-users'); }
// Pending listeners registered before socket connects
const _pendingOnlineUsersListeners = [];

export function onOnlineUsers(cb) {
    if (socket) {
        socket.off('online-users', cb);
        socket.on('online-users', cb);
    } else {
        _pendingOnlineUsersListeners.push(cb);
    }
    return () => socket?.off('online-users', cb);
}
export function onUserOnline(cb) { socket?.on('user-online', cb); return () => socket?.off('user-online', cb); }
export function onUserOffline(cb) { socket?.on('user-offline', cb); return () => socket?.off('user-offline', cb); }

// ─── CALL SIGNALING ──────────────────────────────────────────────────────────
export function onIncomingCall(cb) { socket?.on('incoming-call', cb); return () => socket?.off('incoming-call', cb); }
export function onCallAccepted(cb) { socket?.on('call-accepted', cb); return () => socket?.off('call-accepted', cb); }
export function onCallRejected(cb) { socket?.on('call-rejected', cb); return () => socket?.off('call-rejected', cb); }
export function onCallEnded(cb) { socket?.on('call-ended', cb); return () => socket?.off('call-ended', cb); }
export function onIceCandidate(cb) { socket?.on('ice-candidate', cb); return () => socket?.off('ice-candidate', cb); }
export function onCallUnavailable(cb) { socket?.on('call-unavailable', cb); return () => socket?.off('call-unavailable', cb); }
export function initiateCall(targetUserId, callType, offer) { socket?.emit('call-request', { targetUserId, callType, offer }); }
export function acceptCall(callerId, answer) { socket?.emit('call-accept', { callerId, answer }); }
export function rejectCall(callerId) { socket?.emit('call-reject', { callerId }); }
export function sendIceCandidate(targetUserId, candidate) { socket?.emit('ice-candidate', { targetUserId, candidate }); }
export function endCall(targetUserId, callType, duration) { socket?.emit('call-end', { targetUserId, callType, duration }); }

// ─── MEETING INVITES ──────────────────────────────────────────────────────────
export function onMeetingInvite(cb) {
    if (socket) {
        socket.off('meeting-invite', cb);
        socket.on('meeting-invite', cb);
    }
    // Also register for when socket connects later
    const originalConnect = connectSocket;
    return () => socket?.off('meeting-invite', cb);
}

// ─── REAL-TIME DATA EVENTS ────────────────────────────────────────────────────
// Job events
export function onNewJob(cb) { socket?.on('new-job', cb); return () => socket?.off('new-job', cb); }
export function onJobDeleted(cb) { socket?.on('job-deleted', cb); return () => socket?.off('job-deleted', cb); }
export function onJobUpdated(cb) { socket?.on('job-updated', cb); return () => socket?.off('job-updated', cb); }

// Proposal events
export function onNewProposal(cb) { socket?.on('new-proposal', cb); return () => socket?.off('new-proposal', cb); }
export function onProposalStatusChanged(cb) { socket?.on('proposal-status-changed', cb); return () => socket?.off('proposal-status-changed', cb); }

// Notification events
export function onNewNotification(cb) { socket?.on('new-notification', cb); return () => socket?.off('new-notification', cb); }