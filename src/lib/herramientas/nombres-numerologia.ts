/**
 * Compatibilidad de nombres con numerología pitagórica (la misma tabla y reducción que src/lib/numerologia.ts).
 *
 * Cada nombre da dos números: el del nombre completo (expresión) y el de sus vocales (alma). La afinidad sale de
 * las tres «familias» clásicas de números (1-5-7, 2-4-8, 3-6-9) y una pizca determinista por la pareja de nombres,
 * para que dos parejas con los mismos números no den siempre el mismo porcentaje. Es un juego de reflexión.
 *
 * Los nombres en árabe y devanagari se transliteran al alfabeto latino antes de contar. Cualquier otra letra que no
 * sepamos transliterar cuenta igual (por su posición en Unicode) y se avisa de que es una aproximación.
 */
import { reducir } from "@/lib/numerologia";

export type Familia = "a" | "b" | "c";

export interface LetraContada {
  letra: string;
  valor: number;
  vocal: boolean;
}

export interface NumerosNombre {
  original: string;
  /** El nombre tal como se contó (en letras latinas), si hubo que transliterarlo. */
  transliterado: string | null;
  aproximado: boolean;
  letras: LetraContada[];
  suma: number;
  expresion: number;
  sumaVocales: number;
  /** Número del alma (vocales); si el nombre no tiene vocales escritas, se toma el de expresión. */
  alma: number;
  almaSinVocales: boolean;
}

export interface Compatibilidad {
  a: NumerosNombre;
  b: NumerosNombre;
  porcentaje: number;
  nivel: 0 | 1 | 2 | 3 | 4; // 0 = la más alta
  familiaA: Familia;
  familiaB: Familia;
}

// ───────────── Transliteración ─────────────

const ARABE: Record<string, string> = {
  "ا": "a", "أ": "a", "إ": "i", "آ": "a", "ٱ": "a", "ء": "", "ؤ": "u", "ئ": "i", "ب": "b", "ت": "t", "ة": "a", "ث": "th",
  "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s", "ض": "d",
  "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h",
  "ى": "a", "پ": "p", "چ": "ch", "ژ": "zh", "گ": "g", "ک": "k",
  "َ": "a", "ُ": "u", "ِ": "i", // fatha, damma, kasra
};

function esArabe(cp: number) {
  return (cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0x0750 && cp <= 0x077f) || (cp >= 0xfb50 && cp <= 0xfdff) || (cp >= 0xfe70 && cp <= 0xfeff);
}

function deArabe(texto: string) {
  const chars = Array.from(texto.normalize("NFKC"));
  let out = "";
  chars.forEach((ch, i) => {
    const previo = i > 0 ? chars[i - 1] : " ";
    const inicio = !esArabe(previo.codePointAt(0) ?? 32) || previo === " ";
    if (ch === "و") out += inicio ? "w" : "u";
    else if (ch === "ي" || ch === "ی") out += inicio ? "y" : "i";
    else if (ch in ARABE) out += ARABE[ch];
    else if (!esArabe(ch.codePointAt(0) ?? 0)) out += ch; // espacios y letras de otros alfabetos
    // tanwin, sukun, shadda, tatweel y demás signos se omiten
  });
  return out;
}

const DEVA_CONSONANTES: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n", "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n", "ऩ": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ऱ": "r", "ल": "l", "ळ": "l", "ऴ": "l",
  "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "क़": "q", "ख़": "kh", "ग़": "gh", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y",
};
/** Con nukta (़) detrás: क़ ख़ ग़ ज़ ड़ ढ़ फ़ य़. */
const DEVA_NUKTA: Record<string, string> = { "क": "q", "ख": "kh", "ग": "gh", "ज": "z", "ड": "r", "ढ": "rh", "फ": "f", "य": "y" };
const DEVA_VOCALES: Record<string, string> = {
  "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u", "ऋ": "ri", "ॠ": "ri", "ऌ": "li", "ए": "e", "ऐ": "ai",
  "ऍ": "e", "ऎ": "e", "ओ": "o", "औ": "au", "ऑ": "o", "ऒ": "o",
};
const DEVA_MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri", "ॄ": "ri", "ॅ": "e",
  "ॆ": "e", "े": "e", "ै": "ai", "ॉ": "o", "ॊ": "o", "ो": "o", "ौ": "au", "ॢ": "li",
};

function esDevanagari(cp: number) {
  return cp >= 0x0900 && cp <= 0x097f;
}

/** Devanagari → latino, con la «a» inherente de cada consonante y sin ella al final de palabra («राहुल» → rahul). */
function deDevanagari(texto: string) {
  let out = "";
  let aPendiente = false;
  let ultima = "";
  for (const ch of Array.from(texto.normalize("NFC"))) {
    if (ch in DEVA_CONSONANTES) {
      if (aPendiente) out += "a";
      out += DEVA_CONSONANTES[ch];
      ultima = ch;
      aPendiente = true;
    } else if (ch === "़") {
      const conNukta = DEVA_NUKTA[ultima];
      if (conNukta && aPendiente) {
        out = out.slice(0, out.length - DEVA_CONSONANTES[ultima].length) + conNukta;
      }
    } else if (ch in DEVA_MATRAS) {
      out += DEVA_MATRAS[ch];
      aPendiente = false;
    } else if (ch === "्") {
      aPendiente = false; // virama: consonante sin vocal
    } else if (ch === "ं" || ch === "ँ") {
      if (aPendiente) out += "a";
      out += "n";
      aPendiente = false;
    } else if (ch === "ः") {
      if (aPendiente) out += "a";
      out += "h";
      aPendiente = false;
    } else if (ch in DEVA_VOCALES) {
      if (aPendiente) out += "a";
      out += DEVA_VOCALES[ch];
      aPendiente = false;
    } else if (!esDevanagari(ch.codePointAt(0) ?? 0)) {
      aPendiente = false; // fin de palabra: la «a» final no se pronuncia
      out += ch;
    }
  }
  return out;
}

/** Letras latinas sueltas que la descomposición Unicode no resuelve. */
const LATINAS_ESPECIALES: Record<string, string> = { "ı": "i", "ß": "ss", "æ": "ae", "œ": "oe", "ø": "o", "đ": "d", "ł": "l", "þ": "th", "ð": "d" };

/** ¿Cuenta como letra? Las que tienen mayúscula y las de alfabetos sin mayúsculas (sin signos, espacios ni emojis). */
function esLetra(ch: string) {
  if (ch.toLowerCase() !== ch.toUpperCase()) return true;
  const cp = ch.codePointAt(0) ?? 0;
  if (cp < 0x0370) return false;
  if (cp >= 0x2000 && cp <= 0x2bff) return false; // puntuación general, símbolos, flechas
  if (cp >= 0x3000 && cp <= 0x303f) return false; // puntuación CJK
  if (cp >= 0xfe00 && cp <= 0xfe4f) return false; // selectores de variante
  if (cp >= 0xff00 && cp <= 0xff20) return false; // puntuación de ancho completo
  return cp < 0x1f000; // emojis fuera
}

/** Lleva el nombre a letras latinas minúsculas sin acentos. Lo que no se puede transliterar se deja tal cual. */
export function aLatino(nombre: string): { texto: string; transliterado: boolean } {
  let texto = nombre.trim();
  let transliterado = false;
  if (Array.from(texto).some((c) => esArabe(c.codePointAt(0) ?? 0))) {
    texto = deArabe(texto);
    transliterado = true;
  }
  if (Array.from(texto).some((c) => esDevanagari(c.codePointAt(0) ?? 0))) {
    texto = deDevanagari(texto);
    transliterado = true;
  }
  texto = Array.from(texto.toLowerCase())
    .map((c) => LATINAS_ESPECIALES[c] ?? c)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return { texto, transliterado };
}

// ───────────── Números ─────────────

const VOCALES = new Set(["a", "e", "i", "o", "u"]);

/** Tabla pitagórica: a=1 … i=9, j=1 … r=9, s=1 … z=8. */
function valorLetra(c: string): number | null {
  const cp = c.codePointAt(0) ?? 0;
  if (cp >= 97 && cp <= 122) return ((cp - 97) % 9) + 1;
  return null;
}

export function numerosDeNombre(nombre: string): NumerosNombre {
  const original = nombre.trim().replace(/\s+/g, " ").slice(0, 60);
  const { texto, transliterado } = aLatino(original);
  const letras: LetraContada[] = [];
  let aproximado = false;
  for (const c of Array.from(texto)) {
    const v = valorLetra(c);
    if (v !== null) letras.push({ letra: c.toUpperCase(), valor: v, vocal: VOCALES.has(c) });
    else if (esLetra(c)) {
      // Letra de un alfabeto que no transliteramos (cirílico, chino, bengalí…): vale por su posición, del 1 al 9.
      letras.push({ letra: c.toUpperCase(), valor: ((c.codePointAt(0) ?? 0) % 9) + 1, vocal: false });
      aproximado = true;
    }
  }
  const suma = letras.reduce((s, l) => s + l.valor, 0);
  const sumaVocales = letras.filter((l) => l.vocal).reduce((s, l) => s + l.valor, 0);
  const expresion = suma > 0 ? reducir(suma) : 0;
  const almaSinVocales = sumaVocales === 0;
  return {
    original,
    transliterado: transliterado ? texto.replace(/\s+/g, " ").trim() : null,
    aproximado,
    letras,
    suma,
    expresion,
    sumaVocales,
    alma: almaSinVocales ? expresion : reducir(sumaVocales),
    almaSinVocales,
  };
}

/** Número raíz (los maestros 11, 22 y 33 vuelven a 2, 4 y 6). */
export function raiz(n: number) {
  return reducir(n, false);
}

export function familiaDe(n: number): Familia {
  const r = raiz(n);
  if (r === 1 || r === 5 || r === 7) return "a";
  if (r === 2 || r === 4 || r === 8) return "b";
  return "c";
}

/** Afinidad de dos números (0-100). */
function afinidad(x: number, y: number) {
  const fx = familiaDe(x);
  const fy = familiaDe(y);
  if (raiz(x) === raiz(y)) return 86;
  if (fx === fy) return 93;
  const par = [fx, fy].sort().join("");
  if (par === "ac") return 77; // libertad + expresión
  if (par === "bc") return 72; // estructura + cariño
  return 63; // "ab": libertad + seguridad, se complementan con esfuerzo
}

function hash(texto: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function compatibilidadNombres(nombreA: string, nombreB: string): Compatibilidad | null {
  const a = numerosDeNombre(nombreA);
  const b = numerosDeNombre(nombreB);
  if (!a.letras.length || !b.letras.length) return null;
  const base = 0.6 * afinidad(a.expresion, b.expresion) + 0.4 * afinidad(a.alma, b.alma);
  // La pizca de la pareja: igual en los dos órdenes (Ana + Luis = Luis + Ana).
  const claves = [a.original.toLowerCase(), b.original.toLowerCase()].sort();
  const pizca = (hash(claves.join("|")) % 11) - 4; // de −4 a +6
  const porcentaje = Math.max(48, Math.min(99, Math.round(base + pizca)));
  const nivel = porcentaje >= 90 ? 0 : porcentaje >= 80 ? 1 : porcentaje >= 70 ? 2 : porcentaje >= 60 ? 3 : 4;
  return { a, b, porcentaje, nivel, familiaA: familiaDe(a.expresion), familiaB: familiaDe(b.expresion) };
}
