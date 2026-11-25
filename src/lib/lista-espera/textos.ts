import type { Idioma } from "@/lib/i18n/idiomas";

/** Cursos (y otros productos) que aún no existen y tienen lista de espera. */
export const CURSOS = ["rituales"] as const;
export type Curso = (typeof CURSOS)[number];

export interface TextosListaEspera {
  antetitulo: string;
  titulo: string;
  texto: string;
  correo: string;
  boton: string;
  listo: string;
  error: string;
  nota: string;
}

/** Invitación a la lista de espera del curso de rituales, en los 8 idiomas. Sin promesas de resultados. */
export const TEXTOS_LISTA_ESPERA: Record<Idioma, TextosListaEspera> = {
  es: {
    antetitulo: "Muy pronto",
    titulo: "Curso de rituales con Sibila",
    texto: "Siete días, una lección por día: un video corto y un ritual guiado, desde la tradición (velas, Luna, limpias y cierres de ciclo). ¿Te aviso cuando abra?",
    correo: "Tu correo",
    boton: "Avísame",
    listo: "¡Listo! Te escribo cuando abra el curso 🕯️",
    error: "Revisa tu correo e inténtalo de nuevo.",
    nota: "Solo te escribiremos para avisarte del curso.",
  },
  en: {
    antetitulo: "Coming soon",
    titulo: "Rituals course with Sibila",
    texto: "Seven days, one lesson a day: a short video and a guided ritual, from tradition (candles, the Moon, cleansings and closing cycles). Shall I let you know when it opens?",
    correo: "Your email",
    boton: "Notify me",
    listo: "Done! I'll write to you when the course opens 🕯️",
    error: "Check your email and try again.",
    nota: "We'll only write to tell you about the course.",
  },
  pt: {
    antetitulo: "Em breve",
    titulo: "Curso de rituais com a Sibila",
    texto: "Sete dias, uma lição por dia: um vídeo curto e um ritual guiado, a partir da tradição (velas, Lua, limpezas e fechamento de ciclos). Quer que eu te avise quando abrir?",
    correo: "Seu e-mail",
    boton: "Me avise",
    listo: "Pronto! Te escrevo quando o curso abrir 🕯️",
    error: "Confira seu e-mail e tente de novo.",
    nota: "Só vamos te escrever para avisar do curso.",
  },
  fr: {
    antetitulo: "Bientôt",
    titulo: "Cours de rituels avec Sibila",
    texto: "Sept jours, une leçon par jour : une courte vidéo et un rituel guidé, selon la tradition (bougies, Lune, nettoyages et fins de cycle). Je te préviens à l'ouverture ?",
    correo: "Ton e-mail",
    boton: "Préviens-moi",
    listo: "C'est noté ! Je t'écris à l'ouverture du cours 🕯️",
    error: "Vérifie ton e-mail et réessaie.",
    nota: "Nous t'écrirons seulement pour te prévenir du cours.",
  },
  tr: {
    antetitulo: "Çok yakında",
    titulo: "Sibila ile ritüel kursu",
    texto: "Yedi gün, her gün bir ders: kısa bir video ve gelenekten rehberli bir ritüel (mumlar, Ay, arınmalar ve döngü kapatma). Açıldığında sana haber vereyim mi?",
    correo: "E-postan",
    boton: "Bana haber ver",
    listo: "Tamam! Kurs açıldığında sana yazacağım 🕯️",
    error: "E-postanı kontrol edip tekrar dene.",
    nota: "Sana yalnızca kursu haber vermek için yazacağız.",
  },
  ar: {
    antetitulo: "قريبًا",
    titulo: "دورة الطقوس مع سيبيلا",
    texto: "سبعة أيام، ودرس كل يوم: فيديو قصير وطقس مُرشَد من التقاليد (الشموع، والقمر، والتنقية، وإغلاق الدورات). هل أُخبرك حين تُفتح؟",
    correo: "بريدك الإلكتروني",
    boton: "أخبرني",
    listo: "تمّ! سأكتب لك حين تُفتح الدورة 🕯️",
    error: "تحقّق من بريدك وحاول مرة أخرى.",
    nota: "لن نكتب لك إلا لإخبارك بالدورة.",
  },
  id: {
    antetitulo: "Segera hadir",
    titulo: "Kursus ritual bersama Sibila",
    texto: "Tujuh hari, satu pelajaran setiap hari: video singkat dan ritual terpandu, dari tradisi (lilin, Bulan, pembersihan, dan menutup siklus). Mau kukabari saat dibuka?",
    correo: "Email-mu",
    boton: "Kabari aku",
    listo: "Siap! Aku akan menulis saat kursusnya dibuka 🕯️",
    error: "Periksa email-mu dan coba lagi.",
    nota: "Kami hanya akan menulis untuk mengabarkan kursus ini.",
  },
  hi: {
    antetitulo: "जल्द ही",
    titulo: "सिबिला के साथ अनुष्ठान कोर्स",
    texto: "सात दिन, हर दिन एक पाठ: एक छोटा वीडियो और परंपरा से एक निर्देशित अनुष्ठान (मोमबत्तियाँ, चंद्रमा, शुद्धि और चक्र पूरे करना)। खुलने पर आपको बताऊँ?",
    correo: "आपका ईमेल",
    boton: "मुझे बताएँ",
    listo: "हो गया! कोर्स खुलने पर मैं आपको लिखूँगी 🕯️",
    error: "अपना ईमेल जाँचकर फिर से कोशिश करें।",
    nota: "हम आपको सिर्फ़ कोर्स की सूचना देने के लिए लिखेंगे।",
  },
};
