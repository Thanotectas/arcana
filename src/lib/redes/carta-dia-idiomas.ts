import "server-only";
import { generarTexto } from "@/lib/ia";
import { PAQUETE_PRUEBA } from "@/lib/creditos";
import { MAZOS } from "@/lib/tarot/mazos";
import { nombreCarta, palabrasCarta } from "@/lib/juego/cartas-idiomas";
import { cartaDelDia, frase, mazoDelDia } from "./carta-dia";
import type { TextosReel } from "./reel";

/**
 * La carta del día en otros idiomas (turco y árabe, desde noviembre de 2026): un reel aparte en las mismas cuentas,
 * a la mañana de esos países. La carta es la misma del día; su significado se traduce una vez con el modelo
 * económico y lo fijo (etiquetas, invitación, voz de cierre) está escrito aquí.
 */
export const IDIOMAS_CARTA = ["tr", "ar"] as const;
export type IdiomaCarta = (typeof IDIOMAS_CARTA)[number];

const FIJOS: Record<IdiomaCarta, {
  etiqueta: string;
  locale: string;
  mazos: Record<string, string>;
  ctaPregunta: string;
  ctaTitulo: string;
  ctaPie: string;
  vozInicio: (nombre: string) => string;
  vozCierre: string;
  amor: string;
  trabajo: string;
  claves: string;
  invitacion: (enlace: string) => string;
  tirada: (precio: string) => string;
  comenta: string;
  comunidad: (enlace: string) => string;
  hashtags: string;
  enlaceIg: string;
  enlaceFb: string;
}> = {
  tr: {
    etiqueta: "Günün kartı",
    locale: "tr-TR",
    mazos: { rider: "Rider-Waite", arcana: "Tarot Arcana", marsella: "Marsilya Tarotu", angeles: "Melekler Kartları" },
    ctaPregunta: "Kendi açılımını ister misin?",
    ctaTitulo: "Sibila sorunla ilgili üç kart okur",
    ctaPie: "Günün kartı her gün ücretsiz",
    vozInicio: (n) => `Bugünün kartı ${n}.`,
    vozCierre: "Kendi açılımını ister misin? Mi arcana nokta com'da sana üç kart okurum. Günün kartı ise her gün ücretsiz.",
    amor: "Aşkta",
    trabajo: "İşte",
    claves: "Anahtar kelimeler",
    invitacion: (e) => `🔮 Bu herkesin kartı. Kartlar sana ne söylüyor? Kendi kartını ücretsiz çek: ${e}.`,
    tirada: (p) => `✨ Kendi açılımını ister misin? Sibila sorunla ilgili üç kart okur: ${p}.`,
    comenta: "💬 Burcunu yorumlara yaz, Sibila sana cevap versin.",
    comunidad: (e) => `🌍 Bu kart sana ne söylüyor? Toplulukta anlat: herkes kendi dilinde yazıyor, herkes kendi dilinde okuyor: ${e}.`,
    hashtags: "#tarot #gününkartı #tarotfalı #fal #burçlar #miarcana",
    enlaceIg: "miarcana.com/tr (bağlantı biyografide)",
    enlaceFb: "miarcana nokta com/tr (bağlantı profilimizde)",
  },
  ar: {
    etiqueta: "بطاقة اليوم",
    locale: "ar-u-nu-latn",
    mazos: { rider: "رايدر وايت", arcana: "تاروت أركانا", marsella: "تاروت مارسيليا", angeles: "بطاقات الملائكة" },
    ctaPregunta: "هل تريد قراءتك الخاصة؟",
    ctaTitulo: "سيبيلا تقرأ لك ثلاث بطاقات عن سؤالك",
    ctaPie: "بطاقة اليوم مجانية كل يوم",
    vozInicio: (n) => `بطاقة اليوم هي ${n}.`,
    vozCierre: "هل تريد قراءتك الخاصة؟ أقرأ لك ثلاث بطاقات على مي أركانا دوت كوم. وبطاقة اليوم مجانية كل يوم.",
    amor: "في الحب",
    trabajo: "في العمل",
    claves: "كلمات مفتاحية",
    invitacion: (e) => `🔮 هذه بطاقة الجميع. ماذا تقول لك البطاقات أنت؟ اسحب بطاقتك مجانًا: ${e}.`,
    tirada: (p) => `✨ هل تريد قراءتك الخاصة؟ سيبيلا تقرأ لك ثلاث بطاقات عن سؤالك: ${p}.`,
    comenta: "💬 اكتب برجك في التعليقات وسترد عليك سيبيلا.",
    comunidad: (e) => `🌍 ماذا تقول لك هذه البطاقة؟ احكِ في المجتمع: كلٌّ يكتب بلغته ويقرأ الجميع بلغته: ${e}.`,
    hashtags: "#تاروت #بطاقة_اليوم #الأبراج #قراءة_التاروت #miarcana",
    enlaceIg: "miarcana.com/ar (الرابط في السيرة)",
    enlaceFb: "miarcana دوت كوم/ar (الرابط في صفحتنا)",
  },
};

export interface CartaTraducida {
  nombre: string;
  frase: string;
  amor: string;
  trabajo: string;
  claves: string[];
}

const NOMBRE_IDIOMA: Record<IdiomaCarta, string> = { tr: "turco (Türkçe)", ar: "árabe (العربية الفصحى المبسطة)" };

/** Traduce el texto de la carta del día (una llamada al modelo económico). */
export async function traducirCarta(fecha: string, idioma: IdiomaCarta): Promise<CartaTraducida> {
  const c = cartaDelDia(fecha);
  const nombreConocido = nombreCarta(c, idioma);
  const entrada = JSON.stringify({ nombre: c.nombre, frase: frase(c.significado, 150), significado: frase(c.significado, 320), amor: c.amor, trabajo: c.trabajo, claves: c.palabrasClave.slice(0, 3) });
  const salida = await generarTexto(
    `Traduce al ${NOMBRE_IDIOMA[idioma]} esta carta del día de tarot, con un tono cálido y natural (tutea en turco; en árabe, segunda persona sencilla). ` +
      `${nombreConocido !== c.nombre ? `El nombre de la carta en ese idioma es «${nombreConocido}»: úsalo tal cual. ` : "Traduce el nombre de la carta con su nombre tradicional en ese idioma. "}` +
      `Devuelve SOLO un JSON con las claves: nombre, frase (la frase corta, máximo 150 caracteres), significado, amor, trabajo, claves (lista de 3). Sin comentarios ni markdown.\n\n${entrada}`,
    "Eres traductora nativa y profesional de textos de tarot. Traduce el sentido, no palabra por palabra: cada frase debe sonar como la escribiría desde cero un hablante nativo, con gramática impecable. Los nombres de cartas, con el orden natural del idioma (en turco, «Umut Meleği» y no «Melek Umut»; «Yıldız», «Ay», «Güneş» para los arcanos). No agregues ni quites ideas.",
    { effort: "low", maxTokens: 1500, nivel: "economico", idioma },
  );
  const json = salida.slice(salida.indexOf("{"), salida.lastIndexOf("}") + 1);
  const t = JSON.parse(json) as Partial<CartaTraducida & { significado: string }>;
  if (!t.nombre || !t.frase || !t.amor || !t.trabajo) throw new Error(`traducción incompleta (${idioma})`);
  return {
    nombre: t.nombre.trim(),
    frase: t.frase.trim(),
    amor: t.amor.trim(),
    trabajo: t.trabajo.trim(),
    claves: Array.isArray(t.claves) && t.claves.length ? t.claves.slice(0, 3).map(String) : palabrasCarta(c, idioma).luz.slice(0, 3),
  };
}

function precioUsd() {
  return `$${(PAQUETE_PRUEBA.precioUSDCentavos / 100).toFixed(2)} USD`;
}

function fechaLarga(fecha: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));
}

/** Textos del reel (pantalla y voz) en ese idioma. */
export function textosReelIdioma(fecha: string, idioma: IdiomaCarta, t: CartaTraducida): TextosReel {
  const f = FIJOS[idioma];
  return {
    idioma,
    etiqueta: f.etiqueta,
    fechaMazo: `${fechaLarga(fecha, f.locale)} · ${f.mazos[mazoDelDia(fecha)] ?? MAZOS[mazoDelDia(fecha)].nombre}`,
    nombre: t.nombre,
    frase: t.frase,
    ctaPregunta: f.ctaPregunta,
    ctaTitulo: f.ctaTitulo,
    ctaPrecio: precioUsd(),
    ctaEnlace: `miarcana.com/${idioma}`,
    ctaPie: f.ctaPie,
    voz: [`${f.vozInicio(t.nombre)} ${t.frase}`, f.vozCierre],
  };
}

/** Texto de la publicación en ese idioma (en Facebook la dirección va en palabras: los enlaces están limitados). */
export function textoCartaIdioma(fecha: string, idioma: IdiomaCarta, red: "instagram" | "facebook", t: CartaTraducida) {
  const f = FIJOS[idioma];
  const mazo = mazoDelDia(fecha);
  return [
    `✨ ${f.etiqueta} · ${fechaLarga(fecha, f.locale)}`,
    `${t.nombre} · ${f.mazos[mazo] ?? MAZOS[mazo].nombre}`,
    "",
    t.frase,
    "",
    `💛 ${f.amor}: ${t.amor}`,
    `💼 ${f.trabajo}: ${t.trabajo}`,
    "",
    `${f.claves}: ${t.claves.join(" · ")}`,
    "",
    f.invitacion(red === "facebook" ? f.enlaceFb : f.enlaceIg),
    f.tirada(precioUsd()),
    "",
    f.comenta,
    f.comunidad(red === "facebook" ? (idioma === "ar" ? "miarcana دوت كوم/ar/comunidad" : "miarcana nokta com/tr/comunidad") : `miarcana.com/${idioma}/comunidad`),
    "",
    f.hashtags,
  ]
    .join("\n")
    .slice(0, 2200);
}
