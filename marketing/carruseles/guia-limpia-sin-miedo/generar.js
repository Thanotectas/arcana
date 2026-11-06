// «Guía de la limpia con huevo, sin miedo» (1 imagen 1080×1350): lo que se ve en el vaso, lo que es físico y lo que
// se lee, según src/lib/conocimiento/huevo.md. Contrapeso a las guías que leen envidias, brujería y muerte.
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/guia-limpia-sin-miedo/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

// Vaso dibujado: contorno, agua, yema y el detalle de cada señal.
const vaso = (detalle, yema = { cx: 60, cy: 118, rx: 26, ry: 13, color: "#f2a33a" }, encima = "") => `<svg viewBox="0 0 120 150" width="120" height="150">
  <path d="M18 18 L102 18 L94 140 Q60 146 26 140 Z" fill="rgba(183,165,255,0.10)" stroke="#d9c9a0" stroke-width="2.5"/>
  <path d="M21 38 L99 38" stroke="rgba(183,165,255,0.6)" stroke-width="1.6"/>
  ${detalle}
  <ellipse cx="${yema.cx}" cy="${yema.cy}" rx="${yema.rx}" ry="${yema.ry}" fill="${yema.color}"/>
  <ellipse cx="${yema.cx - 7}" cy="${yema.cy - 4}" rx="7" ry="3" fill="#fff" opacity=".35"/>
  ${encima}
</svg>`;
const B = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,.25)" stroke="#fff" stroke-width="1.6"/>`;

const SENALES = [
  { t: "Agua clara, yema entera", d: "Calma. Tu centro está firme y no hay nada pesado.", s: vaso("") },
  { t: "Burbujitas arriba", d: "Cansancio que se soltó. Ojo: unas burbujas salen siempre al echar el huevo.", s: vaso([B(38, 45), B(52, 43, 3.5), B(68, 46, 4.5), B(83, 44, 3), B(60, 52, 3.5), B(45, 56, 3)].join("")) },
  { t: "Hilos que suben", d: "Preocupaciones que se van. Si llegan arriba, ya salieron.", s: vaso(`<path d="M52 104 C48 80 56 64 50 44 M62 104 C64 82 58 66 64 46 M70 106 C76 86 70 70 76 52" stroke="#fff" stroke-width="2" fill="none" opacity=".85"/>`) },
  { t: "Picos con burbujita", d: "«Velitas»: peticiones en camino, lo que pediste con fuerza.", s: vaso(`<path d="M44 106 L48 74 L52 106 M66 106 L71 66 L76 106" stroke="#fff" stroke-width="2.2" fill="rgba(255,255,255,.25)"/>${B(48, 70, 3.5)}${B(71, 62, 3.5)}`) },
  { t: "Velo o nube", d: "Cargas del corazón que se traían guardadas y empiezan a soltarse.", s: vaso(`<path d="M36 104 C34 86 50 78 46 62 C58 70 62 58 74 66 C70 80 88 86 84 104 Z" fill="rgba(255,255,255,.55)"/>`) },
  { t: "Puntito rojo en la yema", d: "Es natural en huevos frescos. Se lee como una carga fuerte que salió. Nunca es enfermedad.", s: vaso("", undefined, `<circle cx="67" cy="119" r="4.5" fill="#c0392b" stroke="#7a1d14" stroke-width="1"/>`) },
  { t: "Yema pálida o extendida", d: "Cansancio. Te pide descanso y cuidarte, no es un daño.", s: vaso("", { cx: 60, cy: 124, rx: 34, ry: 9, color: "#f6d77a" }) },
  { t: "Figuras: ave, corazón, camino", d: "Noticias, afecto, un viaje o un trámite. Ninguna figura es mal augurio.", s: vaso(`<path d="M44 70 q8 -10 16 0 q8 -10 16 0" stroke="#fff" stroke-width="2.2" fill="none"/><path d="M56 92 c-6 -7 2 -12 4 -6 c2 -6 10 -1 4 6 l-4 5z" fill="#fff" opacity=".8"/>`) },
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; }
.lienzo { position: relative; width: 1080px; height: 1350px; background: radial-gradient(ellipse at 50% 20%, #2a1a5e 0%, #160d33 55%, #0b0716 100%); }
.marco { position: absolute; inset: 30px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.grilla { position: absolute; left: 66px; right: 66px; top: 262px; height: 828px; display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 20px 26px; }
.sen { display: flex; gap: 16px; align-items: center; background: rgba(11,7,22,.5); border: 1.5px solid rgba(241,217,154,.22); border-radius: 22px; padding: 12px 18px 12px 8px; }
.sen svg { flex: none; width: 124px; height: 155px; }
.sen h3 { font-family: Cormorant; font-weight: 600; font-size: 36px; line-height: 1.02; color: #f1d99a; }
.sen p { font-size: 21px; line-height: 1.32; margin-top: 6px; }
`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo"><div class="marco"></div>
  <p style="position:absolute;top:66px;left:0;right:0;text-align:center;font-size:22px;letter-spacing:.36em;text-transform:uppercase;color:#b7a5ff"><b style="color:#f1d99a">Arcana</b> · Sibila te lee</p>
  <h1 style="position:absolute;top:106px;left:0;right:0;text-align:center;font-family:Cormorant;font-weight:600;font-size:76px;line-height:1;color:#f1d99a;text-shadow:0 0 40px rgba(241,217,154,.3)">La limpia con huevo, sin miedo</h1>
  <p style="position:absolute;top:196px;left:90px;right:90px;text-align:center;font-family:Cormorant;font-style:italic;font-size:32px;color:#ece6f7">Lo que ves en tu vaso, lo que es físico y lo que se lee</p>
  <div class="grilla">${SENALES.map((x) => `<div class="sen">${x.s}<div><h3>${x.t}</h3><p>${x.d}</p></div></div>`).join("")}</div>
  <div style="position:absolute;left:90px;right:90px;bottom:116px;padding:16px 26px;border-radius:22px;border:2px solid rgba(241,217,154,.6);background:rgba(11,7,22,.55);text-align:center">
    <p style="font-size:24px;line-height:1.4">En el vaso no se ven envidias, «trabajos» ni enfermedades. <b style="color:#f1d99a">Desconfía de quien te asuste para cobrarte.</b></p>
  </div>
  <p style="position:absolute;bottom:62px;left:0;right:0;text-align:center;font-size:24px;color:#b7a5ff">Sibila te marca lo que salió en tu vaso: <b style="color:#f1d99a">miarcana.com/huevo</b> · primera lectura gratis</p>
</div></body></html>`;

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  writeFileSync(tmp, html);
  await p.goto(`file://${tmp}`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  await p.screenshot({ path: join(SALIDA, "guia-limpia-sin-miedo.png") });
  rmSync(tmp, { force: true });
  await b.close();
  console.log("listo");
})();
