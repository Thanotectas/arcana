import type { Idioma } from "@/lib/i18n/idiomas";
import { esEscrituraArabe, transliterar } from "@/lib/abjad/calculo";
import { idiomaConversacion } from "./respuestas-fijas";
import { idiomaDePublicacion, nombreDelComentario, valorJummal } from "./abjad-comentarios";
import { nombresDelComentario } from "./yildizname-comentarios";

/**
 * Comentarios en el reel de compatibilidad de pareja por abjad / ebced (gancho: Leyla y Majnún). Método fijo, para que
 * la respuesta sea siempre la misma: valor abjad de cada nombre escrito en árabe (los latinos o turcos se transcriben
 * como en el reel del abjad), se suman, y el resultado es la suma módulo 9 (un residuo 0 es 9). Los nueve resultados
 * son positivos: es entretenimiento y nunca dice que una pareja no es compatible.
 */

export function esPublicacionCompatibilidad(texto: string) {
  return /توافق|uyum|compatib|mecnun|majn[uú]n|قيس/i.test(texto) && /abjad|ebced|ebcet|جمل|أبجد|ابجد|حساب|numerolog/i.test(texto.normalize("NFC").replace(/[ً-ٰٟ]/g, ""));
}

/** Majnún («el loco de amor») es el apodo de Qays: se cuenta siempre como قيس, igual que en el reel. */
const ALIAS: Record<string, string> = { mecnun: "قيس", "mecnûn": "قيس", majnun: "قيس", "majnún": "قيس", mejnun: "قيس", "مجنون": "قيس", qays: "قيس", kays: "قيس", qais: "قيس", kais: "قيس", "kayıs": "قيس" };

/** Nombres árabes que empiezan con و: en «ليلى وليد» la و es parte del nombre, no la conjunción. */
const NOMBRES_CON_WAW = /^(وليد|وسيم|وفاء|وعد|وئام|وجدان|وداد|ورد|وردة|وصال|وائل|وهيب|وحيد|وديع|وديعة|ولاء|وسام|وجيه|وفيق|وهبة|وضاح|ودود|وحيدة|ونس|وليدة)$/;

/** Los nombres del comentario (1 o 2). Además de «+», «,», «و», «ve»…, acepta «ليلى وقيس» con la و pegada. */
export function nombresDePareja(texto: string): string[] | null {
  const limpio = texto.normalize("NFC").replace(/[ً-ٰٟ]/g, "").replace(/[^\p{L}\s'+,،/&|-]/gu, " ").replace(/\s+/g, " ").trim();
  const palabras = limpio.split(" ");
  if (palabras.length === 2 && esEscrituraArabe(limpio) && palabras[1].startsWith("و") && palabras[1].length >= 4 && !NOMBRES_CON_WAW.test(palabras[1])) {
    const segundo = palabras[1].slice(1);
    if (nombreDelComentario(palabras[0]) && nombreDelComentario(segundo)) return [palabras[0], segundo];
  }
  return nombresDelComentario(texto);
}

/** Escritura árabe del nombre (con los alias de Majnún) y su valor. */
function valorNombre(nombre: string, idioma: Idioma) {
  const alias = ALIAS[nombre.toLocaleLowerCase("tr").trim()];
  const arabe = alias ?? (esEscrituraArabe(nombre) ? nombre : transliterar(nombre, idioma));
  return { arabe, valor: valorJummal(arabe), mostrar: esEscrituraArabe(nombre) ? nombre : `${nombre} (${arabe})` };
}

export function numeroDePareja(suma: number) {
  return suma % 9 === 0 ? 9 : suma % 9;
}

const SENTIDOS: Record<Idioma, readonly string[]> = {
  ar: ["قيادة مشتركة", "تناغم وهدوء", "فرح وشغف", "استقرار وبيت دافئ", "مغامرة وشرارة", "حب وحنان", "روحان متصلتان", "قوة ونجاح معاً", "حب كبير يحتاج صبراً"],
  tr: ["Ortak güç", "Uyum ve huzur", "Neşe ve tutku", "Sağlam bir yuva", "Macera ve kıvılcım", "Sevgi ve şefkat", "Ruh bağı", "Birlikte başarı", "Sabır isteyen büyük aşk"],
  es: ["Fuerza compartida", "Armonía y paz", "Alegría y pasión", "Un hogar firme", "Aventura y chispa", "Amor y ternura", "Almas conectadas", "Éxito juntos", "Un gran amor que pide paciencia"],
  en: ["Shared strength", "Harmony and peace", "Joy and passion", "A solid home", "Adventure and spark", "Love and tenderness", "Connected souls", "Success together", "A great love that asks for patience"],
  pt: ["Força compartilhada", "Harmonia e paz", "Alegria e paixão", "Um lar firme", "Aventura e faísca", "Amor e ternura", "Almas conectadas", "Sucesso juntos", "Um grande amor que pede paciência"],
  fr: ["Force partagée", "Harmonie et paix", "Joie et passion", "Un foyer solide", "Aventure et étincelle", "Amour et tendresse", "Âmes liées", "Réussite à deux", "Un grand amour qui demande de la patience"],
  id: ["Kekuatan bersama", "Harmoni dan damai", "Sukacita dan gairah", "Rumah yang kokoh", "Petualangan dan percikan", "Cinta dan kelembutan", "Jiwa yang terhubung", "Sukses bersama", "Cinta besar yang butuh kesabaran"],
  hi: ["साझा शक्ति", "सामंजस्य और शांति", "आनंद और जुनून", "मज़बूत घर", "रोमांच और चिंगारी", "प्रेम और कोमलता", "जुड़ी हुई आत्माएँ", "साथ में सफलता", "बड़ा प्रेम जो धैर्य माँगता है"],
};

type Red = "instagram" | "facebook";
const ENLACE: Record<Idioma, (red: Red) => string> = {
  ar: (r) => (r === "facebook" ? "القراءة الكاملة في الرابط الموجود في صفحتنا" : "القراءة الكاملة في الرابط بالبايو"),
  tr: (r) => (r === "facebook" ? "Tam okuma profilimizdeki linkte" : "Tam okuma bio'daki linkte"),
  es: (r) => (r === "facebook" ? "La lectura completa, en el enlace de nuestro perfil" : "La lectura completa, en el enlace de la bio"),
  en: (r) => (r === "facebook" ? "The full reading is in the link on our profile" : "The full reading is in the link in our bio"),
  pt: (r) => (r === "facebook" ? "A leitura completa está no link do nosso perfil" : "A leitura completa está no link da bio"),
  fr: (r) => (r === "facebook" ? "La lecture complète est dans le lien de notre profil" : "La lecture complète est dans le lien de la bio"),
  id: (r) => (r === "facebook" ? "Bacaan lengkapnya ada di tautan di profil kami" : "Bacaan lengkapnya ada di tautan di bio"),
  hi: (r) => (r === "facebook" ? "पूरी रीडिंग हमारी प्रोफ़ाइल के लिंक में है" : "पूरी रीडिंग बायो के लिंक में है"),
};

/** Un solo nombre: su valor y la invitación a escribir el segundo. */
const UNO: Record<Idioma, (n: string, v: number) => string> = {
  ar: (n, v) => `${n} = ${v} في حساب الجُمَّل ✨ اكتب بجانبه اسم من تحب لنحسب توافقكما 💞`,
  tr: (n, v) => `${n} = ${v} (ebced) ✨ Yanına sevdiğinin ismini de yaz, uyumunuzu hesaplayalım 💞`,
  es: (n, v) => `${n} = ${v} en حساب الجُمَّل ✨ Escribe al lado el nombre de quien amas y calculamos su compatibilidad 💞`,
  en: (n, v) => `${n} = ${v} in حساب الجُمَّل ✨ Write the name of the one you love next to it and we'll calculate your match 💞`,
  pt: (n, v) => `${n} = ${v} em حساب الجُمَّل ✨ Escreva ao lado o nome de quem você ama e calculamos a compatibilidade 💞`,
  fr: (n, v) => `${n} = ${v} en حساب الجُمَّل ✨ Écris à côté le prénom de la personne que tu aimes et on calcule votre compatibilité 💞`,
  id: (n, v) => `${n} = ${v} dalam حساب الجُمَّل ✨ Tulis di sebelahnya nama orang yang kamu cintai, kami hitung kecocokan kalian 💞`,
  hi: (n, v) => `${n} = ${v} (حساب الجُمَّل) ✨ साथ में अपने प्रिय का नाम लिखिए, हम आपकी अनुकूलता निकालेंगे 💞`,
};

/**
 * Respuesta a un comentario en el reel de compatibilidad. Dos nombres: «{1} 💞 {2}: v1 + v2 = suma → n · sentido».
 * Un nombre: su valor e invitación al segundo. null si no hay nombres (responde Sibila, sin inventar cuentas).
 */
export function respuestaCompatibilidad(comentario: string, textoPublicacion: string, red: Red): string | null {
  const nombres = nombresDePareja(comentario);
  if (!nombres) return null;
  const arabe = esEscrituraArabe(comentario);
  const idioma: Idioma = arabe ? "ar" : idiomaConversacion(comentario) !== "es" ? idiomaConversacion(comentario) : idiomaDePublicacion(textoPublicacion);
  const [a, b] = nombres.map((n) => valorNombre(n, idioma));
  if (!a || a.valor <= 0) return null;
  if (!b) return UNO[idioma](a.mostrar, a.valor);
  if (b.valor <= 0) return null;
  const suma = a.valor + b.valor;
  const n = numeroDePareja(suma);
  const flecha = idioma === "ar" ? "←" : "→";
  return `${a.mostrar} 💞 ${b.mostrar}: ${a.valor} + ${b.valor} = ${suma} ${flecha} ${n} · ${SENTIDOS[idioma][n - 1]} ✨ ${ENLACE[idioma](red)}`;
}
