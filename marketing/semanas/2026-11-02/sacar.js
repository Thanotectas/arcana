const { chromium } = require("playwright"); const dir = process.argv[2];
(async () => { const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [n, v] of [["1-lunes", "semana"], ["2-martes", "numero"], ["3-miercoles", "vivo"], ["4-jueves", "pendulo"], ["5-viernes", "pareja"], ["6-sabado", "elige"], ["7-domingo-revela", "revela"]]) {
    await p.goto(`file://${dir}/tarjeta.html?v=${v}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300); await p.screenshot({ path: `${dir}/${n}.png` }); }
  await b.close(); })();
