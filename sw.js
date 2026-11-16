const CACHE_NAME = 'ravencard-cache-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './manifest.json?v=9',
  './css/style.css',
  './css/style.css?v=14',
  './js/pwa.js',
  './js/data-service.js',
  './js/storage.js',
  './js/audio.js',
  './js/quiz.js',
  './js/app.js',
  './assets/icons/logo.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-192.png?v=9',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512.png?v=9',
  './assets/icons/icon-512-maskable.png',
  './assets/icons/icon-512-maskable.png?v=9',
  './data/hiragana.json',
  './data/katakana.json',
  './data/kanji-n5.json',
  './data/kanji-n4.json',
  './data/kanji-n3.json',
  './data/kotoba-n5.json',
  './data/kotoba-n4.json',
  './data/kotoba-n3.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use allSettled so missing optional files do not abort service worker installation
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Pre-cache failed for ${url}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Let browser natively handle cross-origin streams and external audio
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background to keep offline data current without blocking UI
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Fall back to index.html for navigation requests when offline
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html').then((res) => res || caches.match('./'));
          }
        });
    })
  );
});
