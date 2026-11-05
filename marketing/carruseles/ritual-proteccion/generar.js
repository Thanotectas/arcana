// Carrusel «Ritual de protección (sin desearle mal a nadie)» para la Luna menguante antes de la Luna nueva
// del 9 de noviembre de 2026 (7 láminas 1080×1350). Contenido según src/lib/conocimiento/velas.md.
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/ritual-proteccion/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { readFileSync, mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const SVG = JSON.parse(readFileSync(join(__dirname, "../rituales-fin-de-anio/svgs.json"), "utf8"));
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;
const SIBILA = `file://${RAIZ}/public/marca/sibila/base.jpg`;

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; font-variant-numeric: lining-nums; }
.lienzo { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: radial-gradient(ellipse at 50% 35%, #2a1a5e 0%, #160d33 45%, #0b0716 100%); }
.marco { position: absolute; inset: 34px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.marco::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(241,217,154,.22); border-radius: 18px; }
.esquina { position: absolute; color: #f1d99a; font-size: 34px; line-height: 1; }
.marca { position: absolute; top: 74px; left: 0; right: 0; text-align: center; font-size: 22px; letter-spacing: .38em; text-transform: uppercase; color: #b7a5ff; }
.marca b { color: #f1d99a; font-weight: 600; }
.titulo { position: absolute; left: 90px; right: 90px; text-align: center; font-family: Cormorant; font-weight: 600; font-size: 84px; line-height: 1.02; color: #f1d99a; text-shadow: 0 0 40px rgba(241,217,154,.25); }
.lista { position: absolute; left: 110px; right: 110px; display: flex; flex-direction: column; gap: 26px; }
.item { display: flex; gap: 26px; align-items: flex-start; font-size: 34px; line-height: 1.35; }
.num { flex: none; width: 58px; height: 58px; border-radius: 50%; border: 2px solid #f1d99a; display: flex; align-items: center; justify-content: center; font-family: Cormorant; font-weight: 600; font-size: 36px; color: #f1d99a; }
.item b { color: #f1d99a; font-weight: 600; }
.pie { position: absolute; bottom: 70px; left: 0; right: 0; text-align: center; font-size: 24px; color: #b7a5ff; }
.pie b { color: #f1d99a; font-weight: 600; }
.ilus { position: absolute; left: 50%; transform: translateX(-50%); }
.ilus svg { width: 100%; height: 100%; }
`;
function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350">${Array.from({ length: 80 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`).join("")}</svg>`;
}
const esquinas = `<span class="esquina" style="top:48px;left:52px">✦</span><span class="esquina" style="top:48px;right:52px">✦</span><span class="esquina" style="bottom:48px;left:52px">✦</span><span class="esquina" style="bottom:48px;right:52px">✦</span>`;
const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo">${cuerpo}</div></body></html>`;
const base = (n, total, cuerpo) => pagina(`${estrellas(n * 71)}<div class="marco"></div>${esquinas}<p class="marca"><b>Arcana</b> · Ritual de protección</p>${cuerpo}<p class="pie">${n} de ${total} · <b>miarcana.com</b></p>`);
const TOTAL = 5;

// Plato con sal en círculo y la vela en el centro.
const PLATO = `<svg viewBox="0 0 560 360"><defs><linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#f1d99a"/><stop offset="1" stop-color="#c9992e"/></linearGradient></defs>
  <ellipse cx="280" cy="250" rx="250" ry="70" fill="#1d1338" stroke="url(#o)" stroke-width="5"/>
  <ellipse cx="280" cy="245" rx="190" ry="48" fill="none" stroke="#f7f3ff" stroke-width="20" stroke-dasharray="3 7" stroke-linecap="round"/>
  <rect x="245" y="90" width="70" height="150" rx="10" fill="#f7f3ff" stroke="#cfc6ea" stroke-width="2"/>
  <ellipse cx="280" cy="92" rx="35" ry="9" fill="#e9e3f7"/>
  <path d="M280 20 Q300 55 280 82 Q260 55 280 20 Z" fill="#f1d99a"/><path d="M280 44 Q290 62 280 78 Q270 62 280 44 Z" fill="#fff6d8"/>
  <circle cx="280" cy="55" r="70" fill="#f1d99a" fill-opacity=".12"/></svg>`;

const portada = pagina(`
  <div style="position:absolute;inset:0;background-image:url('${SIBILA}');background-position:30% center;background-size:auto 1350px"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(11,7,22,.15) 0%, rgba(11,7,22,.3) 36%, rgba(11,7,22,.93) 60%, #0b0716 100%)"></div>
  <div class="marco"></div>${esquinas}
  <p class="marca"><b>Arcana</b> · Sibila te lee</p>
  <p style="position:absolute;left:0;right:0;top:800px;text-align:center;font-family:Cormorant;font-style:italic;font-size:44px;color:#b7a5ff">Luna menguante · hasta el 9 de noviembre</p>
  <p style="position:absolute;left:70px;right:70px;top:862px;text-align:center;font-family:Cormorant;font-weight:600;font-size:108px;line-height:.98;color:#f1d99a;text-shadow:0 0 50px rgba(241,217,154,.3)">Ritual de protección</p>
  <p style="position:absolute;left:0;right:0;top:985px;text-align:center;font-family:Cormorant;font-weight:600;font-size:50px;color:#ece6f7">sin desearle mal a nadie</p>
  <p style="position:absolute;left:0;right:0;top:1110px;text-align:center;font-size:30px;color:#ece6f7">Guárdalo y hazlo esta semana ✨</p>
  <p class="pie">Desliza →</p>`);

const necesitas = base(1, TOTAL, `
  <h1 class="titulo" style="top:150px">Lo que necesitas</h1>
  <div class="ilus" style="top:290px;width:560px;height:360px">${PLATO}</div>
  <div class="lista" style="top:720px">
    <div class="item"><span class="num">✦</span><span>Una <b>vela blanca</b> nueva: sirve para toda intención y es la de la protección.</span></div>
    <div class="item"><span class="num">✦</span><span>Un <b>plato</b> que no se queme y <b>sal gruesa</b>.</span></div>
    <div class="item"><span class="num">✦</span><span>Un <b>papel</b> y un lápiz para escribir tu intención.</span></div>
  </div>`);

const pasos = base(2, TOTAL, `
  <h1 class="titulo" style="top:140px">Paso a paso</h1>
  <div class="lista" style="top:290px;gap:24px">
    <div class="item"><span class="num">1</span><span>Ventila y ordena el lugar. Haz un <b>círculo de sal</b> en el plato y pon la vela en el centro.</span></div>
    <div class="item"><span class="num">2</span><span>Escribe en presente: <b>«Mi casa y mi camino se cierran a lo que no me hace bien. Lo que no es mío se va en paz.»</b></span></div>
    <div class="item"><span class="num">3</span><span>Dobla el papel, déjalo bajo el plato y <b>enciende la vela</b>.</span></div>
    <div class="item"><span class="num">4</span><span>Respira hondo y repite tu frase tres veces, con calma.</span></div>
    <div class="item"><span class="num">5</span><span>Deja que se consuma, <b>sin soplarla</b>. Si tienes que apagarla, con los dedos húmedos, y la vuelves a prender después.</span></div>
  </div>
  <p style="position:absolute;left:110px;right:110px;bottom:130px;text-align:center;font-size:27px;line-height:1.4;color:#b7a5ff">Nunca la dejes encendida sola ni cerca de cortinas, niños o mascotas.</p>`);

const porque = base(3, TOTAL, `
  <h1 class="titulo" style="top:150px">¿Por qué sin «rebote»?</h1>
  <div class="ilus" style="top:330px;width:420px;height:420px">${SVG.luna}</div>
  <p style="position:absolute;left:110px;right:110px;top:800px;text-align:center;font-size:38px;line-height:1.42">Protegerte es <b style="color:#f1d99a">cerrar tu puerta</b>, no abrir la de otros. No hace falta desearle mal a nadie.</p>
  <p style="position:absolute;left:110px;right:110px;top:1000px;text-align:center;font-family:Cormorant;font-style:italic;font-size:44px;line-height:1.25;color:#b7a5ff">La Luna menguante es la luna de soltar: lo que no es tuyo se va en paz.</p>`);

const dice = base(4, TOTAL, `
  <h1 class="titulo" style="top:140px">Lo que te dice tu vela</h1>
  <div class="lista" style="top:310px;gap:30px">
    <div class="item"><span class="num">✦</span><span><b>Llama alta y firme:</b> tu protección quedó bien puesta.</span></div>
    <div class="item"><span class="num">✦</span><span><b>Humo negro u hollín:</b> algo pesado se está soltando. No es un daño.</span></div>
    <div class="item"><span class="num">✦</span><span><b>Lágrimas de cera:</b> una emoción guardada que por fin sale.</span></div>
    <div class="item"><span class="num">✦</span><span><b>Pared de cera de un lado:</b> una protección que se formó mientras pedías.</span></div>
    <div class="item"><span class="num">✦</span><span><b>Se apaga sola:</b> vuelve a encenderla una vez con la misma frase.</span></div>
  </div>
  <p style="position:absolute;left:110px;right:110px;bottom:130px;text-align:center;font-size:28px;line-height:1.4;color:#b7a5ff">Al terminar: envuelve los restos y la sal en papel y bótalos fuera de casa, agradeciendo.</p>`);

const cierre = base(5, TOTAL, `
  <h1 class="titulo" style="top:140px;font-size:90px">¿Qué te dijo tu vela?</h1>
  <div style="position:absolute;left:50%;top:310px;transform:translateX(-50%);width:420px;height:420px;border-radius:50%;overflow:hidden;border:4px solid rgba(241,217,154,.8);box-shadow:0 0 80px rgba(241,217,154,.25)">
    <div style="position:absolute;inset:0;background-image:url('${SIBILA}');background-size:1450px auto;background-position:34% 12%"></div>
  </div>
  <p style="position:absolute;left:110px;right:110px;top:790px;text-align:center;font-size:38px;line-height:1.4">Tómale una foto y súbela en <b style="color:#f1d99a">miarcana.com/velas</b>: Sibila te marca lo que salió y lo que viene para ti.</p>
  <p style="position:absolute;left:0;right:0;top:1030px;text-align:center;font-family:Cormorant;font-weight:600;font-size:48px;color:#f1d99a">Tu primera lectura es gratis</p>
  <p style="position:absolute;left:0;right:0;top:1110px;text-align:center;font-size:28px;color:#b7a5ff">Instagram @miarcana.oficial · TikTok @miarcana4</p>`);

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const piezas = [["00-portada", portada], ["01-lo-que-necesitas", necesitas], ["02-paso-a-paso", pasos], ["03-sin-rebote", porque], ["04-lo-que-dice-la-vela", dice], ["05-cierre", cierre]];
  const tmp = join(SALIDA, "_pieza.html");
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
