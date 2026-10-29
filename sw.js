// Офлайн: сначала сеть мимо кэша браузера (чтобы обновления приходили сразу), без сети — из кэша.
const CACHE = 'budget-29.10-1745';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const same = new URL(req.url).origin === location.origin;
  e.respondWith(
    fetch(same ? new Request(req, { cache: 'no-store' }) : req).then(r => {
      if (r.ok && same) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
