import { MAZO, type CartaTarot } from "@/lib/tarot/deck";

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

const ROTACION: CartaTarot[] = MAZO.filter((c) => !DELICADO.test(`${frase(c.significado, 320)} ${c.amor} ${c.trabajo}`));

const mcd = (a: number, b: number): number => (b ? mcd(b, a % b) : a);
// Un paso coprimo con el tamaño de la rotación visita cada carta una vez por ciclo.
const PASO = [29, 31, 37, 41, 43, 47].find((p) => mcd(p, ROTACION.length) === 1) ?? 1;

export function fechaBogota(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(d); // AAAA-MM-DD
}

export function esFecha(valor: string | null | undefined): valor is string {
  return Boolean(valor && /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(Date.parse(`${valor}T00:00:00Z`)));
}

export function cartaDelDia(fecha: string): CartaTarot {
  const dias = Math.round((Date.parse(`${fecha}T00:00:00Z`) - EPOCA) / 864e5);
  const n = ROTACION.length;
  const i = (((dias * PASO) % n) + n) % n;
  return ROTACION[i];
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
  return [
    `✨ Carta del día · ${fechaLarga(fecha)}`,
    `${c.nombre}`,
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
    "#tarot #tarotenespañol #cartadeldia #tarotdiario #espiritualidad #arcana",
  ]
    .join("\n")
    .slice(0, 2200);
}
