import axios from "axios";
import { logger } from "../utils/logger";
import { getApiUrl } from "../utils/authUtils";

const API_URL = getApiUrl();

/**
 * Analytics Service: Handles client-side event tracking.
 * This is designed to be low-priority, so failure never blocks the UI.
 */
class AnalyticsService {
  constructor() {
    this.sessionId = this._generateId();
    this.enabled = true; // Could be controlled by GDPR settings
  }

  _generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Track a generic event
   */
  async track(action, page = window.location.pathname, feature = null, metadata = {}) {
    if (!this.enabled) return;

    const payload = {
      action,
      page,
      feature,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
      },
    };

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return; // Skip tracking for unauthenticated users to avoid 401s

    try {
      // Direct axios call to avoid circular dependency
      await axios.post(`${API_URL}/api/activity/track`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
       // Silently swallow 401s to avoid console clutter when sessions expire
       if (error.response?.status !== 401) {
          logger.warn('[Analytics] Tracking failed:', error);
       }
    }
  }

  /**
   * Specifically track page visits
   */
  trackVisit(page = window.location.pathname) {
    this.track('visit', page);
  }

  /**
   * Specifically track feature usage
   */
  trackFeature(feature, page = window.location.pathname, metadata = {}) {
    this.track('feature_usage', page, feature, metadata);
  }

  // Error tracking (to integrate with ErrorBoundary later)
  trackError(error, info) {
     this.track('error', window.location.pathname, 'frontend_crash', {
        message: error.message,
        componentStack: info ? info.componentStack : null
     });
  }
}

export default new AnalyticsService();
