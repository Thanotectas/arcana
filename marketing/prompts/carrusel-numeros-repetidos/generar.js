// Carrusel «¿Qué significa ver números repetidos?» (10 imágenes 1080×1350, el máximo de Facebook).
// Uso: NODE_PATH=$(npm root -g) node marketing/prompts/carrusel-numeros-repetidos/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(RAIZ, "marketing/imagenes/carrusel-numeros-repetidos");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

const NUMEROS = [
  { n: "111", titulo: "Nuevos comienzos", texto: "Lo que piensas se está volviendo realidad muy rápido. Cuida tus pensamientos y empieza eso que vienes aplazando.", tono: "#f1d99a" },
  { n: "222", titulo: "Equilibrio y paciencia", texto: "Vas por buen camino aunque todavía no veas el resultado. Una relación o un acuerdo se está acomodando: no lo fuerces.", tono: "#b7c8ff" },
  { n: "333", titulo: "Tu voz despierta", texto: "Tu creatividad está encendida. Di lo que sientes, escribe, crea: es tu momento de expresarte y de que te escuchen.", tono: "#f2a6d8" },
  { n: "444", titulo: "Base firme", texto: "Lo que construyes con esfuerzo está protegido. Sigue paso a paso: la estabilidad que buscas ya se está formando.", tono: "#8fd19e" },
  { n: "555", titulo: "Un cambio grande", texto: "Algo se mueve en tu vida: un trabajo, una casa, una forma de pensar. Suelta lo viejo, que lo nuevo viene mejor.", tono: "#f2a65a" },
  { n: "777", titulo: "El camino correcto", texto: "Tu intuición no falla. Es tiempo de aprender, de mirar hacia adentro y de confiar en las señales que te llegan.", tono: "#b7a5ff" },
  { n: "888", titulo: "Cosecha", texto: "Llega el momento de recoger lo que sembraste: un reconocimiento, una ayuda o un pago que venías esperando.", tono: "#f1d99a" },
  { n: "11:11", titulo: "Un portal de deseos", texto: "Lo que piensas en ese instante se siembra. Cuando lo veas, respira y pide algo con claridad, en presente.", tono: "#7fc4f0" },
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; font-variant-numeric: lining-nums; font-feature-settings: "lnum" 1; }
.lienzo { position: relative; width: 1080px; height: 1350px; overflow: hidden; }
.marco { position: absolute; inset: 34px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.marco::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(241,217,154,.22); border-radius: 18px; }
.esquina { position: absolute; color: #f1d99a; font-size: 34px; line-height: 1; }
.centro { position: absolute; left: 0; right: 0; text-align: center; }
.marca { top: 74px; font-size: 22px; letter-spacing: .38em; text-transform: uppercase; color: #b7a5ff; }
.marca b { color: #f1d99a; font-weight: 600; }
.pie { bottom: 70px; font-size: 24px; color: #b7a5ff; letter-spacing: .04em; }
.pie b { color: #f1d99a; font-weight: 600; }
`;

function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350">${Array.from({ length: 90 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`).join("")}</svg>`;
}
const marcos = `<div class="marco"></div><span class="esquina" style="top:48px;left:52px">✦</span><span class="esquina" style="top:48px;right:52px">✦</span><span class="esquina" style="bottom:48px;left:52px">✦</span><span class="esquina" style="bottom:48px;right:52px">✦</span>`;
const pagina = (fondo, cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo" style="background:${fondo}">${cuerpo}</div></body></html>`;
const FONDO = (tono) => `radial-gradient(ellipse at 50% 34%, ${tono}30 0%, #2a1a5e 32%, #160d33 62%, #0b0716 100%)`;

const portada = pagina(FONDO("#f1d99a"), `
  ${estrellas(5)}${marcos}
  <p class="centro marca"><b>Arcana</b> · Numerología</p>
  <p class="centro" style="top:230px;font-family:Cormorant;font-weight:600;font-size:150px;line-height:1;letter-spacing:.04em;color:#f1d99a;text-shadow:0 0 60px rgba(241,217,154,.45)">11:11</p>
  <p class="centro" style="top:400px;font-family:Cormorant;font-weight:600;font-size:92px;line-height:1;color:#b7c8ff;opacity:.85">222 · 333</p>
  <p class="centro" style="top:600px;padding:0 90px;font-family:Cormorant;font-weight:600;font-size:96px;line-height:1.02;color:#f1d99a">¿Sigues viendo números repetidos?</p>
  <p class="centro" style="top:850px;padding:0 120px;font-size:38px;line-height:1.4">Esto es lo que te quieren decir, número por número.</p>
  <p class="centro" style="top:1040px;font-size:30px;color:#b7a5ff">Guárdalo y compártelo con quien siempre los ve ✨</p>
  <p class="centro pie">Desliza →</p>`);

const lamina = (x, i) => pagina(FONDO(x.tono), `
  ${estrellas(17 + i * 41)}${marcos}
  <p class="centro marca"><b>Arcana</b> · Números repetidos</p>
  <div style="position:absolute;left:50%;top:170px;transform:translateX(-50%);width:560px;height:560px;border-radius:50%;background:radial-gradient(circle, ${x.tono}40 0%, ${x.tono}10 45%, transparent 70%)"></div>
  <p class="centro" style="top:${x.n.length > 3 ? 290 : 250}px;font-family:Cormorant;font-weight:600;font-size:${x.n.length > 3 ? 230 : 290}px;line-height:1;letter-spacing:.03em;color:${x.tono};text-shadow:0 0 70px ${x.tono}88">${x.n}</p>
  <p class="centro" style="top:690px;font-size:26px;letter-spacing:.3em;text-transform:uppercase;color:#b7a5ff">Si ves el ${x.n}</p>
  <h1 class="centro" style="top:740px;padding:0 80px;font-family:Cormorant;font-weight:600;font-size:96px;line-height:1;color:#f1d99a">${x.titulo}</h1>
  <p class="centro" style="top:900px;padding:0 110px;font-size:40px;line-height:1.4">${x.texto}</p>
  <p class="centro pie">${i + 1} de ${NUMEROS.length} · <b>miarcana.com</b></p>`);

const cierre = pagina(FONDO("#b7a5ff"), `
  ${estrellas(99)}${marcos}
  <p class="centro marca"><b>Arcana</b> · Numerología</p>
  <h1 class="centro" style="top:170px;padding:0 90px;font-family:Cormorant;font-weight:600;font-size:104px;line-height:1;color:#f1d99a">¿Y tú, qué número ves más?</h1>
  <p class="centro" style="top:420px;padding:0 120px;font-size:42px;line-height:1.4">Escríbelo en los comentarios y te decimos qué significa para ti ✨</p>
  <div style="position:absolute;left:120px;right:120px;top:660px;border:2px solid rgba(241,217,154,.6);border-radius:28px;padding:44px 40px;text-align:center;background:rgba(11,7,22,.55)">
    <p style="font-size:30px;color:#b7a5ff">Tus números no son casualidad</p>
    <p style="margin-top:14px;font-family:Cormorant;font-weight:600;font-size:64px;line-height:1.05;color:#f1d99a">Calcula gratis tu Matriz del Destino</p>
    <p style="margin-top:18px;font-size:32px;color:#ece6f7">con tu fecha de nacimiento en <b style="color:#f1d99a">miarcana.com</b></p>
  </div>
  <p class="centro" style="top:1110px;font-family:Cormorant;font-weight:600;font-size:46px;color:#f1d99a">Guárdalo · Compártelo</p>
  <p class="centro pie">Instagram <b>@miarcana.oficial</b> · TikTok <b>@miarcana4</b></p>`);

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  const piezas = [["00-portada", portada], ...NUMEROS.map((x, i) => [`${String(i + 1).padStart(2, "0")}-${x.n.replace(":", "")}`, lamina(x, i)]), ["09-cierre", cierre]];
  for (const [nombre, html] of piezas) {
    writeFileSync(tmp, html);
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: join(SALIDA, `${nombre}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log(`${piezas.length} imágenes en ${SALIDA}`);
})();
