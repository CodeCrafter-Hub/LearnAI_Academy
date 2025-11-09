/**
 * Service Worker for Offline Mode
 * Caches static assets and API responses for offline access
 */

const CACHE_NAME = 'learnai-academy-v1';
const STATIC_CACHE = 'learnai-static-v1';
const API_CACHE = 'learnai-api-v1';
const IMAGE_CACHE = 'learnai-images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/learn',
  '/progress',
  '/achievements',
  '/offline',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== STATIC_CACHE &&
              name !== API_CACHE &&
              name !== IMAGE_CACHE &&
              name !== CACHE_NAME
            );
          })
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim(); // Take control immediately
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (unless it's our API)
  if (!url.origin.includes(self.location.origin) && !url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    // Images - cache first, network fallback
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    // Static assets - cache first
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // HTML pages - network first, cache fallback
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
  }
});

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(request, cacheName = API_CACHE) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a navigation request and we're offline, show offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // Return error response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Fetch failed:', request.url);
    
    // Return error response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  } else if (event.tag === 'sync-answers') {
    event.waitUntil(syncAnswers());
  }
});

/**
 * Sync progress data when back online
 */
async function syncProgress() {
  try {
    // Get pending progress from IndexedDB
    const pendingProgress = await getPendingProgress();
    
    for (const progress of pendingProgress) {
      try {
        await fetch('/api/students/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress),
        });
        
        // Remove from pending
        await removePendingProgress(progress.id);
      } catch (error) {
        console.error('Error syncing progress:', error);
      }
    }
  } catch (error) {
    console.error('Error in sync progress:', error);
  }
}

/**
 * Sync answers when back online
 */
async function syncAnswers() {
  try {
    const pendingAnswers = await getPendingAnswers();
    
    for (const answer of pendingAnswers) {
      try {
        await fetch('/api/assessment/formative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
        });
        
        await removePendingAnswer(answer.id);
      } catch (error) {
        console.error('Error syncing answer:', error);
      }
    }
  } catch (error) {
    console.error('Error in sync answers:', error);
  }
}

// Placeholder functions for IndexedDB (would need full implementation)
async function getPendingProgress() {
  return [];
}

async function removePendingProgress(id) {
  // Remove from IndexedDB
}

async function getPendingAnswers() {
  return [];
}

async function removePendingAnswer(id) {
  // Remove from IndexedDB
}

/**
 * Push notifications (for future use)
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'LearnAI Academy', options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

