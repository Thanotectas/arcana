// Carrusel «7 rituales sencillos para limpiar tu energía antes de que termine el año» (9 imágenes 1080×1350).
// Uso: NODE_PATH=$(npm root -g) node marketing/prompts/carrusel-rituales-fin-de-anio/generar.js <carpeta de salida>
// Las ilustraciones de luna, huevo y vela salen de src/lib/redes/visual.tsx (svgs.json); las demás están aquí.
const { chromium } = require("playwright");
const { readFileSync, mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(RAIZ, "marketing/imagenes/carrusel-rituales-fin-de-anio");
const SVG = JSON.parse(readFileSync(join(__dirname, "svgs.json"), "utf8"));
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;
const SIBILA = `file://${RAIZ}/public/marca/sibila/base.jpg`;

const DEFS = `<defs>
  <linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#f1d99a"/><stop offset="1" stop-color="#c9992e"/></linearGradient>
  <radialGradient id="h" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="#f1d99a" stop-opacity=".38"/><stop offset=".6" stop-color="#8b6cf6" stop-opacity=".14"/><stop offset="1" stop-color="#8b6cf6" stop-opacity="0"/></radialGradient>
</defs><circle cx="280" cy="300" r="260" fill="url(#h)"/>`;
const envolver = (cuerpo) => `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="560" viewBox="0 0 560 560">${DEFS}${cuerpo}</svg>`;

const ESCOBA = envolver(`
  <g transform="rotate(-18 280 300)">
    <rect x="270" y="40" width="20" height="300" rx="8" fill="#8a5a2b" stroke="#f1d99a" stroke-opacity=".5" stroke-width="2"/>
    <rect x="252" y="330" width="56" height="26" rx="6" fill="url(#o)"/>
    <path d="M250 356 L190 520 Q280 540 370 520 L310 356 Z" fill="#d9b45a" stroke="#fff2c4" stroke-opacity=".6" stroke-width="2"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${262 + i * 4.5} 360 L${200 + i * 20} 518" stroke="#8a6a1e" stroke-opacity=".55" stroke-width="2"/>`).join("")}
    <path d="M232 410 Q280 420 328 410" stroke="#8b6cf6" stroke-width="7" fill="none"/>
  </g>
  ${[[120, 470, 7], [90, 420, 4], [150, 520, 5], [70, 500, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff6d8" fill-opacity=".8"/>`).join("")}`);

const SAL = envolver(`
  <ellipse cx="280" cy="400" rx="200" ry="46" fill="#1d1338" stroke="url(#o)" stroke-width="5"/>
  <path d="M80 400 Q90 480 280 488 Q470 480 480 400" fill="#251a47" stroke="url(#o)" stroke-width="5"/>
  <path d="M130 398 Q200 300 280 292 Q360 300 430 398 Q280 420 130 398 Z" fill="#f7f3ff"/>
  ${Array.from({ length: 46 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180, d = 18 + ((i * 37) % 120);
    const x = 280 + Math.cos(a) * d * 1.15, y = 365 + Math.sin(a) * d * 0.28 - (120 - d) * 0.4;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="9" height="9" rx="2" transform="rotate(${i * 23} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#ffffff" stroke="#cfc6ea" stroke-width="1"/>`;
  }).join("")}
  ${[[150, 200], [400, 180], [460, 260], [110, 280]].map(([x, y]) => `<path d="M${x} ${y - 14} L${x + 4} ${y - 4} L${x + 14} ${y} L${x + 4} ${y + 4} L${x} ${y + 14} L${x - 4} ${y + 4} L${x - 14} ${y} L${x - 4} ${y - 4} Z" fill="#fff2c4"/>`).join("")}`);

const CANELA = envolver(`
  ${[0, 1, 2].map((i) => `<g transform="rotate(${-28 + i * 14} 280 330)"><rect x="${150 + i * 6}" y="${300 + i * 34}" width="270" height="34" rx="16" fill="#a0522d" stroke="#5a2a10" stroke-width="3"/><path d="M${160 + i * 6} ${317 + i * 34} H${410 + i * 6}" stroke="#d98c52" stroke-width="4" stroke-opacity=".7"/><ellipse cx="${420 + i * 6}" cy="${317 + i * 34}" rx="10" ry="17" fill="#7a3a18" stroke="#d98c52" stroke-width="3"/></g>`).join("")}
  ${Array.from({ length: 70 }, (_, i) => {
    const t = i / 70, x = 110 + t * 340, y = 200 - Math.sin(t * Math.PI) * 110 + ((i * 29) % 30);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${2 + ((i * 7) % 4)}" fill="${i % 3 ? "#c46a2e" : "#f1d99a"}" fill-opacity="${0.45 + (i % 5) * 0.1}"/>`;
  }).join("")}`);

const CARTA = envolver(`
  <g transform="rotate(-6 280 300)">
    <path d="M150 110 H400 L410 170 L398 230 L412 300 L400 370 L410 470 H150 Z" fill="#f4ead2" stroke="url(#o)" stroke-width="4"/>
    ${[170, 215, 260, 305, 350, 395].map((y, i) => `<path d="M185 ${y} Q${260 + (i % 2) * 20} ${y - 8} ${360 - (i % 3) * 25} ${y}" stroke="#5b3fd0" stroke-width="5" fill="none" stroke-linecap="round" stroke-opacity=".7"/>`).join("")}
  </g>
  <g transform="rotate(14 430 420)"><path d="M405 330 L470 336 L462 372 L478 404 L412 410 Z" fill="#f4ead2" stroke="url(#o)" stroke-width="3"/></g>
  <g transform="rotate(-22 130 450)"><path d="M100 420 L160 414 L166 452 L150 486 L104 476 Z" fill="#f4ead2" stroke="url(#o)" stroke-width="3"/></g>`);

// Luna llena (la de visual.tsx es creciente).
const LUNA_LLENA = envolver(`
  <circle cx="280" cy="290" r="250" fill="url(#h)"/>
  <circle cx="280" cy="290" r="170" fill="url(#o)"/>
  ${[[230, 240, 30], [330, 230, 18], [300, 340, 36], [215, 330, 16], [350, 300, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#c9992e" fill-opacity=".35"/>`).join("")}
  ${[[90, 110, 5], [470, 140, 6], [480, 430, 4], [70, 420, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff6d8"/>`).join("")}`);

const ILUSTRACION = { escoba: ESCOBA, sal: SAL, canela: CANELA, vela: SVG.vela, luna: LUNA_LLENA, huevo: SVG.huevo, carta: CARTA };

const RITUALES = [
  { n: 1, id: "escoba", titulo: "Barre hacia afuera", texto: "Un sábado en la mañana abre todas las ventanas y barre de adentro hacia la puerta. Saca la basura ese mismo día: la casa también necesita respirar." },
  { n: 2, id: "sal", titulo: "Sal en la entrada", texto: "Pon un platito de sal gruesa junto a la puerta durante siete días. Al octavo, échala al desagüe con el agua corriendo y di: «Lo que no es mío, se va con el agua»." },
  { n: 3, id: "canela", titulo: "Canela el día primero", texto: "El primer día del mes sopla una pizca de canela desde la puerta hacia adentro y pide en voz alta lo que quieres que entre: trabajo, dinero, buenas noticias." },
  { n: 4, id: "vela", titulo: "Vela blanca con tu intención", texto: "Escribe lo que pides en presente («recibo», «tengo»), dobla el papel hacia ti y déjalo bajo una vela blanca. Nunca la dejes encendida sola." },
  { n: 5, id: "luna", titulo: "Agua de luna llena", texto: "La noche de luna llena deja un vaso de agua junto a la ventana. Al otro día riega con ella tus plantas o lávate las manos antes de empezar algo importante." },
  { n: 6, id: "huevo", titulo: "Limpia con huevo", texto: "Pasa un huevo de la cabeza a los pies, rómpelo en un vaso con agua y espera unos minutos. Burbujas, hilos, picos, la yema: cada forma dice algo." },
  { n: 7, id: "carta", titulo: "Carta de cierre", texto: "Escribe lo que no quieres llevarte al año nuevo: el miedo, la culpa, lo que ya terminó. Léelo una vez en voz alta, rómpelo y bótalo. Lo que se nombra, se suelta." },
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Medium.ttf")}"); font-weight: 500; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; }
.lienzo { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: radial-gradient(ellipse at 50% 35%, #2a1a5e 0%, #160d33 45%, #0b0716 100%); }
.estrellas { position: absolute; inset: 0; }
.marco { position: absolute; inset: 34px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.marco::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(241,217,154,.22); border-radius: 18px; }
.esquina { position: absolute; color: #f1d99a; font-size: 34px; line-height: 1; }
.marca { position: absolute; top: 74px; left: 0; right: 0; text-align: center; font-size: 22px; letter-spacing: .38em; text-transform: uppercase; color: #b7a5ff; }
.marca b { color: #f1d99a; font-weight: 600; }
.numero { position: absolute; top: 130px; left: 50%; transform: translateX(-50%); width: 92px; height: 92px; border-radius: 50%; border: 2px solid #f1d99a; display: flex; align-items: center; justify-content: center; font-family: Cormorant; font-weight: 600; font-size: 54px; color: #f1d99a; background: rgba(11,7,22,.6); }
.titulo { position: absolute; left: 90px; right: 90px; top: 246px; text-align: center; font-family: Cormorant; font-weight: 600; font-size: 84px; line-height: 1.02; color: #f1d99a; text-shadow: 0 0 40px rgba(241,217,154,.25); }
.ilustracion { position: absolute; left: 50%; top: 440px; transform: translateX(-50%); width: 520px; height: 520px; }
.ilustracion svg { width: 100%; height: 100%; }
.adorno { position: absolute; left: 50%; transform: translateX(-50%); color: #d9b45a; font-size: 26px; letter-spacing: .5em; }
.texto { position: absolute; left: 110px; right: 110px; top: 1000px; text-align: center; font-size: 37px; line-height: 1.38; color: #ece6f7; }
.pie { position: absolute; bottom: 70px; left: 0; right: 0; text-align: center; font-size: 24px; color: #b7a5ff; letter-spacing: .06em; }
.pie b { color: #f1d99a; font-weight: 600; }
.foto { position: absolute; inset: 0; background-size: cover; }
.velo { position: absolute; inset: 0; }
`;

function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg class="estrellas" viewBox="0 0 1080 1350">${Array.from({ length: 90 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`).join("")}</svg>`;
}
const esquinas = `<span class="esquina" style="top:48px;left:52px">✦</span><span class="esquina" style="top:48px;right:52px">✦</span><span class="esquina" style="bottom:48px;left:52px">✦</span><span class="esquina" style="bottom:48px;right:52px">✦</span>`;
const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo">${cuerpo}</div></body></html>`;

const portada = pagina(`
  <div class="foto" style="background-image:url('${SIBILA}'); background-position: 30% center; background-size: auto 1350px;"></div>
  <div class="velo" style="background: linear-gradient(180deg, rgba(11,7,22,.15) 0%, rgba(11,7,22,.25) 38%, rgba(11,7,22,.92) 62%, #0b0716 100%);"></div>
  <div class="marco"></div>${esquinas}
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <p style="position:absolute;left:0;right:0;top:810px;text-align:center;font-family:Cormorant;font-style:italic;font-size:46px;color:#b7a5ff">Antes de que termine el año</p>
  <p style="position:absolute;left:80px;right:80px;top:870px;text-align:center;font-family:Cormorant;font-weight:600;font-size:100px;line-height:.98;color:#f1d99a;text-shadow:0 0 50px rgba(241,217,154,.3)">7 rituales sencillos para limpiar tu energía</p>
  <p style="position:absolute;left:0;right:0;top:1150px;text-align:center;font-size:30px;color:#ece6f7">Guárdalo y hazlos esta semana ✨</p>
  <p class="pie">Desliza →</p>`);

const ritual = (r) => pagina(`
  ${estrellas(r.n * 97)}
  <div class="marco"></div>${esquinas}
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <div class="numero">${r.n}</div>
  <h1 class="titulo">${r.titulo}</h1>
  <div class="ilustracion">${ILUSTRACION[r.id]}</div>
  <p class="adorno" style="top:958px">✦ ✦ ✦</p>
  <p class="texto">${r.texto}</p>
  <p class="pie">${r.n} de 7 · <b>miarcana.com</b></p>`);

const cierre = pagina(`
  ${estrellas(7)}
  <div class="marco"></div>${esquinas}
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <h1 class="titulo" style="top:140px;font-size:92px">¿Qué salió en tu vaso?</h1>
  <div style="position:absolute;left:50%;top:300px;transform:translateX(-50%);width:440px;height:440px;border-radius:50%;overflow:hidden;border:4px solid rgba(241,217,154,.8);box-shadow:0 0 80px rgba(241,217,154,.25)">
    <div style="position:absolute;inset:0;background-image:url('${SIBILA}');background-size:1450px auto;background-position:34% 12%"></div>
  </div>
  <p class="texto" style="top:790px;font-size:39px">Tómale una foto a tu limpia con huevo y súbela en <b style="color:#f1d99a">miarcana.com/huevo</b>: Sibila te dice qué formas dejó y qué anuncian para ti.</p>
  <p style="position:absolute;left:0;right:0;top:1050px;text-align:center;font-size:30px;color:#b7a5ff">Tu primera lectura va por cuenta de la casa al crear tu cuenta.</p>
  <p style="position:absolute;left:0;right:0;top:1140px;text-align:center;font-family:Cormorant;font-weight:600;font-size:46px;color:#f1d99a">Guárdalo · Compártelo con quien lo necesite</p>
  <p class="pie">Instagram <b>@miarcana.oficial</b> · TikTok <b>@miarcana4</b></p>`);

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const piezas = [["00-portada", portada], ...RITUALES.map((r) => [`0${r.n}-${r.id}`, ritual(r)]), ["08-cierre", cierre]];
  for (const [nombre, html] of piezas) {
    // Desde un archivo (no setContent) para que carguen las fuentes y la pintura con file://.
    const tmp = join(SALIDA, "_pieza.html");
    writeFileSync(tmp, html);
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    await p.screenshot({ path: join(SALIDA, `${nombre}.png`) });
  }
  rmSync(join(SALIDA, "_pieza.html"), { force: true });
  await b.close();
  console.log(`${piezas.length} imágenes en ${SALIDA}`);
})();
