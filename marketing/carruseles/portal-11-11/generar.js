// Portal 11:11 (11 de noviembre de 2026): portada, ritual y cierre (1080×1350) + reel de 15 s con las tres láminas.
// Cielo real del día (efemérides de Arcana): Luna creciente en Sagitario (Luna nueva en Escorpio el 9), Marte y Júpiter
// juntándose en Leo (exacto hacia el 15), Luna llena en Géminis el 24.
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/portal-11-11/generar.js
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const R = join(__dirname, "../../..");
const f = (x) => `file://${R}/src/app/fuentes/${x}`;
const FOTO = `file://${R}/marketing/carruseles/que-significa-huevo/fotos/velitas.jpg`;
const SALIDA = join(__dirname, "laminas");
const css = `
@font-face{font-family:C;src:url(${f("CormorantGaramond-SemiBold.ttf")})}@font-face{font-family:CI;src:url(${f("CormorantGaramond-Italic.ttf")})}
@font-face{font-family:I;src:url(${f("Inter-SemiBold.ttf")})}@font-face{font-family:IR;src:url(${f("Inter-Regular.ttf")})}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;overflow:hidden;background:#0b0716;color:#ece6f7;font-family:IR;font-variant-numeric:lining-nums}
.fondo{position:absolute;inset:-40px;background:url(${FOTO}) center/cover;filter:blur(26px) brightness(.42) saturate(1.2)}
.velo{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,rgba(59,36,112,.35) 0%,rgba(11,7,22,.75) 70%,#0b0716 100%)}
.marco{position:absolute;inset:28px;border:2px solid rgba(241,217,154,.55);border-radius:26px}
.c{position:absolute;left:70px;right:70px;text-align:center}
.marca{top:62px;font-family:I;font-size:22px;letter-spacing:.36em;color:#cfc2ff}.marca b{color:#f1d99a}
.num{font-family:C;color:#f1d99a;text-shadow:0 0 60px rgba(241,217,154,.65),0 0 140px rgba(241,217,154,.35)}
.pie{bottom:62px;font-size:24px;color:#b7a5ff}.pie b{color:#f1d99a;font-family:I}
.paso{display:flex;gap:26px;align-items:flex-start;text-align:left;margin-top:30px}
.paso span{flex:none;width:64px;height:64px;border-radius:50%;background:#f1d99a;color:#0b0716;font-family:I;font-size:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 26px rgba(241,217,154,.45)}
.paso p{font-size:34px;line-height:1.35;padding-top:6px}.paso p b{font-family:I;color:#f1d99a;font-weight:600}
.estrellas{position:absolute;inset:0}
`;
const estrellas = Array.from({ length: 70 }, (_, i) => { const r = (n) => { const x = Math.sin((i + 1) * n) * 43758.5453; return x - Math.floor(x); };
  return `<div style="position:absolute;left:${(r(12.9) * 1080).toFixed(0)}px;top:${(r(78.2) * 1350).toFixed(0)}px;width:${(1 + r(3.1) * 3).toFixed(1)}px;height:${(1 + r(3.1) * 3).toFixed(1)}px;border-radius:50%;background:#fff;opacity:${(0.25 + r(5.7) * 0.6).toFixed(2)}"></div>`; }).join("");
const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="fondo"></div><div class="velo"></div><div class="estrellas">${estrellas}</div><div class="marco"></div>${cuerpo}</body></html>`;

const piezas = {
  "1-portada": pagina(`
    <p class="c marca"><b>ARCANA</b> · SIBILA TE LEE</p>
    <p class="c" style="top:190px;font-family:CI;font-size:52px;color:#cfc2ff">Hoy se abre el portal</p>
    <p class="c num" style="top:250px;font-size:300px;line-height:1">11:11</p>
    <p class="c" style="top:600px;font-family:C;font-size:62px;line-height:1.1;color:#fff">El día más fácil del año<br>para pedir un deseo</p>
    <div class="c" style="top:820px;font-size:31px;line-height:1.5;color:#ece6f7">
      Y el cielo acompaña: la <b style="font-family:I;color:#f1d99a">Luna está creciendo</b><br>(nació en Escorpio el 9) y <b style="font-family:I;color:#f1d99a">Marte y Júpiter</b><br>se juntan en Leo: valor + expansión.
    </div>
    <p class="c" style="top:1060px;font-family:I;font-size:30px;letter-spacing:.4em;color:#f1d99a">11 · 11 · 2026</p>
    <p class="c pie">Desliza para el ritual de 11 minutos →</p>`),
  "2-ritual": pagina(`
    <p class="c marca"><b>ARCANA</b> · RITUAL 11:11</p>
    <p class="c num" style="top:120px;font-size:96px">Tu ritual 11:11</p>
    <p class="c" style="top:240px;font-family:CI;font-size:40px;color:#cfc2ff">a las 11:11 a. m. o p. m. · 11 minutos</p>
    <div class="c" style="top:330px;left:110px;right:110px">
      <div class="paso"><span>1</span><p>Enciende una <b>vela blanca</b> y respira hondo tres veces.</p></div>
      <div class="paso"><span>2</span><p>Escribe <b>11 deseos en presente</b>, como si ya fueran tuyos: «Tengo…», «Soy…», «Vivo…».</p></div>
      <div class="paso"><span>3</span><p>Léelos en voz alta y cierra con <b>«Así es, así será»</b>.</p></div>
      <div class="paso"><span>4</span><p>Dobla el papel y <b>guárdalo hasta la Luna llena del 24</b>. Ese día, léelo otra vez y agradece.</p></div>
    </div>
    <p class="c pie">Guárdalo para hacerlo hoy ✨</p>`),
  "3-cierre": pagina(`
    <p class="c marca"><b>ARCANA</b> · SIBILA TE LEE</p>
    <p class="c num" style="top:170px;font-size:200px;line-height:1">1111</p>
    <p class="c" style="top:420px;font-family:C;font-size:70px;line-height:1.08;color:#fff">Escribe <span style="color:#f1d99a">1111</span><br>y tu deseo en los comentarios</p>
    <p class="c" style="top:630px;font-size:34px;line-height:1.45">Sibila lo decreta contigo 🔮<br>Uno solo, el que más te importa hoy.</p>
    <div class="c" style="top:850px"><div style="display:inline-block;padding:22px 48px;border-radius:999px;border:3px solid #f1d99a;background:rgba(11,7,22,.6);box-shadow:0 0 40px rgba(241,217,154,.3)">
      <p style="font-family:I;font-size:46px;color:#f1d99a">miarcana.com</p>
      <p style="font-family:I;font-size:21px;letter-spacing:.2em;color:#cfc2ff;margin-top:6px">TU CARTA DEL DÍA ES GRATIS</p></div></div>
    <p class="c pie">Lecturas de entretenimiento y reflexión personal</p>`),
};
(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
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
