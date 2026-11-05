const { chromium } = require("playwright");
const fs = require("fs");
const [dir, modo] = process.argv.slice(2);
const datos = JSON.parse(fs.readFileSync(dir + "/datos.json", "utf8"));
const vb = datos.qr.match(/viewBox="([^"]+)"/)[1];
datos.qrViewBox = vb; datos.qrCuerpo = datos.qr.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errores = []; p.on("pageerror", (e) => errores.push(e.message));
  await p.addInitScript((d) => { window.DATOS = d; }, datos);
  await p.goto("file://" + dir + "/escena.html");
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  const tiempos = modo === "prueba" ? [2.4, 7.5, 9.6, 13.2, 17.5, 23.4, 28.5] : null;
  if (tiempos) {
    for (const t of tiempos) { await p.evaluate((t) => window.pintar(t), t); await p.screenshot({ path: `${dir}/prueba-${t}.png` }); }
  } else {
    fs.mkdirSync(dir + "/cuadros", { recursive: true });
    const fps = 30, n = 30 * fps;
    for (let i = 0; i < n; i++) { await p.evaluate((t) => window.pintar(t), i / fps); await p.screenshot({ path: `${dir}/cuadros/${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 }); }
  }
  console.log("errores", errores);
  await b.close();
})();
