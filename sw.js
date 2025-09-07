/* =========================================================
   Service Worker — Gaddiel ❤️ Noemí (sw.js)
   - HTML (navegación): network-first  -> mejor frescura
   - Estáticos (CSS/JS/imagenes): cache-first -> más rápido
   ========================================================= */

const CACHE_NAME = "noemi-magic-v3"; // ← súbelo (v3, v4…) cuando despliegues cambios
const ASSETS = [
  "/",                     // raíz
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.webmanifest",
  "/assets/placeholder.svg",
];

/* ---------------------------
   Install: precache de assets
   --------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Toma control sin esperar a cerrar SW anterior
  self.skipWaiting();
});

/* ---------------------------------------
   Activate: limpieza de caches antiguos
   --------------------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  // Reclama clientes abiertos (pestañas) inmediatamente
  self.clients.claim();
});

/* ---------------------------------------
   Estrategias de respuesta
   --------------------------------------- */

// Navegación / HTML: intenta red primero, cae a caché
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || caches.match("/index.html");
  }
}

// Estáticos: sirve caché si existe; si no, baja y guarda
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, fresh.clone());
  return fresh;
}

/* ---------------------------------------
   Fetch: enruta según tipo de petición
   --------------------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Detecta navegaciones/HTML (SPA friendly)
  const accepts = request.headers.get("accept") || "";
  const isHTML =
    request.mode === "navigate" || accepts.includes("text/html");

  event.respondWith(isHTML ? networkFirst(request) : cacheFirst(request));
});
