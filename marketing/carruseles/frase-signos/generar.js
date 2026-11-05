// Carrusel «La frase que tu signo debe dejar de decir» (14 láminas 1080×1350): portada, una por signo
// («deja de decir» → «empieza a decir» y el porqué) y cierre.
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/frase-signos/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

const ELEMENTO = { fuego: "#f2a65a", tierra: "#8fd19e", aire: "#b7c8ff", agua: "#7fc4f0" };
const SIGNOS = [
  { id: "aries", nombre: "Aries", fechas: "21 mar – 19 abr", elemento: "fuego", deja: "Lo hago yo solo.", empieza: "Dejo que me ayuden.", porque: "Pedir ayuda no te quita fuerza: te da equipo." },
  { id: "tauro", nombre: "Tauro", fechas: "20 abr – 20 may", elemento: "tierra", deja: "Así soy y no voy a cambiar.", empieza: "Me permito crecer.", porque: "Cambiar no es perderte: es crecer sin soltar tus raíces." },
  { id: "geminis", nombre: "Géminis", fechas: "21 may – 20 jun", elemento: "aire", deja: "Después lo hablamos.", empieza: "Lo digo ahora, con calma.", porque: "Lo que se calla se enreda; lo que se dice, se resuelve." },
  { id: "cancer", nombre: "Cáncer", fechas: "21 jun – 22 jul", elemento: "agua", deja: "No quiero molestar.", empieza: "Yo también merezco que me cuiden.", porque: "Cuidarte no es egoísmo: es lo que te deja seguir cuidando." },
  { id: "leo", nombre: "Leo", fechas: "23 jul – 22 ago", elemento: "fuego", deja: "Nadie me valora.", empieza: "Yo me valoro primero.", porque: "Cuando tú te reconoces, los demás aprenden a verte." },
  { id: "virgo", nombre: "Virgo", fechas: "23 ago – 22 sep", elemento: "tierra", deja: "Todavía no está perfecto.", empieza: "Ya está listo para empezar.", porque: "Lo perfecto llega practicando, no esperando." },
  { id: "libra", nombre: "Libra", fechas: "23 sep – 22 oct", elemento: "aire", deja: "Lo que tú quieras.", empieza: "Esto es lo que yo quiero.", porque: "Tu paz también cuenta en la balanza." },
  { id: "escorpio", nombre: "Escorpio", fechas: "23 oct – 21 nov", elemento: "agua", deja: "No confío en nadie.", empieza: "Confío en quien lo demuestra.", porque: "La confianza no se regala, pero tampoco se cierra para siempre." },
  { id: "sagitario", nombre: "Sagitario", fechas: "22 nov – 21 dic", elemento: "fuego", deja: "Ya veremos.", empieza: "Me comprometo.", porque: "La libertad también es elegir algo y quedarte." },
  { id: "capricornio", nombre: "Capricornio", fechas: "22 dic – 19 ene", elemento: "tierra", deja: "No tengo tiempo.", empieza: "Mi descanso también es importante.", porque: "Descansar es parte del plan, no una pausa en él." },
  { id: "acuario", nombre: "Acuario", fechas: "20 ene – 18 feb", elemento: "aire", deja: "No me importa.", empieza: "Me importa, y está bien sentirlo.", porque: "Sentir no te hace menos libre." },
  { id: "piscis", nombre: "Piscis", fechas: "19 feb – 20 mar", elemento: "agua", deja: "Seguro es mi culpa.", empieza: "Hice lo mejor que pude.", porque: "No todo lo que pasa a tu alrededor es tuyo para cargar." },
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; font-variant-numeric: lining-nums; }
.lienzo { position: relative; width: 1080px; height: 1350px; overflow: hidden; }
.marco { position: absolute; inset: 34px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.marco::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(241,217,154,.22); border-radius: 18px; }
.esquina { position: absolute; color: #f1d99a; font-size: 34px; line-height: 1; }
.centro { position: absolute; left: 0; right: 0; text-align: center; }
.k { font-size: 22px; letter-spacing: .36em; text-transform: uppercase; color: #b7a5ff; }
.etq { font-size: 24px; letter-spacing: .28em; text-transform: uppercase; }
`;

function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350">${Array.from({ length: 80 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`).join("")}</svg>`;
}
const esquinas = `<span class="esquina" style="top:48px;left:52px">✦</span><span class="esquina" style="top:48px;right:52px">✦</span><span class="esquina" style="bottom:48px;left:52px">✦</span><span class="esquina" style="bottom:48px;right:52px">✦</span>`;
const envolver = (i, fondo, cuerpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="lienzo" style="background:${fondo}">${estrellas(13 + i * 37)}<div class="marco"></div>${esquinas}${cuerpo}</div></body></html>`;
const FONDO = "radial-gradient(ellipse at 50% 30%, #2a1a5e 0%, #160d33 58%, #0b0716 100%)";

const portada = () => envolver(0, FONDO, `
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Palabras que cambian</p>
  <div style="position:absolute;left:90px;right:90px;top:250px;height:700px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:40px">
    <p style="font-family:Cormorant;font-weight:600;font-size:110px;line-height:1.02;color:#f1d99a;text-shadow:0 0 50px rgba(241,217,154,.3)">La frase que tu signo debe dejar de decir</p>
    <div style="width:140px;height:2px;background:rgba(241,217,154,.5)"></div>
    <p style="font-size:38px;line-height:1.4">Lo que repites cada día se vuelve tu forma de mirar la vida.</p>
  </div>
  <p class="centro" style="bottom:200px;font-family:Cormorant;font-style:italic;font-size:44px;color:#b7a5ff">Desliza y busca la tuya →</p>
  <p class="centro" style="bottom:72px;font-size:24px;color:#b7a5ff">Tu horóscopo de hoy en <b style="color:#f1d99a">miarcana.com</b></p>`);

const lamina = (g, i) => {
  const a = ELEMENTO[g.elemento];
  return envolver(i + 1, `radial-gradient(ellipse at 50% 22%, ${a}33 0%, #2a1a5e 30%, #160d33 60%, #0b0716 100%)`, `
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Palabras que cambian</p>
  <div style="position:absolute;left:50%;top:136px;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;box-shadow:0 0 80px ${a}66, 0 0 0 3px rgba(241,217,154,.7)">
    <img src="file://${RAIZ}/public/signos/${g.id}.webp" style="width:100%;height:100%;border-radius:50%;object-fit:cover" />
  </div>
  <p class="centro" style="top:360px;font-size:26px;letter-spacing:.22em;text-transform:uppercase;color:${a}">${g.nombre} · ${g.fechas}</p>
  <div style="position:absolute;left:110px;right:110px;top:440px;display:flex;flex-direction:column;align-items:center;text-align:center">
    <p class="etq" style="color:#9d8fc4">Deja de decir</p>
    <p style="margin-top:14px;font-family:Cormorant;font-weight:600;font-size:72px;line-height:1.05;color:#9d8fc4;text-decoration:line-through;text-decoration-thickness:3px;text-decoration-color:rgba(232,128,106,.8)">«${g.deja}»</p>
    <p style="margin:34px 0 26px;font-size:46px;color:#f1d99a">↓</p>
    <p class="etq" style="color:${a}">Empieza a decir</p>
    <p style="margin-top:14px;font-family:Cormorant;font-weight:600;font-size:84px;line-height:1.05;color:#f1d99a;text-shadow:0 0 40px rgba(241,217,154,.3)">«${g.empieza}»</p>
  </div>
  <p class="centro" style="bottom:150px;padding:0 130px;font-family:Cormorant;font-style:italic;font-size:42px;line-height:1.25;color:#ece6f7">${g.porque}</p>
  <p class="centro" style="bottom:72px;font-size:24px;color:#b7a5ff">Tu horóscopo de hoy en <b style="color:#f1d99a">miarcana.com</b></p>`);
};

const cierre = () => envolver(13, FONDO, `
  <p class="centro k" style="top:84px"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Palabras que cambian</p>
  <div style="position:absolute;left:90px;right:90px;top:220px;height:760px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:44px">
    <p style="font-family:Cormorant;font-weight:600;font-size:100px;line-height:1.05;color:#f1d99a">¿Cuál te tocó más?</p>
    <p style="font-size:40px;line-height:1.4">Escribe en los comentarios tu signo y la frase que vas a empezar a decir.</p>
    <p style="font-size:34px;line-height:1.4;color:#b7a5ff">Y etiqueta a esa persona que necesita leer la suya.</p>
  </div>
  <div style="position:absolute;left:210px;right:210px;bottom:150px;padding:22px 20px 26px;border-radius:999px;border:2px solid #f1d99a;text-align:center;background:rgba(11,7,22,.55)">
    <p style="font-size:42px;font-weight:600;color:#f1d99a">miarcana.com</p>
    <p style="font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:#b7a5ff;margin-top:4px">Tu horóscopo y tu carta del día, gratis</p>
  </div>`);

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  const piezas = [portada(), ...SIGNOS.map(lamina), cierre()];
  for (const [i, html] of piezas.entries()) {
    writeFileSync(tmp, html);
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: join(SALIDA, `${String(i + 1).padStart(2, "0")}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log(`${piezas.length} láminas en ${SALIDA}`);
})();
