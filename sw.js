// Meridian Motors — service worker
// Cache-first for the 3D model + static assets so return visits are instant.
// Bump CACHE_VERSION whenever the model or core assets change, to bust old caches.
const CACHE_VERSION = "v1";
const CACHE_NAME = `meridian-motors-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "models/gmc-canyon-at4x.glb",
  "styles.css",
  "script.js",
  "hero-car-3d.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("meridian-motors-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Cache-first strategy: instant load from disk for anything we've already
// cached (especially the multi-MB model), falling back to the network and
// populating the cache for next time.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isOwnOrigin = url.origin === self.location.origin;
  const isModel = url.pathname.endsWith(".glb");

  if (!isOwnOrigin && !isModel) return; // let cross-origin CDN scripts pass through normally

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
