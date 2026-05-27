import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSocket } from '../services/socketService';
import { logger } from '../utils/logger';
import { useAuth } from '../context/AuthContext';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes of inactivity = idle
const ACTIVITY_THROTTLE = 10000; // Throttle activity pings to once every 10s

// Map pathname to allowed admin modules
const getAdminModule = (pathname) => {
  if (!pathname.startsWith('/admin')) return null;
  
  const path = pathname.replace('/admin', '').toLowerCase();
  
  if (path === '' || path === '/' || path.startsWith('/dashboard')) return 'Dashboard';
  if (path.startsWith('/users')) return 'Users';
  if (path.startsWith('/kyc')) return 'KYC';
  if (path.startsWith('/disputes')) return 'Disputes';
  if (path.startsWith('/moderation')) return 'Moderation';
  if (path.startsWith('/treasury')) return 'Treasury';
  if (path.startsWith('/contracts')) return 'Contracts';
  if (path.startsWith('/jobs')) return 'Jobs';
  if (path.startsWith('/support')) return 'Support';
  if (path.startsWith('/faq')) return 'FAQ';
  if (path.startsWith('/settings')) return 'Settings';
  if (path.startsWith('/command-center') || path.startsWith('/sessions') || path.startsWith('/session-map')) return 'Command Center';
  if (path.startsWith('/fraud')) return 'Fraud';
  if (path.startsWith('/trust-graph')) return 'Trust Graph';
  if (path.startsWith('/verification')) return 'Verification';
  if (path.startsWith('/admins') || path.startsWith('/identity')) return 'Admins';
  
  return 'Dashboard'; // Fallback
};

export function usePresence() {
  const { user } = useAuth();
  const location = useLocation();
  const [isIdle, setIsIdle] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const idleTimeoutRef = useRef(null);
  const throttleRef = useRef(null);
  const socketRef = useRef(null);

  // Monitor path and module changes
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    if (!socket || !socket.connected) return;
    
    socketRef.current = socket;
    const currentPage = location.pathname;

    // 1. Emit instant heartbeat with page details
    socket.emit('heartbeat', { currentPage });

    // 2. Track admin module movements
    const module = getAdminModule(currentPage);
    if (module) {
      socket.emit('admin-module-update', { module });
      logger.log(`[Presence] Admin module navigated: ${module}`);
    }
  }, [location.pathname, user?.id]);

  // Setup idle/activity tracking & visibility listeners
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    // Reset Inactivity Timer
    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
        if (socketRef.current?.connected) {
          socketRef.current.emit('status-change', {
            status: 'idle',
            currentPage: window.location.pathname
          });
          logger.log('[Presence] User status changed to: idle (Inactivity)');
        }
      }, IDLE_TIMEOUT);
    };

    // Handle user activity
    const handleUserActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      // Transition out of idle
      if (isIdle) {
        setIsIdle(false);
        if (socketRef.current?.connected) {
          socketRef.current.emit('status-change', {
            status: 'active',
            currentPage: window.location.pathname
          });
          logger.log('[Presence] User status changed to: active (User action)');
        }
      }

      // Throttled activity pings to server
      if (!throttleRef.current || now - throttleRef.current > ACTIVITY_THROTTLE) {
        throttleRef.current = now;
        if (socketRef.current?.connected) {
          socketRef.current.emit('activity-ping', {
            currentPage: window.location.pathname
          });
        }
      }

      resetIdleTimer();
    };

    // Tab visibility shifts (Page Visibility API)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsIdle(true);
        if (socketRef.current?.connected) {
          socketRef.current.emit('status-change', {
            status: 'idle',
            currentPage: window.location.pathname
          });
          logger.log('[Presence] User status changed to: idle (Tab Hidden)');
        }
      } else {
        setIsIdle(false);
        lastActivityRef.current = Date.now();
        if (socketRef.current?.connected) {
          socketRef.current.emit('status-change', {
            status: 'active',
            currentPage: window.location.pathname
          });
          logger.log('[Presence] User status changed to: active (Tab Foreground)');
        }
        resetIdleTimer();
      }
    };

    // Bind event listeners
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial timer setup
    resetIdleTimer();

    return () => {
      // Cleanup event listeners
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [user?.id, isIdle]);

  return { isIdle };
}
