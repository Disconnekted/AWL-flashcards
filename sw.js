// Bump this version string whenever you re-upload updated app files —
// that's what triggers the browser to fetch fresh copies and clean up
// the old cache automatically.
const CACHE_NAME = 'awl-flashcards-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // don't try to cache anything else

  event.respondWith(
    caches.match(req).then((cached) => {
      // Serve instantly from cache when we have it, but still refresh the
      // cache in the background (stale-while-revalidate) — this is what
      // lets Google Fonts work offline too, once they've loaded at least
      // once while online.
      const network = fetch(req)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return response;
        })
        .catch(() => cached); // offline and nothing cached yet — nothing more we can do

      return cached || network;
    })
  );
});
