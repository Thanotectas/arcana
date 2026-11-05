// Saca una capa (gancho transparente o cierre) de capas.html. Uso: node foto.cjs <gancho|fin> <texto html> <salida.png>
const { chromium } = require("playwright");
const [que, texto, salida] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(`file://${__dirname}/capas.html?que=${que}&texto=${encodeURIComponent(texto)}`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  await p.screenshot({ path: salida, omitBackground: true });
  await b.close();
})();
