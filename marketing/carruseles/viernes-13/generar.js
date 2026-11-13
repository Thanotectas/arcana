// Viernes 13 sin miedo (13 de noviembre de 2026): portada, «el 13 en el tarot», ritual de protección y cierre (1080×1350)
// + reel de 20 s. Cielo real: Mercurio retoma su marcha el 14, Venus el 15, Marte y Júpiter juntos en Leo (exacto ~15).
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/viernes-13/generar.js && ./reel.sh reel-viernes-13.mp4
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const R = join(__dirname, "../../..");
const f = (x) => `file://${R}/src/app/fuentes/${x}`;
const FOTO = `file://${R}/marketing/carruseles/que-significa-huevo/fotos/velo-manto.jpg`;
const CARTA = `file://${R}/public/cartas/rider/la-muerte.webp`;
const SALIDA = join(__dirname, "laminas");
const css = `
@font-face{font-family:C;src:url(${f("CormorantGaramond-SemiBold.ttf")})}@font-face{font-family:CI;src:url(${f("CormorantGaramond-Italic.ttf")})}
@font-face{font-family:I;src:url(${f("Inter-SemiBold.ttf")})}@font-face{font-family:IR;src:url(${f("Inter-Regular.ttf")})}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;overflow:hidden;background:#0b0716;color:#ece6f7;font-family:IR;font-variant-numeric:lining-nums}
.fondo{position:absolute;inset:-40px;background:url(${FOTO}) center/cover;filter:blur(26px) brightness(.38) saturate(1.2)}
.velo{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,rgba(59,36,112,.35) 0%,rgba(11,7,22,.78) 70%,#0b0716 100%)}
.marco{position:absolute;inset:28px;border:2px solid rgba(241,217,154,.55);border-radius:26px}
.c{position:absolute;left:70px;right:70px;text-align:center}
.marca{top:62px;font-family:I;font-size:22px;letter-spacing:.36em;color:#cfc2ff}.marca b{color:#f1d99a}
.num{font-family:C;color:#f1d99a;text-shadow:0 0 60px rgba(241,217,154,.6),0 0 140px rgba(241,217,154,.3)}
.pie{bottom:62px;font-size:24px;color:#b7a5ff}
.paso{display:flex;gap:26px;align-items:flex-start;text-align:left;margin-top:30px}
.paso span{flex:none;width:64px;height:64px;border-radius:50%;background:#f1d99a;color:#0b0716;font-family:I;font-size:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 26px rgba(241,217,154,.45)}
.paso p{font-size:34px;line-height:1.35;padding-top:6px}.paso p b{font-family:I;color:#f1d99a;font-weight:600}
`;
const estrellas = Array.from({ length: 70 }, (_, i) => { const r = (n) => { const x = Math.sin((i + 1) * n) * 43758.5453; return x - Math.floor(x); };
  return `<div style="position:absolute;left:${(r(12.9) * 1080).toFixed(0)}px;top:${(r(78.2) * 1350).toFixed(0)}px;width:${(1 + r(3.1) * 3).toFixed(1)}px;height:${(1 + r(3.1) * 3).toFixed(1)}px;border-radius:50%;background:#fff;opacity:${(0.25 + r(5.7) * 0.6).toFixed(2)}"></div>`; }).join("");
const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="fondo"></div><div class="velo"></div><div style="position:absolute;inset:0">${estrellas}</div><div class="marco"></div>${cuerpo}</body></html>`;

const piezas = {
  "1-portada": pagina(`
    <p class="c marca"><b>ARCANA</b> · SIBILA TE LEE</p>
    <p class="c" style="top:180px;font-family:CI;font-size:54px;color:#cfc2ff">Hoy es</p>
    <p class="c num" style="top:240px;font-size:150px;line-height:1">Viernes 13</p>
    <p class="c" style="top:470px;font-family:C;font-size:84px;line-height:1.05;color:#fff">y no es de mala suerte</p>
    <p class="c" style="top:660px;font-size:34px;line-height:1.5">En el tarot, el 13 es la carta del <b style="font-family:I;color:#f1d99a">cambio</b>:<br>lo que termina para que algo nuevo empiece.</p>
    <p class="c" style="top:880px;font-size:30px;line-height:1.5;color:#cfc2ff">Y el cielo lo confirma: mañana <b style="font-family:I;color:#f1d99a">Mercurio</b> retoma su marcha<br>y el domingo, <b style="font-family:I;color:#f1d99a">Venus</b>. Lo que estaba trabado, se suelta.</p>
    <p class="c pie">Desliza para tu ritual de protección →</p>`),
  "2-carta-13": pagina(`
    <p class="c marca"><b>ARCANA</b> · EL 13 EN EL TAROT</p>
    <div class="c" style="top:130px"><img src="${CARTA}" style="height:600px;border-radius:18px;border:3px solid rgba(241,217,154,.75);box-shadow:0 0 60px rgba(241,217,154,.3)"></div>
    <p class="c num" style="top:770px;font-size:76px">XIII · La Muerte</p>
    <p class="c" style="top:880px;font-size:34px;line-height:1.5">No habla de morir: habla de <b style="font-family:I;color:#f1d99a">cerrar un ciclo</b>.<br>Soltar lo que ya no te sirve para dejarle<br>espacio a lo que viene.</p>
    <p class="c" style="top:1110px;font-family:CI;font-size:40px;color:#cfc2ff">¿Qué vas a soltar hoy?</p>
    <p class="c pie">Desliza →</p>`),
  "3-ritual": pagina(`
    <p class="c marca"><b>ARCANA</b> · RITUAL DE VIERNES 13</p>
    <p class="c num" style="top:120px;font-size:88px">Soltar y proteger</p>
    <p class="c" style="top:235px;font-family:CI;font-size:40px;color:#cfc2ff">13 minutos, esta noche</p>
    <div class="c" style="top:320px;left:110px;right:110px">
      <div class="paso"><span>1</span><p>Pon <b>sal gruesa</b> en un plato junto a la puerta de tu casa.</p></div>
      <div class="paso"><span>2</span><p>Enciende una <b>vela blanca</b> y escribe en un papel <b>lo que quieres soltar</b>.</p></div>
      <div class="paso"><span>3</span><p>Rómpelo en pedacitos y di: <b>«Lo suelto con gratitud»</b>.</p></div>
      <div class="paso"><span>4</span><p>Mañana, bota la sal y los papeles fuera de casa y <b>abre las ventanas</b>.</p></div>
    </div>
    <p class="c pie">Guárdalo para hacerlo esta noche 🕯️</p>`),
  "4-cierre": pagina(`
    <p class="c marca"><b>ARCANA</b> · SIBILA TE LEE</p>
    <p class="c num" style="top:170px;font-size:120px;line-height:1">13 ✨</p>
    <p class="c" style="top:340px;font-family:C;font-size:72px;line-height:1.08;color:#fff">Escribe <span style="color:#f1d99a">«SUELTO»</span><br>y lo que dejas ir hoy</p>
    <p class="c" style="top:560px;font-size:34px;line-height:1.45">Sibila lo cierra contigo 🔮</p>
    <p class="c" style="top:700px;font-size:31px;line-height:1.5;color:#cfc2ff">¿Quieres saber qué viene después de ese cierre?<br>Saca tu carta del día, gratis:</p>
    <div class="c" style="top:850px"><div style="display:inline-block;padding:22px 48px;border-radius:999px;border:3px solid #f1d99a;background:rgba(11,7,22,.6);box-shadow:0 0 40px rgba(241,217,154,.3)">
      <p style="font-family:I;font-size:46px;color:#f1d99a">miarcana.com</p>
      <p style="font-family:I;font-size:21px;letter-spacing:.2em;color:#cfc2ff;margin-top:6px">TU CARTA DEL DÍA ES GRATIS</p></div></div>
    <p class="c pie">Lecturas de entretenimiento y reflexión personal</p>`),
};
(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  for (const [n, html] of Object.entries(piezas)) {
    writeFileSync(tmp, html);
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(SALIDA, `${n}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log("listo");
})();
