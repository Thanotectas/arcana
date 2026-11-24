import "server-only";
import { diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { cartaDelDia, mazoDelDia } from "@/lib/redes/carta-dia";
import { nombreCarta } from "@/lib/juego/cartas-idiomas";
import { escaparHtml, sitio } from "@/lib/correo";
import type { CorreoArmado } from "./plantillas";

/**
 * Correo único (una vez por persona) que invita a la Comunidad Arcana, en el idioma de su perfil. Sale con la corrida
 * diaria de correos (src/app/api/cron/correos) mientras dure la invitación.
 */
export const INVITACION_COMUNIDAD_HASTA = "2026-12-15";

const T: Record<Idioma, { asunto: string; titulo: string; p1: string; p2: string; p3: string; boton: string; carta: string }> = {
  es: {
    asunto: "Abrimos la Comunidad Arcana: ven a conversar 🌙",
    titulo: "Ahora Arcana tiene su comunidad",
    p1: "Cada día hay una conversación alrededor de la carta del día. Cuentas qué te dice a ti, lees lo que viven otras personas y Sibila te responde.",
    p2: "Lo especial: escribes en tu idioma y todos te leen en el suyo. Alguien en Estambul o en Riad te lee en turco o en árabe, y tú lo lees en español.",
    p3: "Es gratis y entras con tu misma cuenta. Nos encantaría que fueras de las primeras personas en escribir.",
    boton: "Entrar a la comunidad",
    carta: "La carta de hoy",
  },
  en: {
    asunto: "The Arcana Community is open: come and talk 🌙",
    titulo: "Arcana now has its own community",
    p1: "Every day there's a conversation around the card of the day. You share what it tells you, read what others are living and Sibila replies.",
    p2: "The special part: you write in your language and everyone reads you in theirs. Someone in Istanbul or Riyadh reads you in Turkish or Arabic, and you read them in English.",
    p3: "It's free and you join with the same account. We'd love you to be one of the first to write.",
    boton: "Join the community",
    carta: "Today's card",
  },
  pt: {
    asunto: "Abrimos a Comunidade Arcana: venha conversar 🌙",
    titulo: "Agora a Arcana tem sua comunidade",
    p1: "Todo dia há uma conversa em torno da carta do dia. Você conta o que ela diz para você, lê o que outras pessoas vivem e a Sibila responde.",
    p2: "O especial: você escreve no seu idioma e todos leem você no deles. Alguém em Istambul ou em Riad lê você em turco ou em árabe, e você lê essa pessoa em português.",
    p3: "É grátis e você entra com a mesma conta. Adoraríamos que você fosse uma das primeiras pessoas a escrever.",
    boton: "Entrar na comunidade",
    carta: "A carta de hoje",
  },
  fr: {
    asunto: "La Communauté Arcana est ouverte : viens discuter 🌙",
    titulo: "Arcana a maintenant sa communauté",
    p1: "Chaque jour, une conversation autour de la carte du jour. Tu racontes ce qu'elle te dit, tu lis ce que vivent les autres et Sibila te répond.",
    p2: "Ce qui est unique : tu écris dans ta langue et chacun te lit dans la sienne. Quelqu'un à Istanbul ou à Riyad te lit en turc ou en arabe, et toi tu le lis en français.",
    p3: "C'est gratuit et tu entres avec le même compte. Nous serions ravis que tu sois parmi les premiers à écrire.",
    boton: "Entrer dans la communauté",
    carta: "La carte du jour",
  },
  tr: {
    asunto: "Arcana Topluluğu açıldı: sohbete gel 🌙",
    titulo: "Arcana'nın artık kendi topluluğu var",
    p1: "Her gün günün kartı etrafında bir sohbet var. Kartın sana ne söylediğini anlatıyorsun, başkalarının yaşadıklarını okuyorsun ve Sibila sana cevap veriyor.",
    p2: "İşin güzel yanı: kendi dilinde yazıyorsun, herkes seni kendi dilinde okuyor. Bogota'daki biri seni İspanyolca okur, sen de onu Türkçe okursun.",
    p3: "Ücretsiz ve aynı hesabınla giriyorsun. İlk yazanlardan biri olmanı çok isteriz.",
    boton: "Topluluğa gir",
    carta: "Günün kartı",
  },
  ar: {
    asunto: "افتتحنا مجتمع أركانا: تعال وتحدّث معنا 🌙",
    titulo: "أصبح لأركانا مجتمعها الخاص",
    p1: "كل يوم حديث حول بطاقة اليوم. تحكي ما تقوله لك، وتقرأ ما يعيشه الآخرون، وترد عليك سيبيلا.",
    p2: "المميز: تكتب بلغتك ويقرؤك الجميع بلغتهم. شخص في بوغوتا يقرؤك بالإسبانية، وأنت تقرؤه بالعربية.",
    p3: "الدخول مجاني وبحسابك نفسه. يسعدنا أن تكون من أوائل من يكتبون.",
    boton: "ادخل إلى المجتمع",
    carta: "بطاقة اليوم",
  },
  id: {
    asunto: "Komunitas Arcana sudah dibuka: ayo ngobrol 🌙",
    titulo: "Sekarang Arcana punya komunitasnya sendiri",
    p1: "Setiap hari ada obrolan seputar kartu hari ini. Kamu ceritakan apa katanya untukmu, membaca pengalaman orang lain, dan Sibila membalasmu.",
    p2: "Istimewanya: kamu menulis dalam bahasamu dan semua orang membacamu dalam bahasa mereka. Seseorang di Istanbul atau Riyadh membacamu dalam bahasa Turki atau Arab, dan kamu membacanya dalam bahasa Indonesia.",
    p3: "Gratis dan kamu masuk dengan akun yang sama. Kami senang sekali jika kamu jadi salah satu yang pertama menulis.",
    boton: "Masuk ke komunitas",
    carta: "Kartu hari ini",
  },
  hi: {
    asunto: "आर्काना समुदाय खुल गया है: आइए बात करें 🌙",
    titulo: "अब आर्काना का अपना समुदाय है",
    p1: "हर दिन आज के कार्ड के इर्द-गिर्द एक बातचीत होती है। आप बताते हैं कि यह आपसे क्या कहता है, दूसरों के अनुभव पढ़ते हैं और सिबिला जवाब देती है।",
    p2: "ख़ास बात: आप अपनी भाषा में लिखते हैं और सब आपको अपनी भाषा में पढ़ते हैं। इस्तांबुल या रियाद में कोई आपको तुर्की या अरबी में पढ़ता है, और आप उसे हिन्दी में।",
    p3: "यह मुफ़्त है और आप उसी अकाउंट से जुड़ते हैं। हमें अच्छा लगेगा अगर आप सबसे पहले लिखने वालों में हों।",
    boton: "समुदाय में जाएँ",
    carta: "आज का कार्ड",
  },
};

const ORO = "#d9b45a";
const ORO_SUAVE = "#f1d99a";
const NOCHE = "#0b0716";
const SUPERFICIE = "#150f26";
const TEXTO = "#ece6f7";
const TEXTO_SUAVE = "#a89fc0";

export function correoComunidad(d: { nombre: string | null; idioma: Idioma; fecha: string; urlBaja: string }): CorreoArmado {
  const t = diccionario(d.idioma);
  const x = T[d.idioma];
  const base = sitio();
  const carta = cartaDelDia(d.fecha);
  const mazo = mazoDelDia(d.fecha);
  const nombreDeCarta = nombreCarta(carta, d.idioma);
  const mostrarNombre = d.idioma === "es" || nombreDeCarta !== carta.nombre;
  const saludo = plantilla(t.correos.saludo, { nombre: d.nombre?.trim().split(/\s+/)[0] || t.inicio.viajero });
  const url = `${base}${d.idioma === "es" ? "" : `/${d.idioma}`}/comunidad?utm_source=correo&utm_medium=email&utm_campaign=comunidad`;
  const dir = d.idioma === "ar" ? "rtl" : "ltr";
  const parrafo = (p: string) => `<p style="margin:14px 0 0;font:16px/1.6 Inter,Arial,sans-serif;color:${TEXTO};">${escaparHtml(p)}</p>`;

  const html = `<!doctype html>
<html lang="${d.idioma}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><title>${escaparHtml(x.asunto)}</title></head>
<body style="margin:0;padding:0;background:${NOCHE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escaparHtml(x.p1.slice(0, 140))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NOCHE};" dir="${dir}">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${SUPERFICIE};border:1px solid rgba(217,180,90,0.35);border-radius:18px;">
<tr><td align="center" style="padding:30px 28px 6px;">
  <img src="${base}/marca/icono-192.png" width="56" height="56" alt="Arcana" style="display:block;border-radius:14px;">
  <p style="margin:12px 0 0;font:600 11px/1.4 Inter,Arial,sans-serif;letter-spacing:4px;color:${ORO};text-transform:uppercase;">Arcana</p>
</td></tr>
<tr><td style="padding:10px 28px 0;text-align:${dir === "rtl" ? "right" : "left"};">
  <p style="margin:0;font:15px/1.5 Inter,Arial,sans-serif;color:${TEXTO_SUAVE};">${escaparHtml(saludo)}</p>
  <h1 style="margin:8px 0 0;font:600 30px/1.15 'Cormorant Garamond',Georgia,'Times New Roman',serif;color:${ORO_SUAVE};">${escaparHtml(x.titulo)}</h1>
  ${parrafo(x.p1)}${parrafo(x.p2)}${parrafo(x.p3)}
</td></tr>
<tr><td align="center" style="padding:24px 28px 0;">
  <a href="${url}" style="text-decoration:none;"><img src="${base}/cartas/${mazo}/${carta.id}.webp" width="150" alt="${escaparHtml(mostrarNombre ? nombreDeCarta : x.carta)}" style="display:block;width:150px;border-radius:12px;border:1px solid rgba(217,180,90,0.6);"></a>
  <p style="margin:10px 0 0;font:12px/1.4 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${TEXTO_SUAVE};">${escaparHtml(x.carta)}</p>
  ${mostrarNombre ? `<p style="margin:4px 0 0;font:600 22px/1.2 'Cormorant Garamond',Georgia,serif;color:${ORO_SUAVE};">${escaparHtml(nombreDeCarta)}</p>` : ""}
</td></tr>
<tr><td align="center" style="padding:24px 28px 30px;">
  <a href="${url}" style="display:inline-block;background:${ORO};color:${NOCHE};font:700 15px/1 Inter,Arial,sans-serif;text-decoration:none;padding:15px 30px;border-radius:999px;">${escaparHtml(x.boton)}</a>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td align="center" style="padding:18px 20px 0;">
  <p style="margin:0;font:12px/1.7 Inter,Arial,sans-serif;color:#6f6689;">${escaparHtml(t.correos.porque)}
  <a href="${d.urlBaja}" style="color:#9a90b8;text-decoration:underline;">${escaparHtml(t.correos.baja)}</a><br>${escaparHtml(t.correos.direccion)}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const texto = [saludo, "", x.titulo, "", x.p1, "", x.p2, "", x.p3, "", `${x.boton}: ${url}`, "", `${t.correos.porque} ${t.correos.baja}: ${d.urlBaja}`, t.correos.direccion].join("\n");
  return { asunto: x.asunto, html, texto };
}
