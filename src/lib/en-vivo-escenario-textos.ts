
/**
 * Textos de la pantalla del escenario en vivo: español (YouTube, Facebook, TikTok) y árabe (el vivo de Instagram,
 * con &idioma=ar). Las lecturas igual salen en el idioma de cada pregunta: esto es solo lo que está fijo en pantalla.
 */
export type IdiomaEscenario = "es" | "ar";
/** Lecturas del vivo (las de en_vivo_preguntas.tipo). */
type TipoVivo = "tarot" | "aura" | "numerologia" | "horoscopo" | "chocolate" | "mano" | "huevo" | "carta" | "sinastria" | "pendulo" | "iching" | "runas" | "lenormand" | "baraja" | "chino";

interface TextosEscenario {
  tipos: Record<TipoVivo, string>;
  instrucciones: { titulo: string; ejemplo: string }[];
  leePara: string;
  enVivo: string;
  sibilaEnVivo: string;
  lecturasEnVivo: string;
  escribeComentarios: string;
  escribeChat: string;
  lecturaPara: string;
  seAcabo: string;
  gracias: string;
  sigueme: string;
  suscribete: string;
  proximo: string;
  cartaGratis: string;
  subeFoto: string;
  miMesa: string;
  /** Posiciones de las cartas (el servidor las manda en español). */
  posiciones: Record<string, string>;
  /** Ayuda fija de abajo (vertical), sin «·» al final. */
  ayuda: [string, string];
}

export const TEXTOS_ESCENARIO: Record<IdiomaEscenario, TextosEscenario> = {
  es: {
    tipos: { tarot: "Tarot", aura: "Lectura de aura", numerologia: "Numerología", horoscopo: "Horóscopo", chocolate: "Lectura del chocolate", mano: "Lectura de la mano", huevo: "Limpia con huevo", carta: "Carta astral", sinastria: "Sinastría", pendulo: "Péndulo", iching: "I Ching", runas: "Runas", lenormand: "Lenormand", baraja: "Baraja española", chino: "Horóscopo chino" },
    // La carta astral y la sinastría salen la mitad del tiempo: son lo que el directo impulsa.
    instrucciones: [
      { titulo: "Tu carta astral, dibujada en vivo", ejemplo: "carta astral 14/03/1985 10:30 Medellín" },
      { titulo: "Sinastría · sus dos cielos juntos", ejemplo: "sinastría 14/03/1985 y 22/08/1990" },
      { titulo: "Tarot · tres cartas para ti", ejemplo: "Leo, ¿me sale el trabajo?" },
      { titulo: "Carta astral · sin la hora también", ejemplo: "carta astral 03/07/1992 Bogotá" },
      { titulo: "Sinastría · ¿son compatibles?", ejemplo: "sinastría 25/11/1989 y 09/02/1994" },
      { titulo: "Horóscopo · tu cielo de hoy", ejemplo: "horóscopo Piscis" },
      { titulo: "Aura · el color de tu energía", ejemplo: "aura: ando muy cansada" },
      { titulo: "Numerología · lo que trae tu año", ejemplo: "mi año 14/03/1985" },
      { titulo: "Péndulo · sí o no", ejemplo: "péndulo: ¿me escribe esta semana?" },
      { titulo: "I Ching · el libro de los cambios", ejemplo: "I Ching: ¿cambio de trabajo?" },
      { titulo: "Runas · tres piedras para ti", ejemplo: "runas: ¿qué viene en el amor?" },
      { titulo: "Horóscopo chino · tu animal", ejemplo: "horóscopo chino 1990" },
    ],
    leePara: "Sibila lee para",
    enVivo: "EN VIVO",
    sibilaEnVivo: "Sibila en vivo",
    lecturasEnVivo: "Lecturas en vivo · Arcana",
    escribeComentarios: "Escribe en los comentarios",
    escribeChat: "Escribe en el chat",
    lecturaPara: "Lectura para",
    seAcabo: "Se acabó el tiempo por esta noche",
    gracias: "Gracias por acompañarnos ✦",
    sigueme: "Sígueme y activa las notificaciones",
    suscribete: "Suscríbete y activa la campanita",
    proximo: "para enterarte del próximo directo de Sibila",
    cartaGratis: "Tu carta del día es gratis en",
    subeFoto: "¿Tu limpia con huevo, tu taza o tu mano? Sube la foto en",
    miMesa: "Mi mesa · en vivo",
    posiciones: {},
    ayuda: ["Escribe en los comentarios tu signo y tu pregunta", "carta astral + fecha · sinastría + dos fechas · péndulo"],
  },
  ar: {
    tipos: { tarot: "التاروت", aura: "قراءة الهالة", numerologia: "علم الأرقام", horoscopo: "الأبراج", chocolate: "قراءة الشوكولاتة", mano: "قراءة الكف", huevo: "تنظيف بالبيض", carta: "الخريطة الفلكية", sinastria: "التوافق", pendulo: "البندول", iching: "آي تشينغ", runas: "الرونز", lenormand: "لونورماند", baraja: "الورق الإسباني", chino: "الأبراج الصينية" },
    instrucciones: [
      { titulo: "سؤالك · ثلاث أوراق تاروت لك", ejemplo: "هل سأجد عملًا جديدًا؟" },
      { titulo: "برجك · سماؤك اليوم", ejemplo: "برج الأسد" },
      { titulo: "خريطتك الفلكية مرسومة مباشرة", ejemplo: "خريطة فلكية 14/03/1985 الرياض" },
      { titulo: "التوافق · سماؤكما معًا", ejemplo: "توافق 14/03/1985 و 22/08/1990" },
      { titulo: "رقمك · ما تحمله لك سنتك", ejemplo: "14/03/1985" },
      { titulo: "البندول · نعم أم لا", ejemplo: "بندول: هل سيكلمني هذا الأسبوع؟" },
    ],
    leePara: "سيبيلا تقرأ لـ",
    enVivo: "مباشر",
    sibilaEnVivo: "سيبيلا مباشرة",
    lecturasEnVivo: "قراءات مباشرة · أركانا",
    escribeComentarios: "اكتب في التعليقات",
    escribeChat: "اكتب في التعليقات",
    lecturaPara: "قراءة لـ",
    seAcabo: "انتهى وقتنا لهذه الليلة",
    gracias: "شكرًا لأنكم كنتم معنا ✦",
    sigueme: "تابعني وفعّل التنبيهات",
    suscribete: "تابعني وفعّل التنبيهات",
    proximo: "لتعرف موعد البث القادم لسيبيلا",
    cartaGratis: "ورقة يومك مجانية على",
    subeFoto: "",
    miMesa: "طاولتي · مباشر",
    posiciones: { "Lo que te rodea": "ما يحيط بك", "Lo que se mueve": "ما يتحرك", "Tu consejo": "نصيحتك", "Lo que viene": "ما هو آت" },
    ayuda: ["اكتب في التعليقات برجك وسؤالك", "خريطة فلكية + تاريخ · توافق + تاريخان · بندول"],
  },
};
