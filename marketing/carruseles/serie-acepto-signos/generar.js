// Serie «ACEPTO» de noviembre: una tarjeta por signo (1080×1350) para Facebook, el grupo e Instagram.
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/serie-acepto-signos/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

// Color de acento por elemento.
const ELEMENTO = { fuego: "#f2a65a", tierra: "#8fd19e", aire: "#b7c8ff", agua: "#7fc4f0" };

const SIGNOS = [
  { id: "aries", nombre: "Aries", fechas: "21 mar – 19 abr", elemento: "fuego", titulo: "Aries, respira.", texto: "Lo que vienes empujando empieza a moverse sin que tengas que pelearlo. Este noviembre la puerta se abre justo cuando bajas el ritmo." },
  { id: "tauro", nombre: "Tauro", fechas: "20 abr – 20 may", elemento: "tierra", titulo: "Tauro, tranquilo.", texto: "Lo que construiste con paciencia empieza a dar fruto. Este mes llega una entrada que no esperabas, y es tuya porque la sembraste." },
  { id: "geminis", nombre: "Géminis", fechas: "21 may – 20 jun", elemento: "aire", titulo: "Géminis, escucha.", texto: "La conversación que tenías pendiente por fin se da, y te deja en paz. Lo que se dice este noviembre te abre un camino nuevo." },
  { id: "cancer", nombre: "Cáncer", fechas: "21 jun – 22 jul", elemento: "agua", titulo: "Cáncer, suelta.", texto: "No tienes que cuidar a todos para que te quieran. Este mes alguien te devuelve, sin que lo pidas, todo el cariño que das." },
  { id: "leo", nombre: "Leo", fechas: "23 jul – 22 ago", elemento: "fuego", titulo: "Leo, brilla.", texto: "Lo que hiciste en silencio por fin se nota. Este noviembre te reconocen justo donde menos lo esperabas." },
  { id: "virgo", nombre: "Virgo", fechas: "23 ago – 22 sep", elemento: "tierra", titulo: "Virgo, confía.", texto: "No todo tiene que estar perfecto para empezar. Lo que dejas fluir este mes se ordena solo, y mejor de lo que planeaste." },
  { id: "libra", nombre: "Libra", fechas: "23 sep – 22 oct", elemento: "aire", titulo: "Libra, decide.", texto: "La duda que te quitaba el sueño se aclara. Este noviembre eliges con el corazón, y esta vez el corazón acierta." },
  { id: "escorpio", nombre: "Escorpio", fechas: "23 oct – 21 nov", elemento: "agua", titulo: "Escorpio, tranquilo.", texto: "El Sol está en tu signo: es tu año nuevo personal. Lo que soltaste no vuelve, y lo que viene es mucho mejor." },
  { id: "sagitario", nombre: "Sagitario", fechas: "22 nov – 21 dic", elemento: "fuego", titulo: "Sagitario, prepárate.", texto: "El 22 de noviembre el Sol llega a tu signo y empieza tu temporada. Una persona, un viaje o una idea nueva te cambia el rumbo." },
  { id: "capricornio", nombre: "Capricornio", fechas: "22 dic – 19 ene", elemento: "tierra", titulo: "Capricornio, descansa.", texto: "Ya hiciste suficiente este año. Este mes la recompensa llega sin que tengas que exigirte más." },
  { id: "acuario", nombre: "Acuario", fechas: "20 ene – 18 feb", elemento: "aire", titulo: "Acuario, atrévete.", texto: "Esa idea que nadie entendía empieza a tener sentido para otros. Este noviembre alguien apuesta por ti." },
  { id: "piscis", nombre: "Piscis", fechas: "19 feb – 20 mar", elemento: "agua", titulo: "Piscis, cree.", texto: "Tu intuición no se equivocó. Lo que soñaste este año empieza a tomar forma antes de diciembre." },
];

const CSS = `
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-SemiBold.ttf")}"); font-weight: 600; }
@font-face { font-family: Cormorant; src: url("${fuente("CormorantGaramond-Italic.ttf")}"); font-style: italic; }
@font-face { font-family: Inter; src: url("${fuente("Inter-Regular.ttf")}"); font-weight: 400; }
@font-face { font-family: Inter; src: url("${fuente("Inter-SemiBold.ttf")}"); font-weight: 600; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: #0b0716; color: #ece6f7; font-family: Inter, sans-serif; }
.lienzo { position: relative; width: 1080px; height: 1350px; overflow: hidden; }
.marco { position: absolute; inset: 34px; border: 2px solid rgba(241,217,154,.55); border-radius: 26px; }
.marco::after { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(241,217,154,.22); border-radius: 18px; }
.esquina { position: absolute; color: #f1d99a; font-size: 34px; line-height: 1; }
.centro { position: absolute; left: 0; right: 0; text-align: center; }
`;

function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350">${Array.from({ length: 80 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`).join("")}</svg>`;
}

const tarjeta = (g, i) => {
  const acento = ELEMENTO[g.elemento];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="lienzo" style="background: radial-gradient(ellipse at 50% 28%, ${acento}33 0%, #2a1a5e 30%, #160d33 60%, #0b0716 100%);">
    ${estrellas(31 + i * 53)}
    <div class="marco"></div>
    <span class="esquina" style="top:48px;left:52px">✦</span><span class="esquina" style="top:48px;right:52px">✦</span>
    <span class="esquina" style="bottom:48px;left:52px">✦</span><span class="esquina" style="bottom:48px;right:52px">✦</span>
    <p class="centro" style="top:74px;font-size:22px;letter-spacing:.38em;text-transform:uppercase;color:#b7a5ff"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Noviembre</p>
    <div style="position:absolute;left:50%;top:140px;transform:translateX(-50%);width:270px;height:270px;border-radius:50%;box-shadow:0 0 90px ${acento}66, 0 0 0 3px rgba(241,217,154,.7)">
      <img src="file://${RAIZ}/public/signos/${g.id}.webp" style="width:100%;height:100%;border-radius:50%;object-fit:cover" />
    </div>
    <p class="centro" style="top:432px;font-size:24px;letter-spacing:.2em;text-transform:uppercase;color:${acento}">${g.nombre} · ${g.fechas}</p>
    <h1 class="centro" style="top:478px;padding:0 70px;font-family:Cormorant;font-weight:600;font-size:104px;line-height:1;color:#f1d99a;text-shadow:0 0 40px rgba(241,217,154,.25)">${g.titulo}</h1>
    <p class="centro" style="top:640px;padding:0 110px;font-size:40px;line-height:1.4;color:#ece6f7">${g.texto}</p>
    <div style="position:absolute;left:150px;right:150px;bottom:150px;border:2px solid rgba(241,217,154,.6);border-radius:28px;padding:26px 20px 30px;text-align:center;background:rgba(11,7,22,.55)">
      <p style="font-size:28px;color:#b7a5ff">Si lo recibes, escribe:</p>
      <p style="font-family:Cormorant;font-weight:600;font-size:96px;line-height:1.05;letter-spacing:.12em;color:#f1d99a;text-shadow:0 0 30px rgba(241,217,154,.35)">ACEPTO</p>
    </div>
    <p class="centro" style="bottom:72px;font-size:24px;color:#b7a5ff">Tu horóscopo de hoy en <b style="color:#f1d99a">miarcana.com</b></p>
  </div></body></html>`;
};

(async () => {
  mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = join(SALIDA, "_pieza.html");
  for (const [i, g] of SIGNOS.entries()) {
    writeFileSync(tmp, tarjeta(g, i));
    await p.goto(`file://${tmp}`, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: join(SALIDA, `${String(i + 1).padStart(2, "0")}-${g.id}.png`) });
  }
  rmSync(tmp, { force: true });
  await b.close();
  console.log(`${SIGNOS.length} tarjetas en ${SALIDA}`);
})();
