// Pantallas reales para el video 46 (iPhone, 390×844 a 3x): /app con los pasos, el juego eligiendo carta y la carta descubierta.
const { chromium, devices } = require("playwright");
const OCULTAR = "nextjs-portal,[role=dialog][aria-label='Medición de anuncios'],.fixed.bottom-5.right-5{display:none!important}";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices["iPhone 13"], deviceScaleFactor: 3 });
  await ctx.route("**/api/juego", (r) =>
    r.request().method() === "POST"
      ? r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, racha: 3, premio: false, progreso: { racha: 3, mejorRacha: 3, jugadas: 3, ganadas: 3, album: ["a", "b", "c"], hoy: [], creditosGanados: 0 } }) })
      : r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ racha: 2, mejorRacha: 2, jugadas: 2, ganadas: 2, album: ["a", "b"], hoy: null, creditosGanados: 0 }) }),
  );
  const p = await ctx.newPage();
  await p.goto("http://localhost:3471/app", { waitUntil: "networkidle" });
  await p.addStyleTag({ content: OCULTAR });
  await p.waitForTimeout(600);
  await p.screenshot({ path: "pantallas/1-app.png" });
  await p.evaluate(() => window.scrollTo(0, 330));
  await p.waitForTimeout(400);
  await p.screenshot({ path: "pantallas/2-pasos.png" });
  await p.goto("http://localhost:3471/juego", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: "networkidle" });
  await p.addStyleTag({ content: OCULTAR });
  await p.waitForSelector("text=¿Qué carta es?");
  await p.click('button[title="La Luna"]'); await p.click("text=Elegir"); await p.waitForTimeout(300);
  await p.click("button:has-text('Copas')"); await p.waitForTimeout(200);
  await p.click('button[title="Dos de Copas"]'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector(".tarjeta").scrollIntoView({ block: "start" }));
  await p.evaluate(() => window.scrollBy(0, -12));
  await p.waitForTimeout(400);
  await p.screenshot({ path: "pantallas/3-juego.png" });
  await p.click("text=Elegir"); await p.waitForTimeout(1800);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.evaluate(() => document.querySelector(".tarjeta").scrollIntoView({ block: "start" }));
  await p.evaluate(() => window.scrollBy(0, -12));
  await p.waitForTimeout(300);
  await p.screenshot({ path: "pantallas/4-carta.png" });
  const f = await p.$("text=La encontraste");
  await f.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 200));
  await p.waitForTimeout(300);
  await p.screenshot({ path: "pantallas/5-final.png" });
  await b.close();
})();
