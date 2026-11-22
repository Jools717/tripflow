/* TripFlow Service Worker — generado en cada build por build/serviceWorkerPlugin.js. No editar dist/sw.js. */
const VERSION = '__VERSION__';
const PRECACHE = `tripflow-precache-${VERSION}`;
const RUNTIME = 'tripflow-runtime';
const TILES = 'tripflow-map-tiles';
const PRECACHE_URLS = __PRECACHE_URLS__;
const MAX_TILES = 400;

// Hosts que nunca se cachean: datos en vivo (Supabase, cotizaciones, Google Maps)
const NETWORK_ONLY = [/supabase\.co$/, /dolarapi\.com$/, /open\.er-api\.com$/, /(^|\.)google\.com$/, /^maps\.googleapis\.com$/, /^maps\.gstatic\.com$/, /^wa\.me$/];
// Fuentes y motor OCR: se guardan la primera vez que se usan
const RUNTIME_CACHE = [/fonts\.googleapis\.com$/, /fonts\.gstatic\.com$/, /cdn\.jsdelivr\.net$/, /unpkg\.com$/, /tessdata\.projectnaptha\.com$/];
const TILE_HOSTS = /tile\.openstreetmap\.org$/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  // No se activa solo: la app muestra "Nueva versión lista" y el usuario decide (con copia de seguridad previa)
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('tripflow-precache-') && k !== PRECACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

const trimCache = async (name, max) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
};

const cacheFirst = async (request, cacheName) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    if (cacheName === TILES) trimCache(TILES, MAX_TILES);
  }
  return response;
};

// Navegación: red primero (para ver siempre la última versión) y, sin conexión, la app guardada
const networkFirstPage = async (request) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch {
    return (await caches.match('/', { ignoreSearch: true })) || (await caches.match(request)) || Response.error();
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (NETWORK_ONLY.some((re) => re.test(url.hostname))) return;

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, RUNTIME));
    return;
  }
  if (TILE_HOSTS.test(url.hostname)) {
    event.respondWith(cacheFirst(request, TILES));
    return;
  }
  if (RUNTIME_CACHE.some((re) => re.test(url.hostname))) {
    event.respondWith(cacheFirst(request, RUNTIME));
  }
});
