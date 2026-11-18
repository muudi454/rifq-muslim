/*
 * RIFQ Muslim service worker — offline shell, bundled data, push notifications.
 *
 * Push payloads are re-branded here as well as on the server, so a notification
 * can never surface a development host name, a *.dev domain or a generic
 * website title. Android prints the site origin under web notifications; that
 * line is controlled by Chrome, not by this file (see docs/MOBILE_RELEASE.md).
 */
const VERSION = 'rifq-v3';
const SHELL_CACHE = `${VERSION}-shell`;
const DATA_CACHE = `${VERSION}-data`;

const APP_NAME = 'RIFQ Muslim';
const NOTIFICATION_ICON = '/icons/icon-192.png';
const NOTIFICATION_BADGE = '/icons/notification-badge.png';

const CATEGORY_LABEL = {
  athan: 'Athan',
  quran: 'Quran Audio',
  dua: 'Daily Dua',
  reminder: 'Prayer Reminder',
  hadith: 'Hadith',
  daily: 'Daily Reminder',
};

const CATEGORY_ROUTE = {
  athan: '/prayer',
  quran: '/quran',
  dua: '/duas',
  reminder: '/notifications',
  hadith: '/hadith',
  daily: '/',
};

/** Development / temporary hosts that must never appear in user-facing text. */
const DEV_ORIGIN = /https?:\/\/(?:[\w-]+\.)*(?:ap-jt\.com|localhost|127\.0\.0\.1)(?::\d+)?[^\s]*/gi;

function cleanText(value) {
  return String(value || '')
    .replace(DEV_ORIGIN, APP_NAME)
    .replace(/\s+/g, ' ')
    .trim();
}

function notificationPayload(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};
  const category = Object.prototype.hasOwnProperty.call(CATEGORY_LABEL, input.category)
    ? input.category
    : 'daily';
  const label = CATEGORY_LABEL[category];
  const detail = [cleanText(input.title), cleanText(input.body)].filter(Boolean).join(' · ');
  return {
    title: `${APP_NAME} – ${label}`,
    body: detail || label,
    url: input.url || CATEGORY_ROUTE[category],
    category,
    tag: input.tag || `rifq-${category}`,
  };
}

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/notification-badge.png',
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
  let raw = {};
  try {
    if (event.data) raw = event.data.json();
  } catch {
    if (event.data) raw = { body: event.data.text() };
  }

  const payload = notificationPayload(raw);

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_BADGE,
      data: { url: payload.url, category: payload.category },
      tag: payload.tag,
      renotify: false,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target =
    data.url ||
    CATEGORY_ROUTE[data.category] ||
    '/';
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
