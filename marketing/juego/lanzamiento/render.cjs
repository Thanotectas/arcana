const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  for (const [modo, w, h] of [["feed", 1080, 1350], ["historia", 1080, 1920]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto("file://" + path.join(__dirname, "tarjeta.html") + "#" + modo);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(__dirname, `camino-del-loco-${modo}.jpg`), type: "jpeg", quality: 92 });
    await p.close();
  }
  await b.close();
})();
