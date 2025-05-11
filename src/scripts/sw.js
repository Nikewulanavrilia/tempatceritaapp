const CACHE_NAME = 'tempath-cerita-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.bundle.js',
  './app.css',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => caches.match('./index.html'))
      );
    })
  );
});

self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};
  const title = data.title || 'Notifikasi';
  const options = data.options || {
    body: 'Ada update baru!',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
