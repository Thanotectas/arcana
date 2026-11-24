import type { Idioma } from "@/lib/i18n/idiomas";
import { esEscrituraArabe, transliterar } from "@/lib/abjad/calculo";
import { idiomaConversacion } from "./respuestas-fijas";

/**
 * Comentarios que dejan solo un nombre en un reel de abjad / ebced: el valor se calcula aquí, con una tabla fija
 * (nunca con el modelo), y la respuesta sale de una plantilla en el idioma del comentario.
 */

/** Valores de حساب الجُمَّل (orden oriental), con las variantes de cada letra. */
const TABLA: Readonly<Record<string, number>> = {
  "ا": 1, "أ": 1, "إ": 1, "آ": 1, "ء": 1,
  "ب": 2, "ج": 3, "د": 4, "ه": 5, "ة": 5, "و": 6, "ؤ": 6, "ز": 7, "ح": 8, "ط": 9,
  "ي": 10, "ى": 10, "ئ": 10,
  "ك": 20, "ل": 30, "م": 40, "ن": 50, "س": 60, "ع": 70, "ف": 80, "ص": 90,
  "ق": 100, "ر": 200, "ش": 300, "ت": 400, "ث": 500, "خ": 600, "ذ": 700, "ض": 800, "ظ": 900, "غ": 1000,
};

/** Suma de las letras árabes del texto (vocales cortas, shadda y lo demás no cuentan). */
export function valorJummal(arabe: string): number {
  let total = 0;
  for (const c of arabe.normalize("NFC")) total += TABLA[c] ?? 0;
  return total;
}

/** Suma de cifras repetida hasta quedar en un dígito (1–9). */
export function raizDigital(n: number): number {
  let r = n;
  while (r > 9) r = String(r).split("").reduce((s, d) => s + Number(d), 0);
  return r;
}

/** ¿La publicación es de abjad / ebced? (por su texto: caption de Instagram o mensaje de Facebook). */
export function esPublicacionAbjad(texto: string) {
  const sinVocales = texto.normalize("NFC").replace(/[\u064B-\u065F\u0670]/g, "");
  return /abjad|ebced|ebcet|jummal|jumal|جمل|أبجد|ابجد/i.test(sinVocales);
}

/**
 * Idioma del texto de una publicación: árabe si predomina la escritura árabe; si no, el de su texto latino (los
 * hashtags como #حساب_الجمل no lo cambian).
 */
export function idiomaDePublicacion(texto: string): Idioma {
  const sinEtiquetas = texto.replace(/#\S+/g, " ");
  const arabes = (sinEtiquetas.match(/[\u0600-\u06FF]/g) ?? []).length;
  const latinas = (sinEtiquetas.match(/[A-Za-zÀ-ÿĞğİıŞş]/g) ?? []).length;
  if (arabes > latinas) return "ar";
  return idiomaConversacion(sinEtiquetas.replace(/[\u0600-\u06FF]+/g, " "));
}

/** Palabras que se comentan solas y no son nombres (agradecer, reaccionar, criticar). */
const NO_NOMBRES = /^(gracias|grac|amen|amén|ok|okay|wow|hola|si|sí|no|thanks|thank you|thx|yes|nice|love|merci|obrigad[oa]|terima kasih|teşekkürler|tesekkurler|sağol|merhaba|selam|maşallah|mashallah|masha ?allah|inshallah|haram|günah|shirk|bid'?ah|شكرا|شكراً|حرام|شرك|بدعة|نعم|لا|ماشاء الله|ما شاء الله|سبحان الله|الله أكبر|الحمد لله|آمين|امين|مرحبا|السلام عليكم)$/i;

/** El nombre del comentario, si el comentario es solo un nombre (sin emojis ni signos); si no, null. */
export function nombreDelComentario(texto: string): string | null {
  const limpio = texto
    .normalize("NFC")
    .replace(/[ً-ٰٟ]/g, "") // vocales cortas árabes
    .replace(/[^\p{L}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!limpio || limpio.length > 40 || /\d|\?|؟/.test(texto)) return null;
  const palabras = limpio.split(" ");
  if (palabras.length > 4 || palabras.some((p) => p.length < 2)) return null;
  if (NO_NOMBRES.test(limpio)) return null;
  return limpio;
}

const SIGNIFICADOS: Record<Idioma, readonly string[]> = {
  es: ["inicios", "armonía", "creatividad", "estabilidad", "libertad", "amor y responsabilidad", "sabiduría", "fuerza y logro", "generosidad"],
  en: ["new beginnings", "harmony", "creativity", "stability", "freedom", "love and responsibility", "wisdom", "strength and achievement", "generosity"],
  pt: ["inícios", "harmonia", "criatividade", "estabilidade", "liberdade", "amor e responsabilidade", "sabedoria", "força e conquista", "generosidade"],
  fr: ["les commencements", "l'harmonie", "la créativité", "la stabilité", "la liberté", "l'amour et la responsabilité", "la sagesse", "la force et la réussite", "la générosité"],
  tr: ["başlangıçlar", "uyum", "yaratıcılık", "istikrar", "özgürlük", "sevgi ve sorumluluk", "bilgelik", "güç ve başarı", "cömertlik"],
  ar: ["البدايات", "الانسجام", "الإبداع", "الاستقرار", "الحرية", "الحب والمسؤولية", "الحكمة", "القوة والإنجاز", "الكرم"],
  id: ["awal baru", "harmoni", "kreativitas", "stabilitas", "kebebasan", "cinta dan tanggung jawab", "kebijaksanaan", "kekuatan dan pencapaian", "kemurahan hati"],
  hi: ["नई शुरुआत", "सामंजस्य", "रचनात्मकता", "स्थिरता", "स्वतंत्रता", "प्रेम और ज़िम्मेदारी", "ज्ञान", "शक्ति और सफलता", "उदारता"],
};

/** «[nombre] = [valor] en حساب الجُمَّل, raíz [n]: [significado]» + invitación al enlace (bio en Instagram, perfil en Facebook). */
const PLANTILLA: Record<Idioma, (n: string, v: number, r: number, s: string, red: "instagram" | "facebook") => string> = {
  es: (n, v, r, s, red) => `${n} = ${v} en حساب الجُمَّل, raíz ${r}: ${s}. Lo que tu nombre dice de ti, completo, en el enlace ${red === "facebook" ? "de nuestro perfil" : "de la bio"} 🔮`,
  en: (n, v, r, s, red) => `${n} = ${v} in حساب الجُمَّل, root ${r}: ${s}. The full reading of your name is in the link ${red === "facebook" ? "on our profile" : "in our bio"} 🔮`,
  pt: (n, v, r, s, red) => `${n} = ${v} em حساب الجُمَّل, raiz ${r}: ${s}. A leitura completa do seu nome está no link ${red === "facebook" ? "do nosso perfil" : "da bio"} 🔮`,
  fr: (n, v, r, s, red) => `${n} = ${v} en حساب الجُمَّل, racine ${r} : ${s}. La lecture complète de ton prénom est dans le lien ${red === "facebook" ? "de notre profil" : "de la bio"} 🔮`,
  tr: (n, v, r, s, red) => `${n} = ${v} (حساب الجُمَّل, ebced), kök ${r}: ${s}. Adının tam yorumu ${red === "facebook" ? "profilimizdeki" : "biyografideki"} bağlantıda 🔮`,
  ar: (n, v, r, s, red) => `${n} = ${v} في حساب الجُمَّل، الجذر ${r}: ${s}. القراءة الكاملة لاسمك في الرابط ${red === "facebook" ? "الموجود في صفحتنا" : "الموجود في السيرة"} 🔮`,
  id: (n, v, r, s, red) => `${n} = ${v} dalam حساب الجُمَّل, akar ${r}: ${s}. Bacaan lengkap namamu ada di tautan ${red === "facebook" ? "di profil kami" : "di bio"} 🔮`,
  hi: (n, v, r, s, red) => `${n} = ${v} (حساب الجُمَّل), मूलांक ${r}: ${s}। आपके नाम की पूरी रीडिंग ${red === "facebook" ? "हमारी प्रोफ़ाइल" : "बायो"} के लिंक में है 🔮`,
};

/**
 * Respuesta a un comentario que es solo un nombre, en un reel de abjad: null si no es un nombre o no tiene letras
 * que contar. El idioma es el del comentario; si es un nombre en letras latinas sin más pistas, el de la publicación.
 */
export function respuestaNombreAbjad(comentario: string, textoPublicacion: string, red: "instagram" | "facebook"): string | null {
  const nombre = nombreDelComentario(comentario);
  if (!nombre) return null;
  const arabe = esEscrituraArabe(nombre);
  const idioma: Idioma = arabe ? "ar" : idiomaConversacion(comentario) !== "es" ? idiomaConversacion(comentario) : idiomaDePublicacion(textoPublicacion);
  const grafia = arabe ? nombre : transliterar(nombre, idioma);
  const valor = valorJummal(grafia);
  if (valor <= 0) return null;
  const raiz = raizDigital(valor);
  const mostrado = arabe ? nombre : `${nombre} (${grafia})`;
  return PLANTILLA[idioma](mostrado, valor, raiz, SIGNIFICADOS[idioma][raiz - 1], red);
}
