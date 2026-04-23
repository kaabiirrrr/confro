import api from '../lib/api';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

// ─── JOBS ────────────────────────────────────────────────────


export const createJob = async (jobData) => {
    const { data } = await api.post(`/api/jobs`, jobData);
    return data;
};

export const getMyJobs = async (status = 'all') => {
    const { data } = await api.get(`/api/jobs/client/my-jobs?status=${status}`);
    return data;
};

export const getAllJobs = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/jobs/all?${params}`);
    return data;
};

export const getJobById = async (id) => {
    const { data } = await api.get(`/api/jobs/${id}`);
    return data;
};

export const getJobStats = async () => {
    const { data } = await api.get(`/api/jobs/stats`);
    return data;
};

export const updateJob = async (id, updates) => {
    const { data } = await api.patch(`/api/jobs/update/${id}`, updates);
    return data;
};

export const deleteJob = async (id) => {
    const { data } = await api.delete(`/api/jobs/delete/${id}`);
    return data;
};

export const getJobWorkspace = async (jobId) => {
    const { data } = await api.get(`/api/jobs/${jobId}/workspace`);
    return data;
};

export const acknowledgeMission = async (jobId) => {
    const { data } = await api.patch(`/api/jobs/${jobId}/member/acknowledge`);
    return data;
};

export const closeJobBidding = async (jobId) => {
    const { data } = await api.patch(`/api/jobs/${jobId}/bidding/close`);
    return data;
};

export const updateJobMember = async (jobId, memberId, updates) => {
    const { data } = await api.patch(`/api/jobs/${jobId}/member/${memberId}`, updates);
    return data;
};

export const removeJobMember = async (jobId, memberId) => {
    const { data } = await api.delete(`/api/jobs/${jobId}/member/${memberId}`);
    return data;
};

export const getClientDashboard = async () => {
    const { data } = await api.get(`/api/jobs/client/dashboard`);
    return data;
};

// Feature 1: Live search â€” GET /api/jobs/search?q=<query>
export const searchJobs = async (q) => {
    const { data } = await api.get(`/api/jobs/search?q=${encodeURIComponent(q)}`);
    return data;
};

// Feature 2: Best matches â€” GET /api/jobs/best-matches/:freelancerId
export const getBestMatchJobs = async (freelancerId) => {
    const { data } = await api.get(`/api/jobs/best-matches/${freelancerId}`);
    return data;
};

// Feature 3: Most recent â€” GET /api/jobs/recent
export const getRecentJobs = async () => {
    const { data } = await api.get(`/api/jobs/recent`);
    return data;
};

// Feature 4: Deadline Risk — GET /api/jobs/:id/deadline-risk
export const getDeadlineRisk = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/deadline-risk`);
    return response.data;
};

export const getContractDeadlineRisk = async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/deadline-risk`);
    return response.data;
};

// ─── SAVE / BOOKMARK JOBS ──────────────────────────────────────────────────────────

// Toggle save/unsave a job — POST /api/bookmarks/toggle
export const toggleBookmarkJob = async (jobId) => {
    const { data } = await api.post(`/api/bookmarks/toggle`, { job_id: jobId });
    return data;
};

// Get all saved job IDs (for bookmark icon highlighting) â€” GET /api/bookmarks/ids
export const getSavedJobIds = async () => {
    const { data } = await api.get(`/api/bookmarks/ids`);
    return data;
};

// Get saved jobs with full data (for Saved Jobs tab) â€” GET /api/bookmarks/saved-jobs
export const getSavedJobs = async () => {
    const { data } = await api.get(`/api/bookmarks/saved-jobs`);
    return data;
};

// â”€â”€â”€ CONVERSATIONS & MESSAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getCallLogs = async (conversationId = null) => {
    const url = conversationId
        ? `/api/calls/${conversationId}`
        : `/api/calls`;
    const { data } = await api.get(url);
    return data;
};

export const getOnlineUsers = async () => {
    const { data } = await api.get(`/api/presence/online`);
    return data;
};

export const getMyConversations = async () => {
    const { data } = await api.get(`/api/conversations`);
    return data;
};

export const getConversationRequests = async () => {
    const { data } = await api.get(`/api/conversations/requests`);
    return data;
};

export const acceptConversationRequest = async (conversationId) => {
    const { data } = await api.post(`/api/conversations/${conversationId}/accept`, {});
    return data;
};

export const rejectConversationRequest = async (conversationId) => {
    const { data } = await api.post(`/api/conversations/${conversationId}/reject`, {});
    return data;
};

export const getOrCreateConversation = async (otherUserId) => {
    if (!otherUserId) throw new Error('otherUserId is required');
    const { data } = await api.post(`/api/conversations`, {
        freelancer_id: otherUserId,
        other_user_id: otherUserId,
    });
    return data;
};

export const getMessages = async (conversationId, limit = 50, offset = 0) => {
    const { data } = await api.get(`/api/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
    return data;
};

export const uploadChatFile = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/api/conversations/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

// â”€â”€â”€ PROPOSALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getMyProposals = async () => {
    const { data } = await api.get(`/api/proposals`);
    return data;
};

export const getJobProposals = async (jobId) => {
    const { data } = await api.get(`/api/proposals/job/${jobId}`);
    return data;
};

export const checkProposal = async (jobId) => {
    const { data } = await api.get(`/api/proposals/check/${jobId}`);
    return data;
};

export const submitProposal = async (proposalData) => {
    const { data } = await api.post(`/api/proposals/create`, proposalData);
    return data;
};

export const updateProposalStatus = async (proposalId, status, role = 'Freelancer', scope = '') => {
    const { data } = await api.patch(`/api/proposals/${proposalId}/status`, { status, role, scope });
    return data;
};

// â”€â”€â”€ CONTRACTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getMyContracts = async () => {
    const { data } = await api.get(`/api/contracts/user`);
    return data;
};

// â”€â”€â”€ WORK SUBMISSIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const submitWork = async (payload) => {
    const { data } = await api.post(`/api/submissions`, payload);
    return data;
};

export const getContractSubmissions = async (contractId) => {
    const { data } = await api.get(`/api/submissions/contract/${contractId}`);
    return data;
};

export const updateSubmissionStatus = async (id, status, feedback) => {
    const { data } = await api.patch(`/api/submissions/${id}/status`, { status, client_feedback: feedback });
    return data;
};

// ─── WORK DELIVERIES (PRO) ──────────────────────────

export const getUploadUrl = async (jobId, fileName, fileSize, fileType) => {
    const { data } = await api.post(`/api/deliveries/upload-url`, { jobId, fileName, fileSize, fileType });
    return data;
};

export const submitDelivery = async (payload) => {
    const { data } = await api.post(`/api/deliveries`, payload);
    return data;
};

export const getJobDeliveries = async (jobId) => {
    const { data } = await api.get(`/api/deliveries/job/${jobId}`);
    return data;
};

export const approveDelivery = async (id) => {
    const { data } = await api.post(`/api/deliveries/${id}/approve`);
    return data;
};

export const requestRevision = async (id, feedback) => {
    const { data } = await api.post(`/api/deliveries/${id}/revision`, { feedback });
    return data;
};

export const addDeliveryComment = async (id, comment) => {
    const { data } = await api.post(`/api/deliveries/${id}/comments`, { comment });
    return data;
};

export const getSignedDeliveryUrl = async (path, fileName) => {
    const query = `path=${encodeURIComponent(path)}${fileName ? `&fileName=${encodeURIComponent(fileName)}` : ''}`;
    const { data } = await api.get(`/api/deliveries/files/signed-url?${query}`);
    return data;
};

export const downloadDeliveryFile = async (path, fileName) => {
    const query = `path=${encodeURIComponent(path)}${fileName ? `&fileName=${encodeURIComponent(fileName)}` : ''}`;
    const response = await api.get(`/api/deliveries/files/download?${query}`, {
        responseType: 'blob'
    });
    return response.data;
};

// â”€â”€â”€ WORK DIARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Legacy work diary removed in favor of hourly activity routes
// export const getWorkDiary = ...
// export const logWorkDiary = ...
// export const deleteWorkDiaryEntry = ...

export const getHiredFreelancers = async () => {
    const { data } = await api.get(`/api/contracts/client/hired`);
    return data;
};

// ─── WORK LOGS ────────────────────────────────────────────────────

export const upsertWorkLog = async (logData) => {
    const { data } = await api.post(`/api/work-logs`, logData);
    return data;
};

export const getJobWorkLogs = async (jobId, page = 1, limit = 10) => {
    const { data } = await api.get(`/api/work-logs/job/${jobId}?page=${page}&limit=${limit}`);
    return data;
};

export const getClientWorkSummary = async () => {
    const { data } = await api.get(`/api/work-logs/client/summary`);
    return data;
};

export const askForWorkUpdate = async (queryData) => {
    const { data } = await api.post(`/api/work-logs/ask`, queryData);
    return data;
};

export const getWorkLogQueries = async () => {
    const { data } = await api.get(`/api/work-logs/queries`);
    return data;
};

// ─── PAYMENTS ──────────────────────────────────────────────────────────────────────

export const getMyPayments = async () => {
    const { data } = await api.get(`/api/payments/history`);
    return data;
};

// ─── PROFILE ───────────────────────────────────────────────────────────────────────

export const getMyProfile = async () => {
    const { data } = await api.get(`/api/profile/me`);
    return data;
};

export const updateMyProfile = async (profileData) => {
    const { data } = await api.patch(`/api/profile/update`, profileData);
    return data;
};

export const getProfileStatus = async () => {
    const { data } = await api.get('/api/profile/status');
    return data;
};

export const getFreelancerStats = async () => {
    const { data } = await api.get('/api/profile/stats');
    return data;
};

export const uploadAvatar = async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.post(`/api/profile/upload-avatar`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const uploadDocument = async (file) => {
    const form = new FormData();
    form.append('document', file);
    const { data } = await api.post(`/api/profile/upload-document`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const changePassword = async (passwords) => {
    const { data } = await api.patch(`/api/auth/change-password`, passwords);
    return data;
};

export const deleteAccount = async (reason) => {
    const { data } = await api.delete(`/api/profile/delete-account`, { data: { reason } });
    return data;
};

// â”€â”€â”€ DASHBOARD STATS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getClientDashboardStats = async () => {
    try {
        const res = await getClientDashboard();
        const stats = res?.data?.stats || {};

        return {
            activeJobs: stats.open_jobs || 0,
            totalProposals: stats.pending_proposals || 0,
            freelancersHired: stats.active_contracts || 0,
            totalSpending: 0 // Payment history aggregation to be implemented
        };
    } catch (err) {
        logger.error('Dashboard stats error', err);
        return { activeJobs: 0, totalProposals: 0, freelancersHired: 0, totalSpending: 0 };
    }
};

// â”€â”€â”€ JOB FILE UPLOAD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const uploadJobAttachment = async (file) => {
    const fileName = `job-attachments/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
        .from('job-attachments')
        .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('job-attachments').getPublicUrl(fileName);
    return { url: publicUrl, name: file.name };
};
// â”€â”€â”€ FREELANCERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getFreelancers = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/profile/freelancers?${params}`);
    return data;
};

export const getFreelancerProfile = async (id) => {
    const { data } = await api.get(`/api/profile/${id}`);
    return data;
};

// â”€â”€â”€ CLIENT: SAVED FREELANCERS (bookmarks) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Backend contract: docs/BACKEND_SAVED_TALENT.md

export const getSavedFreelancers = async () => {
    const { data } = await api.get(`/api/clients/saved-freelancers`);
    return data;
};

export const saveFreelancer = async (freelancerId) => {
    const { data } = await api.post(`/api/clients/saved-freelancers`, { freelancer_id: freelancerId });
    return data;
};

export const removeSavedFreelancer = async (freelancerId) => {
    const { data } = await api.delete(`/api/clients/saved-freelancers/${freelancerId}`);
    return data;
};

// â”€â”€â”€ DIRECT CONTRACTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createDirectContract = async (payload) => {
    const { data } = await api.post(`/api/direct-contracts`, payload);
    return data;
};

export const getDirectContracts = async (params = {}) => {
    const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
    const { data } = await api.get(`/api/direct-contracts${query ? `?${query}` : ''}`);
    return data;
};

export const getDirectContractById = async (id) => {
    const { data } = await api.get(`/api/direct-contracts/${id}`);
    return data;
};

export const updateDirectContractStatus = async (id, status) => {
    const { data } = await api.patch(`/api/direct-contracts/${id}/status`, { status });
    return data;
};

// â”€â”€â”€ HOURLY CONTRACT ACTIVITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getTimesheets = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/hourly/timesheets?${params}`);
    return data;
};

export const updateTimesheetStatus = async (id, status, memo = '') => {
    const { data } = await api.patch(`/api/hourly/timesheets/${id}/status`, { status, memo });
    return data;
};

export const getTimeByFreelancer = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/hourly/time-by-freelancer?${params}`);
    return data;
};

export const getWorkDiary = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/hourly/work-diary?${params}`);
    return data;
};

export const logWorkDiary = async (payload) => {
    const { data } = await api.post(`/api/hourly/work-diary`, payload);
    return data;
};

export const deleteWorkDiaryEntry = async (id) => {
    const { data } = await api.delete(`/api/hourly/work-diary/${id}`);
    return data;
};

export const getHourlyExport = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/hourly/export?${params}`, {
        responseType: filters.format === 'csv' ? 'blob' : 'json',
    });
    return response;
};

// â”€â”€â”€ REPORTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getWeeklySummary = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/reports/weekly-summary?${params}`);
    return data;
};

export const getTransactions = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/reports/transactions?${params}`);
    return data;
};

export const getSpendingByActivity = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/reports/spending-by-activity?${params}`);
    return data;
};

// â”€â”€â”€ ONBOARDING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getOnboardingStatus = async () => {
    const { data } = await api.get(`/api/account/onboarding-status`);
    return data;
};

export const sendVerificationEmail = async () => {
    const { data } = await api.post(`/api/auth/send-verification`, {});
    return data;
};

// â”€â”€â”€ BILLING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getBillingMethods = async () => {
    const { data } = await api.get(`/api/billing/methods`);
    return data;
};

export const createSetupIntent = async () => {
    const { data } = await api.post(`/api/billing/setup-intent`, {});
    return data;
};

export const addBillingMethod = async (payload) => {
    const { data } = await api.post(`/api/billing/methods`, payload);
    return data;
};

export const setDefaultBillingMethod = async (id) => {
    const { data } = await api.patch(`/api/billing/methods/${id}/default`, {});
    return data;
};

export const removeBillingMethod = async (id) => {
    const { data } = await api.delete(`/api/billing/methods/${id}`);
    return data;
};

// â”€â”€â”€ CONSULTATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getConsultationExperts = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/consultations/experts?${params}`);
    return data;
};

export const getMyConsultations = async () => {
    const { data } = await api.get(`/api/consultations`);
    return data;
};

export const bookConsultation = async (payload) => {
    const { data } = await api.post(`/api/consultations`, payload);
    return data;
};

export const updateConsultationStatus = async (id, status) => {
    const { data } = await api.patch(`/api/consultations/${id}/status`, { status });
    return data;
};

// â”€â”€â”€ TEAMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getMyTeams = async () => {
    const { data } = await api.get(`/api/teams/my-teams`);
    return data;
};

export const createTeam = async (name) => {
    const { data } = await api.post(`/api/teams/create`, { name });
    return data;
};

export const inviteTeammate = async (payload) => {
    const { data } = await api.post(`/api/teams/invite`, payload);
    return data;
};

export const getTeamMembers = async (teamId) => {
    const { data } = await api.get(`/api/teams/${teamId}/members`);
    return data;
};

// â”€â”€â”€ FIND WORK (FREELANCER) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const findWorkJobs = async (filters = {}) => {
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null));
    const params = new URLSearchParams(clean).toString();
    const { data } = await api.get(`/api/jobs/find-work?${params}`);
    return data;
};

export const toggleSaveJob = async (jobId) => {
    const { data } = await api.post(`/api/jobs/${jobId}/save`, {});
    return data;
};

export const getJobDetail = async (jobId) => {
    const { data } = await api.get(`/api/jobs/${jobId}`);
    return data;
};



// â”€â”€â”€ FREELANCER SERVICES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getAllServices = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/services?${params}`);
    return data;
};

export const getServiceById = async (id) => {
    const { data } = await api.get(`/api/services/${id}`);
    return data;
};

export const getMyServices = async () => {
    const { data } = await api.get(`/api/services/my/list`);
    return data;
};

export const createService = async (payload) => {
    const { data } = await api.post(`/api/services`, payload);
    return data;
};

export const updateService = async (id, payload) => {
    const { data } = await api.patch(`/api/services/${id}`, payload);
    return data;
};

export const uploadServiceImage = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/api/services/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const orderService = async (serviceId, payload) => {
    const { data } = await api.post(`/api/services/${serviceId}/order`, payload);
    return data;
};

export const deleteService = async (id) => {
    const { data } = await api.delete(`/api/services/${id}`);
    return data;
};

export const getMyServiceOrders = async () => {
    const { data } = await api.get(`/api/services/orders/my`);
    return data;
};

export const updateServiceOrderStatus = async (id, status) => {
    const { data } = await api.patch(`/api/services/orders/${id}/status`, { status });
    return data;
};

// â”€â”€â”€ PROMOTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getMyPromotions = async () => {
    const { data } = await api.get(`/api/promotions/my`);
    return data;
};

export const togglePromotion = async (type) => {
    const { data } = await api.patch(`/api/promotions/${type}`, {});
    return data;
};

export const getPromotionStats = async () => {
    const { data } = await api.get(`/api/promotions/stats`);
    return data;
};

// â”€â”€â”€ IDENTITY VERIFICATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getIdentityStatus = async () => {
    const { data } = await api.get(`/api/identity/status`);
    return data;
};

export const uploadIdentityDocument = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/api/identity/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const submitIdentityVerification = async (payload) => {
    const { data } = await api.post(`/api/identity/submit`, payload);
    return data;
};

export const adminReviewIdentity = async (id, action, rejection_reason = '') => {
    const { data } = await api.patch(`/api/identity/admin/${id}/review`,
        { action, ...(rejection_reason ? { rejection_reason } : {}) });
    return data;
};

// --- NEW DUAL VERIFICATION SYSTEM (OCR) ---
export const extractVerificationData = async (imageUrl, documentType) => {
    const { data } = await api.post(`/api/verification/extract`, { imageUrl, documentType });
    return data;
};

export const submitDualVerification = async (payload) => {
    const { data } = await api.post(`/api/verification/submit`, payload);
    return data;
};

export const getMyDualVerification = async () => {
    const { data } = await api.get(`/api/verification/me`);
    return data;
};

// --- ADMIN VERIFICATION ENDPOINTS ---
export const getAdminVerifications = async (type, status = 'ALL') => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.set('status', status);
    if (type) params.set('role', type.toUpperCase()); // CLIENT or FREELANCER
    const { data } = await api.get(`/api/identity/admin/pending?${params.toString()}`);
    return data;
};

export const approveVerification = async (id) => {
    const { data } = await api.patch(`/api/identity/admin/${id}/review`, { action: 'approve' });
    return data;
};

export const rejectVerification = async (id, rejection_reason = 'Does not meet requirements') => {
    const { data } = await api.patch(`/api/identity/admin/${id}/review`, { action: 'reject', rejection_reason });
    return data;
};

// â”€â”€â”€ WITHDRAWALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getWithdrawals = async () => {
    const { data } = await api.get(`/api/withdrawals`);
    return data;
};

export const requestWithdrawal = async (payload) => {
    const { data } = await api.post(`/api/withdrawals`, payload);
    return data;
};

export const cancelWithdrawal = async (id) => {
    const { data } = await api.patch(`/api/withdrawals/${id}/cancel`, {});
    return data;
};

export const clearConversation = async (conversationId) => {
    const { data } = await api.delete(`/api/conversations/${conversationId}/clear`);
    return data;
};

export const blockUser = async (userId) => {
    const { data } = await api.post(`/api/conversations/block/${userId}`, {});
    return data;
};

export const muteConversation = async (conversationId) => {
    const { data } = await api.post(`/api/conversations/${conversationId}/mute`, {});
    return data;
};

export const getMuteStatus = async (conversationId) => {
    const { data } = await api.get(`/api/conversations/${conversationId}/mute-status`);
    return data;
};

// ─── FAKE ESCROW (DEMO MODE) ──────────────────────────────────────────────────

export const getFakeEscrowBalance = async () => {
    const { data } = await api.get('/api/fake-escrow/balance');
    return data;
};

export const fundFakeEscrow = async (payload) => {
    const { data } = await api.post('/api/fake-escrow/fund', payload);
    return data;
};

export const releaseFakeEscrow = async (transactionId) => {
    const { data } = await api.post('/api/fake-escrow/release', { transaction_id: transactionId });
    return data;
};

export const resetFakeWallet = async () => {
    const { data } = await api.post('/api/fake-escrow/reset');
    return data;
};

export const getFakeEscrowTransactions = async (contractId = null) => {
    const query = contractId ? `?contract_id=${contractId}` : '';
    const { data } = await api.get(`/api/fake-escrow/transactions${query}`);
    return data;
};


export const getBlockStatus = async (userId) => {
    const { data } = await api.get(`/api/conversations/block-status/${userId}`);
    return data;
};

export const getBlockedUsers = async () => {
    const { data } = await api.get(`/api/conversations/blocked`);
    return data;
};

export const unblockUser = async (userId) => {
    const { data } = await api.delete(`/api/conversations/unblock/${userId}`);
    return data;
};

export const reportUser = async (userId, reason) => {
    const { data } = await api.post(`/api/conversations/report/${userId}`, { reason });
    return data;
};

// --- GLOBAL STATS ---

export const getGlobalStats = async () => {
    const { data } = await api.get(`/api/stats/global`);
    return data;
};

// --- USER PROBLEMS ---

export const submitUserProblem = async (problemData) => {
    const { data } = await api.post(`/api/problems/submit`, problemData);
    return data;
};

export const getAdminProblems = async (status = '') => {
    const { data } = await api.get(`/api/admin/problems?status=${status}`);
    return data;
};

export const updateProblemStatus = async (id, status) => {
    const { data } = await api.patch(`/api/admin/problems/${id}`, { status });
    return data;
};

export const deleteProblem = async (id) => {
    const { data } = await api.delete(`/api/admin/problems/${id}`);
    return data;
};

// --- FAQ ---

export const getPublishedFAQs = async () => {
    const { data } = await api.get(`/api/faqs/published`);
    return data;
};

export const submitFAQQuestion = async (question) => {
    const { data } = await api.post(`/api/faqs/submit`, { question });
    return data;
};

export const getAdminFAQs = async (status = '') => {
    const { data } = await api.get(`/api/admin/faqs?status=${status}`);
    return data;
};

export const updateFAQ = async (id, faqData) => {
    const { data } = await api.patch(`/api/admin/faqs/${id}`, faqData);
    return data;
};

export const deleteFAQ = async (id) => {
    const { data } = await api.delete(`/api/admin/faqs/${id}`);
    return data;
};

// --- REVIEWS ---

export const getAdminProjectReviews = async () => {
    const { data } = await api.get(`/api/admin/reviews/project`);
    return data;
};

export const getAdminSiteReviews = async () => {
    const { data } = await api.get(`/api/admin/reviews/site`);
    return data;
};

export const deleteReview = async (id, type = 'project') => {
    const { data } = await api.delete(`/api/admin/reviews/${id}?type=${type}`);
    return data;
};


// --- SKIMMER CO-PILOT ---

export const getSkimmerOverview = async (jobId) => {
    const { data } = await api.get(`/api/skimmer/${jobId}/overview`);
    return data;
};

export const getSkimmerTasks = async (jobId) => {
    const { data } = await api.get(`/api/skimmer/${jobId}/tasks`);
    return data;
};

export const getSkimmerInsights = async (jobId) => {
    const { data } = await api.get(`/api/skimmer/${jobId}/insights`);
    return data;
};

export const getSkimmerHistory = async (jobId) => {
    const { data } = await api.get(`/api/skimmer/${jobId}/history`);
    return data;
};

export const regenerateSkimmerPlan = async (jobId) => {
    const { data } = await api.post(`/api/skimmer/${jobId}/regenerate-plan`);
    return data;
};

// --- CONNECT AI CO-PILOT ---

export const aiGenerateJob = async (idea) => {
    const { data } = await api.post('/api/ai/generate-job', { idea });
    return data;
};

export const aiImproveJob = async (jobPost) => {
    const { data } = await api.post('/api/ai/improve-job', { jobPost });
    return data;
};

export const aiSuggestSkills = async (category) => {
    const { data } = await api.post('/api/ai/suggest-skills', { category });
    return data;
};

// ── BANK ACCOUNTS ────────────────────────────────────────────────────────────────

export const getBankAccounts = async () => {
    const { data } = await api.get(`/api/bank-accounts`);
    return data;
};

export const addBankAccount = async (payload) => {
    const { data } = await api.post(`/api/bank-accounts`, payload);
    return data;
};

export const deleteBankAccount = async (id) => {
    const { data } = await api.delete(`/api/bank-accounts/${id}`);
    return data;
};

export const setDefaultBankAccount = async (id) => {
    const { data } = await api.patch(`/api/bank-accounts/${id}/default`);
    return data;
};

// ── KYC (OCR-based) ──────────────────────────────────────────────────────────────

export const uploadKYC = async ({ documentType, documentFile, selfieFile }) => {
    const form = new FormData();
    form.append('document_type', documentType);
    form.append('document', documentFile);
    if (selfieFile) form.append('selfie', selfieFile);
    const { data } = await api.post('/api/kyc/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const getKYCStatus = async () => {
    const { data } = await api.get('/api/kyc/status');
    return data;
};

export const adminVerifyKYC = async ({ userId, action, rejection_reason = '' }) => {
    const { data } = await api.post('/api/admin/kyc/verify', { userId, action, rejection_reason });
    return data;
};

export const adminGetAllKYC = async (status = '') => {
    const { data } = await api.get(`/api/admin/kyc/list${status ? `?status=${status}` : ''}`);
    return data;
};

// ── IDENTITY upload-and-scan (OCR) ───────────────────────────────────────────────
export const uploadAndScanIdentity = async (file, documentType) => {
    const form = new FormData();
    form.append('file', file);
    form.append('document_type', documentType);
    const response = await api.post(`/api/identity/upload-and-scan`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Handle both { data } and raw response shapes
    return response?.data ?? response;
};

// ── LOTTERY ──────────────────────────────────────────────────────────────────────

export const getMyLotteryStatus = async () => {
    const { data } = await api.get('/api/lottery/my-status');
    return data;
};

export const getMyLotteryHistory = async () => {
    const { data } = await api.get('/api/lottery/my-history');
    return data;
};

export const adminGetLotteryDraws = async () => {
    const { data } = await api.get('/api/admin/lottery/draws');
    return data;
};

export const adminCreateLotteryDraw = async (payload) => {
    const { data } = await api.post('/api/admin/lottery/draws', payload);
    return data;
};

export const adminRunLottery = async (drawId) => {
    const { data } = await api.post(`/api/admin/lottery/draws/${drawId}/run`);
    return data;
};

export const adminGetLotteryWinners = async (drawId) => {
    const { data } = await api.get(`/api/admin/lottery/draws/${drawId}/winners`);
    return data;
};

export const adminDeleteLotteryDraw = async (drawId) => {
    const { data } = await api.delete(`/api/admin/lottery/draws/${drawId}`);
    return data;
};

// ─── CONNECTS ECONOMY ──────────────────────────────────────────────────────────

export const getConnectsBalance = async () => {
    const { data } = await api.get('/api/connects/balance');
    return data;
};

export const getConnectsHistory = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/api/connects/history?${params}`);
    return data;
};

export const getConnectsPackages = async () => {
    const { data } = await api.get('/api/connects/packages');
    return data;
};

export const getConnectsSettings = async () => {
    const { data } = await api.get('/api/connects/settings');
    return data;
};
