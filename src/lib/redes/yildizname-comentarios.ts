import type { Idioma } from "@/lib/i18n/idiomas";
import { SIGNOS } from "@/lib/zodiaco";
import { SIGNOS_IDIOMA } from "@/lib/juego/textos";
import { esEscrituraArabe } from "@/lib/abjad/calculo";
import { calcularYildizname } from "@/lib/yildizname/calculo";
import { TEXTOS_YILDIZNAME } from "@/lib/yildizname/textos";
import { idiomaConversacion } from "./respuestas-fijas";
import { idiomaDePublicacion, nombreDelComentario } from "./abjad-comentarios";

/** Palabras de reacción que no son nombres, en los idiomas de los reels. */
const PALABRAS_COMUNES = /^(hermos[oa]|lind[oa]|bonit[oa]|precios[oa]|genial|video|vídeo|que|qué|yo|mi|me|mamá|mama|madre|beautiful|amazing|love|nice|wow|güzel|harika|çok|süper|annem|ben|جميل|جميلة|رائع|رائعة|الله|ماشاء|حلو|ممتاز|أمي|امي|انا|أنا)$/i;

/**
 * Comentarios en un reel del Yıldızname: «tu nombre + el de tu madre». Se calcula con el mismo módulo que la lectura
 * de la página (así el comentario y la lectura dan lo mismo), nunca con el modelo, y se responde con una plantilla en
 * el idioma del comentario. Si solo viene un nombre, se pide el de la madre.
 */

export function esPublicacionYildizname(texto: string) {
  return /y[ıi]ld[ıi]zn[aâ]me|يلدز ?نامه|libro de las estrellas|book of the stars|yıldızların kitabı|كتاب النجوم/i.test(texto);
}

/** Separadores entre los dos nombres: «+», «,», «-», «/», «&» y la palabra «y / and / ve / e / et / dan / و» suelta. */
const SEPARADOR = /\s*(?:[+,،/&|]|\s-\s|\s(?:y|and|ve|e|et|dan|und|و)\s)\s*/i;

/** Los nombres del comentario (1 o 2), sin emojis ni signos; null si no parece una lista de nombres. */
export function nombresDelComentario(texto: string): string[] | null {
  if (/\d|\?|؟/.test(texto)) return null;
  const limpio = texto
    .normalize("NFC")
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[^\p{L}\s'+,،/&|-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!limpio || limpio.length > 60) return null;
  let partes = limpio.split(SEPARADOR).map((p) => p.replace(/[+,،/&|-]/g, "").trim()).filter(Boolean);
  // Sin separador: dos palabras son dos nombres («Leyla Deniz»), y en letras latinas solo si las dos van con mayúscula
  // (así «lindo video» no se toma por dos nombres); una es un solo nombre; más, no se adivina.
  if (partes.length === 1) {
    const palabras = partes[0].split(" ");
    if (palabras.length === 2) {
      if (!esEscrituraArabe(partes[0]) && !palabras.every((w) => /^\p{Lu}/u.test(w))) return null;
      partes = palabras;
    } else if (palabras.length > 2) return null;
  }
  if (partes.length > 2 || partes.some((p) => p.length < 2 || p.split(" ").length > 3)) return null;
  // Cada parte tiene que poder ser un nombre (no «gracias», «haram», «شكرا», «جميل»…).
  if (partes.some((p) => !nombreDelComentario(p) || PALABRAS_COMUNES.test(p))) return null;
  return partes;
}

const PLANTILLA: Record<Idioma, { estrella: (cuenta: string, signo: string, planeta: string, dia: string, red: "instagram" | "facebook") => string; madre: (nombre: string) => string }> = {
  es: {
    estrella: (c, s, p, d, red) => `${c} → tu estrella: ${s} · planeta: ${p} · día: ${d.toLowerCase()} 🌙 Tu yıldızname completo, con tu carácter y lo que anuncia, en el enlace ${red === "facebook" ? "de nuestro perfil" : "de la bio"} 🔮`,
    madre: (n) => `${n}, en el yıldızname se suma también el nombre de tu madre ✨ Escríbelo así: «${n} + el nombre de tu mamá» y te digo tu estrella 🔮`,
  },
  en: {
    estrella: (c, s, p, d, red) => `${c} → your star: ${s} · planet: ${p} · day: ${d} 🌙 Your full yıldızname, with your character and what it foretells, is in the link ${red === "facebook" ? "on our profile" : "in our bio"} 🔮`,
    madre: (n) => `${n}, the yıldızname also adds your mother's name ✨ Write it like this: “${n} + your mother's name” and I'll tell you your star 🔮`,
  },
  pt: {
    estrella: (c, s, p, d, red) => `${c} → sua estrela: ${s} · planeta: ${p} · dia: ${d.toLowerCase()} 🌙 Seu yıldızname completo, com seu caráter e o que ele anuncia, está no link ${red === "facebook" ? "do nosso perfil" : "da bio"} 🔮`,
    madre: (n) => `${n}, no yıldızname também se soma o nome da sua mãe ✨ Escreva assim: «${n} + o nome da sua mãe» e eu te digo sua estrela 🔮`,
  },
  fr: {
    estrella: (c, s, p, d, red) => `${c} → ton étoile : ${s} · planète : ${p} · jour : ${d.toLowerCase()} 🌙 Ton yıldızname complet, avec ton caractère et ce qu'il annonce, est dans le lien ${red === "facebook" ? "de notre profil" : "de la bio"} 🔮`,
    madre: (n) => `${n}, dans le yıldızname on ajoute aussi le prénom de ta mère ✨ Écris-le ainsi : « ${n} + le prénom de ta mère » et je te dis ton étoile 🔮`,
  },
  tr: {
    estrella: (c, s, p, d, red) => `${c} → yıldızın ${s}, gezegenin ${p}, günün ${d} 🌙 Karakterin ve sana anlattıklarıyla tam yıldıznamen ${red === "facebook" ? "profilimizdeki" : "biyografideki"} bağlantıda 🔮`,
    madre: (n) => `${n}, yıldıznamede annenin adı da eklenir ✨ Şöyle yaz: «${n} + annenin adı», sana yıldızını söyleyeyim 🔮`,
  },
  ar: {
    estrella: (c, s, p, d, red) => `${c} ← نجمك ${s}، وكوكبك ${p}، ويومك ${d} 🌙 قراءة «يلدز نامه» الكاملة بطبعك وبما يبشّر به في الرابط ${red === "facebook" ? "الموجود في صفحتنا" : "الموجود في السيرة"} 🔮`,
    madre: (n) => `${n}، في «يلدز نامه» يُضاف اسم الأم أيضًا ✨ اكتبه هكذا: «${n} + اسم أمك» وسأخبرك بنجمك 🔮`,
  },
  id: {
    estrella: (c, s, p, d, red) => `${c} → bintangmu: ${s} · planet: ${p} · hari: ${d} 🌙 Yıldızname lengkapmu, dengan karaktermu dan apa yang ditandakannya, ada di tautan ${red === "facebook" ? "di profil kami" : "di bio"} 🔮`,
    madre: (n) => `${n}, dalam yıldızname nama ibumu juga dijumlahkan ✨ Tulis begini: «${n} + nama ibumu» dan akan kuberi tahu bintangmu 🔮`,
  },
  hi: {
    estrella: (c, s, p, d, red) => `${c} → आपका सितारा ${s} है, ग्रह ${p} और दिन ${d} 🌙 आपका पूरा यिल्दिज़नामे ${red === "facebook" ? "हमारी प्रोफ़ाइल" : "बायो"} के लिंक में है 🔮`,
    madre: (n) => `${n}, यिल्दिज़नामे में माँ का नाम भी जोड़ा जाता है ✨ ऐसे लिखिए: «${n} + आपकी माँ का नाम» और मैं आपका सितारा बताऊँगी 🔮`,
  },
};

/**
 * Respuesta a un comentario en un reel del Yıldızname. null si el comentario no trae nombres (entonces responde Sibila
 * con sus instrucciones, que le piden no inventar cuentas).
 */
export function respuestaYildizname(comentario: string, textoPublicacion: string, red: "instagram" | "facebook"): string | null {
  const nombres = nombresDelComentario(comentario);
  if (!nombres) return null;
  const arabe = esEscrituraArabe(comentario);
  const idioma: Idioma = arabe ? "ar" : idiomaConversacion(comentario) !== "es" ? idiomaConversacion(comentario) : idiomaDePublicacion(textoPublicacion);
  const p = PLANTILLA[idioma];
  if (nombres.length === 1) return p.madre(nombres[0]);
  const r = calcularYildizname({ nombre: nombres[0], madre: nombres[1] }, idioma);
  if (!r || !r.abjad.madre) return null;
  const mostrar = (nombre: string, grafia: string) => (esEscrituraArabe(nombre) ? nombre : `${nombre} (${grafia})`);
  const cuenta = `${mostrar(nombres[0], r.abjad.persona.escritura)} + ${mostrar(nombres[1], r.abjad.madre.escritura)} = ${r.abjad.persona.total} + ${r.abjad.madre.total} = ${r.total}`;
  const signo = SIGNOS.find((s) => s.id === r.signo)!;
  const nombreSigno = `${idioma === "es" ? signo.nombre : (SIGNOS_IDIOMA[idioma][signo.id] ?? signo.nombre)} ${signo.simbolo}`;
  const t = TEXTOS_YILDIZNAME[idioma];
  return p.estrella(cuenta, nombreSigno, t.planetas[r.planeta], t.dias[r.dia], red);
}
