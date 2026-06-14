const CACHE = 'atrakcje-polska-v4';
const PRECACHE = [
  './atrakcje-polska.html',
  './manifest-polska.json',
  './icon-polska-192.png',
  './icon-polska-512.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(PRECACHE.map(u => c.add(u).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(['openstreetmap.org','tile.openstreetmap.org'].some(h=>url.hostname.includes(h))){
    e.respondWith(fetch(e.request).catch(()=>new Response('',{status:503}))); return;
  }
  if(['fonts.googleapis.com','fonts.gstatic.com','unpkg.com'].some(h=>url.hostname.includes(h))){
    e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{
      const cl=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)); return r;
    }))); return;
  }
  if(url.origin===self.location.origin){
    e.respondWith(fetch(e.request).then(r=>{
      const cl=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cl)); return r;
    }).catch(()=>caches.match(e.request))); return;
  }
});
