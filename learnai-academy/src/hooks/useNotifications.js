'use client';

import { useState, useCallback, useEffect } from 'react';

let notificationIdCounter = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = notification.id || `notification-${++notificationIdCounter}`;
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000,
      action: notification.action,
      timestamp: Date.now(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Real-time achievement notifications
  const notifyAchievement = useCallback((achievement) => {
    addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked! 🎉',
      message: `You've earned the "${achievement.name}" badge!`,
      duration: 6000,
      action: {
        label: 'View',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/achievements';
          }
        },
      },
    });
  }, [addNotification]);

  // Progress milestone notifications
  const notifyProgress = useCallback((milestone) => {
    addNotification({
      type: 'progress',
      title: 'Milestone Reached! 🚀',
      message: milestone.message || `You've reached ${milestone.points} points!`,
      duration: 5000,
    });
  }, [addNotification]);

  // Streak notifications
  const notifyStreak = useCallback((streak) => {
    if (streak % 7 === 0 && streak > 0) {
      addNotification({
        type: 'success',
        title: 'Streak Milestone! 🔥',
        message: `Amazing! You've maintained a ${streak}-day streak!`,
        duration: 5000,
      });
    }
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifyAchievement,
    notifyProgress,
    notifyStreak,
  };
}

