import api from '../lib/api';


export const profileApi = {
    getStatus: async () => {
        const response = await api.get(`/api/profile/status`);
        return response.data;
    },

    updateStepStatus: async (step, data) => {
        const response = await api.put(`/api/profile/status`, { step, data });
        return response.data;
    },

    getPublicProfile: async (id) => {
        const response = await api.get(`/api/profile/${id}`);
        return response.data;
    },

    verifyEmailSend: async () => {
        const response = await api.post(`/api/profile/verify/email/send`, {});
        return response.data;
    },

    verifyEmailConfirm: async (otp) => {
        const response = await api.post(`/api/profile/verify/email/confirm`, { otp });
        return response.data;
    },

    uploadDocument: async (file, type = 'document') => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', type);

        const response = await api.post(`/api/profile/upload-document`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getReliabilityData: async (id) => {
        const response = await api.get(`/api/reliability/${id}/reliability`);
        return response.data;
    },

    getRiskData: async (id) => {
        const response = await api.get(`/api/reliability/${id}/risk`);
        return response.data;
    },

    uploadPortfolioItem: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/api/profile/upload-portfolio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateProfile: async (updates) => {
        const response = await api.patch(`/api/profile/update`, updates);
        return response.data;
    },

    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post(`/api/profile/upload-avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // --- CLIENT API ---
    getClientProfile: async () => {
        const response = await api.get(`/api/client/profile`);
        return response.data;
    },

    updateClientProfile: async (updates) => {
        const response = await api.put(`/api/client/profile`, updates);
        return response.data;
    },

    uploadClientPhoto: async (file) => {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await api.post(`/api/client/profile/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

