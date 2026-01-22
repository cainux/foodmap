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
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('Service Worker: Installed');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
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
        caches.open(RUNTIME_CACHE).then((cache) => {
          return cache.match(request).then((response) => {
            if (response) {
              return response;
            }
            return fetch(request).then((response) => {
              // Cache successful tile requests
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            }).catch(() => {
              // Return a placeholder or handle offline gracefully
              return new Response('Offline', { status: 503 });
            });
          });
        })
      );
      return;
    }

    // For other cross-origin requests (fonts, etc.), try network first
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // For same-origin requests, use cache-first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        // Return cached version
        return response;
      }

      // Fetch from network and cache
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Determine which cache to use
        const cacheToUse = request.url.includes('/_app/') ? RUNTIME_CACHE : CACHE_NAME;

        caches.open(cacheToUse).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // If fetch fails and nothing in cache, return offline page
        if (request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
