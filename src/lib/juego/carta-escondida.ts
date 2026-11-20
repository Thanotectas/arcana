import { MAZO, type CartaTarot } from "@/lib/tarot/deck";

/**
 * «El Camino del Loco», fase 1: la carta escondida del día.
 * Cada día (hora de Bogotá) hay una carta oculta del mazo Rider, la misma para
 * todos. Se adivina en 6 intentos: cada intento dice si el grupo (Arcano Mayor
 * o el palo) coincide y si el número de la carta escondida es mayor o menor, y
 * con cada fallo Sibila suelta una pista más.
 * Todo se calcula en el navegador (como los juegos diarios de palabras): no hay
 * nada que proteger, solo diversión.
 */

/** Día del juego número 1. */
export const INICIO_JUEGO = "2026-11-19";
export const MAX_INTENTOS = 6;
export const RACHA_PREMIO = 7;

export function fechaBogota(ahora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(ahora);
}

export function numeroDeJuego(fecha: string) {
  return Math.round((Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${INICIO_JUEGO}T00:00:00Z`)) / 86_400_000) + 1;
}

/** Fecha (AAAA-MM-DD) de la carta número n. */
export function fechaDeNumero(n: number) {
  return new Date(Date.parse(`${INICIO_JUEGO}T12:00:00Z`) + (n - 1) * 86_400_000).toISOString().slice(0, 10);
}

/** Día anterior a una fecha AAAA-MM-DD. */
export function diaAnterior(fecha: string) {
  return new Date(Date.parse(`${fecha}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
}

/** Milisegundos hasta la medianoche de Bogotá (UTC−5, sin horario de verano). */
export function msHastaNuevaCarta(ahora = Date.now()) {
  const bogota = ahora - 5 * 3_600_000;
  return 86_400_000 - (((bogota % 86_400_000) + 86_400_000) % 86_400_000);
}

function aleatorio(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Las 78 cartas en un orden fijo por ciclo: no se repite ninguna hasta pasar por todas. */
function ordenDelCiclo(ciclo: number) {
  const r = aleatorio(20_261_120 + ciclo * 7_919);
  const orden = MAZO.map((_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden;
}

export function cartaDelJuego(numero: number): CartaTarot {
  const n = Math.max(1, numero) - 1;
  return MAZO[ordenDelCiclo(Math.floor(n / MAZO.length))[n % MAZO.length]];
}

export function cartaPorId(id: string) {
  return MAZO.find((c) => c.id === id);
}

const NOMBRE_GRUPO: Record<string, string> = { mayor: "Arcanos Mayores", bastos: "Bastos", copas: "Copas", espadas: "Espadas", oros: "Oros" };
export function grupo(c: CartaTarot) {
  return c.arcano === "mayor" ? "mayor" : (c.palo ?? "");
}
export function nombreGrupo(c: CartaTarot) {
  return NOMBRE_GRUPO[grupo(c)] ?? "";
}

export interface Comparacion {
  acierto: boolean;
  grupo: boolean;
  /** Cómo es el número de la carta escondida frente al del intento. */
  numero: "igual" | "mayor" | "menor";
}

export function comparar(intento: CartaTarot, escondida: CartaTarot): Comparacion {
  return {
    acierto: intento.id === escondida.id,
    grupo: grupo(intento) === grupo(escondida),
    numero: escondida.numero === intento.numero ? "igual" : escondida.numero > intento.numero ? "mayor" : "menor",
  };
}

export function emojiDe(c: Comparacion) {
  return `${c.grupo ? "🟪" : "⬛"}${c.numero === "igual" ? "🟪" : c.numero === "mayor" ? "⬆️" : "⬇️"}${c.acierto ? " ✨" : ""}`;
}

const ELEMENTO: Record<CartaTarot["elemento"], string> = {
  fuego: "Su elemento es el fuego: pide acción.",
  agua: "Su elemento es el agua: habla de emociones.",
  aire: "Su elemento es el aire: vive en la mente y la palabra.",
  tierra: "Su elemento es la tierra: lo concreto, el cuerpo y el dinero.",
  espiritu: "No tiene un elemento terrenal: es una carta del espíritu.",
};

function ocultarNombre(texto: string, c: CartaTarot) {
  const nombre = c.nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return texto.replace(new RegExp(nombre, "gi"), "esta carta");
}

/**
 * Pistas de Sibila, en orden: la primera se ve desde el comienzo y se suma una
 * por cada intento fallido (hasta cinco más).
 */
export function pistas(c: CartaTarot): string[] {
  const [p1, p2, p3] = c.palabrasClave;
  return [
    `Sibila susurra: «${p1}».`,
    ELEMENTO[c.elemento],
    `Otra palabra que la acompaña: «${p2 ?? p3 ?? p1}».`,
    `En el amor dice: «${ocultarNombre(c.amor, c)}»`,
    `En el trabajo dice: «${ocultarNombre(c.trabajo, c)}»`,
    `Su sombra, cuando sale invertida: «${c.palabrasClaveInvertida.slice(0, 2).join(", ")}».`,
  ];
}

/** El mensaje del día al descubrirla: las dos primeras frases de su significado. */
export function mensajeDelDia(c: CartaTarot) {
  const frases = c.significado.match(/[^.!?]+[.!?]+/g) ?? [c.significado];
  return frases.slice(0, 2).join(" ").trim();
}

/** Para buscar sin tildes ni mayúsculas. */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function buscarCartas(texto: string, excluir: ReadonlySet<string>, limite = 8) {
  const q = normalizar(texto);
  if (!q) return [];
  return MAZO.filter((c) => !excluir.has(c.id) && normalizar(c.nombre).includes(q)).slice(0, limite);
}

// ───────────────────────── Progreso guardado en el navegador ─────────────────────────

export interface Progreso {
  /** Intentos (ids de carta) por fecha. */
  partidas: Record<string, string[]>;
  jugadas: number;
  ganadas: number;
  racha: number;
  mejorRacha: number;
  /** Última fecha terminada (ganada o perdida). */
  ultima: string | null;
  /** Cuántas se ganaron en 1, 2… 6 intentos. */
  distribucion: number[];
  /** Ids de las cartas descubiertas: el álbum. */
  album: string[];
}

export const PROGRESO_VACIO: Progreso = { partidas: {}, jugadas: 0, ganadas: 0, racha: 0, mejorRacha: 0, ultima: null, distribucion: [0, 0, 0, 0, 0, 0], album: [] };

/** Suma una partida terminada al progreso. La racha cuenta días seguidos jugando. */
export function terminarPartida(p: Progreso, fecha: string, intentos: string[], gano: boolean, cartaId: string): Progreso {
  if (p.ultima === fecha) return p;
  const racha = p.ultima === diaAnterior(fecha) ? p.racha + 1 : 1;
  const distribucion = [...p.distribucion];
  if (gano) distribucion[intentos.length - 1] = (distribucion[intentos.length - 1] ?? 0) + 1;
  return {
    ...p,
    partidas: { ...p.partidas, [fecha]: intentos },
    jugadas: p.jugadas + 1,
    ganadas: p.ganadas + (gano ? 1 : 0),
    racha,
    mejorRacha: Math.max(p.mejorRacha, racha),
    ultima: fecha,
    distribucion,
    album: gano && !p.album.includes(cartaId) ? [...p.album, cartaId] : p.album,
  };
}

/**
 * El resultado en pocas letras, para el enlace y la imagen (sin revelar la carta): por intento, «1» o «0» según el
 * grupo, y «i», «m» o «n» según el número (igual, mayor, menor). Ej.: «0n1m1i».
 */
export function codigoResultado(comparaciones: Comparacion[]) {
  return comparaciones.map((c) => `${c.grupo ? 1 : 0}${c.numero === "igual" ? "i" : c.numero === "mayor" ? "m" : "n"}`).join("");
}

export interface ResultadoCompartido {
  numero: number;
  filas: Comparacion[];
  gano: boolean;
  racha: number;
}

/** Lee un resultado compartido (?n=&f=&ra=). null si no es válido. */
export function leerResultado(n: unknown, f: unknown, ra: unknown): ResultadoCompartido | null {
  const numero = Number(n);
  const codigo = typeof f === "string" ? f : "";
  if (!Number.isInteger(numero) || numero < 1 || numero > 100_000 || !/^([01][imn]){1,6}$/.test(codigo)) return null;
  const filas: Comparacion[] = (codigo.match(/../g) ?? []).map((par) => {
    const grupo = par[0] === "1";
    const numeroC = par[1] === "i" ? "igual" : par[1] === "m" ? "mayor" : "menor";
    return { grupo, numero: numeroC, acierto: grupo && numeroC === "igual" };
  });
  // Solo el último puede ser el acierto; si hubo uno antes, el código no es válido.
  if (filas.slice(0, -1).some((x) => x.acierto)) return null;
  const gano = filas[filas.length - 1].acierto;
  if (!gano && filas.length !== MAX_INTENTOS) return null;
  const racha = Math.min(9999, Math.max(0, Math.floor(Number(ra) || 0)));
  return { numero, filas, gano, racha };
}

export function enlaceResultado(sitio: string, numero: number, comparaciones: Comparacion[], racha: number) {
  return `${sitio}/juego?n=${numero}&f=${codigoResultado(comparaciones)}${racha > 1 ? `&ra=${racha}` : ""}`;
}

/** Texto para compartir: sin revelar la carta. */
export function textoParaCompartir(numero: number, comparaciones: Comparacion[], gano: boolean, racha: number, sitio: string) {
  return [
    `🔮 El Camino del Loco #${numero} · ${gano ? comparaciones.length : "X"}/${MAX_INTENTOS}`,
    ...comparaciones.map(emojiDe),
    racha > 1 ? `🔥 ${racha} días seguidos` : "",
    `¿Adivinas la carta de hoy? ${enlaceResultado(sitio, numero, comparaciones, racha)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ───────────────────────── Selector visual ─────────────────────────

export const GRUPOS = [
  { id: "mayor", nombre: "Mayores", icono: "✦" },
  { id: "bastos", nombre: "Bastos", icono: "🔥" },
  { id: "copas", nombre: "Copas", icono: "💧" },
  { id: "espadas", nombre: "Espadas", icono: "🗡️" },
  { id: "oros", nombre: "Oros", icono: "🪙" },
] as const;
export type IdGrupo = (typeof GRUPOS)[number]["id"];

export function cartasDelGrupo(g: IdGrupo) {
  return MAZO.filter((c) => grupo(c) === g).sort((a, b) => a.numero - b.numero);
}

const ROMANOS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const CORTE: Record<number, string> = { 1: "As", 11: "Sota", 12: "Caballo", 13: "Reina", 14: "Rey" };

/** Lo que se ve en la casilla del selector: número arriba y nombre corto abajo. */
export function rotuloCasilla(c: CartaTarot) {
  if (c.arcano === "mayor") return { numero: ROMANOS[c.numero] ?? String(c.numero), nombre: c.nombre.replace(/^(El|La|Los|Las)\s+/, "") };
  return { numero: String(c.numero), nombre: CORTE[c.numero] ?? "" };
}

/** Cartas que todavía pueden ser la escondida según lo que dijeron los intentos. */
export function posibles(intentos: CartaTarot[], resultados: Comparacion[]) {
  return new Set(
    MAZO.filter((c) =>
      intentos.every((g, i) => {
        const r = comparar(g, c);
        const s = resultados[i];
        return r.acierto === s.acierto && r.grupo === s.grupo && r.numero === s.numero;
      }),
    ).map((c) => c.id),
  );
}
