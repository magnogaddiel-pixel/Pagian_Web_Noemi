/* =========================================================
   Gaddiel ❤️ Noemí — Interacciones principales (script.js)
   Limpio, ordenado y con comentarios
   ========================================================= */

"use strict";

/* ===========================
   0) Helpers de selección
   =========================== */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* =========================================================
   1) Emojis de amor al tocar/clic
   ========================================================= */
(function heartBursts() {
  const EMOJIS = ["💖", "💘", "💝", "💗", "💓", "💕", "🥰", "😍"];

  function spawnHeart(x, y) {
    const el = document.createElement("div");
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    Object.assign(el.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      fontSize: "24px",
      pointerEvents: "none",
      transform: "translate(-50%, -10px)",
      zIndex: 9999
    });
    document.body.appendChild(el);

    const rise = -(80 + Math.random() * 60);
    el.animate(
      [
        { opacity: 1, transform: "translate(-50%, -10px)" },
        { opacity: 0, transform: `translate(-50%, ${rise}px)` },
      ],
      { duration: 1200, easing: "ease-out" }
    ).onfinish = () => el.remove();
  }

  // Disparadores (click y touch)
  document.addEventListener("click", (e) => spawnHeart(e.clientX, e.clientY));
  document.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (t) spawnHeart(t.clientX, t.clientY);
    },
    { passive: true }
  );
})();

/* =========================================================
   2) Confetti minimalista (canvas de fondo)
   ========================================================= */
const fx  = $("#fx");
const ctx = fx?.getContext("2d");
let W = 0, H = 0, confettiParts = [];

function resizeCanvas() {
  if (!fx) return;
  W = fx.width  = innerWidth  * devicePixelRatio;
  H = fx.height = innerHeight * devicePixelRatio;
}

function confetti(n = 120) {
  if (!ctx) return;
  for (let i = 0; i < n; i++) {
    confettiParts.push({
      x: Math.random() * W,
      y: -20,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 2,
      r: 2 + Math.random() * 4,
      c: `hsl(${Math.random() * 360}, 90%, 60%)`,
    });
  }
}

function confettiTick() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  confettiParts.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  confettiParts = confettiParts.filter((p) => p.y < H + 10);
  requestAnimationFrame(confettiTick);
}

resizeCanvas();
addEventListener("resize", resizeCanvas);
confettiTick();

/* =========================================================
   3) Utilidades generales
   ========================================================= */
const yearEl = $("#anio");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const player  = $("#player");
const btnPlay = $("#btn-play");
btnPlay?.addEventListener("click", () => {
  player?.play()?.catch(() => {/* silencioso */});
});

/* =========================================================
   4) Galería auto-cargada (desde fotos.json si existe)
   ========================================================= */
const imgEl    = $("#foto");
const capEl    = $("#caption");
const thumbsEl = $("#thumbs");
const btnPrev  = $("#prev");
const btnNext  = $("#next");

let photos  = [];
let current = 0;

// 1) Intenta cargar /Fotos_Noemi/fotos.json (modo sin API)
async function loadFromJson() {
  try {
    const res = await fetch("/Fotos_Noemi/fotos.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No hay fotos.json");
    const list = await res.json();
    return list.map((name) => ({
      src: `/Fotos_Noemi/${encodeURIComponent(name)}`,
      caption: name
    }));
  } catch {
    return null;
  }
}

// 2) Construir la galería
async function buildGallery() {
  photos = (await loadFromJson()) || [];

  if (photos.length === 0) {
    photos = [
      { src: "/assets/placeholder.svg", caption: "Agrega tus fotos a /Fotos_Noemi" }
    ];
  }

  // Pintar miniaturas
  if (thumbsEl) {
    thumbsEl.innerHTML = "";
    photos.forEach((p, idx) => {
      const t = new Image();
      t.src = p.src;
      t.alt = `Miniatura ${idx + 1}`;
      t.addEventListener("click", () => mount(idx));
      thumbsEl.appendChild(t);
    });
  }

  // Mostrar primera
  mount(0);

  // Controles (una vez existen mount/current)
  btnPrev?.addEventListener("click", () => mount(current - 1));
  btnNext?.addEventListener("click", () => mount(current + 1));
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  mount(current - 1);
    if (e.key === "ArrowRight") mount(current + 1);
  });
}

// 3) Mostrar la foto seleccionada
function mount(i) {
  if (!imgEl || !capEl || !photos.length) return;
  current = (i + photos.length) % photos.length;
  imgEl.src = photos[current].src;
  imgEl.alt = photos[current].caption || "Recuerdo";
  capEl.textContent = photos[current].caption || "";
  if (thumbsEl) {
    [...thumbsEl.children].forEach((el, idx) =>
      el.classList.toggle("active", idx === current)
    );
  }
}

// 4) Iniciar
buildGallery();

/* =========================================================
   5) Carta: revelar secretos + lectura en voz alta
   ========================================================= */
const secretos = [
  "Tu risa es mi sonido favorito del día.",
  "Prometo cuidarte cuando haga frío y celebrar contigo cuando salga el sol.",
  "Gracias por hacer que un mes se sienta como un sueño bonito.",
  "Eres mi persona favorita en todo el mundo.",
  "Cada momento contigo es un tesoro que guardo en mi corazón.",
  "Contigo, cada día es una nueva aventura llena de amor y alegría.",
  "Eres la razón por la que sonrío sin motivo.",
  "Tu amor es el regalo más hermoso que he recibido.",
  "A tu lado, he descubierto lo que significa el verdadero amor."
];

let paso = 0;

$("#btn-revelar")?.addEventListener("click", () => {
  const carta = $("#carta");
  if (!carta) return;
  if (paso < secretos.length) {
    const p = document.createElement("p");
    p.textContent = secretos[paso++];
    carta.appendChild(p);
  } else {
    confetti(200);
  }
});

$("#btn-voz")?.addEventListener("click", () => {
  const texto = $$("#carta p, #carta h2").map((n) => n.textContent).join(". ");
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "es-PE";
  u.pitch = 1.05;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
});

/* =========================================================
   6) Adivinanzas de amor (quiz)
   ========================================================= */
const preguntas = [
  { q: "¿Cuándo es nuestro aniversario?", a: ["12", "14", "10"], ok: 1 },
  { q: "¿Dónde nos conocimos?",          a: ["Instagram", "Facebook", "Free Fire"], ok: 2 },
  { q: "¿Qué debe mandar la fecha del mes?", a: ["Foto", "Chiste", "Nada"], ok: 0 },
];

const quizEl = $("#quiz");

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}
const okMsg  = () => "¡Correcto, amor! 💖";
const badMsg = () => "Ups, intenta otra vez 🥺";

if (quizEl) {
  preguntas.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "q";

    const h = document.createElement("h3");
    h.textContent = `#${idx + 1} ${p.q}`;
    card.appendChild(h);

    const row = document.createElement("div");
    row.className = "row";

    p.a.forEach((opt, i) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = opt;
      b.addEventListener("click", () => {
        if (i === p.ok) { confetti(150); toast(okMsg()); }
        else           { toast(badMsg()); }
      });
      row.appendChild(b);
    });

    card.appendChild(row);
    quizEl.appendChild(card);
  });
}

/* =========================================================
   7) PWA: instalación (beforeinstallprompt)
   ========================================================= */
let deferredPrompt = null;
const btnInstall = $("#btn-instalar");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

btnInstall?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

/* =========================================================
   8) Actualización de la app (banner "Nueva versión disponible")
   ========================================================= */
(function setupSWUpdater(){
  if (!("serviceWorker" in navigator)) return;

  function showUpdateBanner(reg) {
    if (!reg || !reg.waiting) return;
    const el = Object.assign(document.createElement("div"), { id: "update-banner" });
    el.style.cssText = `
      position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%);
      background: #1b1530ee; color: #fff; border: 1px solid #ffffff33;
      padding: .6rem 1rem; border-radius: 12px; z-index: 9999;
      box-shadow: 0 10px 30px #0008; display: flex; gap: .6rem; align-items: center;
      font: 14px/1.2 Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    `;
    const txt = document.createElement("span");
    txt.textContent = "Hay una nueva versión de la app.";
    const btn = Object.assign(document.createElement("button"), { className: "btn" });
    btn.textContent = "Actualizar";
    btn.style.background = "#ffffff1a";
    btn.style.color = "#fff";
    btn.style.border = "1px solid #ffffff44";
    btn.onclick = () => {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
      navigator.serviceWorker.addEventListener("controllerchange", () => location.reload());
    };
    el.append(txt, btn);
    document.body.appendChild(el);
  }

  navigator.serviceWorker.register("/sw.js").then((reg) => {
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      sw && sw.addEventListener("statechange", () => {
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner(reg);
        }
      });
    });

    if (reg.waiting) showUpdateBanner(reg);
  }).catch(console.error);
})();

/* =========================================================
   9) Sorpresa del mes (desde /config_meses.json)
   ========================================================= */
(async function monthlyLink(){
  const link = document.querySelector('#link-mes') || document.querySelector('a[href="/flores/"]');
  if (!link) return;

  // por defecto: visible con /flores/
  link.style.display = "";
  link.href = "/flores/";
  link.textContent = link.textContent || "Flores Amarillas 🌼";

  try {
    const res = await fetch("/config_meses.json", { cache: "no-store" });
    if (!res.ok) return; // si falla, lo dejamos visible por defecto

    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,"0")}`;
    const map = await res.json();
    const conf = map[key];

    if (conf && conf.path) {
      link.href = conf.path;
      link.textContent = conf.label || link.textContent;
    }
    // si no hay clave del mes → dejamos el botón tal cual (visible)
  } catch {
    // si hay error de red/JSON, NO lo ocultamos
  }
})();
