import React, { createContext, useContext, useState, useEffect } from 'react';
import PolicyViolationModal from './components/ui/PolicyViolationModal';
import { onMessageBlocked } from './services/socketService';
import api from './lib/api';
import { toast } from 'react-hot-toast';

const ModerationContext = createContext();

export const ModerationProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        reason: '',
        flaggedContent: '',
        warningCount: 0,
        severity: 'High'
    });

    const showViolation = (data) => {
        setModalState({
            isOpen: true,
            reason: data.reason || 'Policy Violation',
            flaggedContent: data.flaggedContent || data.content || data.message || '',
            warningCount: data.warningCount || data.strikes || 1,
            severity: data.severity || 'High'
        });
    };

    const closeViolation = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    // 1. Socket Listener Integration
    useEffect(() => {
        const unsubscribe = onMessageBlocked((data) => {
            console.log('[Moderation] Socket block received:', data);
            showViolation({
                reason: data.reason,
                flaggedContent: data.message,
                warningCount: data.strikes,
                severity: data.severity
            });
        });
        return () => unsubscribe && unsubscribe();
    }, []);

    // 2. API Interceptor Integration (One-time setup)
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            response => response,
            error => {
                const data = error.response?.data;
                // Check if this is a moderation block (403 or 400 with specific markers)
                if (error.response?.status === 403 && (data?.error === 'policy_violation' || data?.blocked)) {
                    showViolation({
                        reason: data.message || data.reason,
                        flaggedContent: data.flagged_content || data.content || '',
                        warningCount: data.warning_count || data.strikes || 0,
                        severity: data.severity || 'High'
                    });
                }
                return Promise.reject(error);
            }
        );
        return () => api.interceptors.response.eject(interceptor);
    }, []);

    return (
        <ModerationContext.Provider value={{ showViolation }}>
            {children}
            <PolicyViolationModal 
                {...modalState} 
                onClose={closeViolation} 
            />
        </ModerationContext.Provider>
    );
};

export const useModeration = () => {
    const context = useContext(ModerationContext);
    if (!context) {
        throw new Error('useModeration must be used within a ModerationProvider');
    }
    return context;
};
