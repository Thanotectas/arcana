const { chromium } = require("playwright");
const dir = process.argv[2];
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  for (const [i, v] of ["tarot", "pendulo", "astral", "pareja"].entries()) {
    await p.goto(`file://${dir}/tarjeta.html?v=${v}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: `${dir}/0${i + 1}-${v}.png` });
  }
  await b.close();
})();
