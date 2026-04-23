import api from '../lib/api';

export const accountApi = {
    getHealthStatus: async () => {
        const response = await api.get('/api/account/health');
        return response.data;
    },

    getEnforcementHistory: async () => {
        const response = await api.get('/api/account/enforcement-history');
        return response.data;
    },

    getSecuritySettings: async () => {
        const response = await api.get('/api/account/security');
        return response.data;
    },

    updateSecuritySettings: async (settings) => {
        const response = await api.put('/api/account/security', settings);
        return response.data;
    }
};
