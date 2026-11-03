// Genera el video vertical de la lectura de un vaso a partir de un JSON (ver ejemplo.json).
// Uso: NODE_PATH=$(npm root -g) node marketing/prompts/video-lectura-vaso/generar.cjs config.json [prueba]
//   «prueba» solo saca 6 cuadros sueltos (PNG) junto a la salida, para revisar las marcas.
// La foto, el audio y la salida se resuelven respecto del JSON. Sin audio, el video va mudo (se le pone
// música o la voz de Sibila al publicarlo).
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const FPS = 30;
const [archivo, modo] = process.argv.slice(2);
if (!archivo) throw new Error("Falta el JSON de configuración.");
const base = path.dirname(path.resolve(archivo));
const K = JSON.parse(fs.readFileSync(archivo, "utf8"));
const salida = path.resolve(base, K.salida || "lectura-vaso.mp4");
const trabajo = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "vaso-"));
const plantilla = path.join(__dirname, "plantilla.html");

(async () => {
  // La plantilla carga las fuentes con rutas relativas al repo: se copia junto a ellas con su config.
  const pagina = path.join(__dirname, "_escena.html");
  fs.copyFileSync(plantilla, pagina);
  fs.copyFileSync(path.resolve(base, K.foto), path.join(__dirname, "_foto" + path.extname(K.foto)));
  fs.writeFileSync(path.join(__dirname, "config.js"), "window.CONFIG = " + JSON.stringify({ ...K, foto: "_foto" + path.extname(K.foto) }) + ";");
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errores = [];
  p.on("pageerror", (e) => errores.push(e.message));
  await p.goto("file://" + pagina);
  await p.evaluate(() => window.listo);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  try {
    if (modo === "prueba") {
      const momentos = [1.5, ...K.pasos.map((x) => x.desde + 2.2), K.duracion - 1];
      for (const t of momentos) {
        await p.evaluate((t) => window.pintar(t), t);
        await p.screenshot({ path: salida.replace(/\.mp4$/, `-prueba-${t.toFixed(1)}.png`) });
      }
    } else {
      const n = Math.round(K.duracion * FPS);
      for (let i = 0; i < n; i++) {
        await p.evaluate((t) => window.pintar(t), i / FPS);
        await p.screenshot({ path: path.join(trabajo, `${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 90 });
      }
      const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
      const entradas = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(trabajo, "%05d.jpg")];
      if (K.audio) entradas.push("-i", path.resolve(base, K.audio));
      execFileSync(ffmpeg, [...entradas, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", ...(K.audio ? ["-c:a", "aac", "-b:a", "160k", "-shortest"] : []), "-movflags", "+faststart", salida]);
    }
  } finally {
    await b.close();
    for (const f of ["_escena.html", "config.js", "_foto" + path.extname(K.foto)]) fs.rmSync(path.join(__dirname, f), { force: true });
    fs.rmSync(trabajo, { recursive: true, force: true });
  }
  console.log(errores.length ? `errores: ${errores.join(" | ")}` : `listo: ${modo === "prueba" ? "cuadros de prueba" : salida}`);
})();
