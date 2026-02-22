const CACHE_NAME = 'sight-reading-v5';
const ASSETS = [
  './',
  './index.html',
  './compose.html',
  './practice.html',
  './css/style.css',
  './css/compose.css',
  './css/practice.css',
  './js/app.js',
  './js/config.js',
  './js/compose.js',
  './js/practice.js',
  './js/noteGenerator.js',
  './js/quizManager.js',
  './js/uiController.js',
  './js/staffRenderer.js',
  './js/midiHandler.js',
  './js/micHandler.js',
  './js/progressManager.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Cache local assets on install, fetch VexFlow from network
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for CDN resources, cache-first for local assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Network-first for external resources (VexFlow CDN)
  if (url.origin !== location.origin) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for local assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      });
    })
  );
});
