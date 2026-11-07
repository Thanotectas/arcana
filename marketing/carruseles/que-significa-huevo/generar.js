// Serie «¿Qué significa…?» de la limpia con huevo: portada, 8 señales (una por lámina: lo que se lee, lo físico o un
// gesto, y lo que anuncia, según src/lib/conocimiento/huevo.md) y cierre. 1080×1350. Cada lámina sirve también sola.
// Cada señal es una escena ilustrada: el vaso sobre un paño de terciopelo, entre dos velas, con sal y romero.
// Si existe fotos/<id>.jpg|png|webp (por ejemplo, generada con los prompts de prompts-gemini.txt), se usa esa foto.
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/que-significa-huevo/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

/* ───────────── La escena (SVG 1000×680) ─────────────
   El vaso se dibuja en su propio sistema (600×760; interior arriba x 112–488 en y 110, abajo x 150–450 en y 668;
   agua desde y 175) y se coloca en la escena con translate(272,44) scale(.76). */
const izq = (y) => 112 + ((y - 110) / 558) * 38;
const der = (y) => 488 - ((y - 110) / 558) * 38;

const llama = (x, y, k = 1) => `
  <circle cx="${x}" cy="${y - 10 * k}" r="${120 * k}" fill="url(#halo)" opacity=".75"/>
  <circle cx="${x}" cy="${y - 10 * k}" r="${46 * k}" fill="url(#halo)"/>
  <path d="M${x} ${y - 52 * k} C${x + 17 * k} ${y - 26 * k} ${x + 15 * k} ${y - 2 * k} ${x} ${y + 6 * k} C${x - 15 * k} ${y - 2 * k} ${x - 17 * k} ${y - 26 * k} ${x} ${y - 52 * k} Z" fill="url(#fuego)"/>
  <path d="M${x} ${y - 30 * k} C${x + 7 * k} ${y - 16 * k} ${x + 6 * k} ${y - 2 * k} ${x} ${y + 2 * k} C${x - 6 * k} ${y - 2 * k} ${x - 7 * k} ${y - 16 * k} ${x} ${y - 30 * k} Z" fill="#fffbe8"/>
  <path d="M${x} ${y + 6 * k} L${x} ${y + 16 * k}" stroke="#2a1a10" stroke-width="${3 * k}" stroke-linecap="round"/>`;
const vela = (x, arriba, abajo, ancho) => `
  <ellipse cx="${x}" cy="${abajo}" rx="${ancho * 0.9}" ry="${ancho * 0.18}" fill="#000" opacity=".5" filter="url(#b6)"/>
  <path d="M${x - ancho / 2} ${arriba} L${x - ancho / 2} ${abajo} Q${x} ${abajo + ancho * 0.16} ${x + ancho / 2} ${abajo} L${x + ancho / 2} ${arriba} Z" fill="url(#cera)"/>
  <path d="M${x - ancho / 2} ${arriba} Q${x - ancho * 0.42} ${arriba + 40} ${x - ancho * 0.38} ${arriba + 58} Q${x - ancho * 0.34} ${arriba + 66} ${x - ancho * 0.3} ${arriba + 52} Q${x - ancho * 0.24} ${arriba + 18} ${x - ancho * 0.1} ${arriba + 12} Z" fill="#fff6dc" opacity=".8"/>
  <path d="M${x + ancho * 0.18} ${arriba + 6} Q${x + ancho * 0.22} ${arriba + 30} ${x + ancho * 0.26} ${arriba + 34} Q${x + ancho * 0.31} ${arriba + 30} ${x + ancho * 0.32} ${arriba + 8} Z" fill="#fff6dc" opacity=".7"/>
  <ellipse cx="${x}" cy="${arriba}" rx="${ancho / 2}" ry="${ancho * 0.14}" fill="#fff3d1"/>
  <ellipse cx="${x}" cy="${arriba + 1}" rx="${ancho * 0.36}" ry="${ancho * 0.09}" fill="#f1d99a" opacity=".8"/>
  ${llama(x, arriba - 16, ancho / 70)}`;

function vaso({ yema = { x: 300, y: 610, rx: 78, ry: 40 }, yemas = null, clara = "", encima = "", punto = null } = {}) {
  const ys = yemas || [yema];
  const unaYema = (y) => `
    <ellipse cx="${y.x}" cy="${y.y + 4}" rx="${y.rx * 1.45}" ry="${y.ry * 1.5}" fill="#fff" fill-opacity=".09" filter="url(#b6)"/>
    <ellipse cx="${y.x}" cy="${y.y + 2}" rx="${y.rx * 1.3}" ry="${y.ry * 1.3}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/>
    <ellipse cx="${y.x}" cy="${y.y + y.ry * 0.85}" rx="${y.rx * 0.95}" ry="${y.ry * 0.35}" fill="#4a1a00" opacity=".35" filter="url(#b6)"/>
    <ellipse cx="${y.x}" cy="${y.y}" rx="${y.rx}" ry="${y.ry}" fill="url(#yema)"/>
    <ellipse cx="${y.x}" cy="${y.y}" rx="${y.rx}" ry="${y.ry}" fill="url(#yemaBorde)"/>
    <ellipse cx="${y.x - y.rx * 0.3}" cy="${y.y - y.ry * 0.4}" rx="${y.rx * 0.34}" ry="${y.ry * 0.2}" fill="#fff" opacity=".7" filter="url(#b3)"/>
    <ellipse cx="${y.x - y.rx * 0.36}" cy="${y.y - y.ry * 0.46}" rx="${y.rx * 0.1}" ry="${y.ry * 0.07}" fill="#fff"/>
    <path d="M${y.x + y.rx * 0.2} ${y.y + y.ry * 0.55} Q${y.x + y.rx * 0.6} ${y.y + y.ry * 0.4} ${y.x + y.rx * 0.8} ${y.y}" fill="none" stroke="#ffe2a0" stroke-opacity=".5" stroke-width="2" filter="url(#b2)"/>`;
  const v = `
  <g clip-path="url(#dentro)">
    <rect x="100" y="175" width="400" height="520" fill="url(#agua)"/>
    <rect x="100" y="175" width="400" height="520" fill="url(#aguaLados)"/>
    <g clip-path="url(#enAgua)">${clara}${ys.map(unaYema).join("")}${punto ? `<circle cx="${punto.x}" cy="${punto.y}" r="8" fill="#a3201a"/><circle cx="${punto.x}" cy="${punto.y}" r="13" fill="#c0392b" opacity=".25" filter="url(#b3)"/><circle cx="${punto.x - 2.5}" cy="${punto.y - 2.5}" r="2.6" fill="#ff9a8a"/>` : ""}${encima}</g>
    <ellipse cx="300" cy="175" rx="${(der(175) - izq(175)) / 2}" ry="13" fill="#fff" opacity=".14"/>
    <ellipse cx="300" cy="178" rx="${(der(175) - izq(175)) / 2 - 6}" ry="10" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
    <ellipse cx="300" cy="175" rx="${(der(175) - izq(175)) / 2}" ry="13" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.4"/>
  </g>
  <path d="M112 110 L488 110 L450 668 Q300 690 150 668 Z" fill="url(#borde)" stroke="#f6ead0" stroke-opacity=".8" stroke-width="3.2"/>
  <path d="M150 668 Q300 690 450 668 L446 712 Q300 738 154 712 Z" fill="url(#base)" stroke="#f6ead0" stroke-opacity=".55" stroke-width="2"/>
  <path d="M170 690 Q300 706 430 690" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
  <ellipse cx="300" cy="110" rx="188" ry="16" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3.4"/>
  <ellipse cx="300" cy="113" rx="181" ry="12" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
  <path d="M134 140 L163 640" stroke="#fff" stroke-opacity=".5" stroke-width="12" stroke-linecap="round" filter="url(#b3)"/>
  <path d="M146 150 L170 560" stroke="#fff" stroke-opacity=".8" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M466 150 L444 600" stroke="#ffd9a0" stroke-opacity=".35" stroke-width="9" stroke-linecap="round" filter="url(#b3)"/>
  <path d="M190 120 Q300 128 420 118" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" filter="url(#b2)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
  <defs>
    <radialGradient id="fondo" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#3b2470"/><stop offset=".55" stop-color="#1b1039"/><stop offset="1" stop-color="#0b0716"/></radialGradient>
    <linearGradient id="pano" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2466"/><stop offset=".35" stop-color="#25164a"/><stop offset="1" stop-color="#0d0820"/></linearGradient>
    <radialGradient id="yema" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#ffe08a"/><stop offset=".35" stop-color="#ffb53a"/><stop offset=".8" stop-color="#e8790f"/><stop offset="1" stop-color="#b85508"/></radialGradient>
    <radialGradient id="yemaBorde" cx="50%" cy="50%" r="50%"><stop offset=".78" stop-color="#ff9f2a" stop-opacity="0"/><stop offset="1" stop-color="#ffd27a" stop-opacity=".55"/></radialGradient>
    <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6e6ff" stop-opacity=".14"/><stop offset=".7" stop-color="#a8c6ff" stop-opacity=".22"/><stop offset="1" stop-color="#ffcf8a" stop-opacity=".28"/></linearGradient>
    <linearGradient id="aguaLados" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b0716" stop-opacity=".35"/><stop offset=".18" stop-color="#0b0716" stop-opacity="0"/><stop offset=".82" stop-color="#0b0716" stop-opacity="0"/><stop offset="1" stop-color="#0b0716" stop-opacity=".35"/></linearGradient>
    <linearGradient id="borde" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".07" stop-color="#fff" stop-opacity=".1"/><stop offset=".5" stop-color="#fff" stop-opacity=".02"/><stop offset=".93" stop-color="#ffe6b8" stop-opacity=".1"/><stop offset="1" stop-color="#ffe6b8" stop-opacity=".45"/></linearGradient>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#ffe6b8" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>
    <linearGradient id="cera" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8a27a"/><stop offset=".35" stop-color="#f6ead0"/><stop offset=".6" stop-color="#fff8e6"/><stop offset="1" stop-color="#a8916a"/></linearGradient>
    <radialGradient id="fuego" cx="50%" cy="75%" r="70%"><stop offset="0" stop-color="#fff7d6"/><stop offset=".45" stop-color="#ffc75a"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset=".4" stop-color="#ffb347" stop-opacity=".18"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    <radialGradient id="caustica" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <filter id="b2"><feGaussianBlur stdDeviation="2"/></filter><filter id="b3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="b14"><feGaussianBlur stdDeviation="14"/></filter>
    <clipPath id="dentro"><path d="M112 110 L488 110 L450 668 Q300 690 150 668 Z"/></clipPath>
    <clipPath id="enAgua"><path d="M${izq(175)} 175 L${der(175)} 175 L450 668 Q300 690 150 668 Z"/></clipPath>
  </defs>
  <rect width="1000" height="680" fill="url(#fondo)"/>
  ${[[90, 120, 26, "#ffd27a", 0.25], [930, 90, 34, "#b7a5ff", 0.22], [820, 210, 16, "#ffd27a", 0.3], [180, 300, 14, "#b7a5ff", 0.25], [700, 60, 12, "#fff", 0.25], [300, 70, 10, "#ffd27a", 0.3], [960, 330, 20, "#ffd27a", 0.18], [40, 420, 18, "#b7a5ff", 0.2]]
    .map(([x, y, r, c, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}" filter="url(#b6)"/>`).join("")}
  ${[[250, 140], [760, 120], [640, 40], [380, 30], [880, 260], [120, 220]].map(([x, y]) => `<path d="M${x} ${y - 7} L${x + 1.6} ${y - 1.6} L${x + 7} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 7} L${x - 1.6} ${y + 1.6} L${x - 7} ${y} L${x - 1.6} ${y - 1.6} Z" fill="#f1d99a" opacity=".55"/>`).join("")}
  <!-- Paño de terciopelo -->
  <path d="M0 520 Q500 490 1000 520 L1000 680 L0 680 Z" fill="url(#pano)"/>
  <path d="M0 520 Q500 490 1000 520" fill="none" stroke="#b7a5ff" stroke-opacity=".25" stroke-width="2"/>
  <path d="M140 680 Q180 600 150 525" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="18" filter="url(#b6)"/>
  <path d="M860 680 Q820 600 850 525" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="18" filter="url(#b6)"/>
  <!-- Velas -->
  ${vela(125, 300, 560, 74)}${vela(880, 360, 548, 64)}
  <!-- Romero -->
  <g transform="translate(205 590) rotate(-14)">
    <path d="M0 0 Q70 -6 150 -2" stroke="#4f6b3a" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${Array.from({ length: 13 }, (_, i) => { const x = 8 + i * 11; return `<ellipse cx="${x}" cy="-9" rx="10" ry="3" transform="rotate(-35 ${x} -9)" fill="#6f8f4e"/><ellipse cx="${x + 4}" cy="5" rx="10" ry="3" transform="rotate(30 ${x + 4} 5)" fill="#5c7a40"/>`; }).join("")}
  </g>
  <!-- Sal -->
  <ellipse cx="770" cy="612" rx="62" ry="13" fill="#000" opacity=".4" filter="url(#b3)"/>
  <path d="M712 610 Q740 572 770 568 Q802 572 828 610 Q770 622 712 610 Z" fill="#f4f0ff"/>
  <path d="M735 596 Q760 578 780 578" stroke="#fff" stroke-width="3" fill="none" opacity=".9"/>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${700 + ((i * 37) % 140)}" y="${612 + ((i * 13) % 12)}" width="3" height="3" fill="#fff" opacity=".8" transform="rotate(${i * 20} ${700 + ((i * 37) % 140)} ${612 + ((i * 13) % 12)})"/>`).join("")}
  <!-- Vaso: sombra y luz que atraviesa el agua -->
  <ellipse cx="500" cy="592" rx="165" ry="20" fill="#000" opacity=".55" filter="url(#b6)"/>
  <ellipse cx="555" cy="606" rx="130" ry="18" fill="url(#caustica)" filter="url(#b6)"/>
  <g transform="translate(272 44) scale(.76)">${v}</g>
</svg>`;
}

// Piezas de la clara (blancas, translúcidas), en coordenadas del vaso
const blanco = (d, op = 0.55, ancho = 3) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${op * 0.6}" stroke-width="${ancho * 2.4}" stroke-linecap="round" filter="url(#b3)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity="${op}" stroke-width="${ancho}" stroke-linecap="round" filter="url(#b2)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity="${Math.min(1, op + 0.25)}" stroke-width="${ancho * 0.4}" stroke-linecap="round"/>`;
const nube = (d, op = 0.45) => `<path d="${d}" fill="#fff" fill-opacity="${op * 0.6}" filter="url(#b6)"/><path d="${d}" fill="#fff" fill-opacity="${op * 0.5}" filter="url(#b2)"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>`;
const burbuja = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".9" stroke-width="2"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.3}" fill="#fff" opacity=".95"/><path d="M${x + r * 0.2} ${y + r * 0.7} A${r * 0.8} ${r * 0.8} 0 0 0 ${x + r * 0.75} ${y + r * 0.1}" stroke="#ffd27a" stroke-opacity=".7" stroke-width="1.4" fill="none"/>`;

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

/** Foto propia de la señal (fotos/<id>.jpg|png|webp), si existe, como data URL. */
function foto(id) {
  for (const ext of ["jpg", "png", "webp"]) {
    const f = join(__dirname, "fotos", `${id}.${ext}`);
    if (existsSync(f)) return `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${readFileSync(f).toString("base64")}`;
  }
  return null;
}
const escena = (s) => { const f = foto(s.id); return f ? `<img src="${f}" style="width:100%;height:100%;object-fit:cover">` : s.svg; };

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; }
.lienzo { position: relative; width: 1080px; height: 1350px; background: radial-gradient(ellipse at 50% 70%, #1d1240 0%, #0b0716 75%); }
.escena { position: absolute; left: 0; right: 0; top: 0; height: 735px; overflow: hidden; }
.escena::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,7,22,.75) 0%, rgba(11,7,22,0) 16%, rgba(11,7,22,0) 72%, #0e0920 100%); }
.marco { position: absolute; inset: 26px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; z-index: 2; pointer-events: none; }
.esq { position: absolute; color: #f1d99a; font-size: 28px; z-index: 3; }
.marca { position: absolute; top: 56px; left: 0; right: 0; text-align: center; font-size: 21px; letter-spacing: .36em; text-transform: uppercase; color: #cfc2ff; z-index: 3; text-shadow: 0 2px 10px #0b0716; }
.marca b { color: #f1d99a; font-weight: 600; }
.titulo { position: absolute; left: 60px; right: 60px; top: 662px; text-align: center; z-index: 3; }
.kick { font-family: Cormorant; font-style: italic; font-size: 38px; color: #b7a5ff; }
h1 { font-family: Cormorant; font-weight: 600; font-size: 82px; line-height: 1; color: #f1d99a; text-shadow: 0 0 40px rgba(241,217,154,.35), 0 2px 14px #0b0716; }
.lee { position: absolute; left: 90px; right: 90px; top: 818px; text-align: center; font-size: 27px; line-height: 1.42; z-index: 3; }
.fila { position: absolute; left: 60px; right: 60px; top: 962px; display: flex; gap: 22px; z-index: 3; }
.bloque { flex: 1; border-radius: 24px; padding: 20px 24px; min-height: 200px; }
.fis { background: rgba(11,7,22,.6); border: 1.5px solid rgba(183,165,255,.4); }
.anu { background: linear-gradient(160deg, rgba(241,217,154,.16), rgba(241,217,154,.04)); border: 2px solid rgba(241,217,154,.6); display: flex; flex-direction: column; }
.et { font-size: 19px; letter-spacing: .24em; text-transform: uppercase; }
.tx { margin-top: 8px; font-size: 23px; line-height: 1.36; }
.anu .tx { font-family: Cormorant; font-weight: 600; font-size: 40px; line-height: 1.08; color: #f1d99a; flex: 1; display: flex; align-items: center; }
.cta { position: absolute; left: 0; right: 0; top: 1196px; text-align: center; font-family: Cormorant; font-style: italic; font-size: 37px; z-index: 3; }
.cta b { font-style: normal; color: #f1d99a; }
.pie { position: absolute; bottom: 48px; left: 0; right: 0; text-align: center; font-size: 22px; color: #b7a5ff; z-index: 3; }
.pie b { color: #f1d99a; font-weight: 600; }
`;
const esquinas = `<span class="esq" style="top:38px;left:42px">✦</span><span class="esq" style="top:38px;right:42px">✦</span><span class="esq" style="bottom:38px;left:42px">✦</span><span class="esq" style="bottom:38px;right:42px">✦</span>`;
const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo">${cuerpo}<div class="marco"></div>${esquinas}</div></body></html>`;

const lamina = (s, i) => pagina(`
  <div class="escena">${escena(s)}</div>
  <p class="marca"><b>Arcana</b> · La limpia con huevo, sin miedo</p>
  <div class="titulo"><p class="kick">¿Qué significa…</p><h1>${s.titulo}?</h1></div>
  <p class="lee">${s.lee}</p>
  <div class="fila">
    <div class="bloque fis"><p class="et" style="color:#b7a5ff">${s.fisico ? "Lo físico" : "Un gesto para ti"}</p><p class="tx">${s.fisico || s.gesto}</p></div>
    <div class="bloque anu"><p class="et" style="color:#f1d99a">✦ Lo que anuncia</p><p class="tx">${s.anuncia}</p></div>
  </div>
  <p class="cta">¿Te salió así? Comenta <b>«${s.palabra}»</b> y Sibila te lee 🔮</p>
  <p class="pie">${i + 1} de ${SENALES.length} · Sibila te marca tu vaso en <b>miarcana.com/huevo</b></p>`);

const portada = pagina(`
  <div class="escena" style="height:820px">${escena(SENALES[1])}</div>
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <p style="position:absolute;left:0;right:0;top:770px;text-align:center;font-family:Cormorant;font-style:italic;font-size:46px;color:#b7a5ff;z-index:3">¿Qué significa lo que salió en tu vaso?</p>
  <h1 style="position:absolute;left:60px;right:60px;top:835px;text-align:center;font-size:104px;z-index:3">La limpia con huevo, sin miedo</h1>
  <p style="position:absolute;left:110px;right:110px;top:1072px;text-align:center;font-size:30px;line-height:1.42;z-index:3">8 señales del vaso: lo que es físico, lo que se lee y lo que anuncia para ti.</p>
  <p class="pie" style="font-size:24px">Guárdalo para tu próxima limpia · <b>Desliza →</b></p>`);

const cierre = pagina(`
  <div class="escena" style="height:760px">${escena(SENALES[2])}</div>
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <h1 style="position:absolute;left:60px;right:60px;top:700px;text-align:center;font-size:92px;z-index:3">¿Y en tu vaso, qué salió?</h1>
  <p style="position:absolute;left:110px;right:110px;top:838px;text-align:center;font-size:32px;line-height:1.42;z-index:3">Tómale una foto de lado, con luz, y Sibila te <b style="color:#f1d99a">marca con líneas</b> lo que salió y lo que viene para ti.</p>
  <div style="position:absolute;left:220px;right:220px;top:1010px;padding:24px 20px 26px;border-radius:999px;border:2px solid #f1d99a;text-align:center;background:rgba(241,217,154,.08);box-shadow:0 0 50px rgba(241,217,154,.2);z-index:3">
    <p style="font-size:44px;font-weight:600;color:#f1d99a">miarcana.com/huevo</p>
    <p style="font-size:21px;letter-spacing:.2em;text-transform:uppercase;color:#cfc2ff;margin-top:4px">Tu primera lectura es gratis</p>
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
    const desborde = await p.evaluate(() => [...document.querySelectorAll(".lee,.fila,.titulo")].some((e) => e.getBoundingClientRect().bottom > ({ lee: 950, fila: 1190, titulo: 812 })[e.className.split(" ")[0]]));
    if (desborde) console.warn(`⚠ ${nombre}: el texto se sale de su espacio`);
    await p.screenshot({ path: join(SALIDA, `${nombre}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log(`${piezas.length} láminas en ${SALIDA}`);
})();
