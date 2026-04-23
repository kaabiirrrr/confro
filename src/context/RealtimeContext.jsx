import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, getSocket } from '../services/socketService';
import { useNotification } from '../hooks/useNotification';
import { logger } from '../utils/logger';

const RealtimeContext = createContext(null);

/**
 * Global real-time context.
 *
 * Manages the socket connection lifecycle and exposes typed listeners
 * that individual components can subscribe to without maintaining their
 * own socket connections.
 */
export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const { notify } = useNotification();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // ── Listener registries (component callbacks keyed by event) ──────────────
  const listeners = useRef({
    'new-job': new Set(),
    'job-deleted': new Set(),
    'job-updated': new Set(),
    'new-proposal': new Set(),
    'proposal-status-changed': new Set(),
    'new-notification': new Set(),
  });

  // ── Dispatch to all registered callbacks for an event ─────────────────────
  const dispatch = useCallback((event, data) => {
    listeners.current[event]?.forEach((cb) => {
      try { cb(data); } catch (err) {
        logger.error(`[Realtime] Listener error for "${event}"`, err);
      }
    });
  }, []);

  // ── Connect socket and wire all real-time events ───────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const connect = async () => {
      try {
        const socket = await connectSocket();
        if (!active) return;
        socketRef.current = socket;
        setIsConnected(true);

        // ── Job events ─────────────────────────────────────────────────────
        socket.on('new-job', (job) => {
          dispatch('new-job', job);
        });

        socket.on('job-deleted', ({ id }) => {
          dispatch('job-deleted', { id });
        });

        socket.on('job-updated', (job) => {
          dispatch('job-updated', job);
        });

        // ── Proposal events ────────────────────────────────────────────────
        socket.on('new-proposal', (proposal) => {
          dispatch('new-proposal', proposal);
          // Show iOS-style toast for the client
          notify({
            title: '📋 New Proposal',
            message: `Someone applied to "${proposal.job_title || 'your job'}"`,
            type: 'info',
            duration: 5000,
          });
        });

        socket.on('proposal-status-changed', (payload) => {
          dispatch('proposal-status-changed', payload);
          // Show iOS-style toast for the freelancer
          const accepted = payload.status === 'ACCEPTED';
          notify({
            title: accepted ? '🎉 Proposal Accepted!' : 'Proposal Rejected',
            message: accepted
              ? `Your proposal for "${payload.job_title}" was accepted!`
              : `Your proposal for "${payload.job_title}" was not selected.`,
            type: accepted ? 'success' : 'error',
            duration: 6000,
          });
        });

        // ── Notification events ────────────────────────────────────────────
        socket.on('new-notification', (notif) => {
          dispatch('new-notification', notif);
          notify({
            title: notif.title || 'New Notification',
            message: notif.content || '',
            type: 'info',
            duration: 5000,
          });
        });

        logger.log('[Realtime] Real-time listeners attached');
      } catch (err) {
        // Muffle the authentication warning to keep console clean
        if (err.message !== 'Not authenticated') {
           logger.error('[Realtime] Socket initialization error:', err);
        }
      }
    };

    connect();

    return () => {
      active = false;
      // Remove all real-time listeners but keep the socket alive for chat/calls
      const socket = socketRef.current || getSocket();
      if (socket) {
        ['new-job', 'job-deleted', 'job-updated', 'new-proposal', 'proposal-status-changed', 'new-notification']
          .forEach((ev) => socket.off(ev));
      }
      setIsConnected(false);
    };
  }, [user?.id, dispatch, notify]);

  // ── Public API: register / unregister typed listeners ─────────────────────
  const subscribe = useCallback((event, callback) => {
    if (!listeners.current[event]) {
      logger.warn(`[Realtime] Unknown event subscribed: "${event}"`);
      return () => {};
    }
    listeners.current[event].add(callback);
    return () => listeners.current[event].delete(callback);
  }, []);

  const value = { isConnected, subscribe };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
}

/**
 * Subscribe to new-job events. Callback receives the full job object.
 * Cleans up automatically on unmount.
 */
export function useRealtimeJobs({ onNewJob, onJobDeleted, onJobUpdated } = {}) {
  const { subscribe } = useRealtime();

  useEffect(() => {
    const unsubs = [];
    if (onNewJob) unsubs.push(subscribe('new-job', onNewJob));
    if (onJobDeleted) unsubs.push(subscribe('job-deleted', onJobDeleted));
    if (onJobUpdated) unsubs.push(subscribe('job-updated', onJobUpdated));
    return () => unsubs.forEach((fn) => fn());
  }, [subscribe, onNewJob, onJobDeleted, onJobUpdated]);
}

/**
 * Subscribe to proposal events. Callbacks receive proposal payloads.
 */
export function useRealtimeProposals({ onNewProposal, onStatusChanged } = {}) {
  const { subscribe } = useRealtime();

  useEffect(() => {
    const unsubs = [];
    if (onNewProposal) unsubs.push(subscribe('new-proposal', onNewProposal));
    if (onStatusChanged) unsubs.push(subscribe('proposal-status-changed', onStatusChanged));
    return () => unsubs.forEach((fn) => fn());
  }, [subscribe, onNewProposal, onStatusChanged]);
}

/**
 * Subscribe to notification events.
 */
export function useRealtimeNotifications({ onNewNotification } = {}) {
  const { subscribe } = useRealtime();

  useEffect(() => {
    const unsubs = [];
    if (onNewNotification) unsubs.push(subscribe('new-notification', onNewNotification));
    return () => unsubs.forEach((fn) => fn());
  }, [subscribe, onNewNotification]);
}
