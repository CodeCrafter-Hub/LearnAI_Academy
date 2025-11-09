'use client';

import { createContext, useContext } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const notificationState = useNotifications();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
      <NotificationCenter
        notifications={notificationState.notifications}
        onDismiss={notificationState.removeNotification}
      />
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}

