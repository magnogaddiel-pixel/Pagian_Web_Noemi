/* =========================================================
   Service Worker — Gaddiel ❤️ Noemí
   Controla qué se guarda para funcionar offline
   ========================================================= */

const CACHE_NAME = "noemi-magic-v4.4"; // ⚡ Nueva versión

const ASSETS = [
  "/",                        // raíz
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/sw.js",

  // 🎵 Música
  "/assets/amor_2.mp3",
  "/assets/amor_4.mp3",

  // 🌸 Hero
  "/Fotos_Noemi/Noemi_3.jpg",

  // 🖼️ Íconos
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/placeholder.svg",

  // 📸 Fotos
  "/Fotos_Noemi/Noemi_1.jpg",
  "/Fotos_Noemi/Noemi_2.jpg",
  "/Fotos_Noemi/Noemi_3.jpg",
  "/Fotos_Noemi/Noemi_4.jpg",

  // 🌼 Nueva página Flores Amarillas
  "/flores/index.html",
  "/flores/style.css",
  "/flores/script.js",
];

/* ---------- Install: precache ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

/* ---------- Activate: limpia versiones viejas ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

/* ---------- Fetch: primero red, si no cache ---------- */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request).then((res) => res || caches.match("/index.html")))
  );
});
