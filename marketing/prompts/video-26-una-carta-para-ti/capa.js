const { chromium } = require("playwright"); const fs = require("fs");
const [dir, modo, dur] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + dir + "/capa.html"); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const ts = modo === "prueba" ? [1.5, 4.5, 11] : Array.from({ length: Math.round(Number(dur) * 30) }, (_, i) => i / 30);
  fs.mkdirSync(dir + "/capa", { recursive: true });
  for (const [i, t] of ts.entries()) { await p.evaluate((t) => window.pintar(t), t); await p.screenshot({ path: modo === "prueba" ? `${dir}/prueba-${t}.png` : `${dir}/capa/${String(i).padStart(4, "0")}.png`, omitBackground: true }); }
  await b.close(); })();
