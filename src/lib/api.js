import axios from 'axios';
import { supabase } from './supabase';
import { getApiUrl } from '../utils/authUtils';
import { cleanImageUrl } from '../utils/imageUrl';

// Standardize baseURL — use getApiUrl() so localhost always hits local backend
const rawBaseURL = getApiUrl();
const baseURL = rawBaseURL.replace(/\/$/, '');

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 60000, // 60s — accommodates Render free tier cold starts (~50s)
});

// Recursive data sanitizer to clean image URLs in API responses
const sanitizeData = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeData);

    const sanitized = {};
    for (const key in obj) {
        let value = obj[key];

        // Sanitize any key that looks like an image URL or avatar
        if (typeof value === 'string' && (key.includes('url') || key.includes('avatar') || key.includes('photo') || key.includes('image'))) {
            value = cleanImageUrl(value, obj.name || obj.title || 'User');
        } else {
            value = sanitizeData(value);
        }
        sanitized[key] = value;
    }
    return sanitized;
};

// Interceptor to add auth header
api.interceptors.request.use(async (config) => {
    // 1. Priority #1: Sync check from storage for maximum speed and reliability during redirects
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    let source = 'storage';

    // 2. Priority #2: Fallback to live Supabase session (Async)
    if (!token) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                token = session.access_token;
                // Persist it so subsequent requests don't need the async fallback
                localStorage.setItem('token', token);
                sessionStorage.setItem('token', token);
                source = 'supabase';
            }
        } catch (err) {
            console.warn('[API Interceptor] Supabase session check failed', err);
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (config.url?.includes('/api/')) {
            console.log(`[API Interceptor] Token attached from ${source}: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
        }
    }

    // Give file uploads extra time — cold start + upload can exceed default timeout
    const isFileUpload = 
        config.url?.includes('upload') ||
        config.url?.includes('/photo') ||
        config.url?.includes('/avatar') ||
        config.url?.includes('/document');
    if (isFileUpload) {
        config.timeout = 120000; // 2 minutes for uploads
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Global response interceptor to sanitize dirty data (ELITE FIX)
api.interceptors.response.use((response) => {
    if (response.data) {
        response.data = sanitizeData(response.data);
    }
    return response;
}, async (error) => {
    const originalRequest = error.config;

    // ── 401 UNAUTHORIZED RECOVERY ────────────────────────────────────────────
    // Strategy: attempt a silent Supabase token refresh before giving up.
    // NEVER delete sb-* keys — those belong to the Supabase SDK and are needed
    // for refresh. Only clear our app-level 'token' key if the refresh also fails.
    if (error.response?.status === 401 && !originalRequest._retried) {
        originalRequest._retried = true;

        try {
            // Try to refresh the session first
            const { data: refreshData } = await supabase.auth.refreshSession();
            const freshToken = refreshData?.session?.access_token;

            if (freshToken) {
                localStorage.setItem('token', freshToken);
                sessionStorage.setItem('token', freshToken);
                originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
                return api(originalRequest);
            }
        } catch (refreshErr) {
            // Refresh failed — session is truly expired
        }

        // Refresh failed — clear stale token and redirect to login
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');

        const path = window.location.pathname;
        const isOnboarding = path.includes('/auth/callback') || path.includes('/profile-wizard') || path.includes('/setup-profile');

        if (!isOnboarding) {
            window.dispatchEvent(new Event('auth-unauthorized'));
        }
    }

    return Promise.reject(error);
});

export default api;
