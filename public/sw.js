// VartaPrime Service Worker
const CACHE_NAME = 'vartaprime-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/admin.html',
  '/reporter.html',
  '/reporter-bot.html',
  '/css/style.css',
  '/css/admin.css',
  '/css/reporter.css',
  '/js/app.js',
  '/js/admin.js',
  '/js/reporter.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network first, fallback to cache
  if (e.request.url.includes('/api/')) {
    return; // Don't cache dynamic API calls
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
