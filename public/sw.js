// ==========================================
// SERVICE WORKER — Unhas Mikaela v1.2.0
// ==========================================
const CACHE = 'mikaela-v1.2.0';
const ARQUIVOS_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  console.log('📦 SW: Instalando versão', CACHE);
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.all(
        ARQUIVOS_CACHE.map(url =>
          c.add(url).catch(err => console.warn('⚠️ SW: Não cacheou', url, err.message))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('🔄 SW: Ativando versão', CACHE);
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => {
            console.log('🗑️ SW: Removendo cache antigo', k);
            return caches.delete(k);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('/api/')) return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(resp => {
        if (resp.ok && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => {
        return caches.match('/');
      });
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const titulo = data.title || '💅 Unhas Mikaela';
  const opcoes = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'mikaela-notif',
    renotify: true
  };
  e.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (e.data === 'CLEAR_CACHE') {
    caches.delete(CACHE).then(() => {
      console.log('🗑️ SW: Cache limpo manualmente');
    });
  }
});

console.log('✅ SW: Unhas Mikaela v1.2.0 carregado');