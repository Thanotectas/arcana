// Publicación de Facebook «Comparte tu vaso: esta noche lo leemos en vivo» (1080×1350).
// Uso: NODE_PATH=$(npm root -g) node marketing/redes/facebook/comparte-tu-vaso/generar.js
const { chromium } = require("playwright");
const { join } = require("node:path");
const { writeFileSync, rmSync } = require("node:fs");
const R = join(__dirname, "../../../..");
const f = (x) => `file://${R}/src/app/fuentes/${x}`;
const foto = `file://${R}/marketing/carruseles/que-significa-huevo/fotos/velitas.jpg`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:C;src:url(${f("CormorantGaramond-SemiBold.ttf")})}@font-face{font-family:CI;src:url(${f("CormorantGaramond-Italic.ttf")})}
@font-face{font-family:I;src:url(${f("Inter-SemiBold.ttf")})}@font-face{font-family:IR;src:url(${f("Inter-Regular.ttf")})}
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1350px;overflow:hidden;background:#0b0716;color:#ece6f7;font-family:IR}
.foto{position:absolute;left:0;right:0;top:0;height:760px;background:url(${foto}) center 45%/cover}
.foto::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,7,22,.85) 0%,rgba(11,7,22,0) 22%,rgba(11,7,22,0) 70%,#0b0716 100%)}
.marco{position:absolute;inset:26px;border:2px solid rgba(241,217,154,.55);border-radius:26px}
.c{position:absolute;left:60px;right:60px;text-align:center}
</style></head><body><div class="foto"></div><div class="marco"></div>
<p class="c" style="top:58px;font-family:I;font-size:22px;letter-spacing:.36em;color:#cfc2ff"><b style="color:#f1d99a">ARCANA</b> · SIBILA TE LEE</p>
<div class="c" style="top:120px"><span style="display:inline-flex;align-items:center;gap:12px;padding:10px 26px;border-radius:999px;background:#e0453a;font-family:I;font-size:28px;letter-spacing:.18em;color:#fff"><span style="width:14px;height:14px;border-radius:50%;background:#fff"></span>HOY EN VIVO · 8 P.M.</span></div>
<p class="c" style="top:700px;font-family:CI;font-size:50px;color:#b7a5ff">¿Te hiciste la limpia con huevo?</p>
<h1 class="c" style="top:768px;font-family:C;font-weight:600;font-size:104px;line-height:1;color:#f1d99a;text-shadow:0 0 40px rgba(241,217,154,.35)">Comparte tu vaso</h1>
<p class="c" style="top:900px;font-size:36px;line-height:1.35">Deja la foto en los comentarios 👇<br>y <b style="font-family:I;color:#f1d99a">esta noche Sibila lo lee en vivo</b></p>
<div class="c" style="top:1040px"><div style="display:inline-block;padding:20px 40px;border-radius:999px;border:2px solid #f1d99a;background:rgba(241,217,154,.08)">
<p style="font-family:I;font-size:38px;color:#f1d99a">8 p.m. Colombia · en TikTok @miarcana4</p>
<p style="font-size:24px;color:#cfc2ff;margin-top:6px">7 p.m. México · 9 p.m. Venezuela · 10 p.m. Argentina y Chile</p></div></div>
<p class="c" style="top:1225px;font-size:22px;color:#a89fc0">Foto de lado y con luz · Al compartirla aceptas que la mostremos en el directo con tu nombre</p>
</body></html>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(__dirname, "_pieza.html");
  writeFileSync(tmp, html);
  await p.goto(`file://${tmp}`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: join(__dirname, "comparte-tu-vaso.png") });
  rmSync(tmp, { force: true });
  await b.close();
})();
