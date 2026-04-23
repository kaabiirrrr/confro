import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ROLES, ADMIN_ROLES } from '../utils/roles';
import { checkProfileCompletion } from '../utils/authUtils';
import { logger } from '../utils/logger';

/**
 * Loading Spinner Component for Auth States
 */
const AuthLoadingSpinner = () => (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-4"
        />
        <p className="text-white/60 font-medium animate-pulse">Checking authentication...</p>
    </div>
);

/**
 * ProtectedRoute Component
 * @param {Array} allowedRoles - Roles permitted to access the route
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, role, loading, profile, isAuthenticated } = useAuth();
    const location = useLocation();

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // ── Optimized Loading Logic (Flicker Prevention) ──────────────────
    // Only show the full-screen spinner if:
    // 1. Context is still initializing (loading is true)
    // 2. AND we have a token (so we expect to be logged in)
    // 3. AND we DON'T have a cached role yet (hydration hasn't happened)
    if (loading && token && !role) return <AuthLoadingSpinner />;

    // â”€â”€ Stage 1: Check token and memory auth state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // If we have no token and no memory state, we are not authenticated.
    if (!token && !isAuthenticated) {
        logger.log(`[ProtectedRoute] No token or auth state found. Redirecting to login from ${location.pathname}.`);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // â”€â”€ Stage 2: Check user state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // If a token exists but the user object hasn't propagated to context yet,
    // we show a loading spinner instead of redirection. This resolves the 
    // race condition during login transitions.
    if (!user) {
        logger.log(`[ProtectedRoute] Auth active but user object missing for ${location.pathname}. Waiting for state sync...`);
        return <AuthLoadingSpinner />;
    }

    // Redirect to unauthorized if role is not allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Wait for hydration to finish before redirecting or warning
        if (!role) return <AuthLoadingSpinner />;

        logger.warn(`[ProtectedRoute] Access denied for role: ${role}. Required: ${allowedRoles.join(', ')}`);

        // Redirect to the correct dashboard based on role
        if (ADMIN_ROLES.includes(role)) return <Navigate to="/admin/dashboard" replace />;
        if (role === ROLES.CLIENT) return <Navigate to="/client/dashboard" replace />;
        if (role === ROLES.FREELANCER) return <Navigate to="/freelancer/dashboard" replace />;
        
        return <Navigate to="/" replace />;
    }

    // ─────────────────────────────────────────────────────────────────
    // Profile Completion Enforcement
    // Redirect incomplete profiles to setup flow (except when already there)
    // ─────────────────────────────────────────────────────────────────
    const isSetupPage = location.pathname.includes('setup-profile') || 
                        location.pathname.includes('profile-wizard');

    if ((role === ROLES.FREELANCER || role === ROLES.CLIENT) && !isSetupPage) {
        
        // Wait until profile is actually loaded — don't redirect on null/undefined
        // Also wait if profile is an empty object (still hydrating)
        if (profile === null || profile === undefined || Object.keys(profile).length === 0) {
            logger.log(`[ProtectedRoute] Profile empty or null. Waiting for hydration in ${location.pathname}...`);
            return <AuthLoadingSpinner />;
        }

        const isProfileCompleted = checkProfileCompletion(user, role, profile);

        if (!isProfileCompleted) {
            const redirectPath = role === ROLES.CLIENT ? '/client/setup-profile' : '/freelancer/setup-profile';
            logger.warn(`[ProtectedRoute] ${role} profile incomplete. Redirecting to setup.`, { 
                role, 
                path: location.pathname 
            });
            return <Navigate to={redirectPath} replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
