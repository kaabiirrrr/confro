import api from "../lib/api";

export const connectsApi = {
    getBalance: async () => {
        const response = await api.get(`/api/connects/balance`);
        return response.data;
    },

    getHistory: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.typeFilter) params.append("typeFilter", filters.typeFilter);
        if (filters.dateFilter) params.append("dateFilter", filters.dateFilter);

        const response = await api.get(`/api/connects/history?${params.toString()}`);
        return response.data;
    },

    getPackages: async () => {
        const response = await api.get(`/api/connects/packages`);
        return response.data;
    },

    applyPromoCode: async (code) => {
        const response = await api.post(`/api/connects/apply-promo`, { code });
        return response.data;
    },

    createPaymentIntent: async (packageId, promoCode) => {
        const response = await api.post(`/api/connects/create-payment-intent`, { packageId, promoCode });
        return response.data;
    },

    confirmPayment: async (paymentIntentId) => {
        const response = await api.post(`/api/connects/confirm-payment`, { paymentIntentId });
        return response.data;
    },

    getSettings: async () => {
        const response = await api.get(`/api/connects/settings`);
        return response.data;
    }
};
