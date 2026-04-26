import api from '../lib/api';
import { logger } from '../utils/logger';

/**
 * Fetches both platform announcements and user-specific notifications
 */
export const fetchUnifiedNotifications = async (role) => {
    // Don't fetch if no token — avoids 401 spam on initial render
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return [];

    try {
        let activeAnnouncements = [];
        try {
            const annResponse = await api.get('/api/notifications/announcements');
            const announcements = annResponse.data.data || [];
            const dismissedIds = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
            activeAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));
        } catch (e) {
            if (e?.response?.status !== 401) logger.error("NotificationService: Failed to fetch announcements", e);
        }

        let notifications = [];
        try {
            const response = await api.get('/api/notifications');
            notifications = response.data.data || [];
        } catch (e) {
            if (e?.response?.status !== 401) logger.error("NotificationService: Failed to fetch private notifications", e);
        }

        const unified = [
            ...activeAnnouncements.map(a => ({ ...a, type: 'ANNOUNCEMENT' })),
            ...notifications.map(n => ({ ...n, type: 'NOTIFICATION' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return unified;
    } catch (error) {
        logger.error("NotificationService: Critical error", error);
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
            await api.delete(`/api/notifications/${item.id}`);
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
            await api.put('/api/notifications/read', { id: notificationIds });
        } catch (e) {
            if (e?.response?.status !== 401) logger.error("NotificationService: Failed to mark notifications as read", e);
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

