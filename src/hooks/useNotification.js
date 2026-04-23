import { useCallback } from 'react';
import { useNotificationContext } from '../context/NotificationContext';

export const useNotification = () => {
  const { showNotification, hideNotification } = useNotificationContext();

  const notify = useCallback((options) => showNotification(options), [showNotification]);
  const dismiss = useCallback(() => hideNotification(), [hideNotification]);

  return { notify, dismiss };
};
