/**
 * WebDog Service Worker — Cache-first per assets statici
 *
 * Strategia:
 *  - Assets statici (immagini, font, JS/CSS del build): cache-first
 *  - Navigazione HTML: network-first con fallback alla cache
 *  - API e Firebase: sempre network (no cache)
 */

const CACHE_NAME = 'webdog-v1';

// Assets da pre-cachare all'installazione
const PRECACHE_URLS = [
  '/',
  '/favicon.svg',
  '/chi_sono_profile.jpg',
  '/gallery_walk.png',
  '/gallery_sitting.png',
  '/gallery_training.png',
  '/webdog_walkthrough.webp',
];

// Installa e pre-cacha gli asset principali
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        // Se un asset non è raggiungibile, non bloccare l'installazione
        console.warn('[SW] Pre-cache parziale:', err);
      });
    })
  );
  self.skipWaiting();
});

// Attiva e rimuove vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercetta le fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Non intercettare: Firebase, EmailJS, Google APIs, extensioni browser
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('emailjs') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('googletagmanager') ||
    url.hostname.includes('unsplash') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // Navigazione HTML → network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Assets statici (immagini, font, JS, CSS) → cache-first
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'script' ||
    request.destination === 'style'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});
