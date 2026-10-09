// Service Worker — Cache básico para funcionar offline
const CACHE = 'mikaela-v1';
const ARQUIVOS_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARQUIVOS_CACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first (para sempre pegar dados atualizados da API)
// Fallback para cache se estiver offline
self.addEventListener('fetch', e => {
  // Ignora requisições não-GET e APIs (sempre online)
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Cacheia apenas recursos estáticos
        if (resp.ok && !e.request.url.includes('/api/')) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/')))
  );
});

// Suporte a notificações push (opcional)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const titulo = data.title || 'Unhas Mikaela';
  const opcoes = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200]
  };
  e.waitUntil(self.registration.showNotification(titulo, opcoes));
});