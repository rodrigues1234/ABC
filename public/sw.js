const CACHE = 'abc-bi-v1';
const ASSETS = ['/', '/index.html', '/styles/app.css', '/src/app.js', '/src/store.js', '/src/crypto.js', '/public/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((res) => res || fetch(event.request)));
});
