// Tarjeta de WhatsApp del directo del domingo 15 de noviembre (estado 1080×1920 y cuadrada 1080×1080).
// Uso: NODE_PATH=$(npm root -g) node marketing/directos/2026-11-15/generar.js
const { chromium } = require("playwright");
const { writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");
const R = join(__dirname, "../../..");
const f = (x) => `file://${R}/src/app/fuentes/${x}`;
const SIBILA = `file://${R}/public/marca/sibila/base.jpg`;
const css = (w, h) => `
@font-face{font-family:C;src:url(${f("CormorantGaramond-SemiBold.ttf")})}@font-face{font-family:CI;src:url(${f("CormorantGaramond-Italic.ttf")})}
@font-face{font-family:I;src:url(${f("Inter-SemiBold.ttf")})}@font-face{font-family:IR;src:url(${f("Inter-Regular.ttf")})}
*{margin:0;padding:0;box-sizing:border-box}body{width:${w}px;height:${h}px;overflow:hidden;background:#0b0716;color:#ece6f7;font-family:IR;font-variant-numeric:lining-nums}
.c{position:absolute;left:60px;right:60px;text-align:center}
.vivo{display:inline-flex;align-items:center;gap:14px;padding:12px 30px;border-radius:999px;background:#e0453a;font-family:I;font-size:34px;letter-spacing:.2em;color:#fff}
.vivo i{width:18px;height:18px;border-radius:50%;background:#fff}
.oro{font-family:C;color:#f1d99a;text-shadow:0 0 40px rgba(241,217,154,.45),0 3px 16px #0b0716}
.pill{display:inline-block;padding:18px 40px;border-radius:999px;border:3px solid #f1d99a;background:rgba(11,7,22,.75);font-family:I;color:#f1d99a}
.it{display:inline-block;margin:6px;padding:10px 22px;border-radius:999px;border:2px solid rgba(241,217,154,.6);background:rgba(11,7,22,.6);font-family:I;font-size:28px;color:#f1d99a}
`;
const estado = `<!doctype html><html><head><meta charset="utf-8"><style>${css(1080, 1920)}
.foto{position:absolute;left:0;right:0;top:330px;height:1000px;background:url(${SIBILA}) 32% center/cover}
.foto::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#0b0716 0%,rgba(11,7,22,0) 18%,rgba(11,7,22,0) 72%,#0b0716 100%)}
</style></head><body>
<div class="foto"></div>
<div class="c" style="top:80px"><span class="vivo"><i></i>EN VIVO HOY</span></div>
<p class="c oro" style="top:170px;font-size:100px;line-height:1">Sibila te lee</p>
<div class="c" style="top:1250px"><p class="oro" style="font-size:110px;line-height:1">8:00 p.m.</p>
  <p style="font-family:I;font-size:34px;color:#fff;margin-top:10px">Colombia · Perú · Ecuador</p>
  <p style="font-size:28px;color:#cfc2ff;margin-top:8px">7 p.m. México · 9 p.m. Venezuela · 10 p.m. Argentina y Chile</p></div>
<div class="c" style="top:1490px"><span class="it">💗 Amor (hoy Venus avanza)</span><span class="it">Tarot</span><span class="it">Carta astral</span><span class="it">Sinastría</span></div>
<div class="c" style="top:1650px"><span class="pill" style="font-size:44px">▶ youtube.com/live/4MOgSv2TN_4</span>
  <p style="font-size:28px;color:#ece6f7;margin-top:16px">Toca «Notificarme» y escribe tu signo y tu pregunta en el chat</p></div>
</body></html>`;
const cuadrada = `<!doctype html><html><head><meta charset="utf-8"><style>${css(1080, 1080)}
.foto{position:absolute;left:0;top:0;width:560px;height:1080px;background:url(${SIBILA}) 30% center/cover}
.foto::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,7,22,0) 55%,#0b0716 100%)}
.d{position:absolute;left:520px;right:50px;text-align:center}
</style></head><body>
<div class="foto"></div>
<div class="d" style="top:90px"><span class="vivo" style="font-size:28px"><i></i>EN VIVO HOY</span></div>
<p class="d oro" style="top:170px;font-size:82px;line-height:1">Sibila<br>te lee</p>
<p class="d oro" style="top:380px;font-size:96px;line-height:1">8:00 p.m.</p>
<p class="d" style="top:490px;font-family:I;font-size:26px;color:#fff">Colombia · Perú · Ecuador</p>
<p class="d" style="top:535px;font-size:22px;color:#cfc2ff;line-height:1.4">7 p.m. México · 9 p.m. Venezuela<br>10 p.m. Argentina y Chile</p>
<p class="d" style="top:650px;font-size:28px;line-height:1.4">Tu signo y tu pregunta:<br><b style="font-family:I;color:#f1d99a">te leo gratis en el chat</b> 🔮</p>
<div class="d" style="top:810px"><span class="pill" style="font-size:30px;padding:16px 26px">▶ YouTube @miarcana</span></div>
<p class="d" style="top:920px;font-size:22px;color:#cfc2ff">youtube.com/live/4MOgSv2TN_4</p>
</body></html>`;
(async () => {
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  for (const [n, html, w, h] of [["tarjeta-whatsapp-estado", estado, 1080, 1920], ["tarjeta-whatsapp-cuadrada", cuadrada, 1080, 1080]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const tmp = join(__dirname, "_pieza.html");
    writeFileSync(tmp, html);
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(__dirname, `${n}.png`) });
    rmSync(tmp, { force: true });
  }
  await b.close();
  console.log("listo");
})();
