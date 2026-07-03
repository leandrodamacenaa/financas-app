const CACHE_NAME = 'financas-leandro-v2';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k))) // limpa QUALQUER cache antigo, de qualquer versão
    )
  );
  self.clients.claim();
});

// O documento principal (index.html e a raiz "/") NUNCA é cacheado — sempre
// busca a versão mais nova na rede. Só ícones/manifest usam cache (não mudam).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // deixa Firebase/CDNs passarem direto

  const isDocument = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isDocument) {
    event.respondWith(fetch(event.request, {cache: 'no-store'}));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
