// Piezas de la campaña de anuncios de Arcana (noviembre 2026): imagen 1080×1080
// (feed) y 1080×1920 (historias y reels) por anuncio, con las cartas ilustradas
// y las monedas de los signos reales. Las dibuja como SVG y resvg las pasa a PNG.
//
// Uso (desde la raíz del repo):
//   npm i --no-save @resvg/resvg-wasm
//   node marketing/anuncios/generar.mjs marketing/anuncios/2026-11
//
// Los enlaces van con utm (utm_source=meta-ads, utm_medium=<línea>,
// utm_campaign=<anuncio>): el proxy los guarda en la cookie de origen y quedan
// en «Por dónde llegan» (/admin/resumen) con cada cuenta y cada compra.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import sharp from "sharp";

const SALIDA = process.argv[2] ?? "marketing/anuncios/2026-11";
const req = createRequire(join(process.cwd(), "package.json"));
const { initWasm, Resvg } = await import(process.env.RESVG_MODULO ?? "@resvg/resvg-wasm");
await initWasm(await readFile(process.env.RESVG_WASM ?? req.resolve("@resvg/resvg-wasm/index_bg.wasm")));
const fuentes = await Promise.all(["CormorantGaramond-SemiBold.ttf", "CormorantGaramond-Italic.ttf", "Inter-Medium.ttf", "Inter-SemiBold.ttf"].map((f) => readFile(join("src/app/fuentes", f))));

const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const imagen = async (ruta, alto) => `data:image/png;base64,${(await sharp(await readFile(ruta)).resize({ height: alto }).png().toBuffer()).toString("base64")}`;
const carta = (id, alto = 600) => imagen(join("public/cartas/arcana", `${id}.webp`), alto);
const signo = (id, lado = 300) => imagen(join("public/signos", `${id}.webp`), lado);

export const ANUNCIOS = [
  { id: "meta-test-1", linea: "test", destino: "que-carta-eres", etiqueta: "Test gratis · 1 minuto", titulo: "¿Qué carta del tarot eres?", texto: "6 preguntas para descubrir tu arcano mayor: tu esencia, tu don y tu reto.", boton: "Hacer el test gratis", visual: { tipo: "abanico", cartas: ["el-viajero", "la-estrella", "el-sol"] } },
  { id: "meta-test-2", linea: "test", destino: "alma-vieja", etiqueta: "Test gratis · 1 minuto", titulo: "¿Eres alma vieja?", texto: "7 preguntas para descubrir la edad de tu alma: nueva, joven, madura, vieja o ancestral.", boton: "Hacer el test gratis", visual: { tipo: "una", cartas: ["la-sibila"] } },
  { id: "meta-dia-1", linea: "carta-dia", destino: "registro", etiqueta: "Gratis cada día", titulo: "Tu carta del día, leída por Sibila", texto: "Crea tu cuenta gratis y recibe 3 créditos de regalo para tu primera lectura.", boton: "Sacar mi carta", visual: { tipo: "una", cartas: ["la-estrella"] } },
  { id: "meta-dia-2", linea: "carta-dia", destino: "registro", etiqueta: "Tarot en español", titulo: "¿Qué te dicen las cartas hoy?", texto: "Elige tus cartas del abanico y Sibila te las lee con tu pregunta. La carta del día es gratis.", boton: "Sacar mi carta", visual: { tipo: "abanico", cartas: ["la-luna", "el-encuentro", "la-rueda-del-cielo"] } },
  { id: "meta-astral-1", linea: "astral", destino: "registro", etiqueta: "Carta astral", titulo: "Tu Sol, tu Luna y tu Ascendente", texto: "Calcula tu carta astral con tu fecha, hora y ciudad. La vista previa es gratis.", boton: "Ver mi carta astral", visual: { tipo: "signos", signos: ["leo", "cancer", "escorpio"] } },
  { id: "meta-astral-2", linea: "astral", destino: "registro", etiqueta: "Carta astral", titulo: "¿Por qué eres como eres?", texto: "Tu carta astral explicada casa por casa, con las posiciones reales del cielo del día en que naciste.", boton: "Ver mi carta astral", visual: { tipo: "signos", signos: ["piscis", "aries", "virgo"] } },
];

export const enlace = (a) => `https://miarcana.com/${a.destino}?utm_source=meta-ads&utm_medium=${a.linea}&utm_campaign=${a.id}`;

function renglones(texto, max, maxR) {
  const r = [];
  let actual = "";
  for (const p of texto.split(/\s+/)) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (prueba.length <= max || !actual) actual = prueba;
    else { r.push(actual); actual = p; }
  }
  if (actual) r.push(actual);
  return r.length <= maxR ? r : null;
}

function bloque(t, o) {
  let tam = o.max;
  let l = null;
  for (; tam >= o.min; tam -= 2) { l = renglones(t, Math.floor(o.ancho / (tam * o.factor)), o.maxR); if (l) break; }
  if (!l) { tam = o.min; l = (renglones(t, Math.floor(o.ancho / (tam * o.factor)), 99) ?? [t]).slice(0, o.maxR); }
  const il = o.interlinea ?? 1.12;
  const anchor = o.centro ? ` text-anchor="middle"` : "";
  return {
    svg: `<text${anchor} font-family="${o.familia}" font-weight="${o.peso}"${o.italica ? ` font-style="italic"` : ""} font-size="${tam}" fill="${o.color}">${l.map((r, i) => `<tspan x="${o.x}" y="${(o.y + tam * 0.85 + i * tam * il).toFixed(0)}">${esc(r)}</tspan>`).join("")}</text>`,
    alto: l.length * tam * il,
  };
}

// Estrellas fijas (misma semilla para todas las piezas).
function estrellas(W, H) {
  let s = 7;
  const azar = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: 70 }, () => `<circle cx="${(azar() * W).toFixed(0)}" cy="${(azar() * H).toFixed(0)}" r="${(0.8 + azar() * 1.8).toFixed(1)}" fill="#f1d99a" opacity="${(0.15 + azar() * 0.5).toFixed(2)}"/>`).join("");
}

async function visual(v, cx, cy, escala) {
  if (v.tipo === "una") {
    const h = 520 * escala, w = h * (2 / 3);
    return `<g filter="url(#sombra)"><image href="${await carta(v.cartas[0])}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}"/></g><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="14" fill="none" stroke="#d9b45a" stroke-width="3"/>`;
  }
  if (v.tipo === "abanico") {
    const h = 430 * escala, w = h * (2 / 3);
    const partes = [];
    for (const [i, id] of v.cartas.entries()) {
      const ang = (i - 1) * 14, dx = (i - 1) * w * 0.62, dy = Math.abs(i - 1) * 26 * escala;
      partes.push(`<g transform="rotate(${ang} ${cx + dx} ${cy + dy + h})" filter="url(#sombra)"><image href="${await carta(id)}" x="${cx + dx - w / 2}" y="${cy + dy - h / 2}" width="${w}" height="${h}"/><rect x="${cx + dx - w / 2}" y="${cy + dy - h / 2}" width="${w}" height="${h}" rx="12" fill="none" stroke="#d9b45a" stroke-width="3"/></g>`);
    }
    return [partes[0], partes[2], partes[1]].join("");
  }
  const lado = 250 * escala;
  const pos = [[-1, 0.18], [0, -0.12], [1, 0.18]];
  const partes = [];
  for (const [i, id] of v.signos.entries()) {
    const [px, py] = pos[i];
    partes.push(`<image href="${await signo(id, Math.round(lado))}" x="${cx + px * lado * 1.02 - lado / 2}" y="${cy + py * lado - lado / 2}" width="${lado}" height="${lado}" filter="url(#sombra)"/>`);
  }
  return `<circle cx="${cx}" cy="${cy}" r="${lado * 1.75}" fill="none" stroke="#d9b45a" stroke-opacity=".35" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${lado * 1.45}" fill="none" stroke="#8b6cf6" stroke-opacity=".3" stroke-width="2" stroke-dasharray="6 10"/>` + partes.join("");
}

async function pieza(a, formato) {
  const W = 1080, H = formato === "cuadrado" ? 1080 : 1920;
  const cuadrado = formato === "cuadrado";
  // Vertical: lo importante entre y=250 y y≈1500 (arriba y abajo los tapan los controles de historias y reels).
  const yVisual = cuadrado ? 330 : 640, escala = cuadrado ? 0.78 : 1.0;
  const yEtiqueta = cuadrado ? 610 : 985;
  const titulo = bloque(a.titulo, { x: 540, y: yEtiqueta + 46, ancho: 940, max: cuadrado ? 78 : 86, min: 54, maxR: 2, factor: 0.42, color: "#f1d99a", familia: "Cormorant Garamond", peso: 600, centro: true, interlinea: 1.02 });
  const yTexto = yEtiqueta + 46 + titulo.alto + (cuadrado ? 26 : 30);
  const texto = bloque(a.texto, { x: 540, y: yTexto, ancho: 860, max: cuadrado ? 30 : 34, min: 24, maxR: 3, factor: 0.52, color: "#ece6f7", familia: "Inter", peso: 500, centro: true, interlinea: 1.35 });
  const yBoton = yTexto + texto.alto + (cuadrado ? 26 : 40);
  const altoBoton = cuadrado ? 76 : 88;
  const anchoBoton = Math.max(380, a.boton.length * 21 + 120);
  const yPie = yBoton + altoBoton + (cuadrado ? 58 : 80);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="halo" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#3b2470"/><stop offset=".55" stop-color="#1a1032"/><stop offset="1" stop-color="#0b0716"/></radialGradient>
    <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000" flood-opacity=".55"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  ${estrellas(W, H)}
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="28" fill="none" stroke="#d9b45a" stroke-opacity=".35" stroke-width="2"/>
  ${await visual(a.visual, 540, yVisual, escala)}
  <text x="540" y="${yEtiqueta}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="${cuadrado ? 24 : 28}" letter-spacing="5" fill="#b7a5ff">${esc(a.etiqueta.toUpperCase())}</text>
  ${titulo.svg}
  ${texto.svg}
  <rect x="${540 - anchoBoton / 2}" y="${yBoton}" width="${anchoBoton}" height="${cuadrado ? 76 : 88}" rx="${cuadrado ? 38 : 44}" fill="#d9b45a"/>
  <text x="540" y="${yBoton + (cuadrado ? 49 : 57)}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="${cuadrado ? 30 : 34}" fill="#0b0716">${esc(a.boton)}</text>
  <text x="540" y="${yPie}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="${cuadrado ? 34 : 44}" fill="#f1d99a">Arcana <tspan font-style="italic" font-size="${cuadrado ? 26 : 32}" fill="#a89fc0">· miarcana.com</tspan></text>
</svg>`;
}

await mkdir(SALIDA, { recursive: true });
for (const a of ANUNCIOS) {
  for (const f of ["cuadrado", "vertical"]) {
    const svg = await pieza(a, f);
    const png = new Resvg(svg, { font: { fontBuffers: fuentes, loadSystemFonts: false, defaultFontFamily: "Inter" }, fitTo: { mode: "width", value: 1080 } }).render().asPng();
    // JPG de alta calidad: las cartas son ilustraciones y en PNG pesan ~1 MB cada una.
    await writeFile(join(SALIDA, `${a.id}-${f === "cuadrado" ? "1080x1080" : "1080x1920"}.jpg`), await sharp(png).jpeg({ quality: 90, mozjpeg: true }).toBuffer());
  }
  console.log(a.id, enlace(a));
}
