const CACHE='mijnAnker-v4';const ASSETS=['./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(cached=>{const fetchPromise=fetch(e.request).then(response=>{if(!response||response.status!==200)return response;const responseToCache=response.clone();caches.open(CACHE).then(cache=>{cache.put(e.request,responseToCache);});return response;});return cached||fetchPromise;}));});
