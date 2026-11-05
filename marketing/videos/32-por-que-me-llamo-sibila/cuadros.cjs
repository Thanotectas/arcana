// Dibuja las capas transparentes (PNG con alfa) de capas.html, cuadro por cuadro a 30 fps.
const { chromium } = require("playwright");
const fs = require("node:fs");
const [html, salida, duracion] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(salida, { recursive: true });
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + html);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const n = Math.round(Number(duracion) * 30);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => window.pintar(t), i / 30);
    await p.screenshot({ path: `${salida}/${String(i).padStart(5, "0")}.png`, omitBackground: true });
  }
  await b.close();
})();
