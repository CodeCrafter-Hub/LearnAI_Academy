/**
 * OfflineApi - Wrapper for API calls with offline support
 * 
 * Automatically queues requests when offline
 */

import { getOfflineService } from './offlineService.js';

/**
 * Fetch with offline support
 */
export async function offlineFetch(url, options = {}) {
  const offlineService = getOfflineService();
  
  if (!offlineService) {
    // Fallback to regular fetch if service not available
    return fetch(url, options);
  }

  // If online, try normal fetch
  if (offlineService.isOnlineStatus()) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      // Network error - queue if it's a POST/PUT/DELETE
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
        await queueRequest(url, options);
        return new Response(JSON.stringify({ 
          success: true, 
          queued: true,
          message: 'Request queued for offline sync' 
        }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw error;
    }
  } else {
    // Offline - queue POST/PUT/DELETE requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
      await queueRequest(url, options);
      return new Response(JSON.stringify({ 
        success: true, 
        queued: true,
        message: 'Request queued for offline sync' 
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // GET requests - try cache
      const cachedResponse = await getCachedResponse(url);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // No cache - return error
      throw new Error('Offline and no cached data available');
    }
  }
}

/**
 * Queue request for offline sync
 */
async function queueRequest(url, options) {
  const offlineService = getOfflineService();
  if (!offlineService) return;

  const body = options.body ? JSON.parse(options.body) : null;

  await offlineService.queueAction({
    type: 'api-request',
    url,
    method: options.method || 'POST',
    body,
  });
}

/**
 * Get cached response
 */
async function getCachedResponse(url) {
  if ('caches' in window) {
    try {
      const cache = await caches.open('learnai-api-v1');
      const cachedResponse = await cache.match(url);
      return cachedResponse;
    } catch (error) {
      console.error('Error getting cached response:', error);
    }
  }
  return null;
}

/**
 * API wrapper with offline support
 */
export const offlineApi = {
  get: (url, options = {}) => offlineFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => offlineFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }),
  put: (url, body, options = {}) => offlineFetch(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }),
  delete: (url, options = {}) => offlineFetch(url, { ...options, method: 'DELETE' }),
};

