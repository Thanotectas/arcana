// Serie «Tu ángel de la semana»: una tarjeta por semana (1080×1350) con una carta del Oráculo de los Ángeles de
// Arcana (ilustraciones de public/cartas/angeles/), su mensaje (tomado de src/lib/tarot/oraculo-angeles.ts), una
// afirmación y el dato del cielo de esa semana. Para semanas nuevas: agregar una entrada a SEMANAS.
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/angel-de-la-semana/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

const SEMANAS = [
  { archivo: "2026-11-09", fechas: "9 al 15 de noviembre", id: "angel-de-los-nuevos-comienzos", nombre: "Ángel de los Nuevos Comienzos",
    mensaje: "Se abre una puerta que hace meses parecía cerrada. Permítete empezar sin exigirte que el primer intento salga perfecto.",
    afirmacion: "Me permito empezar sin miedo a equivocarme.", cielo: "Luna nueva en Escorpio el 9: siembra lo que quieres ver nacer." },
  { archivo: "2026-11-16", fechas: "16 al 22 de noviembre", id: "angel-de-la-valentia", nombre: "Ángel de la Valentía",
    mensaje: "Ser valiente no es dejar de temblar: es dar el paso mientras tiemblas. Esta semana, la llamada o la propuesta que has ensayado mil veces.",
    afirmacion: "Doy el paso, aunque me tiemble la voz.", cielo: "Marte y Júpiter se juntan en Leo: energía para lanzarte." },
  { archivo: "2026-11-23", fechas: "23 al 29 de noviembre", id: "angel-de-la-comunicacion", nombre: "Ángel de la Comunicación",
    mensaje: "Lo que no dices también se comunica. Elige las palabras con cuidado, pero dilas: nadie puede adivinar lo que necesitas.",
    afirmacion: "Digo lo que siento, con calma y con amor.", cielo: "Luna llena en Géminis el 24: se ilumina una conversación pendiente." },
  { archivo: "2026-11-30", fechas: "30 de noviembre al 6 de diciembre", id: "angel-de-la-gratitud", nombre: "Ángel de la Gratitud",
    mensaje: "Antes de pedir algo nuevo, mira lo que ya llegó y nombra tres cosas que hoy funcionan en tu vida.",
    afirmacion: "Agradezco lo que tengo y le abro la puerta a lo que viene.", cielo: "Empieza diciembre: buen momento para cerrar el año agradeciendo." },
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; font-variant-numeric: lining-nums; }
.lienzo { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: radial-gradient(ellipse at 50% 30%, #3a2470 0%, #1a0f3a 50%, #0b0716 100%); }
.marco { position: absolute; inset: 34px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.marco::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(241,217,154,.22); border-radius: 18px; }
.esquina { position: absolute; color: #f1d99a; font-size: 34px; line-height: 1; }
.c { position: absolute; left: 0; right: 0; text-align: center; }
`;
function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350">${Array.from({ length: 90 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`).join("")}</svg>`;
}
const esquinas = `<span class="esquina" style="top:48px;left:52px">✦</span><span class="esquina" style="top:48px;right:52px">✦</span><span class="esquina" style="bottom:48px;left:52px">✦</span><span class="esquina" style="bottom:48px;right:52px">✦</span>`;

const tarjeta = (s, i) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo">
  ${estrellas(41 + i * 67)}<div class="marco"></div>${esquinas}
  <p class="c" style="top:72px;font-size:22px;letter-spacing:.36em;text-transform:uppercase;color:#b7a5ff"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Tu ángel de la semana</p>
  <p class="c" style="top:112px;font-family:Cormorant;font-style:italic;font-size:36px;color:#ece6f7">${s.fechas}</p>
  <div style="position:absolute;left:96px;top:190px;width:380px;height:570px;border-radius:18px;overflow:hidden;box-shadow:0 0 90px rgba(241,217,154,.35),0 0 0 2px rgba(241,217,154,.6)">
    <img src="file://${RAIZ}/public/cartas/angeles/${s.id}.webp" style="width:100%;height:100%;object-fit:cover" />
  </div>
  <div style="position:absolute;left:520px;right:96px;top:200px;height:560px;display:flex;flex-direction:column;justify-content:center">
    <p style="font-family:Cormorant;font-weight:600;font-size:64px;line-height:1.02;color:#f1d99a;text-shadow:0 0 30px rgba(241,217,154,.3)">${s.nombre}</p>
    <div style="width:90px;height:2px;background:rgba(241,217,154,.5);margin:26px 0"></div>
    <p style="font-size:31px;line-height:1.42">${s.mensaje}</p>
  </div>
  <div style="position:absolute;left:96px;right:96px;top:800px;padding:28px 36px;border-radius:26px;border:2px solid rgba(241,217,154,.55);background:rgba(11,7,22,.55);text-align:center">
    <p style="font-size:22px;letter-spacing:.3em;text-transform:uppercase;color:#b7a5ff">Repite esta semana</p>
    <p style="margin-top:12px;font-family:Cormorant;font-weight:600;font-size:56px;line-height:1.08;color:#f1d99a">«${s.afirmacion}»</p>
  </div>
  <p class="c" style="top:1080px;padding:0 120px;font-size:28px;line-height:1.4;color:#ece6f7"><b style="color:#b7a5ff;font-weight:600">El cielo:</b> ${s.cielo}</p>
  <p class="c" style="bottom:110px;font-size:26px;color:#ece6f7">Comenta <b style="color:#f1d99a">«Lo recibo»</b> si este mensaje es para ti</p>
  <p class="c" style="bottom:70px;font-size:22px;color:#b7a5ff">Saca tu carta del Oráculo de los Ángeles en <b style="color:#f1d99a">miarcana.com</b></p>
</div></body></html>`;

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  for (const [i, s] of SEMANAS.entries()) {
    writeFileSync(tmp, tarjeta(s, i));
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    await p.screenshot({ path: join(SALIDA, `${s.archivo}-${s.id.replace("angel-", "")}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log(`${SEMANAS.length} tarjetas en ${SALIDA}`);
})();
