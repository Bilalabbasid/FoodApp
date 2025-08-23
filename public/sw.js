// Completely disable service worker for development
console.log('Service Worker: Disabled for development');

// Immediately unregister any existing service worker
self.addEventListener('install', (event) => {
  console.log('SW: Unregistering...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Clearing all caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map(name => caches.delete(name)));
    }).then(() => {
      console.log('SW: All caches cleared');
      return self.clients.claim();
    })
  );
});

// Do not intercept any fetch requests
self.addEventListener('fetch', (event) => {
  // Let all requests pass through normally
  return;
});
