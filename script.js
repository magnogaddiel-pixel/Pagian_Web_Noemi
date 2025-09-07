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
  const EMOJIS = ["💖", "💘", "💝", "💗", "💓", "💕"];

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

const player   = $("#player");
const btnPlay  = $("#btn-play");
btnPlay?.addEventListener("click", () => player?.play());

/* =========================================================
   4) Galería auto-cargada desde /Fotos_Noemi
   - Para evitar duplicados: dejamos UN solo patrón de nombre
   - Cambia PHOTO_BASENAME si lo necesitas
   ========================================================= */
const imgEl    = $("#foto");
const capEl    = $("#caption");
const thumbsEl = $("#thumbs");

const PHOTO_BASENAME = "Noemi_";                 // 👈 usa un solo patrón
const PHOTO_EXTS     = [".jpg", ".jpeg", ".png"]; // extensiones válidas
const MAX_PHOTOS     = 30;

let photos = [];
let current = 0;

// Carga "optimista": probamos rutas y resolvemos las existentes
function probe(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload  = () => resolve(src);
    im.onerror = () => resolve(null);
    // cache-buster ligero para evitar SW/hard cache en cambios
    im.src = src + (src.includes("?") ? "" : `?t=${Math.random()}`);
  });
}

async function buildGallery() {
  if (!imgEl || !capEl || !thumbsEl) return;

  const tries = [];
  for (let i = 1; i <= MAX_PHOTOS; i++) {
    for (const ext of PHOTO_EXTS) {
      tries.push(`Fotos_Noemi/${PHOTO_BASENAME}${i}${ext}`);
    }
  }

  const found = await Promise.all(tries.map(probe));
  // Filtra nulos y deduplica por ruta (Set)
  const unique = Array.from(new Set(found.filter(Boolean)));

  photos = unique.map((src, idx) => ({ src, caption: `Recuerdo ${idx + 1}` }));
  if (photos.length === 0) {
    photos = [{ src: "assets/placeholder.svg", caption: "Agrega tus fotos a /Fotos_Noemi" }];
  }

  mount(0);

  // Thumbnails
  thumbsEl.innerHTML = "";
  photos.forEach((p, idx) => {
    const t = new Image();
    t.src = p.src;
    t.alt = `Miniatura ${idx + 1}`;
    t.addEventListener("click", () => mount(idx));
    thumbsEl.appendChild(t);
  });
}

function mount(k) {
  if (!imgEl || !capEl || !thumbsEl || photos.length === 0) return;
  current = (k + photos.length) % photos.length;
  imgEl.src = photos[current].src;
  capEl.textContent = photos[current].caption;
  [...thumbsEl.children].forEach((el, ix) => el.classList.toggle("active", ix === current));
}

$("#prev")?.addEventListener("click", () => mount(current - 1));
$("#next")?.addEventListener("click", () => mount(current + 1));

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
    "A tu lado, he descubierto lo que significa el verdadero amor.",
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
  { q: "¿Cuando es nuestro aniversario?", a: ["12", "14", "10"], ok: 1 },
  { q: "¿Donde nos conocimos?",                 a: ["Instagram", "Facebook", "Free Fire"], ok: 2 },
  { q: "¿Que es lo que tiene que mandar la fecha de nuestro mes?",             a: ["Foto", "Chiste", "Nada"], ok: 0 },
];

const quizEl = $("#quiz");

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}
const okMsg   = () => "¡Correcto, amor! 💖";
const badMsg  = () => "Ups, intenta otra vez 🥺";

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
