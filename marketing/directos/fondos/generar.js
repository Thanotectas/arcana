// Fondos virtuales para la cámara del directo (1920×1080): terciopelo morado, luces de vela desenfocadas y estrellas.
// Uso: NODE_PATH=$(npm root -g) node marketing/directos/fondos/generar.js
const { chromium } = require("playwright");
const { join } = require("node:path");
const luces = (n, semilla, colores) => {
  let s = semilla; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () => { const x = r() * 1920, y = r() * 1080, t = 30 + r() * 90, c = colores[Math.floor(r() * colores.length)];
    return `<div style="position:absolute;left:${x}px;top:${y}px;width:${t}px;height:${t}px;border-radius:50%;background:${c};opacity:${0.15 + r() * 0.35};filter:blur(${6 + r() * 14}px)"></div>`; }).join("");
};
const fondo = (base, colores, semilla, extra = "") => `<!doctype html><html><body style="margin:0;width:1920px;height:1080px;overflow:hidden;background:${base};position:relative">
${luces(46, semilla, colores)}
<div style="position:absolute;inset:0;background:repeating-linear-gradient(100deg,rgba(255,255,255,.025) 0 40px,rgba(0,0,0,.05) 40px 110px);filter:blur(10px)"></div>
<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,0) 30%,rgba(5,3,12,.65) 100%)"></div>${extra}</body></html>`;
let semillaE = 3; const azar = () => ((semillaE = (semillaE * 9301 + 49297) % 233280) / 233280);
const estrellas = Array.from({ length: 40 }, (_, i) => `<div style="position:absolute;left:${Math.round(azar() * 1900)}px;top:${Math.round(azar() * 1060)}px;color:#f1d99a;opacity:${0.25 + (i % 5) * 0.08};font-size:${12 + (i % 4) * 6}px">✦</div>`).join("");
const piezas = {
  "fondo-terciopelo": fondo("linear-gradient(180deg,#2a1450 0%,#1a0c33 55%,#0e0620 100%)", ["#ffcf7a", "#ffb347", "#ffe2a8"], 7),
  "fondo-noche-estrellada": fondo("radial-gradient(ellipse at 50% 30%,#3b2470 0%,#1b1039 55%,#0b0716 100%)", ["#b7a5ff", "#ffd27a", "#ffffff"], 21, estrellas),
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [nombre, html] of Object.entries(piezas)) {
    await p.setContent(html);
    await p.screenshot({ path: join(__dirname, `${nombre}.png`) });
  }
  await b.close();
  console.log("listo");
})();
