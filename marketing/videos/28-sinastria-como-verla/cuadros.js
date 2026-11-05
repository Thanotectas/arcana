// Fotogramas del video 28: node cuadros.js <carpeta> [prueba] (desde 3,0 s; antes va el clip del video 20).
const { chromium } = require("playwright");
const fs = require("fs");
const [dir, modo] = process.argv.slice(2);
const datos = JSON.parse(fs.readFileSync(dir + "/datos.json", "utf8"));
(async () => {
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errores = []; p.on("pageerror", (e) => errores.push(e.message));
  await p.addInitScript((d) => { window.DATOS = d; }, datos);
  await p.goto("file://" + dir + "/escena.html");
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  if (modo === "prueba") {
    for (const t of [5.0, 7.8, 11.5, 14.0, 17.5, 23.0, 26.0, 29.0, 33.0]) { await p.evaluate((t) => window.pintar(t), t); await p.screenshot({ path: `${dir}/prueba-${t}.png` }); }
  } else {
    const salida = modo || dir + "/cuadros";
    fs.mkdirSync(salida, { recursive: true });
    const fps = 30, n = Math.round((34.6 - 3.0) * fps);
    for (let i = 0; i < n; i++) { await p.evaluate((t) => window.pintar(t), 3.0 + i / fps); await p.screenshot({ path: `${salida}/${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 }); }
  }
  console.log("errores", errores);
  await b.close();
})();
