const CACHE_NAME = 'foodmap-v1';
const RUNTIME_CACHE = 'foodmap-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('Service Worker: Caching static assets');
      await cache.addAll(STATIC_ASSETS);
      console.log('Service Worker: Installed');
      await self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            await caches.delete(cacheName);
          }
        })
      );
      console.log('Service Worker: Activated');
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // Cache map tiles for offline use
    if (url.hostname.includes('tile') || url.hostname.includes('carto') || url.hostname.includes('openstreetmap')) {
      event.respondWith(
        (async () => {
          const cache = await caches.open(RUNTIME_CACHE);
          const cachedResponse = await cache.match(request);

          if (cachedResponse) {
            return cachedResponse;
          }

          try {
            const response = await fetch(request);
            // Cache successful tile requests
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          } catch {
            // Return a placeholder or handle offline gracefully
            return new Response('Offline', { status: 503 });
          }
        })()
      );
      return;
    }

    // For other cross-origin requests (fonts, etc.), try network first
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          return await caches.match(request);
        }
      })()
    );
    return;
  }

  // For same-origin requests, use cache-first strategy
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        // Return cached version
        return cachedResponse;
      }

      // Fetch from network and cache
      try {
        const response = await fetch(request);

        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Determine which cache to use
        const cacheToUse = request.url.includes('/_app/') ? RUNTIME_CACHE : CACHE_NAME;

        const cache = await caches.open(cacheToUse);
        await cache.put(request, responseToCache);

        return response;
      } catch {
        // If fetch fails and nothing in cache, return offline page
        if (request.destination === 'document') {
          return await caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
