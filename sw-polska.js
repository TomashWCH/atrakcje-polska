const CACHE_NAME = 'polska-v1';
const PRECACHE = [
  './polska-atrakcje.html',
  './manifest-polska.json',
  './icon-polska-192.png',
  './icon-polska-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(PRECACHE.map(url => cache.add(url).catch(()=>{})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.hostname.includes('wsrv.nl') || url.hostname.includes('wikipedia') || url.hostname.includes('wikimedia')){
    event.respondWith(
      fetch(event.request).then(r=>{
        if(r.ok){const c=r.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,c));}
        return r;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }
  if(url.hostname.includes('fonts')){
    event.respondWith(
      caches.match(event.request).then(c=>c||fetch(event.request).then(r=>{
        const cl=r.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,cl));return r;
      }))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(c=>c||fetch(event.request)));
});
