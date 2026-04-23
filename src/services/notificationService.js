import axios from 'axios';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

import { getApiUrl } from '../utils/authUtils';
 
const API_URL = getApiUrl();

const getHeaders = async () => {
    try {
        // Priority: storage token first (fastest), then Supabase session
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            return { headers: { Authorization: `Bearer ${token}` } };
        }
        // Fallback to live Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            return { headers: { Authorization: `Bearer ${session.access_token}` } };
        }
        return { headers: {} };
    } catch (e) {
        logger.error("Failed to retrieve auth headers for notifications", e);
        return { headers: {} };
    }
};

/**
 * Fetches both platform announcements and user-specific notifications
 * @param {string} role - CLIENT or FREELANCER (or ALL)
 */
export const fetchUnifiedNotifications = async (role) => {
    try {
        const isAdmin = role && role.includes('ADMIN') || role === 'MODERATOR';

        // 1. Fetch public announcements from backend proxy (avoiding direct Supabase connection issues)
        let activeAnnouncements = [];
        try {
            const headers = await getHeaders();
            const annResponse = await axios.get(`${API_URL}/api/notifications/announcements`, headers);
            const announcements = annResponse.data.data || [];
            
            // Filter out dismissed announcements
            const dismissedIds = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
            activeAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));
        } catch (e) {
            logger.error("NotificationService: Failed to fetch announcements", e);
            // Fallback: stay as empty array, keep the rest of the flow working
        }

        // 2. Fetch private notifications from API
        let notifications = [];
        try {
            const headers = await getHeaders();
            const response = await axios.get(`${API_URL}/api/notifications`, headers);
            notifications = response.data.data || [];
        } catch (e) {
            logger.error("NotificationService: Failed to fetch private notifications", e);
        }

        // 3. Merge and sort
        const unified = [
            ...activeAnnouncements.map(a => ({ ...a, type: 'ANNOUNCEMENT' })),
            ...notifications.map(n => ({ ...n, type: 'NOTIFICATION' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return unified;
    } catch (error) {
        logger.error("NotificationService: Critical error in unified notification fetch", error);
        return [];
    }
};

/**
 * Dismisses/Deletes a single item
 */
export const dismissUnifiedItem = async (item) => {
    if (!item) return false;

    try {
        if (item.type === 'ANNOUNCEMENT') {
            // Store in local dismissed list
            const dismissedIds = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
            if (!dismissedIds.includes(item.id)) {
                localStorage.setItem('dismissed_announcements', JSON.stringify([...dismissedIds, item.id]));
            }
            return true;
        } else {
            // Call API to delete private notification
            const headers = await getHeaders();
            await axios.delete(`${API_URL}/api/notifications/${item.id}`, headers);
            return true;
        }
    } catch (error) {
        logger.error("NotificationService: Failed to dismiss notification item", error);
        return false;
    }
};

/**
 * Marks items as read
 */
export const markUnifiedAsRead = async (items) => {
    if (!items || items.length === 0) return;

    // Separate announcements (local storage) and notifications (API)
    const announcementIds = items.filter(i => i.type === 'ANNOUNCEMENT').map(i => i.id);
    const notificationIds = items.filter(i => i.type === 'NOTIFICATION' && !i.is_read).map(i => i.id);

    // 1. Mark announcements in localStorage
    if (announcementIds.length > 0) {
        const readIds = JSON.parse(localStorage.getItem('read_announcements') || '[]');
        const updatedIds = [...new Set([...readIds, ...announcementIds])];
        localStorage.setItem('read_announcements', JSON.stringify(updatedIds));
    }

    // 2. Mark notifications in API
    if (notificationIds.length > 0) {
        try {
            const headers = await getHeaders();
            await axios.put(`${API_URL}/api/notifications/read`, { id: notificationIds }, headers);
        } catch (e) {
            logger.error("NotificationService: Failed to mark notifications as read", e);
        }
    }
};

/**
 * Gets count of unread unified items
 */
export const getUnifiedUnreadCount = (items) => {
    if (!items) return 0;
    const readAnnIds = JSON.parse(localStorage.getItem('read_announcements') || '[]');

    return items.filter(item => {
        if (item.type === 'ANNOUNCEMENT') return !readAnnIds.includes(item.id);
        return !item.is_read;
    }).length;
};

// --- Backwards Compatibility ---
export const fetchAnnouncements = async (role) => {
    const data = await fetchUnifiedNotifications(role);
    return data.filter(i => i.type === 'ANNOUNCEMENT');
};

export const markAsRead = (announcements) => {
    markUnifiedAsRead(announcements.map(a => ({ ...a, type: 'ANNOUNCEMENT' })));
};

export const getUnreadCount = (announcements) => {
    return getUnifiedUnreadCount(announcements.map(a => ({ ...a, type: 'ANNOUNCEMENT' })));
};

