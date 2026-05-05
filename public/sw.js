const CACHE_NAME = 'busybee-v2';
const POKEMON_CACHE = 'busybee-pokemon-v1';
const REMINDER_ALARM_KEY = 'busybee_reminder_timer';

// Assets to cache for offline support
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json', '/icon.svg'];

// Pokemon sprite URLs to pre-cache
const POKEMON_IDS = [25, 4, 7, 1, 133, 150, 151, 52, 39, 143, 6, 9, 3, 54, 58, 63, 77, 92, 95, 131, 147, 149, 175, 196];
const POKEMON_URLS = POKEMON_IDS.map(id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
);

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
      // Pre-cache Pokemon images (best-effort — ignore failures)
      caches.open(POKEMON_CACHE).then((cache) =>
        Promise.allSettled(POKEMON_URLS.map(url => cache.add(url).catch(() => {})))
      ),
    ])
  );
  self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== POKEMON_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch — network-first, cache fallback ──────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Pokemon sprites: cache-first (they never change)
  if (event.request.url.includes('PokeAPI/sprites')) {
    event.respondWith(
      caches.open(POKEMON_CACHE).then(cache =>
        cache.match(event.request).then(hit =>
          hit || fetch(event.request).then(res => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
        )
      )
    );
    return;
  }

  // Skip cross-origin requests and API calls
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.includes('generativelanguage') ||
      event.request.url.includes('firestore') ||
      event.request.url.includes('googleapis')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── Notification click ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});

// ─── Message handler — schedule / cancel reminders ─────────────────────────
let reminderTimer = null;

self.addEventListener('message', (event) => {
  const { type, hour, minute, lang } = event.data || {};

  if (type === 'SCHEDULE_REMINDER') {
    if (reminderTimer) clearTimeout(reminderTimer);
    reminderTimer = scheduleNext(hour ?? 8, minute ?? 0, lang ?? 'vn');
  }

  if (type === 'CANCEL_REMINDER') {
    if (reminderTimer) {
      clearTimeout(reminderTimer);
      reminderTimer = null;
    }
  }
});

function scheduleNext(hour, minute, lang) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1); // schedule for tomorrow if past today

  const delay = next.getTime() - now.getTime();

  const title = lang === 'vn' ? 'Busy Bee English 🐝' : 'Busy Bee English 🐝';
  const body = lang === 'vn'
    ? 'Hôm nay bé chưa học rồi! Vào học tiếng Anh ngay nhé! 📚'
    : "You haven't studied today! Time to learn English! 📚";

  return setTimeout(async () => {
    await self.registration.showNotification(title, {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'daily-reminder',
      renotify: true,
      requireInteraction: false,
      data: { url: '/' },
    });
    // Re-schedule for next day
    reminderTimer = scheduleNext(hour, minute, lang);
  }, delay);
}
