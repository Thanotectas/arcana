import "server-only";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import * as fontkit from "fontkit";
import { NOMBRES_CUERPO, SIMBOLOS_CUERPO, posiciones, type Cuerpo } from "@/lib/astro/efemerides";
import { calcularAspectos, localAUtc, type DatosNacimiento, type TipoAspecto } from "@/lib/astro/carta";
import { calcularSinastria } from "@/lib/astro/sinastria";
import { SIGNOS, signoPorLongitud, type Elemento } from "@/lib/zodiaco";

/**
 * Rueda astral que se dibuja sola, para los reels del agente de redes: el
 * anillo, los doce signos, los planetas uno por uno (con su nombre y su signo
 * debajo) y al final los hilos de los aspectos. Cada fotograma es un SVG que
 * sharp convierte en PNG; los glifos y los textos van como trazos (fontkit),
 * así no dependen de las fuentes instaladas en el servidor. ffmpeg superpone
 * la secuencia sobre el fondo del reel (`reel-publicacion.tsx`).
 *
 * - astral: el cielo de una fecha (mediodía en Bogotá), sin casas.
 * - sinastria: dos fechas de ejemplo, los planetas de cada una en un anillo
 *   (oro y violeta) y los aspectos cruzados, con la afinidad al final.
 */
export type RuedaAnimada = { tipo: "astral"; fecha: string } | { tipo: "sinastria"; a: string; b: string };

/** Lienzo de la secuencia: la rueda centrada arriba y la leyenda debajo. */
export const LIENZO = { ancho: 1080, alto: 1200, centro: 540 };
const C = LIENZO.centro;
const R_EXTERIOR = 440;
const R_BANDA = 372;

const COLOR_ELEMENTO: Record<Elemento, string> = { fuego: "#ff8a5b", tierra: "#9ad07f", aire: "#8fc7ff", agua: "#b28dff" };
const COLOR_ASPECTO: Record<TipoAspecto, string> = { conjuncion: "#f1d99a", trigono: "#8fc7ff", sextil: "#8fc7ff", cuadratura: "#ff7b9c", oposicion: "#ff7b9c" };
const ORO = "#f1d99a";
const VIOLETA = "#b7a5ff";
const ROSA = "#f28dc4";
const ORDEN: Cuerpo[] = ["sol", "luna", "mercurio", "venus", "marte", "jupiter", "saturno", "urano", "neptuno", "pluton"];
const BOGOTA = { lugar: "Bogotá", latitud: 4.711, longitud: -74.0721, zonaHoraria: "America/Bogota" };

// ───────────────────────── Glifos y textos como trazos ─────────────────────────

let fuentes: { astro: fontkit.Font; simbolos: fontkit.Font; texto: fontkit.Font } | null = null;
/** Planetas y signos: Noto Sans Symbols (OFL); lo que no tiene (☉) sale de Noto Sans Symbols 2. */
function fuente(tipo: "simbolos" | "texto", texto: string) {
  const leer = (archivo: string) => fontkit.create(readFileSync(join(process.cwd(), "src/app/fuentes", archivo)));
  fuentes ??= { astro: leer("NotoSansSymbols-Astro.woff2"), simbolos: leer("NotoSansSymbols2.ttf"), texto: leer("Inter-SemiBold.ttf") };
  if (tipo === "texto") return fuentes.texto;
  return [...texto].every((c) => fuentes!.astro.hasGlyphForCodePoint(c.codePointAt(0)!)) ? fuentes.astro : fuentes.simbolos;
}

const cacheTrazos = new Map<string, { d: string; ancho: number }>();
/** Trazos de un texto a 1 px por unidad de em (se escalan al dibujar). */
function trazos(tipo: "simbolos" | "texto", texto: string) {
  const clave = `${tipo}|${texto}`;
  const guardado = cacheTrazos.get(clave);
  if (guardado) return guardado;
  const f = fuente(tipo, texto);
  const corrida = f.layout(texto);
  const escala = 1 / f.unitsPerEm;
  let avance = 0;
  const partes: string[] = [];
  corrida.glyphs.forEach((g, i) => {
    const p = corrida.positions[i];
    const d = g.path.toSVG();
    if (d) partes.push(`<path transform="translate(${((avance + p.xOffset) * escala).toFixed(4)} ${(-p.yOffset * escala).toFixed(4)}) scale(${escala} ${-escala})" d="${d}"/>`);
    avance += p.xAdvance;
  });
  const r = { d: partes.join(""), ancho: avance * escala };
  cacheTrazos.set(clave, r);
  return r;
}

/** Texto centrado en (x, y) (centro vertical aproximado), con escala y opacidad. */
function texto(tipo: "simbolos" | "texto", t: string, x: number, y: number, tamano: number, color: string, opacidad = 1, escala = 1) {
  if (opacidad <= 0.01) return "";
  const { d, ancho } = trazos(tipo, t);
  const s = tamano * escala;
  const base = y + s * (tipo === "simbolos" ? 0.36 : 0.35);
  return `<g fill="${color}" opacity="${opacidad.toFixed(3)}" transform="translate(${(x - (ancho * s) / 2).toFixed(1)} ${base.toFixed(1)}) scale(${s.toFixed(3)})">${d}</g>`;
}

// ───────────────────────── Geometría y tiempos ─────────────────────────

const RAD = Math.PI / 180;
/** Aries a la izquierda y el zodiaco en sentido antihorario, como en la rueda de la app. */
function punto(longitud: number, radio: number) {
  const a = (180 + longitud) * RAD;
  return { x: C + radio * Math.cos(a), y: C - radio * Math.sin(a) };
}
const suave = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const tramo = (s: number, inicio: number, dura: number) => suave((s - inicio) / dura);

/** Separa los glifos que caerían encima (relajación circular por pares). */
function separar(longitudes: number[], minimo: number) {
  const ang = [...longitudes];
  for (let vuelta = 0; vuelta < 60; vuelta++) {
    let movio = false;
    for (let i = 0; i < ang.length; i++) {
      for (let j = i + 1; j < ang.length; j++) {
        let d = ang[j] - ang[i];
        d = ((d + 540) % 360) - 180;
        if (Math.abs(d) < minimo) {
          const empuje = (minimo - Math.abs(d)) / 2 + 0.01;
          const signo = d >= 0 ? 1 : -1;
          ang[i] -= signo * empuje;
          ang[j] += signo * empuje;
          movio = true;
        }
      }
    }
    if (!movio) break;
  }
  return ang.map((a) => ((a % 360) + 360) % 360);
}

interface PlanetaRueda {
  cuerpo: Cuerpo;
  longitud: number;
  /** Ángulo donde va el glifo (separado de los vecinos). */
  glifo: number;
  radio: number;
  color: string;
  inicio: number;
}

interface Hilo {
  desde: number;
  hasta: number;
  color: string;
  inicio: number;
}

interface Guion {
  planetas: PlanetaRueda[];
  hilos: Hilo[];
  /** Radio del círculo donde nacen los hilos. */
  radioHilos: number;
  final: string;
  leyenda?: [string, string][];
  duracion: number;
}

function fechaCorta(fecha: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));
}

function guionAstral(fecha: string): Guion {
  const pos = posiciones(localAUtc(fecha, "12:00", BOGOTA.zonaHoraria)).filter((p) => ORDEN.includes(p.cuerpo));
  pos.sort((a, b) => ORDEN.indexOf(a.cuerpo) - ORDEN.indexOf(b.cuerpo));
  const glifos = separar(pos.map((p) => p.longitud), 10);
  const paso = 0.42;
  const planetas = pos.map((p, i) => ({ cuerpo: p.cuerpo, longitud: p.longitud, glifo: glifos[i], radio: 318, color: ORO, inicio: 2.2 + i * paso }));
  const inicioHilos = 2.2 + pos.length * paso + 0.2;
  const hilos = calcularAspectos(pos)
    .slice(0, 12)
    .map((a, k) => ({ desde: pos.find((p) => p.cuerpo === a.a)!.longitud, hasta: pos.find((p) => p.cuerpo === a.b)!.longitud, color: COLOR_ASPECTO[a.tipo], inicio: inicioHilos + k * 0.18 }));
  const fin = inicioHilos + Math.max(0, hilos.length - 1) * 0.18 + 0.6;
  return { planetas, hilos, radioHilos: 262, final: `El cielo del ${fechaCorta(fecha)}`, duracion: fin + 1.2 };
}

function guionSinastria(fechaA: string, fechaB: string): Guion {
  const datos = (nombre: string, fecha: string): DatosNacimiento => ({ nombre, fecha, hora: "12:00", horaDesconocida: true, ...BOGOTA });
  const resultado = calcularSinastria(datos("A", fechaA), datos("B", fechaB));
  const cuerpos = ORDEN.slice(0, 7);
  const de = (fecha: string) => {
    const pos = posiciones(localAUtc(fecha, "12:00", BOGOTA.zonaHoraria));
    return cuerpos.map((c) => pos.find((p) => p.cuerpo === c)!);
  };
  const pa = de(fechaA);
  const pb = de(fechaB);
  const ga = separar(pa.map((p) => p.longitud), 10);
  const gb = separar(pb.map((p) => p.longitud), 13);
  const paso = 0.32;
  const planetas = [
    ...pa.map((p, i) => ({ cuerpo: p.cuerpo, longitud: p.longitud, glifo: ga[i], radio: 322, color: ORO, inicio: 2.2 + i * paso })),
    ...pb.map((p, i) => ({ cuerpo: p.cuerpo, longitud: p.longitud, glifo: gb[i], radio: 246, color: ROSA, inicio: 2.4 + cuerpos.length * paso + i * paso })),
  ];
  const inicioHilos = 2.6 + cuerpos.length * 2 * paso;
  const lon = (lista: typeof pa, c: string) => lista.find((p) => p.cuerpo === c)?.longitud;
  const hilos = resultado.aspectos
    .filter((a) => a.a !== "ascendente" && a.b !== "ascendente" && lon(pa, a.a) !== undefined && lon(pb, a.b) !== undefined)
    .sort((x, y) => Math.abs(y.aporte) - Math.abs(x.aporte))
    .slice(0, 12)
    .map((a, k) => ({ desde: lon(pa, a.a)!, hasta: lon(pb, a.b)!, color: a.tipo === "conjuncion" ? ORO : a.aporte >= 0 ? "#8fc7ff" : "#ff7b9c", inicio: inicioHilos + k * 0.18 }));
  const fin = inicioHilos + Math.max(0, hilos.length - 1) * 0.18 + 0.6;
  return {
    planetas,
    hilos,
    radioHilos: 196,
    final: `Afinidad ${resultado.puntaje}%`,
    leyenda: [
      [ORO, "Primera persona"],
      [ROSA, "Segunda persona"],
    ],
    duracion: fin + 1.2,
  };
}

function guionDe(r: RuedaAnimada): Guion {
  return r.tipo === "astral" ? guionAstral(r.fecha) : guionSinastria(r.a, r.b);
}

// ───────────────────────── Fotograma ─────────────────────────

function circuloTrazado(radio: number, avance: number, color: string, grosor: number, opacidad = 1) {
  if (avance <= 0) return "";
  const largo = 2 * Math.PI * radio;
  return `<circle cx="${C}" cy="${C}" r="${radio}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-opacity="${opacidad}" stroke-dasharray="${largo.toFixed(1)}" stroke-dashoffset="${(largo * (1 - avance)).toFixed(1)}" transform="rotate(180 ${C} ${C})"/>`;
}

/** SVG del instante `s` (segundos). Sin leyenda si `conLeyenda` es false (tarjeta fija). */
function fotograma(g: Guion, s: number, conLeyenda = true): string {
  const partes: string[] = [];
  const anillo = tramo(s, 0.2, 1.2);
  const banda = tramo(s, 0.8, 1.0);

  // Banda de los signos: segmentos tenues del color del elemento.
  if (banda > 0) {
    SIGNOS.forEach((signo, i) => {
      const a0 = punto(i * 30, R_EXTERIOR);
      const a1 = punto((i + 1) * 30, R_EXTERIOR);
      const b1 = punto((i + 1) * 30, R_BANDA);
      const b0 = punto(i * 30, R_BANDA);
      partes.push(`<path d="M ${a0.x} ${a0.y} A ${R_EXTERIOR} ${R_EXTERIOR} 0 0 0 ${a1.x} ${a1.y} L ${b1.x} ${b1.y} A ${R_BANDA} ${R_BANDA} 0 0 1 ${b0.x} ${b0.y} Z" fill="${COLOR_ELEMENTO[signo.elemento]}" fill-opacity="${(0.13 * banda).toFixed(3)}"/>`);
      const l0 = punto(i * 30, R_BANDA);
      const l1 = punto(i * 30, R_EXTERIOR);
      partes.push(`<line x1="${l0.x}" y1="${l0.y}" x2="${l1.x}" y2="${l1.y}" stroke="#d9b45a" stroke-opacity="${(0.6 * banda).toFixed(3)}" stroke-width="1.5"/>`);
    });
    // Marcas cada 5°.
    for (let gr = 0; gr < 360; gr += 5) {
      const largo = gr % 30 === 0 ? 0 : gr % 10 === 0 ? 12 : 7;
      if (!largo) continue;
      const p0 = punto(gr, R_BANDA);
      const p1 = punto(gr, R_BANDA - largo);
      partes.push(`<line x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="#d9b45a" stroke-opacity="${(0.45 * banda).toFixed(3)}" stroke-width="1.2"/>`);
    }
  }
  partes.push(circuloTrazado(R_EXTERIOR, anillo, "#d9b45a", 4));
  partes.push(circuloTrazado(R_BANDA, anillo, "#d9b45a", 2));
  partes.push(circuloTrazado(g.radioHilos, tramo(s, 1.2, 1.0), VIOLETA, 1.5, 0.5));

  SIGNOS.forEach((signo, i) => {
    const a = tramo(s, 0.9 + i * 0.08, 0.35);
    const p = punto(i * 30 + 15, (R_EXTERIOR + R_BANDA) / 2);
    partes.push(texto("simbolos", signo.simbolo, p.x, p.y, 38, COLOR_ELEMENTO[signo.elemento], a, 1 + 0.5 * (1 - a)));
  });

  // Hilos (debajo de los planetas): crecen de un planeta al otro.
  for (const h of g.hilos) {
    const a = tramo(s, h.inicio, 0.55);
    if (a <= 0) continue;
    const p0 = punto(h.desde, g.radioHilos);
    const p1 = punto(h.hasta, g.radioHilos);
    const x = p0.x + (p1.x - p0.x) * a;
    const y = p0.y + (p1.y - p0.y) * a;
    const linea = `x1="${p0.x.toFixed(1)}" y1="${p0.y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${h.color}" stroke-linecap="round"`;
    // Resplandor ancho y tenue debajo, el hilo encima y una chispa en la punta mientras crece.
    partes.push(`<line ${linea} stroke-width="10" stroke-opacity="0.16"/>`, `<line ${linea} stroke-width="2.6" stroke-opacity="0.95"/>`);
    if (a < 1) partes.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${h.color}" fill-opacity="0.35"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#ffffff"/>`);
  }

  // Planetas: destello, marca en el grado exacto y glifo que aparece con un salto.
  for (const p of g.planetas) {
    const a = tramo(s, p.inicio, 0.35);
    if (a <= 0) continue;
    const exacto = punto(p.longitud, g.radioHilos);
    const marca = punto(p.longitud, R_BANDA);
    const glifo = punto(p.glifo, p.radio);
    partes.push(`<line x1="${marca.x.toFixed(1)}" y1="${marca.y.toFixed(1)}" x2="${glifo.x.toFixed(1)}" y2="${glifo.y.toFixed(1)}" stroke="${p.color}" stroke-opacity="${(0.45 * a).toFixed(3)}" stroke-width="1.2"/>`);
    partes.push(`<circle cx="${exacto.x.toFixed(1)}" cy="${exacto.y.toFixed(1)}" r="4" fill="${p.color}" opacity="${a.toFixed(3)}"/>`);
    const destello = tramo(s, p.inicio, 0.7);
    if (destello < 1) partes.push(`<circle cx="${glifo.x.toFixed(1)}" cy="${glifo.y.toFixed(1)}" r="${(28 + 46 * destello).toFixed(1)}" fill="none" stroke="${p.color}" stroke-width="3" stroke-opacity="${(0.8 * (1 - destello)).toFixed(3)}"/>`);
    const escala = 1 + 0.6 * (1 - a);
    partes.push(`<circle cx="${glifo.x.toFixed(1)}" cy="${glifo.y.toFixed(1)}" r="${(27 * escala).toFixed(1)}" fill="#150f26" fill-opacity="${(0.92 * a).toFixed(3)}" stroke="${p.color}" stroke-width="2" stroke-opacity="${a.toFixed(3)}"/>`);
    partes.push(texto("simbolos", SIMBOLOS_CUERPO[p.cuerpo], glifo.x, glifo.y, 30, p.color, a, escala));
  }

  if (conLeyenda) {
    const y = 1048;
    const ultimo = [...g.planetas].reverse().find((p) => s >= p.inicio);
    const finHilos = g.hilos.length ? g.hilos[g.hilos.length - 1].inicio + 0.6 : 0;
    if (s >= finHilos && g.hilos.length) {
      const a = tramo(s, finHilos, 0.4);
      partes.push(texto("texto", g.final, C, y, 52, ORO, a, 1 + 0.25 * (1 - a)));
    } else if (g.hilos.length && s >= g.hilos[0].inicio) {
      const a = tramo(s, g.hilos[0].inicio, 0.3);
      partes.push(texto("texto", "Los hilos entre los planetas", C, y, 40, "#ece6f7", a));
    } else if (ultimo) {
      const a = tramo(s, ultimo.inicio, 0.25);
      const signo = signoPorLongitud(ultimo.longitud);
      const linea = `${NOMBRES_CUERPO[ultimo.cuerpo]} en ${signo.nombre}`;
      const ancho = trazos("texto", linea).ancho * 44 + 64;
      partes.push(texto("simbolos", SIMBOLOS_CUERPO[ultimo.cuerpo], C - ancho / 2 + 16, y, 44, ultimo.color, a));
      partes.push(texto("texto", linea, C + 32, y, 44, "#ece6f7", a));
    }
    if (g.leyenda && s >= 2.2) {
      const a = tramo(s, 2.2, 0.5);
      g.leyenda.forEach(([color, nombre], i) => {
        const x = C + (i === 0 ? -200 : 200);
        partes.push(`<circle cx="${x - trazos("texto", nombre).ancho * 15 - 18}" cy="1122" r="8" fill="${color}" opacity="${a.toFixed(3)}"/>`);
        partes.push(texto("texto", nombre, x, 1122, 30, "#cfc3ee", a));
      });
    }
  }

  const alto = conLeyenda ? LIENZO.alto : LIENZO.ancho;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LIENZO.ancho}" height="${alto}" viewBox="0 0 ${LIENZO.ancho} ${alto}">${partes.join("")}</svg>`;
}

// ───────────────────────── Salidas ─────────────────────────

/**
 * Escribe la secuencia de PNG (transparente, LIENZO) en `dir/rueda` y
 * devuelve el patrón para ffmpeg y cuántos segundos dura.
 */
export async function cuadrosRueda(dir: string, r: RuedaAnimada, fps: number) {
  const g = guionDe(r);
  const carpeta = join(dir, "rueda");
  await mkdir(carpeta, { recursive: true });
  const total = Math.ceil(g.duracion * fps);
  const lote = 6;
  for (let i = 0; i < total; i += lote) {
    await Promise.all(
      Array.from({ length: Math.min(lote, total - i) }, async (_, k) => {
        const n = i + k;
        const png = await sharp(Buffer.from(fotograma(g, n / fps))).png({ compressionLevel: 1 }).toBuffer();
        await writeFile(join(carpeta, `c${String(n).padStart(4, "0")}.png`), png);
      }),
    );
  }
  return { patron: join(carpeta, "c%04d.png"), segundos: total / fps };
}

/** La rueda terminada (sin leyenda), cuadrada, como data URI PNG para la tarjeta fija. */
export async function ruedaTerminada(r: RuedaAnimada, lado: number) {
  const g = guionDe(r);
  const png = await sharp(Buffer.from(fotograma(g, g.duracion, false))).resize(lado, lado).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Texto de la leyenda final (para pruebas y para el panel). */
export function finalRueda(r: RuedaAnimada) {
  return guionDe(r).final;
}
