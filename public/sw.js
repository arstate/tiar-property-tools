// Service Worker for Tiar Property Tools PWA (Extreme Bandwidth Shield)
const CACHE_NAME = "tiar-tools-bandwidth-v2";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico",
];

// 1. Install Event: Pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Purge old caches (including v1)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intercept request & serve from cache
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Do not intercept cross-origin tracking or APIs
  if (url.origin !== self.location.origin) return;

  // Never cache the service worker itself
  if (url.pathname === "/sw.js") return;

  // Pattern 1: Immutable Static Assets (Next.js chunks, fonts, images, icons) -> CACHE FIRST
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(woff2|woff|ttf|eot|png|jpg|jpeg|webp|avif|svg|ico|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn("[SW] Offline / Fetch error for static asset:", request.url, err);
            return new Response("", { status: 408, statusText: "Request Timed Out / Offline" });
          });
      })
    );
    return;
  }

  // Pattern 2: Navigation / HTML -> TRUE STALE-WHILE-REVALIDATE with ignoreSearch: true
  // Crucial: ignoreSearch: true ensures ad traffic (?fbclid=..., ?gclid=...)
  // is instantly served from local cache with 0ms latency and 0 byte origin hit!
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || caches.match("/", { ignoreSearch: true });
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
