const { chromium } = require("playwright"); const fs = require("fs");
const [dir, modo] = process.argv.slice(2);
const qr = fs.readFileSync(dir + "/qr.svg", "utf8");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.addInitScript(([vb, c]) => { window.QRVB = vb; window.QR = c; }, [qr.match(/viewBox="([^"]+)"/)[1], qr.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")]);
  await p.goto("file://" + dir + "/capa.html"); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const ts = modo === "prueba" ? [2, 6.5, 9, 15.5, 18.6, 23] : Array.from({ length: Math.round(25.8 * 30) }, (_, i) => i / 30);
  fs.mkdirSync(dir + "/capa", { recursive: true });
  for (const [i, t] of ts.entries()) { await p.evaluate((t) => window.pintar(t), t); await p.screenshot({ path: modo === "prueba" ? `${dir}/prueba-${t}.png` : `${dir}/capa/${String(i).padStart(4, "0")}.png`, omitBackground: true }); }
  await b.close();
})();
