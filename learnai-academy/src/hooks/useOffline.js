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
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const service = getOfflineService();
      if (!service) {
        setIsOnline(true); // Default to online if service unavailable
        return;
      }

      setOfflineService(service);

      // Load queue
      service.loadQueue().then(() => {
        setQueueLength(service.getQueueLength());
      }).catch((error) => {
        console.warn('Failed to load offline queue:', error);
      });

      // Check initial status
      setIsOnline(service.isOnlineStatus());

      // Listen for online/offline
      const handleOnline = () => {
        setIsOnline(true);
        service.syncQueue().then(() => {
          setQueueLength(service.getQueueLength());
        }).catch((error) => {
          console.warn('Failed to sync queue:', error);
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
          try {
            setQueueLength(service.getQueueLength());
          } catch (error) {
            console.warn('Failed to get queue length:', error);
          }
        }
      }, 1000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
      setIsOnline(true); // Default to online on error
    }
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

