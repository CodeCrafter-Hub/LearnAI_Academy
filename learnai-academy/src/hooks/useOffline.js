'use client';

import { useState, useEffect } from 'react';
import { getOfflineService } from '@/lib/offline/offlineService.js';

/**
 * useOffline Hook
 * Provides offline status and functionality
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);
  const [offlineService, setOfflineService] = useState(null);

  useEffect(() => {
    const service = getOfflineService();
    if (!service) return;

    setOfflineService(service);

    // Load queue
    service.loadQueue().then(() => {
      setQueueLength(service.getQueueLength());
    });

    // Check initial status
    setIsOnline(service.isOnlineStatus());

    // Listen for online/offline
    const handleOnline = () => {
      setIsOnline(true);
      service.syncQueue().then(() => {
        setQueueLength(service.getQueueLength());
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll queue length
    const interval = setInterval(() => {
      if (service) {
        setQueueLength(service.getQueueLength());
      }
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const queueAction = async (action) => {
    if (offlineService) {
      await offlineService.queueAction(action);
      setQueueLength(offlineService.getQueueLength());
    }
  };

  const syncQueue = async () => {
    if (offlineService) {
      await offlineService.syncQueue();
      setQueueLength(offlineService.getQueueLength());
    }
  };

  const clearCache = async () => {
    if (offlineService) {
      await offlineService.clearCache();
    }
  };

  return {
    isOnline,
    isOffline: !isOnline,
    queueLength,
    queueAction,
    syncQueue,
    clearCache,
  };
}

