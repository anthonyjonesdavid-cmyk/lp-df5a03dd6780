const CACHE='lesson-mag-v4';
const CORE=['./','./index.html','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
function putCache(req,res){ if(res&&(res.ok||res.type==='opaque')){const cp=res.clone(); caches.open(CACHE).then(c=>c.put(req,cp));} return res; }
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html')){
      // network first so updates arrive, cache fallback for offline
      e.respondWith(fetch(r).then(res=>putCache('./index.html',res)).catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
      return;
    }
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>putCache(r,res))));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>putCache(r,res))));
  }
});
