import type { Idioma } from "@/lib/i18n/idiomas";
import { MAZO, type CartaTarot } from "@/lib/tarot/deck";
import { nombreCarta, palabrasCarta } from "@/lib/juego/cartas-idiomas";
import { idiomaConversacion } from "./respuestas-fijas";
import { idiomaDePublicacion } from "./abjad-comentarios";

/**
 * Comentarios con la fecha de nacimiento en un reel de «tu carta del tarot de nacimiento»: la carta se calcula aquí
 * (nunca con el modelo) con el método clásico de la carta de nacimiento: día + mes + año, y se suman las cifras del
 * resultado hasta que quede en 22 o menos (22 es El Loco). La suma no depende del orden de día y mes, así que
 * 13/02/1974 y 02/13/1974 dan lo mismo. La respuesta muestra la cuenta, como el abjad.
 */

export function esPublicacionCartaNacimiento(texto: string) {
  return /carta (del tarot )?de nacimiento|tarot de nacimiento|birth ?card|carta de nascimento|carte de naissance|doğum kartı|doğum tarot|بطاقة[ _](التاروت )?(الخاصة )?(ب|ال)?ميلاد|बर्थ कार्ड|जन्म (का )?कार्ड|kartu kelahiran/i.test(texto);
}

const MESES: Record<string, number> = {};
const NOMBRES_MES: string[][] = [
  ["enero", "janeiro", "january", "jan", "janvier", "ocak", "يناير", "كانون الثاني", "januari", "जनवरी"],
  ["febrero", "fevereiro", "february", "feb", "février", "fevrier", "şubat", "subat", "فبراير", "شباط", "februari", "फ़रवरी", "फरवरी"],
  ["marzo", "março", "marco", "march", "mar", "mars", "mart", "مارس", "آذار", "maret", "मार्च"],
  ["abril", "april", "apr", "avril", "nisan", "أبريل", "ابريل", "نيسان", "अप्रैल"],
  ["mayo", "maio", "may", "mai", "mayıs", "mayis", "مايو", "أيار", "mei", "मई"],
  ["junio", "junho", "june", "jun", "juin", "haziran", "يونيو", "حزيران", "juni", "जून"],
  ["julio", "julho", "july", "jul", "juillet", "temmuz", "يوليو", "تموز", "juli", "जुलाई"],
  ["agosto", "august", "aug", "août", "aout", "ağustos", "agustos", "أغسطس", "آب", "agustus", "अगस्त"],
  ["septiembre", "setiembre", "setembro", "september", "sep", "sept", "septembre", "eylül", "eylul", "سبتمبر", "أيلول", "सितंबर"],
  ["octubre", "outubro", "october", "oct", "octobre", "ekim", "أكتوبر", "اكتوبر", "تشرين الأول", "oktober", "अक्टूबर"],
  ["noviembre", "novembro", "november", "nov", "novembre", "kasım", "kasim", "نوفمبر", "تشرين الثاني", "नवंबर"],
  ["diciembre", "dezembro", "december", "dec", "décembre", "decembre", "aralık", "aralik", "ديسمبر", "كانون الأول", "desember", "दिसंबर"],
];
NOMBRES_MES.forEach((lista, i) => lista.forEach((n) => (MESES[n] = i + 1)));

/** Cifras arábigo-índicas y persas a cifras latinas. */
function cifrasLatinas(texto: string) {
  return texto.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export interface FechaComentario {
  dia: number;
  mes: number;
  anio: number;
  /** La fecha como la escribió la persona (con cifras latinas). */
  mostrada: string;
}

/** La fecha de nacimiento del comentario, si trae una sola fecha completa y válida; si no, null. */
export function fechaDelComentario(texto: string): FechaComentario | null {
  const t = cifrasLatinas(texto.normalize("NFC")).toLowerCase();
  const anioActual = new Date().getUTCFullYear();
  const valida = (a: number, b: number, y: number) => y >= 1900 && y <= anioActual && a >= 1 && b >= 1 && ((a <= 31 && b <= 12) || (a <= 12 && b <= 31));
  // 13/02/1974, 13-2-1974, 13.02.1974, 13 02 1974
  let m = t.match(/(?<!\d)(\d{1,2})\s*[/\-.\s]\s*(\d{1,2})\s*[/\-.\s]\s*(\d{4})(?!\d)/);
  if (m) {
    const [a, b, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (!valida(a, b, y)) return null;
    // Para mostrarla: día/mes si se puede (el orden no cambia la suma).
    const [dia, mes] = a <= 31 && b <= 12 ? [a, b] : [b, a];
    return { dia, mes, anio: y, mostrada: `${m[1]}/${m[2]}/${m[3]}` };
  }
  // 1974-02-13
  m = t.match(/(?<!\d)(\d{4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})(?!\d)/);
  if (m) {
    const [y, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (!valida(dia, mes, y)) return null;
    return { dia, mes, anio: y, mostrada: `${dia}/${mes}/${y}` };
  }
  // 13 de febrero de 1974 · 13 février 1974 · 13 Şubat 1974 · 13 فبراير 1974
  m = t.match(/(?<!\d)(\d{1,2})\s*(?:de\s+|del\s+)?([\p{L} ]{3,14}?)\s*(?:de\s+|del\s+|,\s*)?(\d{4})(?!\d)/u);
  if (m && MESES[m[2].trim()]) {
    const [dia, mes, y] = [Number(m[1]), MESES[m[2].trim()], Number(m[3])];
    if (!valida(dia, mes, y) || dia > 31) return null;
    return { dia, mes, anio: y, mostrada: `${dia}/${mes}/${y}` };
  }
  // February 13, 1974
  m = t.match(/([\p{L}]{3,10})\s+(\d{1,2}),?\s+(\d{4})(?!\d)/u);
  if (m && MESES[m[1]]) {
    const [mes, dia, y] = [MESES[m[1]], Number(m[2]), Number(m[3])];
    if (!valida(dia, mes, y) || dia > 31) return null;
    return { dia, mes, anio: y, mostrada: `${dia}/${mes}/${y}` };
  }
  return null;
}

/** Si la fecha trae el mes en letras, su idioma («13 Şubat 1974» → turco). */
const IDIOMA_MES: [Idioma, RegExp][] = [
  ["tr", /(?<![\p{L}])(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)(?![\p{L}])/iu],
  ["fr", /(?<![\p{L}])(janvier|février|fevrier|avril|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)(?![\p{L}])/iu],
  ["pt", /(?<![\p{L}])(janeiro|fevereiro|março|marco|maio|junho|julho|setembro|outubro|novembro|dezembro)(?![\p{L}])/iu],
  ["en", /(?<![\p{L}])(january|february|march|april|may|june|july|august|september|october|november|december)(?![\p{L}])/iu],
  ["id", /(?<![\p{L}])(januari|februari|maret|mei|juni|juli|agustus|oktober|desember)(?![\p{L}])/iu],
  ["es", /(?<![\p{L}])(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?![\p{L}])/iu],
  ["hi", /(जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर)/u],
];
function idiomaDelMes(texto: string): Idioma | null {
  for (const [idioma, re] of IDIOMA_MES) if (re.test(texto)) return idioma;
  return null;
}

const sumaCifras = (n: number) => String(n).split("").reduce((s, d) => s + Number(d), 0);

/** Pasos de la cuenta y el arcano mayor (0–21) de una fecha. */
export function cartaDeNacimiento(f: Pick<FechaComentario, "dia" | "mes" | "anio">): { pasos: number[]; carta: CartaTarot } {
  const pasos = [f.dia + f.mes + f.anio];
  while (pasos[pasos.length - 1] > 22) pasos.push(sumaCifras(pasos[pasos.length - 1]));
  const final = pasos[pasos.length - 1];
  const numero = final === 22 ? 0 : final;
  const carta = MAZO.find((c) => c.arcano === "mayor" && c.numero === numero)!;
  return { pasos, carta };
}

type Red = "instagram" | "facebook";
const BIO = (red: Red, perfil: string, bio: string) => (red === "facebook" ? perfil : bio);

/** Tres formas de decir lo mismo por idioma: cientos de respuestas idénticas parecen spam. */
const PLANTILLAS: Record<Idioma, ((cuenta: string, carta: string, claves: string, red: Red) => string)[]> = {
  es: [
    (c, n, k, r) => `${c} → naciste con ${n} 🃏 ${k}. Lo que tu carta dice de tu camino, completo, en el enlace ${BIO(r, "de nuestro perfil", "de la bio")} 🔮`,
    (c, n, k, r) => `${c}: tu carta de nacimiento es ${n} ✨ ${k}. Su lectura completa está en el enlace ${BIO(r, "de nuestro perfil", "de la bio")} 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 Es la carta que te acompaña desde que naciste: ${k}. Más en el enlace ${BIO(r, "de nuestro perfil", "de la bio")} 🔮`,
  ],
  en: [
    (c, n, k, r) => `${c} → you were born with ${n} 🃏 ${k}. What your card says about your path is in the link ${BIO(r, "on our profile", "in our bio")} 🔮`,
    (c, n, k, r) => `${c}: your birth card is ${n} ✨ ${k}. The full reading is in the link ${BIO(r, "on our profile", "in our bio")} 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 The card that has walked with you since birth: ${k}. More in the link ${BIO(r, "on our profile", "in our bio")} 🔮`,
  ],
  pt: [
    (c, n, k, r) => `${c} → você nasceu com ${n} 🃏 ${k}. O que sua carta diz do seu caminho está no link ${BIO(r, "do nosso perfil", "da bio")} 🔮`,
    (c, n, k, r) => `${c}: sua carta de nascimento é ${n} ✨ ${k}. A leitura completa está no link ${BIO(r, "do nosso perfil", "da bio")} 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 A carta que te acompanha desde que você nasceu: ${k}. Mais no link ${BIO(r, "do nosso perfil", "da bio")} 🔮`,
  ],
  fr: [
    (c, n, k, r) => `${c} → tu es né(e) avec ${n} 🃏 ${k}. Ce que ta carte dit de ton chemin est dans le lien ${BIO(r, "de notre profil", "de la bio")} 🔮`,
    (c, n, k, r) => `${c} : ta carte de naissance est ${n} ✨ ${k}. La lecture complète est dans le lien ${BIO(r, "de notre profil", "de la bio")} 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 La carte qui t'accompagne depuis ta naissance : ${k}. Plus dans le lien ${BIO(r, "de notre profil", "de la bio")} 🔮`,
  ],
  tr: [
    (c, n, k, r) => `${c} → doğum kartın ${n} 🃏 ${k}. Kartının yolun hakkında söyledikleri ${BIO(r, "profilimizdeki", "biyografideki")} bağlantıda 🔮`,
    (c, n, k, r) => `${c}: sen ${n} ile doğdun ✨ ${k}. Tam yorumu ${BIO(r, "profilimizdeki", "biyografideki")} bağlantıda 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 Doğduğundan beri sana eşlik eden kart: ${k}. Devamı ${BIO(r, "profilimizdeki", "biyografideki")} bağlantıda 🔮`,
  ],
  ar: [
    (c, n, k, r) => `${c} ← بطاقة ميلادك هي ${n} 🃏 ${k}. ما تقوله بطاقتك عن طريقك في الرابط ${BIO(r, "الموجود في صفحتنا", "الموجود في السيرة")} 🔮`,
    (c, n, k, r) => `${c}: وُلدتَ مع بطاقة ${n} ✨ ${k}. القراءة الكاملة في الرابط ${BIO(r, "الموجود في صفحتنا", "الموجود في السيرة")} 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 البطاقة التي ترافقك منذ ولادتك: ${k}. المزيد في الرابط ${BIO(r, "الموجود في صفحتنا", "الموجود في السيرة")} 🔮`,
  ],
  id: [
    (c, n, k, r) => `${c} → kartu kelahiranmu adalah ${n} 🃏 ${k}. Apa kata kartumu tentang jalan hidupmu ada di tautan ${BIO(r, "di profil kami", "di bio")} 🔮`,
    (c, n, k, r) => `${c}: kamu lahir bersama ${n} ✨ ${k}. Bacaan lengkapnya ada di tautan ${BIO(r, "di profil kami", "di bio")} 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 Kartu yang menemanimu sejak lahir: ${k}. Selengkapnya di tautan ${BIO(r, "di profil kami", "di bio")} 🔮`,
  ],
  hi: [
    (c, n, k, r) => `${c} → आपका जन्म कार्ड है ${n} 🃏 ${k}। आपके रास्ते के बारे में यह कार्ड क्या कहता है, ${BIO(r, "हमारी प्रोफ़ाइल", "बायो")} के लिंक में है 🔮`,
    (c, n, k, r) => `${c}: आप ${n} के साथ जन्मे हैं ✨ ${k}। पूरी रीडिंग ${BIO(r, "हमारी प्रोफ़ाइल", "बायो")} के लिंक में है 🔮`,
    (c, n, k, r) => `${c} = ${n} 🃏 जन्म से आपके साथ चलने वाला कार्ड: ${k}। और जानकारी ${BIO(r, "हमारी प्रोफ़ाइल", "बायो")} के लिंक में 🔮`,
  ],
};

/**
 * Respuesta a un comentario con la fecha de nacimiento en el reel de la carta de nacimiento. null si el comentario
 * no trae una fecha completa (entonces responde Sibila, que no debe calcular la carta por su cuenta).
 */
export function respuestaCartaNacimiento(comentario: string, textoPublicacion: string, red: Red): string | null {
  const f = fechaDelComentario(comentario);
  if (!f) return null;
  const sinFecha = comentario.replace(/[\d/\-.]+/g, " ").trim();
  const delComentario = sinFecha.replace(/\p{L}+/gu, (w) => (MESES[w.toLowerCase()] ? " " : w)).trim();
  const idioma: Idioma = idiomaDelMes(comentario) ?? (/[؀-ۿ]/.test(comentario) ? "ar" : delComentario && idiomaConversacion(delComentario) !== "es" ? idiomaConversacion(delComentario) : idiomaDePublicacion(textoPublicacion));
  const { pasos, carta } = cartaDeNacimiento(f);
  const cuenta = `${f.mostrada} → ${f.dia} + ${f.mes} + ${f.anio} = ${pasos.join(" → ")}`;
  const claves = palabrasCarta(carta, idioma).luz.slice(0, 2).join(" · ");
  const variantes = PLANTILLAS[idioma];
  const elegida = variantes[Math.floor(Math.random() * variantes.length)];
  return elegida(cuenta, nombreCarta(carta, idioma), claves, red);
}
