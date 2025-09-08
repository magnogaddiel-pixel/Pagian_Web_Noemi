/* =========================================================
   Service Worker — PWA PRO (auto-actualizable)
   Estrategias:
   - HTML → network-first (+ navigation preload)
   - CSS/JS/IMG/FONT/AUDIO → stale-while-revalidate
   - Offline fallback → /index.html
   - SKIP_WAITING vía postMessage
   - Range requests (audio/video) → bypass
   ========================================================= */

const RUNTIME_CACHE = "noemi-runtime-v1";
const OFFLINE_URLS = [
  "./",                 // raíz (el punto es clave)
  "index.html",       // home offline
  "flores/index.html" // subpágina offline (si existe)
];
/* ---------- Install: precache mínimo ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.addAll(OFFLINE_URLS);
      } catch (err) {
        // Si algún recurso falla, seguimos igual. No rompemos la instalación.
        // console.warn("Precaching parcial:", err);
      }
    })()
  );
  self.skipWaiting();
});

/* ---------- Activate: limpia cache vieja + navigation preload ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== RUNTIME_CACHE).map(k => caches.delete(k)));
      // Activa navigation preload si está disponible
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })()
  );
});

/* ---------- Mensajes desde la página ---------- */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ---------- Helpers ---------- */
function isHtml(req) {
  return req.mode === "navigate" ||
         (req.headers.get("accept") || "").includes("text/html");
}

/* ---------- Fetch ---------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET
  if (request.method !== "GET") return;

  // Bypass para Range requests (streaming de audio/video)
  if (request.headers.has("range")) {
    event.respondWith(fetch(request));
    return;
  }

  // 1) HTML → Network First (+ navigation preload si existe), fallback a cache y luego /index.html
  if (isHtml(request)) {
    event.respondWith((async () => {
      try {
        // Usa la respuesta de navigation preload si ya está en vuelo
        const preload = await event.preloadResponse;
        if (preload) {
          const copy = preload.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return preload;
        }

        const net = await fetch(request);
        const copy = net.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
        return net;
      } catch {
        const cached = await caches.match(request);
        return cached || (await caches.match("/index.html"));
      }
    })());
    return;
  }

  // 2) Assets → Stale-While-Revalidate
  const dest = request.destination;
  if (["style", "script", "image", "font", "audio"].includes(dest)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const netPromise = fetch(request)
        .then((res) => { cache.put(request, res.clone()); return res; })
        .catch(() => null);
      return cached || (await netPromise) || new Response("", { status: 504 });
    })());
    return;
  }

  // 3) Resto → red; si falla cache; si no, home offline
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
      .then((r) => r || caches.match("/index.html"))
  );
});
