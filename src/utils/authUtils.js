export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // 1. Force production domain if on the live site
    if (!window.location.hostname.includes('localhost')) {
      return "https://connectfreelance.in";
    }
    // 2. Otherwise local dev
    return import.meta.env.VITE_APP_URL || window.location.origin;
  }
  return "https://connectfreelance.in";
};

export const getApiUrl = () => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return "http://127.0.0.1:5001";
        }
    }
    // Production Render Backend (Prioritize Env Var, fallback to dm8d)
    return import.meta.env.VITE_API_URL || "https://connectfreelance-backend.onrender.com";
};

export const getSocketUrl = () => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return "http://127.0.0.1:5001";
        }
    }
    return import.meta.env.VITE_SOCKET_URL || "https://connectfreelance-backend.onrender.com";
};

export const getOauthRedirectUrl = () => {
  return `${getBaseUrl()}/auth/callback`;
};

/**
 * Unified logic to check if a profile is considered "100% Complete"
 * @param {Object} user - Supabase user object from state/session
 * @param {String} role - Current user role (CLIENT/FREELANCER)
 * @param {Object} profile - Hydrated profile data from backend/cache
 * @returns {Boolean}
 */
export const checkProfileCompletion = (user, role, profile) => {
    if (!role) return false;
    
    // Admins are always complete
    const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'SUPPORT_ADMIN'];
    if (ADMIN_ROLES.includes(role)) return true;

    // Check all combinations of completeness flags
    const isComplete = (
        user?.is_profile_complete === true ||
        profile?.is_profile_complete === true ||
        profile?.profile_completed === true ||
        profile?.profileCompleted === true ||
        profile?.profile_status === 'COMPLETED' ||
        profile?.profile_completion_percentage >= 100 ||
        profile?.is_client_profile_complete === true ||
        // Support nested structure (sometimes profile is { profile: { ... } })
        profile?.profile?.is_profile_complete === true ||
        profile?.profile?.profileCompleted === true ||
        profile?.profile?.profile_completed === true ||
        profile?.profile?.profile_status === 'COMPLETED' ||
        profile?.profile?.profile_completion_percentage >= 100 ||
        profile?.profile?.is_client_profile_complete === true
    );

    return !!isComplete;
};
