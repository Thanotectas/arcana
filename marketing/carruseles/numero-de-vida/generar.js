// Carrusel «¿Cuál es tu número de vida?» (6 láminas 1080×1350): portada con el cálculo, los números del 1 al 9
// y los maestros 11, 22 y 33 (tres por lámina) y cierre hacia /numerologia. El cálculo es el de
// src/lib/numerologia.ts (día, mes y año reducidos por separado; se conservan 11, 22 y 33).
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/numero-de-vida/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

const COLORES = ["#f1d99a", "#b7a5ff", "#7fc4f0"];
const NUMEROS = [
  ["1", "El líder", "Independiente y valiente: abres caminos donde otros no se atreven.", "Pedir ayuda sin sentirte débil."],
  ["2", "El mediador", "Sensible y diplomático: unes a la gente y sientes lo que otros callan.", "No perderte por complacer."],
  ["3", "El comunicador", "Alegre, creativo y expresivo: tu palabra ilumina.", "Terminar lo que empiezas."],
  ["4", "El constructor", "Constante y práctico: lo que levantas, dura.", "Soltar el control y la rigidez."],
  ["5", "El explorador", "Libre, curioso y adaptable: naciste para el cambio.", "Comprometerte sin sentirte atado."],
  ["6", "El protector", "Amoroso y responsable: tu casa y tu gente son tu centro.", "No cargar con todos."],
  ["7", "El buscador", "Intuitivo y profundo: buscas la verdad detrás de todo.", "Confiar y abrirte a los demás."],
  ["8", "El realizador", "Ambicioso y firme: sabes convertir metas en logros.", "Equilibrar el dinero y el corazón."],
  ["9", "El compasivo", "Generoso e idealista: das sin esperar y sabes cerrar ciclos.", "Soltar el pasado."],
  ["11", "El intuitivo", "Número maestro: inspiración, visión y una sensibilidad enorme.", "Confiar en tu luz sin ansiedad."],
  ["22", "El gran constructor", "Número maestro: haces reales los sueños grandes.", "No exigirte de más."],
  ["33", "El maestro del amor", "Número maestro: guías y acompañas con compasión.", "Cuidarte a ti también."],
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; font-variant-numeric: lining-nums; }
.lienzo { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: radial-gradient(ellipse at 50% 30%, #2a1a5e 0%, #160d33 55%, #0b0716 100%); }
.marco { position: absolute; inset: 34px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.marco::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(241,217,154,.22); border-radius: 18px; }
.centro { position: absolute; left: 0; right: 0; text-align: center; }
.k { font-size: 22px; letter-spacing: .36em; text-transform: uppercase; color: #b7a5ff; }
.pie { position: absolute; left: 0; right: 0; bottom: 70px; text-align: center; font-size: 24px; color: #b7a5ff; }
`;

function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350">${Array.from({ length: 70 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.6).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.2 + r() * 0.5).toFixed(2)}"/>`).join("")}</svg>`;
}

const envolver = (i, cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo">${estrellas(23 + i * 59)}<div class="marco"></div>${cuerpo}</div></body></html>`;

const portada = () => envolver(0, `
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Numerología</p>
  <div class="centro" style="top:180px">
    <p style="font-family:Cormorant;font-weight:600;font-size:64px;color:#ece6f7;line-height:1">¿Cuál es tu</p>
    <p style="font-family:Cormorant;font-weight:600;font-size:150px;color:#f1d99a;line-height:1;text-shadow:0 0 50px rgba(241,217,154,.35)">número de vida?</p>
  </div>
  <div style="position:absolute;left:120px;right:120px;top:600px;padding:34px 40px;border-radius:28px;background:rgba(11,7,22,.55);border:1.5px solid rgba(241,217,154,.35)">
    <p style="font-size:24px;letter-spacing:.24em;text-transform:uppercase;color:#b7a5ff;text-align:center">Así se calcula · ejemplo 14/03/1985</p>
    <p style="font-size:34px;line-height:1.6;margin-top:18px">Día <b style="color:#f1d99a">14</b> → 1+4 = <b style="color:#f1d99a">5</b><br>Mes <b style="color:#f1d99a">03</b> → <b style="color:#f1d99a">3</b><br>Año <b style="color:#f1d99a">1985</b> → 1+9+8+5 = 23 → 2+3 = <b style="color:#f1d99a">5</b><br>5 + 3 + 5 = 13 → 1+3 = <b style="color:#f1d99a;font-size:44px">4</b></p>
    <p style="font-size:26px;line-height:1.4;margin-top:16px;color:#b7a5ff;text-align:center">Si te da 11, 22 o 33, no lo sumes: es un número maestro.</p>
  </div>
  <p class="pie">Haz la cuenta y desliza para leer el tuyo →</p>`);

const lamina = (n) => {
  const grupo = NUMEROS.slice(n * 3, n * 3 + 3);
  return envolver(n + 1, `
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Tu número de vida</b> · ${n === 3 ? "números maestros" : `${n * 3 + 1} al ${n * 3 + 3}`}</p>
  <div style="position:absolute;left:80px;right:80px;top:150px;bottom:150px;display:flex;flex-direction:column;justify-content:space-between">
    ${grupo.map(([num, nombre, frase, reto], j) => {
      const c = COLORES[j];
      return `<div style="display:flex;align-items:center;gap:36px;padding:26px 30px;border-radius:26px;background:rgba(11,7,22,.5);border:1.5px solid rgba(241,217,154,.28)">
        <div style="flex:none;width:140px;height:140px;border-radius:50%;border:4px solid ${c};display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px ${c}55;font-family:Cormorant;font-weight:600;font-size:${num.length > 1 ? 70 : 84}px;color:${c}">${num}</div>
        <div>
          <p style="font-family:Cormorant;font-weight:600;font-size:60px;line-height:1;color:#f1d99a">${nombre}</p>
          <p style="font-size:30px;line-height:1.36;margin-top:12px">${frase}</p>
          <p style="font-size:26px;line-height:1.3;margin-top:10px;color:${c}"><b style="font-weight:600">Tu reto:</b> ${reto}</p>
        </div>
      </div>`;
    }).join("")}
  </div>
  <p class="pie">¿Ya encontraste el tuyo? Coméntalo</p>`);
};

const cierre = () => envolver(5, `
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Numerología</p>
  <p class="centro" style="top:260px;font-family:Cormorant;font-weight:600;font-size:96px;line-height:1.05;color:#f1d99a;padding:0 90px">¿Cuál es tu número?</p>
  <p class="centro" style="top:520px;padding:0 120px;font-size:38px;line-height:1.45">Escríbelo en los comentarios 👇<br>y etiqueta a alguien para que calcule el suyo.</p>
  <p class="centro" style="top:760px;padding:0 120px;font-size:34px;line-height:1.45;color:#b7a5ff">Tu número de vida es solo el comienzo: tu nombre también tiene números, y tu año personal dice qué te toca vivir este año.</p>
  <div style="position:absolute;left:210px;right:210px;top:1030px;padding:22px 20px 26px;border-radius:999px;border:2px solid #f1d99a;text-align:center;background:rgba(11,7,22,.55)">
    <p style="font-size:44px;font-weight:600;color:#f1d99a">miarcana.com</p>
    <p style="font-size:24px;letter-spacing:.2em;text-transform:uppercase;color:#b7a5ff;margin-top:4px">Numerología · primera lectura gratis</p>
  </div>`);

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  const piezas = [portada(), ...[0, 1, 2, 3].map(lamina), cierre()];
  for (const [i, html] of piezas.entries()) {
    writeFileSync(tmp, html);
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: join(SALIDA, `${String(i + 1).padStart(2, "0")}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log(`${piezas.length} láminas en ${SALIDA}`);
})();
