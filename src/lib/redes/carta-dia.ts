import type { CartaTarot } from "@/lib/tarot/deck";
import { MAZOS, type IdMazo } from "@/lib/tarot/mazos";

/**
 * "Carta del día de Arcana" para redes: la misma carta para todos en una
 * fecha dada (Bogotá). Recorre el mazo sin repetir hasta completar el ciclo.
 *
 * Quedan fuera las cartas cuyo texto público habla de salud, crisis, pérdidas
 * o traiciones: una publicación para todos no debe sonar a diagnóstico ni a
 * mal augurio (siguen disponibles en las lecturas personales).
 */
const EPOCA = Date.UTC(2026, 0, 1);
const DELICADO = /salud|enferm|crisis|ruina|p[ée]rdida|traici|duelo|depresi|ansiedad|suicid|violen/i;

/** Mazos que se alternan día a día (todos con ilustración propia). */
const MAZOS_REDES: IdMazo[] = ["rider", "arcana", "marsella"];

const ROTACION: Record<IdMazo, CartaTarot[]> = Object.fromEntries(
  (Object.keys(MAZOS) as IdMazo[]).map((m) => [m, MAZOS[m].cartas.filter((c) => !DELICADO.test(`${frase(c.significado, 320)} ${c.amor} ${c.trabajo}`))]),
) as Record<IdMazo, CartaTarot[]>;

const mcd = (a: number, b: number): number => (b ? mcd(b, a % b) : a);
// Un paso coprimo con el tamaño de la rotación visita cada carta una vez por ciclo.
function pasoPara(n: number) {
  return [29, 31, 37, 41, 43, 47, 7, 11, 13].find((p) => mcd(p, n) === 1) ?? 1;
}

export function fechaBogota(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(d); // AAAA-MM-DD
}

export function esFecha(valor: string | null | undefined): valor is string {
  return Boolean(valor && /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(Date.parse(`${valor}T00:00:00Z`)));
}

function diasDesdeEpoca(fecha: string) {
  return Math.round((Date.parse(`${fecha}T00:00:00Z`) - EPOCA) / 864e5);
}

/** Mazo del día: se alternan los mazos con ilustración (Rider-Waite, Tarot Arcana, Marsella…). */
export function mazoDelDia(fecha: string): IdMazo {
  const d = diasDesdeEpoca(fecha);
  return MAZOS_REDES[((d % MAZOS_REDES.length) + MAZOS_REDES.length) % MAZOS_REDES.length];
}

export function cartaDelDia(fecha: string): CartaTarot {
  const mazo = mazoDelDia(fecha);
  const lista = ROTACION[mazo];
  // Cada mazo lleva su propio contador: los días en que le toca a él.
  const turno = Math.floor(diasDesdeEpoca(fecha) / MAZOS_REDES.length);
  const n = lista.length;
  const i = (((turno * pasoPara(n)) % n) + n) % n;
  return lista[i];
}

/** Las primeras frases de un texto, hasta `max` caracteres. */
export function frase(texto: string, max = 230) {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  const fin = corte.lastIndexOf(". ");
  return fin > 60 ? corte.slice(0, fin + 1) : corte.slice(0, corte.lastIndexOf(" ")) + "…";
}

export function simboloCarta(c: CartaTarot) {
  return c.arcano === "mayor" ? "✦" : { bastos: "🜂", copas: "🜄", espadas: "🜁", oros: "🜃" }[c.palo ?? "bastos"];
}

function fechaLarga(fecha: string) {
  const texto = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${fecha}T12:00:00Z`),
  );
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Texto de la publicación (Instagram admite hasta 2.200 caracteres). */
export function textoCartaDelDia(fecha: string) {
  const c = cartaDelDia(fecha);
  const mazo = mazoDelDia(fecha);
  return [
    `✨ Carta del día · ${fechaLarga(fecha)}`,
    `${c.nombre}${mazo === "arcana" ? " · Tarot Arcana, nuestro mazo propio" : ` · ${MAZOS[mazo].nombre}`}`,
    "",
    frase(c.significado, 320),
    "",
    `💛 En el amor: ${c.amor}`,
    `💼 En el trabajo: ${c.trabajo}`,
    "",
    `Palabras clave: ${c.palabrasClave.slice(0, 3).join(" · ")}`,
    "",
    "🔮 Esta es la carta para todos. ¿Qué te dicen las cartas a ti? Saca la tuya gratis en miarcana.com (enlace en la biografía).",
    "",
    mazo === "arcana" ? "#tarot #tarotarcana #cartadeldia #tarotdiario #espiritualidad #miarcana" : "#tarot #tarotenespañol #cartadeldia #tarotdiario #espiritualidad #miarcana",
  ]
    .join("\n")
    .slice(0, 2200);
}
