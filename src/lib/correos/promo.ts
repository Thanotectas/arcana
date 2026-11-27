import "server-only";
import { diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { escaparHtml, sitio } from "@/lib/correo";
import { codigoPromo, PROMO } from "@/lib/promo";
import type { CorreoArmado } from "./plantillas";

/** Correo único de la promoción del fin de semana (Black Friday; «الجمعة البيضاء» en árabe; «Efsane Cuma» en turco). */
const T: Record<Idioma, { asunto: string; titulo: string; p1: string; p2: string; codigo: string; boton: string; nota: string }> = {
  es: { asunto: "Black Friday en Arcana: +5 créditos en cualquier paquete 🔮", titulo: "Este fin de semana, Sibila te regala 5 lecturas más", p1: "Hasta el lunes a medianoche, cualquier paquete de créditos trae 5 créditos más, al mismo precio. Es el momento de esa carta astral completa, la lectura completa de tu nombre o la pregunta que te ronda.", p2: "El código se aplica solo al abrir el enlace. Si es tu primera compra, suma además los créditos de regalo de siempre.", codigo: "Tu código", boton: "Ver los paquetes", nota: "Válido hasta el lunes 30 de noviembre a medianoche (hora de Colombia)." },
  en: { asunto: "Black Friday at Arcana: +5 credits on any pack 🔮", titulo: "This weekend, Sibila gives you 5 more readings", p1: "Until Monday at midnight, every credit pack comes with 5 extra credits at the same price. The perfect time for your full birth chart, the complete reading of your name or the question on your mind.", p2: "The code applies automatically when you open the link. If it's your first purchase, you also get the usual welcome gift.", codigo: "Your code", boton: "See the packs", nota: "Valid until Monday, November 30 at midnight (Colombia time)." },
  pt: { asunto: "Black Friday na Arcana: +5 créditos em qualquer pacote 🔮", titulo: "Neste fim de semana, a Sibila te dá 5 leituras a mais", p1: "Até segunda à meia-noite, qualquer pacote de créditos vem com 5 créditos a mais, pelo mesmo preço. É a hora do seu mapa astral completo, da leitura completa do seu nome ou daquela pergunta.", p2: "O código é aplicado sozinho ao abrir o link. Se for sua primeira compra, você ganha também o presente de sempre.", codigo: "Seu código", boton: "Ver os pacotes", nota: "Válido até segunda, 30 de novembro, à meia-noite (horário da Colômbia)." },
  fr: { asunto: "Black Friday chez Arcana : +5 crédits sur chaque pack 🔮", titulo: "Ce week-end, Sibila t'offre 5 lectures de plus", p1: "Jusqu'à lundi minuit, chaque pack de crédits inclut 5 crédits de plus, au même prix. Le bon moment pour ton thème astral complet, la lecture complète de ton prénom ou la question qui te trotte en tête.", p2: "Le code s'applique tout seul en ouvrant le lien. Pour un premier achat, le cadeau habituel s'ajoute aussi.", codigo: "Ton code", boton: "Voir les packs", nota: "Valable jusqu'au lundi 30 novembre à minuit (heure de Colombie)." },
  tr: { asunto: "Arcana'da Efsane Cuma: her pakete +5 kredi 🔮", titulo: "Bu hafta sonu Sibila'dan 5 okuma daha", p1: "Pazartesi gece yarısına kadar her kredi paketi aynı fiyata 5 kredi fazla geliyor. Tam doğum haritan, adının tam okuması ya da aklındaki soru için tam zamanı.", p2: "Bağlantıyı açınca kod kendiliğinden uygulanır. İlk alışverişinse her zamanki hediyen de eklenir.", codigo: "Kodun", boton: "Paketlere bak", nota: "30 Kasım pazartesi gece yarısına kadar geçerli (Kolombiya saati)." },
  ar: { asunto: "الجمعة البيضاء في أركانا: +5 نقاط مع أي باقة 🔮", titulo: "في عطلة هذا الأسبوع، تهديك سيبيلا 5 قراءات إضافية", p1: "حتى منتصف ليل الاثنين، كل باقة نقاط تأتي مع 5 نقاط إضافية بالسعر نفسه. إنه الوقت المناسب للقراءة الكاملة لاسمك بعلم الحروف، أو خريطتك الفلكية كاملة، أو السؤال الذي يشغل بالك.", p2: "يُطبَّق الرمز تلقائيًا عند فتح الرابط. وإن كان هذا أول شراء لك، تحصل أيضًا على الهدية المعتادة.", codigo: "رمزك", boton: "عرض الباقات", nota: "صالح حتى منتصف ليل الاثنين 30 نوفمبر (بتوقيت كولومبيا)." },
  id: { asunto: "Black Friday di Arcana: +5 kredit untuk paket apa pun 🔮", titulo: "Akhir pekan ini, Sibila memberi 5 bacaan tambahan", p1: "Sampai Senin tengah malam, setiap paket kredit mendapat 5 kredit tambahan dengan harga sama. Waktu yang tepat untuk peta kelahiranmu, bacaan lengkap namamu, atau pertanyaan di pikiranmu.", p2: "Kode langsung berlaku saat membuka tautan. Jika ini pembelian pertamamu, kamu juga mendapat hadiah seperti biasa.", codigo: "Kodemu", boton: "Lihat paket", nota: "Berlaku sampai Senin, 30 November tengah malam (waktu Kolombia)." },
  hi: { asunto: "Arcana पर ब्लैक फ्राइडे: किसी भी पैक पर +5 क्रेडिट 🔮", titulo: "इस सप्ताहांत सिबिला आपको 5 रीडिंग और देती है", p1: "सोमवार आधी रात तक हर क्रेडिट पैक के साथ उसी क़ीमत पर 5 क्रेडिट ज़्यादा। अपनी पूरी जन्म कुंडली, अपने नाम की पूरी रीडिंग या मन के सवाल के लिए सही समय।", p2: "लिंक खोलते ही कोड अपने-आप लग जाता है। पहली ख़रीद हो तो सामान्य उपहार भी मिलेगा।", codigo: "आपका कोड", boton: "पैक देखें", nota: "सोमवार 30 नवंबर आधी रात तक मान्य (कोलंबिया समय)।" },
};

const ORO = "#d9b45a";
const ORO_SUAVE = "#f1d99a";
const NOCHE = "#0b0716";
const SUPERFICIE = "#150f26";
const TEXTO = "#ece6f7";
const TEXTO_SUAVE = "#a89fc0";

export function correoPromo(d: { nombre: string | null; idioma: Idioma; urlBaja: string }): CorreoArmado {
  const t = diccionario(d.idioma);
  const x = T[d.idioma];
  const n = { n: PROMO.creditos };
  const codigoP = codigoPromo(d.idioma);
  const asunto = plantilla(x.asunto, n);
  const base = sitio();
  const saludo = plantilla(t.correos.saludo, { nombre: d.nombre?.trim().split(/\s+/)[0] || t.inicio.viajero });
  const url = `${base}/c/${codigoP}?utm_source=correo&utm_medium=email&utm_campaign=promo_viernes`;
  const dir = d.idioma === "ar" ? "rtl" : "ltr";
  const lado = dir === "rtl" ? "right" : "left";
  const parrafo = (p: string) => `<p style="margin:14px 0 0;font:16px/1.6 Inter,Arial,sans-serif;color:${TEXTO};">${escaparHtml(p)}</p>`;
  const p2 = plantilla(x.p2, n);

  const html = `<!doctype html>
<html lang="${d.idioma}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><title>${escaparHtml(asunto)}</title></head>
<body style="margin:0;padding:0;background:${NOCHE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escaparHtml(p2.slice(0, 140))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NOCHE};" dir="${dir}">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${SUPERFICIE};border:1px solid rgba(217,180,90,0.35);border-radius:18px;">
<tr><td align="center" style="padding:30px 28px 6px;">
  <img src="${base}/marca/icono-192.png" width="56" height="56" alt="Arcana" style="display:block;border-radius:14px;">
  <p style="margin:12px 0 0;font:600 11px/1.4 Inter,Arial,sans-serif;letter-spacing:4px;color:${ORO};text-transform:uppercase;">Arcana</p>
</td></tr>
<tr><td style="padding:10px 28px 0;text-align:${lado};">
  <p style="margin:0;font:15px/1.5 Inter,Arial,sans-serif;color:${TEXTO_SUAVE};">${escaparHtml(saludo)}</p>
  <h1 style="margin:8px 0 0;font:600 30px/1.15 'Cormorant Garamond',Georgia,'Times New Roman',serif;color:${ORO_SUAVE};">${escaparHtml(x.titulo)}</h1>
  ${parrafo(x.p1)}${parrafo(p2)}
</td></tr>
<tr><td align="center" style="padding:24px 28px 0;">
  <p style="margin:0;font:12px/1.4 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${TEXTO_SUAVE};">${escaparHtml(x.codigo)}</p>
  <p style="margin:8px 0 0;display:inline-block;padding:10px 22px;border:1px dashed ${ORO};border-radius:12px;font:700 26px/1 Inter,Arial,sans-serif;letter-spacing:6px;color:${ORO_SUAVE};" dir="ltr">${codigoP}</p>
</td></tr>
<tr><td align="center" style="padding:24px 28px 8px;">
  <a href="${url}" style="display:inline-block;background:${ORO};color:${NOCHE};font:700 15px/1 Inter,Arial,sans-serif;text-decoration:none;padding:15px 30px;border-radius:999px;">${escaparHtml(x.boton)}</a>
</td></tr>
<tr><td align="center" style="padding:6px 28px 30px;">
  <p style="margin:0;font:12px/1.6 Inter,Arial,sans-serif;color:${TEXTO_SUAVE};">${escaparHtml(x.nota)}</p>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td align="center" style="padding:18px 20px 0;">
  <p style="margin:0;font:12px/1.7 Inter,Arial,sans-serif;color:#6f6689;">${escaparHtml(t.correos.porque)}
  <a href="${d.urlBaja}" style="color:#9a90b8;text-decoration:underline;">${escaparHtml(t.correos.baja)}</a><br>${escaparHtml(t.correos.direccion)}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
  const texto = [saludo, "", x.titulo, "", x.p1, "", p2, "", `${x.codigo}: ${codigoP}`, `${x.boton}: ${url}`, "", x.nota, "", `${t.correos.porque} ${t.correos.baja}: ${d.urlBaja}`, t.correos.direccion].join("\n");
  return { asunto, html, texto };
}
