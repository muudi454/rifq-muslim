/* RIFQ Muslim service worker — offline shell, bundled data, push notifications. */
const VERSION = 'rifq-v2';
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

/* ---------------------------------------------------------------- push */

self.addEventListener('push', (event) => {
  let payload = { title: 'RIFQ Muslim', body: '', url: '/' };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || '',
        url: parsed.url || '/',
      };
    }
  } catch {
    if (event.data) payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url },
      tag: 'rifq-push',
      renotify: false,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) await client.navigate(target).catch(() => undefined);
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target);
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
  // Never cache API responses: admin data and activity must stay live.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

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
