// Serie «DECRETADO» de noviembre: una tarjeta por signo (1080×1350), cada una con su número, su decreto
// y un dato real del cielo de noviembre de 2026 (efemérides de Arcana).
// Uso: NODE_PATH=$(npm root -g) node marketing/carruseles/serie-decretado-signos/generar.js [carpeta de salida]
const { chromium } = require("playwright");
const { mkdirSync, writeFileSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const RAIZ = join(__dirname, "../../..");
const SALIDA = process.argv[2] || join(__dirname, "laminas");
const fuente = (f) => `file://${RAIZ}/src/app/fuentes/${f}`;

const ELEMENTO = { fuego: "#f2a65a", tierra: "#8fd19e", aire: "#b7c8ff", agua: "#7fc4f0" };

// Cielo de noviembre 2026: Mercurio directo el 14 y Venus directa el 15 (en Libra); Marte y Júpiter juntos
// en Leo a mediados de mes; Luna nueva en Escorpio el 9; Luna llena en Géminis el 24; Sol a Sagitario el 22.
const SIGNOS = [
  { id: "aries", nombre: "Aries", fechas: "21 mar – 19 abr", elemento: "fuego", numero: "111", decreto: "Lo que empiezo este mes, lo termino con alegría.", cielo: "Marte y Júpiter se juntan en Leo y encienden tu casa del amor y la alegría." },
  { id: "tauro", nombre: "Tauro", fechas: "20 abr – 20 may", elemento: "tierra", numero: "888", decreto: "Recibo lo que vale mi esfuerzo, y lo recibo en paz.", cielo: "Venus, tu regente, retoma el paso el 15 de noviembre: lo que estaba trabado avanza." },
  { id: "geminis", nombre: "Géminis", fechas: "21 may – 20 jun", elemento: "aire", numero: "1212", decreto: "Digo lo que siento, y se me abren caminos.", cielo: "La Luna llena del 24 de noviembre es en tu signo: algo que esperabas se ilumina." },
  { id: "cancer", nombre: "Cáncer", fechas: "21 jun – 22 jul", elemento: "agua", numero: "222", decreto: "Me quieren como yo quiero: de verdad y sin esfuerzo.", cielo: "El Sol en Escorpio pasa por tu casa del amor: temporada de alegrías del corazón." },
  { id: "leo", nombre: "Leo", fechas: "23 jul – 22 ago", elemento: "fuego", numero: "777", decreto: "Mi fuerza abre puertas, y entro con el corazón.", cielo: "Marte y Júpiter se juntan en tu signo a mediados de mes: tu momento de brillar." },
  { id: "virgo", nombre: "Virgo", fechas: "23 ago – 22 sep", elemento: "tierra", numero: "444", decreto: "Lo pendiente se resuelve, y lo nuevo llega en orden.", cielo: "Mercurio, tu regente, vuelve a caminar derecho el 14 de noviembre." },
  { id: "libra", nombre: "Libra", fechas: "23 sep – 22 oct", elemento: "aire", numero: "1010", decreto: "Vuelvo a mí, y desde ahí todo se acomoda.", cielo: "Venus retoma su paso en tu signo el 15 de noviembre: el amor propio manda." },
  { id: "escorpio", nombre: "Escorpio", fechas: "23 oct – 21 nov", elemento: "agua", numero: "1111", decreto: "Mi año nuevo empieza ahora, y empieza bien.", cielo: "La Luna nueva del 9 de noviembre es en tu signo: siembra tu deseo más grande." },
  { id: "sagitario", nombre: "Sagitario", fechas: "22 nov – 21 dic", elemento: "fuego", numero: "555", decreto: "El cambio que pedí ya viene en camino.", cielo: "El 22 de noviembre el Sol llega a tu signo y empieza tu temporada." },
  { id: "capricornio", nombre: "Capricornio", fechas: "22 dic – 19 ene", elemento: "tierra", numero: "333", decreto: "No camino solo: la ayuda llega a tiempo.", cielo: "El Sol en Escorpio pasa por tu casa de los amigos: alguien te tiende la mano." },
  { id: "acuario", nombre: "Acuario", fechas: "20 ene – 18 feb", elemento: "aire", numero: "1234", decreto: "Paso a paso, lo que sueño se hace real.", cielo: "Marte y Júpiter en Leo, frente a tu signo, mueven tus relaciones: llegan aliados." },
  { id: "piscis", nombre: "Piscis", fechas: "19 feb – 20 mar", elemento: "agua", numero: "999", decreto: "Cierro lo que pesa y me abro a lo que sí es para mí.", cielo: "El Sol en Escorpio te mira en trígono: lo que empieces ahora va con el agua a favor." },
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
`;

function estrellas(semilla) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return `<svg style="position:absolute;inset:0" viewBox="0 0 1080 1350">${Array.from({ length: 80 }, () => `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * 1350).toFixed(0)}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#fff6d8" fill-opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`).join("")}</svg>`;
}

const tarjeta = (g, i) => {
  const acento = ELEMENTO[g.elemento];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
  <div class="lienzo" style="background: radial-gradient(ellipse at 50% 24%, ${acento}33 0%, #2a1a5e 30%, #160d33 60%, #0b0716 100%);">
    ${estrellas(77 + i * 41)}
    <div class="marco"></div>
    <span class="esquina" style="top:48px;left:52px">✦</span><span class="esquina" style="top:48px;right:52px">✦</span>
    <span class="esquina" style="bottom:48px;left:52px">✦</span><span class="esquina" style="bottom:48px;right:52px">✦</span>
    <p class="centro" style="top:74px;font-size:22px;letter-spacing:.38em;text-transform:uppercase;color:#b7a5ff"><b style="color:#f1d99a;font-weight:600">Arcana</b> · Decreto de noviembre</p>
    <div style="position:absolute;left:50%;top:132px;transform:translateX(-50%);width:220px;height:220px;border-radius:50%;box-shadow:0 0 80px ${acento}66, 0 0 0 3px rgba(241,217,154,.7)">
      <img src="file://${RAIZ}/public/signos/${g.id}.webp" style="width:100%;height:100%;border-radius:50%;object-fit:cover" />
    </div>
    <p class="centro" style="top:380px;font-size:24px;letter-spacing:.2em;text-transform:uppercase;color:${acento}">${g.nombre} · ${g.fechas}</p>
    <div style="position:absolute;left:90px;right:90px;top:430px;height:500px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:34px">
      <h1 style="font-family:Cormorant;font-weight:600;font-size:80px;line-height:1.05;color:#f1d99a;text-shadow:0 0 40px rgba(241,217,154,.25)">«${g.decreto}»</h1>
      <div style="width:120px;height:2px;background:rgba(241,217,154,.5)"></div>
      <p style="font-size:33px;line-height:1.4;color:#ece6f7;padding:0 20px"><b style="color:${acento};font-weight:600">El cielo:</b> ${g.cielo}</p>
    </div>
    <div style="position:absolute;left:170px;right:170px;bottom:140px;border:2px solid rgba(241,217,154,.6);border-radius:28px;padding:22px 20px 26px;text-align:center;background:rgba(11,7,22,.55)">
      <p style="font-size:28px;color:#b7a5ff">Si es para ti, comenta:</p>
      <p style="font-family:Cormorant;font-weight:600;font-size:76px;line-height:1.05;letter-spacing:.06em;color:#f1d99a;text-shadow:0 0 30px rgba(241,217,154,.35)">DECRETADO ${g.numero}</p>
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
