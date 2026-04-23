import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

/**
 * Sends a password reset email to the specified user.
 * @param {string} email - The user's email address.
 * @returns {Promise<{success: boolean, message: string, error?: any}>}
 */
export const forgotPassword = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        return {
            success: true,
            message: 'Password reset link sent to your email.'
        };
    } catch (error) {
        logger.error("AuthService: Forgot password request failed", error);
        return {
            success: false,
            message: error.message || 'An error occurred while sending reset link.',
            error
        };
    }
};

/**
 * Updates the current user's password.
 * This should only be called when the user is authenticated via the reset link.
 * @param {string} newPassword - The new password.
 * @returns {Promise<{success: boolean, message: string, error?: any}>}
 */
export const resetPassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return {
            success: true,
            message: 'Password successfully updated.'
        };
    } catch (error) {
        logger.error("AuthService: Password reset update failed", error);
        return {
            success: false,
            message: error.message || 'An error occurred while updating password.',
            error
        };
    }
};
