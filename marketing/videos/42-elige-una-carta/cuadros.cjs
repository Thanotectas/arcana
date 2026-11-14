// Dibuja escena.html cuadro por cuadro (30 fps, JPG). Uso: node cuadros.cjs <escena.html> <carpeta> <segundos>
const { chromium } = require("playwright");
const fs = require("node:fs");
const [html, salida, dur] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(salida, { recursive: true });
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + html);
  await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode())).then(() => document.fonts.ready));
  const n = Math.round(Number(dur) * 30);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => window.pintar(t), i / 30);
    await p.screenshot({ path: `${salida}/${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
  }
  await b.close();
})();
