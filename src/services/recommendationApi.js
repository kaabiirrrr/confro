import api from '../lib/api';

// ─── RECOMMENDATION API ──────────────────────────────────────────────────────

/**
 * Get AI-powered personalized job recommendations for the logged-in freelancer.
 */
export const getRecommendations = async ({ limit = 20, offset = 0 } = {}) => {
    const { data } = await api.get(`/api/recommendations?limit=${limit}&offset=${offset}`);
    return data;
};

/**
 * Track a behavioral event on a recommended job.
 * event_type: 'impression' | 'click' | 'save' | 'apply'
 *            | 'hide_job' | 'not_relevant' | 'dont_show_similar' | 'hired'
 */
export const trackRecommendationEvent = async (jobId, eventType, metadata = {}) => {
    try {
        await api.post(`/api/recommendations/event`, {
            job_id: jobId,
            event_type: eventType,
            metadata,
        });
    } catch (_) {
        // Fire-and-forget — swallow silently
    }
};

/**
 * Get the AI Profile Readiness / Completeness Score.
 */
export const getAIProfileScore = async () => {
    const { data } = await api.get(`/api/recommendations/profile-ai-score`);
    return data;
};

/**
 * Get the dynamic connect cost for a specific job (based on match score).
 */
export const getConnectCost = async (jobId) => {
    const { data } = await api.get(`/api/recommendations/connect-cost/${jobId}`);
    return data;
};

/**
 * Trigger a background recommendation compute (e.g. after profile update).
 */
export const triggerRecommendationCompute = async () => {
    await api.post(`/api/recommendations/compute`, {});
};
