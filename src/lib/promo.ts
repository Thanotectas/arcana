import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Promoción del fin de semana de Black Friday (en árabe, «الجمعة البيضاء», el viernes blanco del Golfo; en turco,
 * «Efsane Cuma»): +5 créditos en cualquier paquete, del viernes 27 al lunes 30 de noviembre de 2026 a medianoche
 * de Bogotá. Los códigos BLACK y WHITE están en `codigos_oferta` con el mismo vencimiento; mientras dure, el código
 * se aplica solo en la página de créditos y en la compra en un toque.
 */
export const PROMO = {
  desde: Date.parse("2026-11-27T00:00:00-05:00"),
  hasta: Date.parse("2026-12-01T00:00:00-05:00"),
  creditos: 5,
} as const;

export function promoActiva(ahora = Date.now()) {
  return ahora >= PROMO.desde && ahora < PROMO.hasta;
}

/** El código de la promoción: WHITE para quien la ve como «viernes blanco», BLACK para el resto. */
export function codigoPromo(idioma: Idioma) {
  return idioma === "ar" ? "WHITE" : "BLACK";
}

export const TEXTOS_PROMO: Record<Idioma, { nombre: string; titulo: string; texto: string; boton: string; quedan: string; dias: string }> = {
  es: { nombre: "Black Friday", titulo: "Black Friday: +5 créditos en cualquier paquete", texto: "Pagas lo mismo y Sibila te regala 5 lecturas más. Solo hasta el lunes a medianoche.", boton: "Aprovechar", quedan: "Termina en", dias: "d" },
  en: { nombre: "Black Friday", titulo: "Black Friday: +5 credits on any pack", texto: "Same price, and Sibila adds 5 more readings. Only until Monday at midnight.", boton: "Get it", quedan: "Ends in", dias: "d" },
  pt: { nombre: "Black Friday", titulo: "Black Friday: +5 créditos em qualquer pacote", texto: "Você paga o mesmo e a Sibila dá 5 leituras a mais. Só até segunda à meia-noite.", boton: "Aproveitar", quedan: "Termina em", dias: "d" },
  fr: { nombre: "Black Friday", titulo: "Black Friday : +5 crédits sur chaque pack", texto: "Même prix, et Sibila t'offre 5 lectures de plus. Jusqu'à lundi minuit seulement.", boton: "En profiter", quedan: "Fin dans", dias: "j" },
  tr: { nombre: "Efsane Cuma", titulo: "Efsane Cuma: her pakete +5 kredi", texto: "Aynı fiyata Sibila'dan 5 okuma daha. Sadece pazartesi gece yarısına kadar.", boton: "Fırsatı yakala", quedan: "Bitmesine", dias: "g" },
  ar: { nombre: "الجمعة البيضاء", titulo: "الجمعة البيضاء: +5 نقاط مع أي باقة", texto: "تدفع السعر نفسه وتهديك سيبيلا 5 قراءات إضافية. حتى منتصف ليل الاثنين فقط.", boton: "استفد الآن", quedan: "ينتهي خلال", dias: "ي" },
  id: { nombre: "Black Friday", titulo: "Black Friday: +5 kredit untuk paket apa pun", texto: "Harga sama, Sibila memberi 5 bacaan tambahan. Hanya sampai Senin tengah malam.", boton: "Ambil", quedan: "Berakhir dalam", dias: "h" },
  hi: { nombre: "Black Friday", titulo: "ब्लैक फ्राइडे: किसी भी पैक पर +5 क्रेडिट", texto: "वही क़ीमत, और सिबिला 5 रीडिंग और देती है। सिर्फ़ सोमवार आधी रात तक।", boton: "अभी लें", quedan: "ख़त्म होने में", dias: "दि" },
};
