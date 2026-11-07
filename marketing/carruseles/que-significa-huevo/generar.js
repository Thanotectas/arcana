// Serie «¿Qué significa…?» de la limpia con huevo: portada, 8 señales (una por lámina, con su vaso ilustrado, lo que
// se lee, lo físico y lo que anuncia, según src/lib/conocimiento/huevo.md) y cierre. 1080×1350.
// Cada lámina sirve también sola (una publicación por día).
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/que-significa-huevo/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

/* ───────────── El vaso ilustrado (SVG 600×760) ─────────────
   Interior del vaso: arriba x 112–488 (y 110), abajo x 150–450 (y 668). Agua desde y 175. */
const izq = (y) => 112 + ((y - 110) / 558) * 38;
const der = (y) => 488 - ((y - 110) / 558) * 38;
function vaso({ yema = { x: 300, y: 610, rx: 78, ry: 40 }, yemas = null, clara = "", encima = "", agua = "agua", punto = null } = {}) {
  const ys = yemas || [yema];
  const unaYema = (y, i) => `
    <ellipse cx="${y.x}" cy="${y.y + y.ry * 0.85}" rx="${y.rx * 0.95}" ry="${y.ry * 0.35}" fill="#000" opacity=".25" filter="url(#b6)"/>
    <ellipse cx="${y.x}" cy="${y.y}" rx="${y.rx}" ry="${y.ry}" fill="url(#yema)"/>
    <ellipse cx="${y.x - y.rx * 0.32}" cy="${y.y - y.ry * 0.38}" rx="${y.rx * 0.3}" ry="${y.ry * 0.22}" fill="#fff" opacity=".55" filter="url(#b3)"/>
    <ellipse cx="${y.x}" cy="${y.y}" rx="${y.rx}" ry="${y.ry}" fill="none" stroke="#ffe7a8" stroke-opacity=".35" stroke-width="2"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">
  <defs>
    <radialGradient id="fondo" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#3a2468"/><stop offset=".6" stop-color="#1a1036"/><stop offset="1" stop-color="#0b0716"/></radialGradient>
    <radialGradient id="yema" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffd36b"/><stop offset=".45" stop-color="#ffab2e"/><stop offset="1" stop-color="#d9700e"/></radialGradient>
    <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ff" stop-opacity=".16"/><stop offset="1" stop-color="#9cc4ff" stop-opacity=".30"/></linearGradient>
    <linearGradient id="aguaTurbia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#f3ead2" stop-opacity=".45"/></linearGradient>
    <linearGradient id="borde" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".08" stop-color="#fff" stop-opacity=".08"/><stop offset=".9" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>
    <radialGradient id="vela" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <filter id="b2"><feGaussianBlur stdDeviation="2"/></filter><filter id="b3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b20"><feGaussianBlur stdDeviation="20"/></filter>
    <clipPath id="dentro"><path d="M112 110 L488 110 L450 668 Q300 690 150 668 Z"/></clipPath>
    <clipPath id="enAgua"><path d="M${izq(175)} 175 L${der(175)} 175 L450 668 Q300 690 150 668 Z"/></clipPath>
  </defs>
  <rect width="600" height="760" rx="36" fill="url(#fondo)"/>
  <!-- Luz de velas al fondo -->
  <circle cx="90" cy="150" r="70" fill="url(#vela)" opacity=".55" filter="url(#b20)"/><circle cx="530" cy="250" r="50" fill="url(#vela)" opacity=".35" filter="url(#b20)"/>
  <circle cx="500" cy="110" r="30" fill="url(#vela)" opacity=".4" filter="url(#b20)"/>
  <!-- Mesa -->
  <ellipse cx="300" cy="700" rx="270" ry="40" fill="#000" opacity=".45" filter="url(#b6)"/>
  <!-- Agua -->
  <g clip-path="url(#dentro)">
    <rect x="100" y="175" width="400" height="520" fill="url(#${agua === "turbia" ? "aguaTurbia" : "agua"})"/>
    <g clip-path="url(#enAgua)">${clara}${ys.map(unaYema).join("")}${punto ? `<circle cx="${punto.x}" cy="${punto.y}" r="7" fill="#b3261e"/><circle cx="${punto.x - 2}" cy="${punto.y - 2}" r="2.5" fill="#ff8a7a"/>` : ""}${encima}</g>
    <ellipse cx="300" cy="175" rx="${(der(175) - izq(175)) / 2}" ry="12" fill="#fff" opacity=".18"/>
    <ellipse cx="300" cy="175" rx="${(der(175) - izq(175)) / 2}" ry="12" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
  </g>
  <!-- Vidrio -->
  <path d="M112 110 L488 110 L450 668 Q300 690 150 668 Z" fill="url(#borde)" stroke="#f3e6c4" stroke-opacity=".75" stroke-width="3"/>
  <path d="M150 668 Q300 690 450 668 L446 700 Q300 724 154 700 Z" fill="#fff" opacity=".14" stroke="#f3e6c4" stroke-opacity=".5" stroke-width="2"/>
  <ellipse cx="300" cy="110" rx="188" ry="16" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
  <path d="M132 140 L162 640" stroke="#fff" stroke-opacity=".35" stroke-width="10" stroke-linecap="round" filter="url(#b3)"/>
  <path d="M462 150 L440 600" stroke="#fff" stroke-opacity=".15" stroke-width="6" stroke-linecap="round" filter="url(#b3)"/>
</svg>`;
}

// Piezas de la clara (blancas, translúcidas)
const blanco = (d, op = 0.55, ancho = 3) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="${ancho}" stroke-linecap="round" filter="url(#b2)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity="${op + 0.2}" stroke-width="${ancho * 0.4}" stroke-linecap="round"/>`;
const nube = (d, op = 0.45) => `<path d="${d}" fill="#fff" fill-opacity="${op}" filter="url(#b3)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>`;
const burbuja = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".85" stroke-width="2"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.3}" fill="#fff" opacity=".9"/>`;

const SENALES = [
  {
    id: "yema-doble", palabra: "DOBLE", titulo: "La yema doble",
    svg: vaso({ yemas: [{ x: 250, y: 612, rx: 62, ry: 36 }, { x: 352, y: 606, rx: 60, ry: 35 }], clara: nube("M190 600 Q300 560 410 600 Q420 650 300 655 Q180 650 190 600 Z", 0.25) }),
    lee: "Algo que llega por partida doble: dos caminos que se abren, dos personas importantes en un mismo asunto, o una bendición doble.",
    fisico: "Algunas gallinas ponen huevos de dos yemas. Es poco común, y por eso la tradición lo celebra.",
    anuncia: "Una elección entre dos opciones buenas.",
  },
  {
    id: "velitas", palabra: "VELITAS", titulo: "Picos con burbujita",
    svg: vaso({ clara: [nube("M220 600 L238 380 L256 600 Z", 0.5), nube("M320 600 L344 300 L366 600 Z", 0.55), nube("M280 600 L292 450 L304 600 Z", 0.45)].join("") + burbuja(238, 370, 10) + burbuja(344, 288, 12) + burbuja(292, 440, 8) }),
    lee: "Las «velitas»: peticiones y oraciones en camino. Lo que pediste con fuerza ya se está moviendo. Es de las figuras más bonitas del vaso.",
    fisico: null, gesto: "Agradece en voz alta y escribe en un papel lo que pediste: así vas a reconocer la respuesta cuando llegue.",
    anuncia: "Una respuesta a eso que pediste.",
  },
  {
    id: "velo-manto", palabra: "VELO", titulo: "El velo que se abre",
    svg: vaso({ clara: nube("M300 590 C262 520 214 430 170 300 C238 340 266 290 300 250 C334 290 362 340 430 300 C386 430 338 520 300 590 Z", 0.4) + blanco("M300 585 C290 470 250 380 200 320", 0.35, 2) + blanco("M300 585 C312 470 352 380 402 320", 0.35, 2) }),
    lee: "Un velo que sube y se abre como un manto o la falda de un vestido: protección. Alguien te cuida.",
    fisico: null, gesto: "Bota el agua por el inodoro, lava el vaso con sal y agradece a quien te cuida, aunque no sepas quién es.",
    anuncia: "A veces, algo del amor: una reconciliación o una invitación.",
  },
  {
    id: "yema-flota", palabra: "FLOTA", titulo: "La yema que flota",
    svg: vaso({ yema: { x: 300, y: 430, rx: 74, ry: 40 }, clara: `<ellipse cx="300" cy="470" rx="105" ry="62" fill="#fff" fill-opacity=".16" filter="url(#b6)"/><ellipse cx="300" cy="462" rx="92" ry="48" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/>` + burbuja(240, 520, 6) + burbuja(362, 512, 5) }),
    lee: "Tu energía pide descanso: mente muy activa y poco reposo. Te toca cuidarte.",
    fisico: "En los huevos menos frescos la yema sube más. Si el huevo era viejo, repite la limpia con uno fresco.",
    anuncia: "Cuando descanses, vas a ver todo más claro.",
  },
  {
    id: "puntito-rojo", palabra: "ROJO", titulo: "El puntito rojo",
    punto: true,
    svg: vaso({ punto: { x: 326, y: 600 }, clara: nube("M210 600 Q300 570 390 600 Q400 640 300 648 Q200 640 210 600 Z", 0.22) }),
    lee: "En la tradición, una carga fuerte que por fin salió. Lo que te pesaba se fue con la limpia.",
    fisico: "Es natural en muchos huevos frescos. Nunca es enfermedad, ni daño, ni «energía de muerte».",
    anuncia: "Alivio, como cuando por fin sueltas algo.",
  },
  {
    id: "corona-burbujas", palabra: "CORONA", titulo: "La corona de burbujas",
    svg: vaso({ clara: [[205, 585, 9], [228, 562, 8], [256, 548, 9], [287, 542, 8], [317, 543, 9], [347, 548, 8], [374, 560, 9], [396, 582, 8]].map(([x, y, r]) => burbuja(x, y, r)).join("") + nube("M200 600 Q300 570 400 600 Q405 640 300 650 Q195 640 200 600 Z", 0.2) }),
    lee: "Burbujas alrededor de la yema, como una corona o cúpulas: protección. Estás resguardada.",
    fisico: "Unas burbujas grandes salen siempre al echar el huevo. La corona se forma alrededor de la yema.",
    anuncia: "Calma: lo que te cuida sigue contigo.",
  },
  {
    id: "telarana", palabra: "RED", titulo: "La telaraña",
    svg: vaso({ clara: [
      "M180 250 C240 300 280 260 320 320 C360 380 410 330 430 390", "M200 340 C250 300 300 360 350 300 C390 260 420 300 430 260",
      "M210 420 C260 380 300 440 360 400 C400 380 420 420 410 470", "M240 230 C250 300 240 380 260 450 C270 500 290 540 300 580",
      "M380 230 C370 300 380 380 360 450 C350 500 320 540 300 580", "M300 230 C310 320 290 420 300 580"].map((d) => blanco(d, 0.45, 2.4)).join("") }),
    lee: "Una red de hilos por todo el vaso: preocupaciones enredadas, varias cosas dando vueltas a la vez.",
    fisico: null, gesto: "Escribe las tres cosas que más te preocupan y resuelve hoy la más pequeña. El resto se desenreda solo.",
    anuncia: "Algo empieza a aclararse, empezando por lo más sencillo.",
  },
  {
    id: "hilo-recto", palabra: "HILO", titulo: "Un solo hilo hasta arriba",
    svg: vaso({ clara: blanco("M300 575 C298 470 304 360 299 180", 0.6, 4) + burbuja(299, 186, 6) + nube("M230 600 Q300 575 370 600 Q375 630 300 636 Q225 630 230 600 Z", 0.22) }),
    lee: "Una preocupación puntual que encontró salida. Cuando llega recto hasta la superficie, marca un camino claro.",
    fisico: null, gesto: "Da hoy el primer paso de eso que tenías pendiente, aunque sea uno pequeño.",
    anuncia: "Una decisión que por fin se ve sencilla.",
  },
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; }
.lienzo { position: relative; width: 1080px; height: 1350px; background: radial-gradient(ellipse at 50% 25%, #2a1a5e 0%, #160d33 55%, #0b0716 100%); }
.marco { position: absolute; inset: 30px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.esq { position: absolute; color: #f1d99a; font-size: 30px; }
.marca { position: absolute; top: 62px; left: 0; right: 0; text-align: center; font-size: 22px; letter-spacing: .36em; text-transform: uppercase; color: #b7a5ff; }
.marca b { color: #f1d99a; font-weight: 600; }
.ilus { position: absolute; left: 60px; top: 150px; width: 470px; height: 595px; border-radius: 30px; overflow: hidden; box-shadow: 0 0 60px rgba(241,217,154,.18), 0 0 0 2px rgba(241,217,154,.45); }
.ilus svg { width: 100%; height: 100%; }
.der { position: absolute; left: 570px; right: 70px; top: 160px; height: 580px; display: flex; flex-direction: column; justify-content: center; }
.kick { font-family: Cormorant; font-style: italic; font-size: 40px; color: #b7a5ff; }
h1 { font-family: Cormorant; font-weight: 600; font-size: 74px; line-height: .98; color: #f1d99a; margin-top: 6px; text-shadow: 0 0 40px rgba(241,217,154,.3); }
.lee { margin-top: 26px; font-size: 29px; line-height: 1.42; }
.bloque { position: absolute; left: 60px; right: 60px; border-radius: 24px; padding: 22px 30px; }
.fis { top: 780px; background: rgba(11,7,22,.55); border: 1.5px solid rgba(183,165,255,.35); }
.anu { background: rgba(241,217,154,.08); border: 2px solid rgba(241,217,154,.55); }
.et { font-size: 21px; letter-spacing: .26em; text-transform: uppercase; }
.tx { margin-top: 8px; font-size: 29px; line-height: 1.38; }
.pie { position: absolute; bottom: 58px; left: 0; right: 0; text-align: center; font-size: 24px; color: #b7a5ff; }
.pie b { color: #f1d99a; font-weight: 600; }
`;
const esquinas = `<span class="esq" style="top:44px;left:48px">✦</span><span class="esq" style="top:44px;right:48px">✦</span><span class="esq" style="bottom:44px;left:48px">✦</span><span class="esq" style="bottom:44px;right:48px">✦</span>`;
const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo"><div class="marco"></div>${esquinas}${cuerpo}</div></body></html>`;

const lamina = (s, i) => pagina(`
  <p class="marca"><b>Arcana</b> · La limpia con huevo, sin miedo</p>
  <div class="ilus">${s.svg}</div>
  <div class="der"><p class="kick">¿Qué significa…</p><h1>${s.titulo}?</h1><p class="lee">${s.lee}</p></div>
  <div class="bloque fis"><p class="et" style="color:#b7a5ff">${s.fisico ? "Lo físico" : "Un gesto para ti"}</p><p class="tx">${s.fisico || s.gesto}</p></div>
  <div class="bloque anu" style="top:990px"><p class="et" style="color:#f1d99a">✦ Lo que anuncia</p><p class="tx" style="font-family:Cormorant;font-weight:600;font-size:46px;line-height:1.1;color:#f1d99a">${s.anuncia}</p></div>
  <p style="position:absolute;left:0;right:0;top:1160px;text-align:center;font-family:Cormorant;font-style:italic;font-size:40px;color:#ece6f7">¿Te salió así? Comenta <b style="font-style:normal;color:#f1d99a">«${s.palabra}»</b> y Sibila te lee 🔮</p>
  <p class="pie">${i + 1} de ${SENALES.length} · Sibila te marca tu vaso en <b>miarcana.com/huevo</b></p>`);

const portada = pagina(`
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <div style="position:absolute;left:50%;top:150px;transform:translateX(-50%);width:440px;height:557px;border-radius:30px;overflow:hidden;box-shadow:0 0 70px rgba(241,217,154,.22),0 0 0 2px rgba(241,217,154,.5)">${SENALES[1].svg.replace('width="600" height="760"', 'width="440" height="557"')}</div>
  <p style="position:absolute;left:0;right:0;top:760px;text-align:center;font-family:Cormorant;font-style:italic;font-size:50px;color:#b7a5ff">¿Qué significa lo que salió en tu vaso?</p>
  <h1 style="position:absolute;left:70px;right:70px;top:830px;text-align:center;font-size:96px">La limpia con huevo, sin miedo</h1>
  <p style="position:absolute;left:110px;right:110px;top:1060px;text-align:center;font-size:31px;line-height:1.4">8 señales del vaso: lo que es físico, lo que se lee y lo que anuncia.</p>
  <p class="pie">Guárdalo para tu próxima limpia · Desliza →</p>`);

const cierre = pagina(`
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <h1 style="position:absolute;left:80px;right:80px;top:150px;text-align:center;font-size:92px">¿Y en tu vaso, qué salió?</h1>
  <div style="position:absolute;left:50%;top:400px;transform:translateX(-50%);width:380px;height:481px;border-radius:30px;overflow:hidden;box-shadow:0 0 70px rgba(241,217,154,.22),0 0 0 2px rgba(241,217,154,.5)">${SENALES[2].svg.replace('width="600" height="760"', 'width="380" height="481"')}</div>
  <p style="position:absolute;left:110px;right:110px;top:920px;text-align:center;font-size:34px;line-height:1.42">Tómale una foto de lado, con luz, y Sibila te <b style="color:#f1d99a">marca con líneas</b> lo que salió y lo que viene para ti.</p>
  <div style="position:absolute;left:230px;right:230px;top:1090px;padding:22px 20px 24px;border-radius:999px;border:2px solid #f1d99a;text-align:center;background:rgba(11,7,22,.55)">
    <p style="font-size:42px;font-weight:600;color:#f1d99a">miarcana.com/huevo</p>
    <p style="font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:#b7a5ff;margin-top:4px">Tu primera lectura es gratis</p>
  </div>
  <p class="pie">En el vaso no se ven envidias, «trabajos» ni enfermedades</p>`);

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  const piezas = [["00-portada", portada], ...SENALES.map((s, i) => [`${String(i + 1).padStart(2, "0")}-${s.id}`, lamina(s, i)]), ["09-cierre", cierre]];
  for (const [nombre, html] of piezas) {
    writeFileSync(tmp, html);
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    await p.screenshot({ path: join(SALIDA, `${nombre}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log(`${piezas.length} láminas en ${SALIDA}`);
})();
