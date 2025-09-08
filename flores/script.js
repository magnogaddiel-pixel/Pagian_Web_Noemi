// Flores Amarillas — efectos
"use strict";

const $  = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

// Año
$("#anio").textContent = new Date().getFullYear();

// Música
const player = $("#player");
$("#btnPlay")?.addEventListener("click", ()=>player?.play());

// Emojis al tocar
(function hearts(){
  const EMO=["💛","💖","🌼","🌻"];
  function pop(x,y){
    const el=document.createElement('div');
    el.textContent=EMO[Math.floor(Math.random()*EMO.length)];
    Object.assign(el.style,{position:'fixed',left:x+'px',top:y+'px',transform:'translate(-50%,-10px)',fontSize:'24px',pointerEvents:'none'});
    document.body.appendChild(el);
    el.animate([{opacity:1},{opacity:0,transform:'translate(-50%,-90px)'}],{duration:1200,easing:'ease-out'}).onfinish=()=>el.remove();
  }
  addEventListener('click',e=>pop(e.clientX,e.clientY));
  addEventListener('touchstart',e=>{const t=e.touches[0];t&&pop(t.clientX,t.clientY)}, {passive:true});
})();

// Confetti (amarillo)
const fx = $("#fx"), ctx = fx.getContext("2d");
let W,H,parts=[];
function size(){ W=fx.width=innerWidth*devicePixelRatio; H=fx.height=innerHeight*devicePixelRatio; }
size(); addEventListener('resize', size);
function confetti(n=140){
  for(let i=0;i<n;i++){
    parts.push({x:Math.random()*W, y:-20, vx:(Math.random()-.5)*2, vy:2+Math.random()*2, r:2+Math.random()*4,
      c:`hsl(${50+Math.random()*20},90%,60%)`});
  }
}
function tick(){
  ctx.clearRect(0,0,W,H);
  parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.02; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); });
  parts = parts.filter(p=>p.y<H+10);
  requestAnimationFrame(tick);
}
tick();

// Pétalos en sección
const btnPetalos = $("#btnPetalos");
const section = document.querySelector('section.card');
let toastTimer=null;
function toast(msg){
  const el=document.createElement('div'); el.className='toast'; el.textContent=msg; document.body.appendChild(el);
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.remove(),1600);
}
btnPetalos?.addEventListener('click', ()=>{ confetti(200); toast("Que lluevan pétalos 💛"); });

// Quiz
$$(".op").forEach(b=>{
  b.addEventListener('click', ()=>{
    if (b.hasAttribute('data-ok')) { confetti(200); toast("¡Correcto, amor! 💛"); }
    else { toast("Ups, intenta otra vez 🥺"); }
  });
});
