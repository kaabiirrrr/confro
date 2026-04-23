import api from '../lib/api';

/**
 * Creates a support ticket for a user.
 * @param {Object} ticketData - { userId, subject, message, category }
 */
export const createSupportTicket = async (ticketData) => {
    try {
        const response = await api.post('/api/support/create', ticketData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Fetches a user's ticket history.
 * @param {string} userId 
 */
export const fetchUserTickets = async (userId) => {
    try {
        const response = await api.get(`/api/support/my-tickets?userId=${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * ADMIN: Fetches all support tickets.
 * @param {Object} filters - { status }
 */
export const fetchAllTicketsAdmin = async (filters = {}) => {
    try {
        const { status = 'all' } = filters;
        const response = await api.get(`/api/support/admin/all-tickets?status=${status}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * ADMIN: Fetches a single ticket with its conversation history.
 */
export const fetchTicketDetailsAdmin = async (ticketId) => {
    try {
        const response = await api.get(`/api/support/admin/ticket/${ticketId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * ADMIN: Assigns a ticket to the current admin.
 */
export const assignTicketAdmin = async (ticketId) => {
    try {
        const response = await api.patch(`/api/support/admin/assign/${ticketId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * ADMIN: Updates ticket status (e.g., mark as resolved).
 */
export const updateTicketStatusAdmin = async (ticketId, status) => {
    try {
        const response = await api.patch(`/api/support/admin/update-status/${ticketId}`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * ADMIN: Sends a message/reply to a ticket.
 */
export const sendTicketMessageAdmin = async (ticketId, message) => {
    try {
        const response = await api.post('/api/support/admin/message', { ticketId, message });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Fetches messages for a specific ticket (Authenticated User or Admin).
 */
export const fetchTicketMessages = async (ticketId) => {
    try {
        const response = await api.get(`/api/support/ticket/${ticketId}/messages`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
