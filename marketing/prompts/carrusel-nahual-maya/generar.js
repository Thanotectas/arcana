// Carrusel «¿Cuál es tu nahual maya?» (7 láminas 1080×1350): portada, los 20 nawales de la cuenta k'iche'
// (cuatro por lámina, con el color de su rumbo: rojo, blanco, azul, amarillo) y cierre hacia /calendario-maya.
// Los nombres y sentidos salen de src/lib/oraculos/maya.ts (NAWALES).
// Uso: NODE_PATH=$(npm root -g) node marketing/prompts/carrusel-nahual-maya/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(RAIZ, "marketing/imagenes/carrusel-nahual-maya");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

const COLORES = ["#e8806a", "#ece6f7", "#7fa8f0", "#e9c46a"]; // rojo, blanco, azul, amarillo (se repiten en orden)
const NAWALES = [
  ["Imox", "el agua y la intuición", "Sientes las cosas antes de que pasen; tu intuición casi nunca falla."],
  ["Iq'", "el viento y la palabra", "Tu palabra mueve a la gente: naciste para comunicar."],
  ["Aq'ab'al", "el amanecer", "Siempre vuelves a empezar; contigo llega la luz después de la noche."],
  ["K'at", "la red y la abundancia", "Sabes juntar personas y recursos; cuida de no enredarte en lo ajeno."],
  ["Kan", "la serpiente emplumada", "Energía intensa y sentido de justicia; cambias de piel cuando hace falta."],
  ["Kame", "el renacer y los ancestros", "Renaces de cada final, y tus ancestros caminan contigo."],
  ["Kej", "el venado y la fuerza", "Líder natural, firme y protector con los tuyos."],
  ["Q'anil", "la semilla", "Lo que siembras florece: tienes mano para empezar proyectos."],
  ["Toj", "la ofrenda y la gratitud", "Generoso y agradecido; lo que das vuelve multiplicado."],
  ["Tz'i'", "el perro y la lealtad", "Leal hasta el final; lo justo, para ti, no se negocia."],
  ["B'atz'", "el hilo y el tiempo", "Tejes tu vida con paciencia y creatividad: alma de artista."],
  ["E", "el camino", "Naciste para moverte: los viajes y los cambios te hacen crecer."],
  ["Aj", "la caña y el hogar", "Tu casa es tu fuerza; eres el pilar de tu familia."],
  ["I'x", "el jaguar y la Madre Tierra", "Fuerza tranquila y raíz profunda: nadie te doma."],
  ["Tz'ikin", "el pájaro y la visión", "Ves lejos, y la fortuna te encuentra cuando sigues tu visión."],
  ["Ajmaq", "el perdón", "Aprendes de cada error y sabes perdonar: eso te hace sabio."],
  ["No'j", "el pensamiento", "Mente brillante: las buenas ideas te llegan solas."],
  ["Tijax", "el pedernal y la sanación", "Cortas lo que no sirve y ayudas a sanar con tu claridad."],
  ["Kawoq", "la tormenta y la comunidad", "Juntas a la gente y la sostienes cuando llega la tormenta."],
  ["Ajpu", "el sol y la victoria", "Brillas y ganas: naciste para cumplir lo que te propones."],
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

// Rueda de 20 puntos con los colores de los rumbos (decoración de portada y cierre).
const rueda = (cx, cy, radio) =>
  `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350"><circle cx="${cx}" cy="${cy}" r="${radio}" fill="none" stroke="rgba(241,217,154,.35)" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${radio - 40}" fill="none" stroke="rgba(241,217,154,.18)" stroke-width="1.5"/>${NAWALES.map((_, i) => {
    const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * radio, y = cy + Math.sin(a) * radio;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" fill="#0b0716" stroke="${COLORES[i % 4]}" stroke-width="3"/><text x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="19" fill="${COLORES[i % 4]}">${i + 1}</text>`;
  }).join("")}</svg>`;

const envolver = (i, cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo">${estrellas(19 + i * 61)}<div class="marco"></div>${cuerpo}</div></body></html>`;

const portada = () => envolver(0, `
  ${rueda(540, 560, 300)}
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Calendario maya</p>
  <div class="centro" style="top:440px">
    <p style="font-family:Cormorant;font-weight:600;font-size:60px;color:#ece6f7;line-height:1">¿Cuál es tu</p>
    <p style="font-family:Cormorant;font-weight:600;font-size:150px;color:#f1d99a;line-height:1;text-shadow:0 0 50px rgba(241,217,154,.35)">nahual</p>
    <p style="font-family:Cormorant;font-weight:600;font-size:60px;color:#ece6f7;line-height:1">maya?</p>
  </div>
  <p class="centro" style="top:940px;padding:0 120px;font-size:36px;line-height:1.4">Los 20 nahuales de la cuenta k'iche' y lo que dicen de quien nace bajo cada uno</p>
  <p class="centro" style="top:1100px;font-family:Cormorant;font-style:italic;font-size:34px;color:#b7a5ff">Una tradición viva de los pueblos mayas</p>
  <p class="pie">Desliza y busca el tuyo →</p>`);

const lamina = (n) => {
  const grupo = NAWALES.slice(n * 4, n * 4 + 4);
  return envolver(n + 1, `
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Los 20 nahuales</b> · ${n * 4 + 1} al ${n * 4 + 4}</p>
  <div style="position:absolute;left:80px;right:80px;top:150px;bottom:150px;display:flex;flex-direction:column;justify-content:space-between">
    ${grupo.map(([nombre, sentido, frase], j) => {
      const i = n * 4 + j, c = COLORES[i % 4];
      return `<div style="display:flex;align-items:center;gap:36px;padding:22px 30px;border-radius:26px;background:rgba(11,7,22,.5);border:1.5px solid rgba(241,217,154,.28)">
        <div style="flex:none;width:118px;height:118px;border-radius:50%;border:4px solid ${c};display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px ${c}55;font-family:Cormorant;font-weight:600;font-size:64px;color:${c}">${i + 1}</div>
        <div>
          <p style="font-family:Cormorant;font-weight:600;font-size:62px;line-height:1;color:#f1d99a">${nombre}</p>
          <p style="font-size:24px;letter-spacing:.14em;text-transform:uppercase;color:${c};margin-top:6px">${sentido}</p>
          <p style="font-size:29px;line-height:1.35;margin-top:10px">${frase}</p>
        </div>
      </div>`;
    }).join("")}
  </div>
  <p class="pie">¿Ya encontraste el tuyo? Coméntalo</p>`);
};

const cierre = () => envolver(6, `
  ${rueda(540, 360, 190)}
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Calendario maya</p>
  <p class="centro" style="top:330px;font-family:Cormorant;font-weight:600;font-size:50px;color:#f1d99a">✦</p>
  <p class="centro" style="top:610px;font-family:Cormorant;font-weight:600;font-size:86px;line-height:1.05;color:#f1d99a;padding:0 90px">¿No sabes cuál es el tuyo?</p>
  <p class="centro" style="top:820px;padding:0 120px;font-size:36px;line-height:1.45">Pon tu fecha de nacimiento y Arcana te calcula tu <b style="color:#f1d99a;font-weight:600">nahual</b> y tu <b style="color:#f1d99a;font-weight:600">kin maya</b>, con lo que dicen de ti.</p>
  <div style="position:absolute;left:210px;right:210px;top:1020px;padding:22px 20px 26px;border-radius:999px;border:2px solid #f1d99a;text-align:center;background:rgba(11,7,22,.55)">
    <p style="font-size:44px;font-weight:600;color:#f1d99a">miarcana.com</p>
    <p style="font-size:24px;letter-spacing:.2em;text-transform:uppercase;color:#b7a5ff;margin-top:4px">Calendario maya</p>
  </div>
  <p class="pie" style="font-family:Cormorant;font-style:italic;font-size:36px;color:#ece6f7">Tu primera lectura es gratis</p>`);

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  const piezas = [portada(), ...[0, 1, 2, 3, 4].map(lamina), cierre()];
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
