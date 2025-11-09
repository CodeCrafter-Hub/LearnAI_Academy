/**
 * OfflineService - Manages offline functionality
 * 
 * Features:
 * - Service Worker registration
 * - Offline detection
 * - Queue management for offline actions
 * - Background sync
 * - Cache management
 */

class OfflineService {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.offlineQueue = [];
    
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  /**
   * Initialize offline service
   */
  async init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        this.serviceWorkerRegistration = registration;
        console.log('[OfflineService] Service Worker registered');
      } catch (error) {
        console.error('[OfflineService] Service Worker registration failed:', error);
      }
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // Check initial online status
    this.isOnline = navigator.onLine;
  }

  /**
   * Handle coming online
   */
  async handleOnline() {
    console.log('[OfflineService] Back online, syncing...');
    
    // Sync pending actions
    await this.syncQueue();
    
    // Trigger background sync if available
    if (this.serviceWorkerRegistration && 'sync' in self.registration) {
      try {
        await this.serviceWorkerRegistration.sync.register('sync-progress');
        await this.serviceWorkerRegistration.sync.register('sync-answers');
      } catch (error) {
        console.error('[OfflineService] Background sync registration failed:', error);
      }
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('[OfflineService] Gone offline');
    // Could show offline indicator
  }

  /**
   * Queue action for offline execution
   */
  async queueAction(action) {
    this.offlineQueue.push({
      id: `action_${Date.now()}_${Math.random()}`,
      ...action,
      timestamp: new Date().toISOString(),
    });

    // Store in IndexedDB for persistence
    await this.storeInIndexedDB(this.offlineQueue);

    // Try to execute if online
    if (this.isOnline) {
      await this.syncQueue();
    }
  }

  /**
   * Sync queued actions
   */
  async syncQueue() {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const action of queue) {
      try {
        await this.executeAction(action);
        // Remove from IndexedDB on success
        await this.removeFromIndexedDB(action.id);
      } catch (error) {
        console.error('[OfflineService] Failed to sync action:', error);
        // Re-add to queue if failed
        this.offlineQueue.push(action);
      }
    }

    // Update IndexedDB
    await this.storeInIndexedDB(this.offlineQueue);
  }

  /**
   * Execute a queued action
   */
  async executeAction(action) {
    const { type, url, method, body } = action;

    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Action failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check if online
   */
  isOnlineStatus() {
    return this.isOnline;
  }

  /**
   * Get offline queue length
   */
  getQueueLength() {
    return this.offlineQueue.length;
  }

  /**
   * Clear cache
   */
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[OfflineService] Cache cleared');
    }
  }

  /**
   * Store in IndexedDB (simplified - would need full IndexedDB implementation)
   */
  async storeInIndexedDB(queue) {
    if ('indexedDB' in window) {
      try {
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
      } catch (error) {
        console.error('[OfflineService] Failed to store in localStorage:', error);
      }
    }
  }

  /**
   * Remove from IndexedDB
   */
  async removeFromIndexedDB(id) {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        const queue = JSON.parse(stored);
        const filtered = queue.filter(item => item.id !== id);
        localStorage.setItem('offlineQueue', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('[OfflineService] Failed to remove from localStorage:', error);
    }
  }

  /**
   * Load queue from IndexedDB
   */
  async loadQueue() {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[OfflineService] Failed to load queue:', error);
    }
  }

  /**
   * Update cache
   */
  async updateCache() {
    if (this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.update();
        console.log('[OfflineService] Service Worker updated');
      } catch (error) {
        console.error('[OfflineService] Service Worker update failed:', error);
      }
    }
  }
}

// Singleton instance
let offlineServiceInstance = null;

export function getOfflineService() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!offlineServiceInstance) {
    offlineServiceInstance = new OfflineService();
  }
  
  return offlineServiceInstance;
}

export const offlineService = typeof window !== 'undefined' ? getOfflineService() : null;
export default offlineService;

