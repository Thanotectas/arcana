/**
 * Lo que la persona escribe en el chat del directo para pedir su carta astral
 * o una sinastría: fechas, hora y los trozos que pueden ser la ciudad. Sin
 * dependencias de servidor.
 */
import { SIGNOS } from "./zodiaco";

export const FECHA = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/g;
export const PIDE_CARTA = /carta\s+(astral|natal)|mapa\s+(astral|natal)|birth\s*chart|natal\s*chart|astral\s*chart/i;
export const PIDE_SINASTRIA = /sinastr|synastry|compatib/i;

/** Fechas de nacimiento (dd/mm/aaaa) escritas en el mensaje, en formato YYYY-MM-DD. */
export function fechasEn(texto: string): string[] {
  const res: string[] = [];
  for (const m of texto.matchAll(FECHA)) {
    const anio = Number(m[3].length === 2 ? (Number(m[3]) > 30 ? `19${m[3]}` : `20${m[3]}`) : m[3]);
    const fecha = new Date(Date.UTC(anio, Number(m[2]) - 1, Number(m[1])));
    if (fecha.getUTCDate() !== Number(m[1]) || anio < 1900 || fecha.getTime() > Date.now()) continue;
    res.push(fecha.toISOString().slice(0, 10));
  }
  return res;
}

/** Hora escrita («10:30», «7.15 pm», «10 am», «22h40»), en HH:MM; null si no hay. */
export function horaEn(texto: string): string | null {
  const t = texto.replace(FECHA, " ").toLowerCase();
  const m = /\b(\d{1,2})\s*(?:[:h.]\s*(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?(?![\d/])/.exec(t.replace(/\b(19|20)\d{2}\b/g, " "));
  if (!m || (!m[2] && !m[3])) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const sufijo = m[3]?.replace(/[\s.]/g, "");
  if (sufijo === "pm" && h < 12) h += 12;
  if (sufijo === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

const RELLENO = new Set([
  "carta", "astral", "natal", "mapa", "birth", "chart", "my", "mi", "meu", "minha", "por", "favor", "please", "pls", "plis", "naci", "nací", "nacio", "nació", "born", "nasci",
  "en", "in", "em", "a", "las", "la", "el", "at", "as", "às", "hora", "horas", "ciudad", "city", "cidade", "de", "do", "da", "del", "the", "soy", "sou", "i'm", "im", "i", "am", "and",
  "y", "e", "quiero", "quisiera", "want", "quero", "ver", "see", "dibuja", "hazme", "haz", "make", "me", "my", "am", "pm", "hrs", "h", "lectura", "reading", "leitura", "sibila", "hola", "hello", "oi", "olá",
]);

/**
 * Trozos del mensaje que pueden ser la ciudad, en el orden en que conviene
 * buscarlos: primero lo que sigue a «en» («nací en Cali a las…»), después
 * los trozos separados por comas, del último al primero. A cada trozo se le
 * quitan la fecha, la hora y las palabras de relleno o signos de los bordes
 * («Rio de Janeiro» conserva su «de»).
 */
export function candidatosLugar(texto: string): string[] {
  const nombresSignos = new Set(SIGNOS.flatMap((s) => [s.id, s.nombre.toLowerCase()]));
  const sobra = (w: string) => RELLENO.has(w) || nombresSignos.has(w.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const recortar = (x: string) => {
    const palabras = x.split(/\s+/).filter(Boolean);
    while (palabras.length && sobra(palabras[0])) palabras.shift();
    while (palabras.length && sobra(palabras[palabras.length - 1])) palabras.pop();
    return palabras.join(" ");
  };
  const limpio = texto
    .toLowerCase()
    .replace(FECHA, ",")
    .replace(/\b\d{1,2}\s*(?:[:h.]\s*\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?/g, ",")
    .replace(/[¿?¡!«»"()#@*_]/g, " ");
  const res: string[] = [];
  const tras = /\s(?:en|in|em)\s+([^,;·|\n]+)(?![\s\S]*\s(?:en|in|em)\s)/.exec(` ${limpio}`);
  if (tras) res.push(recortar(tras[1]));
  for (const trozo of limpio.split(/[,;·|\n]/).reverse()) res.push(recortar(trozo.split(/\s(?:en|in|em)\s/).pop() ?? ""));
  return [...new Set(res)].filter((x) => x.length >= 3 && x.length <= 40).slice(0, 3);
}
