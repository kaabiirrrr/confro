import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext(null);

/**
 * Global provider for IOS-style notifications.
 * Handles visibility, timing, and content of notifications.
 */
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    title: '',
    message: '',
    type: 'default', // success, error, info
    duration: 5000,
  });

  const showNotification = useCallback(({ title, message, type = 'default', duration = 4000 }) => {
    // If already showing, hide first to re-trigger animation
    setNotification(prev => ({ ...prev, show: false }));
    
    // Use a tiny timeout to ensure re-render
    setTimeout(() => {
      setNotification({
        show: true,
        title,
        message,
        type,
        duration,
      });
    }, 10);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        hideNotification();
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show, notification.duration, hideNotification]);

  const value = React.useMemo(() => ({ 
    notification, 
    showNotification, 
    hideNotification 
  }), [notification, showNotification, hideNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
