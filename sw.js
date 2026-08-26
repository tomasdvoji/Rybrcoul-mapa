/* Jednoduchý service worker – cache statických souborů pro offline / špatný signál.
 * Při změně dat zvyšte číslo verze, aby se cache obnovila. */
var CACHE = "toh-mapa-v2";
var FILES = [
  "./", "index.html", "css/style.css", "js/app.js", "js/config.js",
  "data/venues.json", "data/program.json", "assets/mapa.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
});
self.addEventListener("fetch", function (e) {
  // network-first pro JSON (aktuální program), cache-first pro zbytek
  if (e.request.url.indexOf("/data/") !== -1) {
    e.respondWith(fetch(e.request).then(function (r) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return r;
    }).catch(function () { return caches.match(e.request); }));
  } else {
    e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
  }
});
