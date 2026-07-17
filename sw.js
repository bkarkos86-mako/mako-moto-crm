const CACHE_VERSION = 'mm-crm-v3';
const SHELL_URLS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        Promise.all(SHELL_URLS.map((url) => fetch(url, { cache: 'no-store' }).then((res) => cache.put(url, res))))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave the backend / Claude API alone

  if (req.mode === 'navigate') {
    // `no-store` forces past the browser's own HTTP cache, not just this
    // service worker's cache — without it, a stale index.html can still be
    // served from disk cache even though this handler "tries" the network.
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Stale-while-revalidate for same-origin static assets (hashed JS/CSS/icons).
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(req);
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
