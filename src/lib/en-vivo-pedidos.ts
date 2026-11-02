/**
 * Lo que la persona escribe en el chat del directo para pedir su carta astral
 * o una sinastría: fechas, hora y los trozos que pueden ser la ciudad. Sin
 * dependencias de servidor.
 */
import { SIGNOS } from "./zodiaco";

export const FECHA = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/g;
export const PIDE_CARTA = /carta\s+(astral|natal)|mapa\s+(astral|natal)|birth\s*chart|natal\s*chart|astral\s*chart|th[eè]me\s+(astral|natal)|geburtshoroskop|geburtsbild|radix/i;
export const PIDE_SINASTRIA = /sinastr|synastr|compatib|kompatib/i;

/** Meses escritos con letras (español, inglés y portugués), con sus abreviaturas. */
const MESES: [RegExp, number][] = [
  [/^(ene|enero|jan|january|janeiro)$/, 1],
  [/^(feb|febr|febrero|february|fev|fevereiro)$/, 2],
  [/^(mar|marzo|march|marco|março)$/, 3],
  [/^(abr|abril|apr|april)$/, 4],
  [/^(may|mayo|mai|maio)$/, 5],
  [/^(jun|junio|june|junho)$/, 6],
  [/^(jul|julio|july|julho)$/, 7],
  [/^(ago|agosto|aug|august)$/, 8],
  [/^(sep|sept|set|septiembre|setiembre|september|setembro)$/, 9],
  [/^(oct|octubre|october|out|outubro)$/, 10],
  [/^(nov|noviembre|november|novembro)$/, 11],
  [/^(dic|diciembre|dec|december|dez|dezembro)$/, 12],
];
const PALABRA_MES = "(ene(?:ro)?|jan(?:uary|eiro)?|febr?(?:ero)?|february|fev(?:ereiro)?|mar(?:zo|ch|[cç]o)?|abr(?:il)?|apr(?:il)?|ma(?:yo|y|io|i)|jun(?:io|e|ho)?|jul(?:io|y|ho)?|ago(?:sto)?|aug(?:ust)?|sept?(?:iembre|ember)?|setiembre|set(?:embro)?|oct(?:ubre|ober)?|out(?:ubro)?|nov(?:iembre|ember|embro)?|dic(?:iembre)?|dec(?:ember)?|dez(?:embro)?)\\.?";
/** «13 de febrero de 1974», «13 feb 1974», «13-feb-1974». */
export const FECHA_DIA_MES = new RegExp(`\\b(\\d{1,2})(?:\\s*(?:de|del|of)?\\s+|[/.-])${PALABRA_MES}(?:\\s*(?:de|del|,)?\\s*|[/.-])(\\d{4}|\\d{2})\\b`, "gi");
/** «febrero 13 de 1974», «February 13, 1974». */
export const FECHA_MES_DIA = new RegExp(`\\b${PALABRA_MES}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*(?:de|del|,)?\\s*)(\\d{4})\\b`, "gi");

function numeroMes(palabra: string) {
  const w = palabra.toLowerCase().replace(/\.$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return MESES.find(([re]) => re.test(w))?.[1] ?? null;
}

function fechaValida(dia: number, mes: number, anioTexto: string): string | null {
  const anio = Number(anioTexto.length === 2 ? (Number(anioTexto) > 30 ? `19${anioTexto}` : `20${anioTexto}`) : anioTexto);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  if (fecha.getUTCDate() !== dia || fecha.getUTCMonth() !== mes - 1 || anio < 1900 || fecha.getTime() > Date.now()) return null;
  return fecha.toISOString().slice(0, 10);
}

/** Quita las fechas (con números o con el mes en letras) para buscar la hora o la ciudad. */
export function sinFechas(texto: string, reemplazo = " ") {
  return texto.replace(FECHA, reemplazo).replace(FECHA_DIA_MES, reemplazo).replace(FECHA_MES_DIA, reemplazo);
}

/**
 * Fechas de nacimiento escritas en el mensaje, en formato YYYY-MM-DD y en el
 * orden en que aparecen: «13/02/1974», «13 de febrero de 1974», «feb 13, 1974».
 */
export function fechasEn(texto: string): string[] {
  const halladas: { pos: number; fecha: string }[] = [];
  for (const m of texto.matchAll(FECHA)) {
    const f = fechaValida(Number(m[1]), Number(m[2]), m[3]);
    if (f) halladas.push({ pos: m.index ?? 0, fecha: f });
  }
  for (const m of texto.matchAll(FECHA_DIA_MES)) {
    const mes = numeroMes(m[2]);
    const f = mes ? fechaValida(Number(m[1]), mes, m[3]) : null;
    if (f) halladas.push({ pos: m.index ?? 0, fecha: f });
  }
  for (const m of texto.matchAll(FECHA_MES_DIA)) {
    const mes = numeroMes(m[1]);
    const f = mes ? fechaValida(Number(m[2]), mes, m[3]) : null;
    if (f) halladas.push({ pos: m.index ?? 0, fecha: f });
  }
  return halladas.sort((a, b) => a.pos - b.pos).map((h) => h.fecha);
}

/** Hora escrita («10:30», «7.15 pm», «10 am», «22h40»), en HH:MM; null si no hay. */
export function horaEn(texto: string): string | null {
  const t = sinFechas(texto).toLowerCase();
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
    .replace(FECHA_DIA_MES, ",")
    .replace(FECHA_MES_DIA, ",")
    .replace(/\b\d{1,2}\s*(?:[:h.]\s*\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?/g, ",")
    .replace(/[¿?¡!«»"()#@*_]/g, " ");
  const res: string[] = [];
  const tras = /\s(?:en|in|em)\s+([^,;·|\n]+)(?![\s\S]*\s(?:en|in|em)\s)/.exec(` ${limpio}`);
  if (tras) res.push(recortar(tras[1]));
  for (const trozo of limpio.split(/[,;·|\n]/).reverse()) res.push(recortar(trozo.split(/\s(?:en|in|em)\s/).pop() ?? ""));
  return [...new Set(res)].filter((x) => x.length >= 3 && x.length <= 40).slice(0, 3);
}
