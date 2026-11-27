import "server-only";
import { diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { escaparHtml, sitio } from "@/lib/correo";
import type { CorreoArmado } from "./plantillas";

/**
 * Correo único a quien se quedó sin créditos y nunca compró: un código con créditos extra en su primera compra.
 * Sale con la corrida diaria de correos (src/app/api/cron/correos) mientras el código esté vigente.
 */
export const CODIGO_REGRESO = "VUELVE";
export const CREDITOS_CODIGO_REGRESO = 2;
export const REGALO_CREDITOS_HASTA = "2026-12-15";

/** Países donde se escribe en árabe o turco: el perfil suele quedar en español aunque la persona no lo hable. */
const PAIS_IDIOMA: Record<string, Idioma> = {
  SA: "ar", AE: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar", LY: "ar", JO: "ar", LB: "ar", SY: "ar", IQ: "ar", YE: "ar", PS: "ar", SD: "ar",
  TR: "tr", FR: "fr", BR: "pt", PT: "pt", ID: "id", IN: "hi", US: "en", GB: "en",
};

/** El idioma del correo: el del perfil si se eligió; si quedó el predeterminado, el del país. */
export function idiomaCorreo(idioma: Idioma, pais: string | null | undefined): Idioma {
  if (idioma !== "es") return idioma;
  return (pais && PAIS_IDIOMA[pais.toUpperCase()]) || "es";
}

const T: Record<Idioma, { asunto: string; titulo: string; p1: string; p2: string; codigo: string; boton: string; nota: string }> = {
  es: {
    asunto: "Sibila te guardó {n} créditos de regalo 🔮",
    titulo: "Tu lectura no tiene por qué quedarse a medias",
    p1: "Vimos que usaste tus créditos de bienvenida. Sibila todavía tiene mucho para decirte: tu carta astral completa, la lectura completa de tu nombre, lo que dicen tus manos.",
    p2: "Con este código, tu primera compra trae {n} créditos más, además del regalo de la primera compra. Con el paquete más pequeño te alcanza para varias lecturas.",
    codigo: "Tu código",
    boton: "Usar mi regalo",
    nota: "El código se aplica solo al abrir el enlace. Vale hasta el 15 de diciembre.",
  },
  en: {
    asunto: "Sibila saved you {n} gift credits 🔮",
    titulo: "Your reading doesn't have to stop halfway",
    p1: "We saw you used your welcome credits. Sibila still has a lot to tell you: your full birth chart, the complete reading of your name, what your hands say.",
    p2: "With this code, your first purchase comes with {n} extra credits, on top of the first-purchase gift. The smallest pack covers several readings.",
    codigo: "Your code",
    boton: "Use my gift",
    nota: "The code applies automatically when you open the link. Valid until December 15.",
  },
  pt: {
    asunto: "A Sibila guardou {n} créditos de presente para você 🔮",
    titulo: "Sua leitura não precisa ficar pela metade",
    p1: "Vimos que você usou seus créditos de boas-vindas. A Sibila ainda tem muito para te dizer: seu mapa astral completo, a leitura completa do seu nome, o que dizem suas mãos.",
    p2: "Com este código, sua primeira compra vem com {n} créditos a mais, além do presente da primeira compra. O pacote menor dá para várias leituras.",
    codigo: "Seu código",
    boton: "Usar meu presente",
    nota: "O código é aplicado sozinho ao abrir o link. Vale até 15 de dezembro.",
  },
  fr: {
    asunto: "Sibila t'a gardé {n} crédits offerts 🔮",
    titulo: "Ta lecture n'a pas à s'arrêter en chemin",
    p1: "Tu as utilisé tes crédits de bienvenue. Sibila a encore beaucoup à te dire : ton thème astral complet, la lecture complète de ton prénom, ce que disent tes mains.",
    p2: "Avec ce code, ton premier achat inclut {n} crédits de plus, en plus du cadeau du premier achat. Le plus petit pack suffit pour plusieurs lectures.",
    codigo: "Ton code",
    boton: "Utiliser mon cadeau",
    nota: "Le code s'applique tout seul en ouvrant le lien. Valable jusqu'au 15 décembre.",
  },
  tr: {
    asunto: "Sibila sana {n} hediye kredi ayırdı 🔮",
    titulo: "Falın yarım kalmak zorunda değil",
    p1: "Hoş geldin kredilerini kullandığını gördük. Sibila'nın sana söyleyecek daha çok şeyi var: tam doğum haritan, adının tam okuması, ellerinin söyledikleri.",
    p2: "Bu kodla ilk alışverişinde, ilk alışveriş hediyesine ek olarak {n} kredi daha gelir. En küçük paket birkaç okumaya yeter.",
    codigo: "Kodun",
    boton: "Hediyemi kullan",
    nota: "Bağlantıyı açınca kod kendiliğinden uygulanır. 15 Aralık'a kadar geçerli.",
  },
  ar: {
    asunto: "سيبيلا خبّأت لك {n} نقاط هدية 🔮",
    titulo: "قراءتك لا يجب أن تبقى ناقصة",
    p1: "لاحظنا أنك استخدمت نقاط الترحيب. ولا يزال لدى سيبيلا الكثير لتقوله لك: القراءة الكاملة لاسمك بعلم الحروف، وخريطتك الفلكية كاملة، وما تقوله كفّاك.",
    p2: "بهذا الرمز، تأتيك مع أول شراء {n} نقاط إضافية، فوق هدية الشراء الأول. وأصغر باقة تكفي لعدة قراءات.",
    codigo: "رمزك",
    boton: "استخدم هديتي",
    nota: "يُطبَّق الرمز تلقائيًا عند فتح الرابط. صالح حتى 15 ديسمبر.",
  },
  id: {
    asunto: "Sibila menyimpan {n} kredit hadiah untukmu 🔮",
    titulo: "Bacaanmu tidak harus berhenti di tengah jalan",
    p1: "Kami lihat kamu sudah memakai kredit sambutanmu. Sibila masih punya banyak untuk dikatakan: peta kelahiranmu lengkap, bacaan lengkap namamu, apa kata telapak tanganmu.",
    p2: "Dengan kode ini, pembelian pertamamu mendapat {n} kredit tambahan, selain hadiah pembelian pertama. Paket terkecil cukup untuk beberapa bacaan.",
    codigo: "Kodemu",
    boton: "Pakai hadiahku",
    nota: "Kode langsung berlaku saat kamu membuka tautan. Berlaku sampai 15 Desember.",
  },
  hi: {
    asunto: "सिबिला ने आपके लिए {n} उपहार क्रेडिट रखे हैं 🔮",
    titulo: "आपकी रीडिंग अधूरी नहीं रहनी चाहिए",
    p1: "हमने देखा कि आपने स्वागत क्रेडिट इस्तेमाल कर लिए। सिबिला के पास अभी आपके लिए बहुत कुछ है: आपकी पूरी जन्म कुंडली, आपके नाम की पूरी रीडिंग, आपकी हथेलियाँ क्या कहती हैं।",
    p2: "इस कोड से आपकी पहली ख़रीद पर {n} क्रेडिट और मिलेंगे, पहली ख़रीद के उपहार के ऊपर। सबसे छोटा पैक कई रीडिंग के लिए काफ़ी है।",
    codigo: "आपका कोड",
    boton: "मेरा उपहार इस्तेमाल करें",
    nota: "लिंक खोलते ही कोड अपने-आप लग जाता है। 15 दिसंबर तक मान्य।",
  },
};

const ORO = "#d9b45a";
const ORO_SUAVE = "#f1d99a";
const NOCHE = "#0b0716";
const SUPERFICIE = "#150f26";
const TEXTO = "#ece6f7";
const TEXTO_SUAVE = "#a89fc0";

export function correoRegaloCreditos(d: { nombre: string | null; idioma: Idioma; urlBaja: string }): CorreoArmado {
  const t = diccionario(d.idioma);
  const x = T[d.idioma];
  const n = { n: CREDITOS_CODIGO_REGRESO };
  const asunto = plantilla(x.asunto, n);
  const base = sitio();
  const saludo = plantilla(t.correos.saludo, { nombre: d.nombre?.trim().split(/\s+/)[0] || t.inicio.viajero });
  const url = `${base}/c/${CODIGO_REGRESO}?utm_source=correo&utm_medium=email&utm_campaign=regalo_creditos`;
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
  <p style="margin:8px 0 0;display:inline-block;padding:10px 22px;border:1px dashed ${ORO};border-radius:12px;font:700 26px/1 Inter,Arial,sans-serif;letter-spacing:6px;color:${ORO_SUAVE};" dir="ltr">${CODIGO_REGRESO}</p>
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
  const texto = [saludo, "", x.titulo, "", x.p1, "", p2, "", `${x.codigo}: ${CODIGO_REGRESO}`, `${x.boton}: ${url}`, "", x.nota, "", `${t.correos.porque} ${t.correos.baja}: ${d.urlBaja}`, t.correos.direccion].join("\n");
  return { asunto, html, texto };
}
