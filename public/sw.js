/* RIFQ Muslim service worker — offline shell + bundled Islamic data. */
const VERSION = 'rifq-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const DATA_CACHE = `${VERSION}-data`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

const DATA_ASSETS = ['/data/quran.json', '/data/hadith.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      await shell.addAll(SHELL_ASSETS).catch(() => undefined);
      const data = await caches.open(DATA_CACHE);
      await data.addAll(DATA_ASSETS).catch(() => undefined);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isSupabase(url) {
  return url.hostname.endsWith('.supabase.co');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (isSupabase(url) || url.pathname.startsWith('/auth/')) return;

  // Navigations: network first, fall back to cached shell for offline use.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put('/index.html', fresh.clone()).catch(() => undefined);
          return fresh;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match('/index.html')) || (await cache.match('/')) || Response.error();
        }
      })(),
    );
    return;
  }

  // Quran / Hadith data: stale-while-revalidate.
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) cache.put(request, response.clone()).catch(() => undefined);
            return response;
          })
          .catch(() => undefined);
        return cached || (await network) || Response.error();
      })(),
    );
    return;
  }

  // Static assets: cache first, then network.
  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && response.ok && url.origin === self.location.origin) {
          cache.put(request, response.clone()).catch(() => undefined);
        }
        return response;
      } catch {
        return cached || Response.error();
      }
    })(),
  );
});
