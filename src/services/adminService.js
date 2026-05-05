import api from '../lib/api';


export const fetchUsers = async (params = {}) => {
    const { role, search, limit = 50, offset = 0 } = params;
    const response = await api.get(`/api/admin/users`, {
        params: { role, search, limit, offset }
    });
    return response.data;
};

export const verifyUser = async (userId) => {
    const response = await api.put(`/api/admin/users/${userId}/verify`, {});
    return response.data;
};

export const toggleUserStatus = async (userId, isBanned) => {
    const response = await api.put(`/api/admin/users/${userId}/toggle-status`, { is_banned: isBanned });
    return response.data;
};

export const resetUserPassword = async (userId) => {
    const response = await api.post(`/api/admin/users/${userId}/reset-password`, {});
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
};

export const addUser = async (userData) => {
    const response = await api.post(`/api/admin/users`, userData);
    return response.data;
};

// --- Verification System ---
export const fetchVerificationRequests = async (params = {}) => {
    const response = await api.get(`/api/identity/admin/pending`, {
        params
    });
    return response.data;
};

export const updateVerificationStatus = async (userId, data) => {
    const response = await api.put(`/api/admin/verification/${userId}`, data);
    return response.data;
};

export const toggleFeaturedStatus = async (userId, data) => {
    const response = await api.put(`/api/admin/freelancers/${userId}/featured`, data);
    return response.data;
};

// --- Finance & Withdrawals ---
export const fetchWithdrawalRequests = async (params = {}) => {
    const response = await api.get(`/api/admin/withdrawals`, {
        params
    });
    return response.data;
};

export const processWithdrawal = async (withdrawalId, status) => {
    const response = await api.put(`/api/admin/withdrawals/${withdrawalId}`, { status });
    return response.data;
};

export const fetchPlatformSettings = async () => {
    const response = await api.get(`/api/admin/settings/platform`);
    return response.data;
};

export const updateCommission = async (percentage) => {
    const response = await api.put(`/api/admin/settings/commission`, { percentage });
    return response.data;
};

// --- Audit Logs ---
export const fetchAdminLogs = async (params = {}) => {
    const response = await api.get(`/api/admin/admin-logs`, {
        params
    });
    return response.data;
};

// --- Admin Management (SUPER_ADMIN ONLY) ---
export const fetchAdmins = async () => {
    const response = await api.get(`/api/admin/admins`);
    return response.data;
};

export const addAdmin = async (adminData) => {
    const response = await api.post(`/api/admin/add-admin`, adminData);
    return response.data;
};

export const removeAdmin = async (adminId) => {
    const response = await api.delete(`/api/admin/admins/${adminId}`);
    return response.data;
};

export const updateAdminRole = async (adminId, role) => {
    const response = await api.put(`/api/admin/admins/${adminId}/role`, { role });
    return response.data;
};

// --- Skills & Announcements ---
export const addSkill = async (skillData) => {
    const response = await api.post(`/api/admin/skills`, skillData);
    return response.data;
};

export const deleteSkill = async (skillId) => {
    const response = await api.delete(`/api/admin/skills/${skillId}`);
    return response.data;
};

export const createAnnouncement = async (announcementData) => {
    const response = await api.post(`/api/admin/announcements`, announcementData);
    return response.data;
};

export const fetchAnnouncements = async () => {
    const response = await api.get(`/api/admin/announcements`);
    return response.data;
};

export const fetchOfferAnalytics = async () => {
    const response = await api.get(`/api/admin/announcements/analytics`);
    return response.data;
};

// --- Jobs Management ---
export const fetchJobs = async (params = {}) => {
    const response = await api.get(`/api/admin/jobs`, {
        params
    });
    return response.data;
};

export const approveJob = async (jobId) => {
    const response = await api.put(`/api/admin/jobs/${jobId}/approve`, {});
    return response.data;
};

export const rejectJob = async (jobId, reason) => {
    const response = await api.put(`/api/admin/jobs/${jobId}/reject`, { reason });
    return response.data;
};

export const deleteJob = async (jobId) => {
    const response = await api.delete(`/api/admin/jobs/${jobId}`);
    return response.data;
};

// --- Proposals Management ---
export const fetchProposals = async (params = {}) => {
    const response = await api.get(`/api/admin/proposals`, {
        params
    });
    return response.data;
};

export const deleteProposal = async (proposalId) => {
    const response = await api.delete(`/api/admin/proposals/${proposalId}`);
    return response.data;
};

// --- Contracts Management ---
export const fetchContracts = async (params = {}) => {
    const response = await api.get(`/api/admin/contracts`, {
        params
    });
    return response.data;
};

export const cancelContract = async (contractId, reason) => {
    const response = await api.put(`/api/admin/contracts/${contractId}/cancel`, { reason });
    return response.data;
};

// --- Disputes Management ---
export const fetchDisputes = async (params = {}) => {
    const response = await api.get(`/api/admin/disputes`, {
        params
    });
    return response.data;
};

export const resolveDispute = async (disputeId, resolutionData) => {
    const response = await api.put(`/api/admin/disputes/${disputeId}/resolve`, resolutionData);
    return response.data;
};

// --- Payments & Analytics ---
export const fetchPayments = async (params = {}) => {
    const response = await api.get(`/api/admin/payments`, {
        params
    });
    return response.data;
};

export const fetchDashboardStats = async () => {
    const response = await api.get(`/api/admin/analytics/overview`);
    return response.data;
};

export const fetchPlatformActivity = async (params = {}) => {
    const response = await api.get(`/api/admin/analytics/activity`, { params });
    return response.data;
};

// --- Moderation (v1 & v2) ---
export const fetchModerationReports = async (params = {}) => {
    const response = await api.get(`/api/admin/reports`, {
        params
    });
    return response.data;
};

export const resolveModerationReport = async (reportId, resolutionData) => {
    const response = await api.put(`/api/admin/reports/${reportId}/resolve`, resolutionData);
    return response.data;
};

export const fetchViolations = async (params = {}) => {
    const response = await api.get(`/api/admin/moderation/violations`, { params });
    return response.data;
};

export const fetchRepeatOffenders = async () => {
    const response = await api.get(`/api/admin/moderation/offenders`);
    return response.data;
};

export const enforceModerationAction = async (userId, action, reason = '') => {
    const response = await api.post(`/api/admin/moderation/enforce/${userId}`, { action, reason });
    return response.data;
};


// --- Fraud Monitoring ---
export const fetchSuspiciousUsers = async () => {
    const response = await api.get(`/api/admin/fraud/suspicious-users`);
    return response.data;
};

export const fetchUserFraudTimeline = async (userId) => {
    const response = await api.get(`/api/admin/fraud/user-timeline/${userId}`);
    return response.data;
};

export const markUserAsFraud = async (userId) => {
    const response = await api.post(`/api/admin/fraud/mark-fraud/${userId}`);
    return response.data;
};

export const freezeUserAccount = async (userId) => {
    const response = await api.post(`/api/admin/fraud/freeze/${userId}`);
    return response.data;
};

export const clearFraudFlag = async (userId) => {
    const response = await api.post(`/api/admin/fraud/clear/${userId}`);
    return response.data;
};

// --- TrustGraph & Reputation Shield (New) ---
export const fetchFraudClusters = async () => {
    const response = await api.get(`/api/admin/fraud/clusters`);
    return response.data;
};

export const recalculateTrustScore = async (userId) => {
    const response = await api.post(`/api/admin/fraud/recalculate/${userId}`);
    return response.data;
};

export const flagFraudUser = async (userId, reason = '') => {
    const response = await api.post(`/api/admin/fraud/flag/${userId}`, { reason });
    return response.data;
};

// --- Broadcast Notifications ---
export const sendBroadcast = async (payload) => {
    const response = await api.post(`/api/admin/notifications/send`, payload);
    return response.data;
};

// --- Refunds ---
export const issueRefund = async (paymentId) => {
    const response = await api.post(`/api/admin/refund`, { payment_id: paymentId });
    return response.data;
};

// --- Platform Settings (generic key/value) ---
export const updatePlatformSetting = async (key, value) => {
    const response = await api.put(`/api/admin/settings/${key}`, { value });
    return response.data;
};

// --- Admin Profile ---
export const fetchAdminProfile = async () => {
    const response = await api.get(`/api/admin/profile`);
    return response.data;
};

export const updateAdminProfile = async (profileData) => {
    const response = await api.put(`/api/admin/profile`, profileData);
    return response.data;
};

export const uploadAdminAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post(`/api/admin/profile/avatar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const setupProfileSchema = async () => {
    const response = await api.get(`/api/admin/setup-profile-schema`);
    return response.data;
};

export const fetchAdminActivityStats = async () => {
    const response = await api.get(`/api/admin/analytics/stats`);
    return response.data;
};



// --- Platform Revenue ---
export const fetchPlatformRevenue = async () => {
    const response = await api.get(`/api/admin/revenue/overview`);
    return response.data;
};

// --- Connect Economy System ---
export const fetchConnectSettings = async () => {
    const response = await api.get(`/api/admin/connects/settings`);
    return response.data;
};

export const updateConnectSettings = async (updates) => {
    const response = await api.put(`/api/admin/connects/settings`, updates);
    return response.data;
};

export const fetchConnectAnalytics = async () => {
    const response = await api.get(`/api/admin/connects/analytics`);
    return response.data;
};

export const fetchConnectLedger = async (params = {}) => {
    const response = await api.get(`/api/admin/connects/ledger`, { params });
    return response.data;
};
