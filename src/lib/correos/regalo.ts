import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarCorreo, escaparHtml, sitio, urlBaja } from "@/lib/correo";
import { esIdioma, IDIOMA_PREDETERMINADO, IDIOMAS_RTL, LOCALE_INTL, type Idioma } from "@/lib/i18n/idiomas";

/**
 * Correo «tu vaso de hoy»: a quien se quedó sin créditos, Sibila le regala una lectura del vaso (3 créditos).
 * El enlace va firmado y vence a las 72 horas; el regalo se abre con un botón en /regalo (los lectores de enlaces
 * del correo no lo pueden abrir solos) y una sola vez por correo. Lo que se usa: curiosidad (qué dice tu vaso),
 * reciprocidad (el regalo va primero, sin pedir nada), un paso fácil y una fecha límite real. Nada de miedo ni
 * de urgencias inventadas.
 */
export const REGALO_VASO = { creditos: 3, horas: 72, motivo: "regalo:vaso", tipo: "regalo_vaso" } as const;

function clave() {
  return process.env.CORREO_SECRETO ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

/** Referencia del regalo: el instante en que vence (segundos), único por correo. */
export function firmaRegalo(usuarioId: string, vence: number) {
  return createHmac("sha256", clave()).update(`regalo-vaso:${usuarioId}:${vence}`).digest("hex").slice(0, 32);
}

export function regaloValido(usuarioId: string, vence: number, firma: string) {
  if (!/^[0-9a-f-]{36}$/.test(usuarioId) || !Number.isFinite(vence) || !/^[0-9a-f]{32}$/.test(firma)) return false;
  const a = Buffer.from(firmaRegalo(usuarioId, vence));
  const b = Buffer.from(firma);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function regaloVencido(vence: number) {
  return vence * 1000 < Date.now();
}

export function urlRegalo(usuarioId: string, vence: number) {
  return `${sitio()}/regalo?u=${usuarioId}&v=${vence}&t=${firmaRegalo(usuarioId, vence)}&utm_source=correo&utm_medium=email&utm_campaign=regalo_vaso`;
}

/** Fecha límite en palabras («miércoles 11 de noviembre»), en la zona de Colombia. */
export function fechaLimite(vence: number, idioma: Idioma) {
  return new Intl.DateTimeFormat(LOCALE_INTL[idioma], { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long" }).format(new Date(vence * 1000));
}

const TEXTOS = {
  es: {
    asunto: (n: string) => `${n}, tu vaso tiene algo que decirte 🥚`,
    previa: "Te dejé un regalo: tu próxima lectura del vaso va por mi cuenta.",
    saludo: (n: string) => `Hola, ${n}:`,
    titulo: "Hay cosas que solo se ven cuando el agua se queda quieta",
    p1: "Un hilo que sube derechito, una corona de burbujas alrededor de la yema, un velo que se abre como un manto… Cada vaso es distinto, y el tuyo guarda un mensaje que todavía no hemos leído.",
    p2: "Por eso esta semana quiero hacerte un regalo: tu próxima lectura del vaso va por mi cuenta. Completa, con tu foto marcada con líneas, lo que salió y lo que viene para ti. Sin pagar nada.",
    tarjeta: "Tu regalo",
    lectura: "1 lectura del vaso",
    hasta: (f: string) => `Puedes abrirlo hasta el ${f}`,
    pasos: "Así de fácil:",
    paso1: "Haz tu limpia con calma, esta noche o cuando sientas que la necesitas.",
    paso2: "Tómale una foto al vaso de lado, a la altura del agua y con buena luz.",
    paso3: "Súbela y yo te marco con líneas lo que salió y lo que anuncia.",
    boton: "Abrir mi regalo 🎁",
    prueba: "Ya somos más de 1.300 en TikTok descubriendo qué dice su vaso.",
    ps: (f: string) => `P. D.: si hoy no es el día de tu limpia, guarda este correo. Tu regalo te espera hasta el ${f}.`,
    firma: "Con cariño,\nSibila, de Arcana",
    porque: "Recibes este correo porque tienes una cuenta en Arcana.",
    baja: "Dejar de recibir correos",
  },
  en: {
    asunto: (n: string) => `${n}, your glass has something to tell you 🥚`,
    previa: "I left you a gift: your next egg cleansing reading is on me.",
    saludo: (n: string) => `Hi ${n},`,
    titulo: "Some things only show when the water is still",
    p1: "A thread rising straight up, a crown of bubbles around the yolk, a veil opening like a mantle… Every glass is different, and yours holds a message we haven't read together yet.",
    p2: "So this week I want to give you a gift: your next glass reading is on me. Complete, with your photo marked with lines, what came out and what's coming for you. Free.",
    tarjeta: "Your gift",
    lectura: "1 egg glass reading",
    hasta: (f: string) => `You can open it until ${f}`,
    pasos: "It's easy:",
    paso1: "Do your cleansing calmly, tonight or whenever you feel you need it.",
    paso2: "Take a photo of the glass from the side, at water level, with good light.",
    paso3: "Upload it and I'll mark with lines what came out and what it announces.",
    boton: "Open my gift 🎁",
    prueba: "More than 1,300 of us on TikTok are already discovering what their glass says.",
    ps: (f: string) => `P.S. If today isn't the day for your cleansing, keep this email. Your gift waits for you until ${f}.`,
    firma: "With love,\nSibila, from Arcana",
    porque: "You receive this email because you have an Arcana account.",
    baja: "Stop receiving emails",
  },
  pt: {
    asunto: (n: string) => `${n}, seu copo tem algo a te dizer 🥚`,
    previa: "Deixei um presente: sua próxima leitura do copo é por minha conta.",
    saludo: (n: string) => `Olá, ${n}:`,
    titulo: "Há coisas que só aparecem quando a água fica parada",
    p1: "Um fio que sobe reto, uma coroa de bolhas ao redor da gema, um véu que se abre como um manto… Cada copo é diferente, e o seu guarda uma mensagem que ainda não lemos.",
    p2: "Por isso, nesta semana quero te dar um presente: sua próxima leitura do copo é por minha conta. Completa, com sua foto marcada com linhas, o que saiu e o que vem para você. Sem pagar nada.",
    tarjeta: "Seu presente",
    lectura: "1 leitura do copo",
    hasta: (f: string) => `Você pode abri-lo até ${f}`,
    pasos: "É fácil:",
    paso1: "Faça sua limpeza com calma, hoje à noite ou quando sentir que precisa.",
    paso2: "Tire uma foto do copo de lado, na altura da água e com boa luz.",
    paso3: "Envie e eu marco com linhas o que saiu e o que anuncia.",
    boton: "Abrir meu presente 🎁",
    prueba: "Já somos mais de 1.300 no TikTok descobrindo o que diz o seu copo.",
    ps: (f: string) => `P.S.: se hoje não é o dia da sua limpeza, guarde este e-mail. Seu presente te espera até ${f}.`,
    firma: "Com carinho,\nSibila, da Arcana",
    porque: "Você recebe este e-mail porque tem uma conta na Arcana.",
    baja: "Não receber mais e-mails",
  },
  fr: {
    asunto: (n: string) => `${n}, ton verre a quelque chose à te dire 🥚`,
    previa: "Je t'ai laissé un cadeau : ta prochaine lecture du verre, c'est moi qui l'offre.",
    saludo: (n: string) => `Bonjour ${n},`,
    titulo: "Il y a des choses qu'on ne voit que lorsque l'eau devient immobile",
    p1: "Un fil qui monte tout droit, une couronne de bulles autour du jaune, un voile qui s'ouvre comme un manteau… Chaque verre est différent, et le tien garde un message que nous n'avons pas encore lu.",
    p2: "C'est pour ça que cette semaine, je veux te faire un cadeau : ta prochaine lecture du verre, c'est moi qui l'offre. Complète, avec ta photo annotée de lignes, ce qui est apparu et ce qui t'attend. Sans rien payer.",
    tarjeta: "Ton cadeau",
    lectura: "1 lecture du verre",
    hasta: (f: string) => `Tu peux l'ouvrir jusqu'au ${f}`,
    pasos: "C'est tout simple :",
    paso1: "Fais ton nettoyage tranquillement, ce soir ou quand tu en sens le besoin.",
    paso2: "Prends le verre en photo de côté, à hauteur de l'eau et avec une bonne lumière.",
    paso3: "Envoie-la et je te trace des lignes sur ce qui est apparu et sur ce que ça annonce.",
    boton: "Ouvrir mon cadeau 🎁",
    prueba: "Nous sommes déjà plus de 1\u00a0300 sur TikTok à découvrir ce que dit notre verre.",
    ps: (f: string) => `P.-S. : si aujourd'hui n'est pas le jour de ton nettoyage, garde cet e-mail. Ton cadeau t'attend jusqu'au ${f}.`,
    firma: "Avec tendresse,\nSibila, d'Arcana",
    porque: "Tu reçois cet e-mail parce que tu as un compte sur Arcana.",
    baja: "Ne plus recevoir d'e-mails",
  },
  tr: {
    asunto: (n: string) => `${n}, bardağının sana söyleyecekleri var 🥚`,
    previa: "Sana bir hediye bıraktım: bir sonraki bardak okuman benden.",
    saludo: (n: string) => `Merhaba ${n},`,
    titulo: "Bazı şeyler ancak su durulduğunda görünür",
    p1: "Dümdüz yükselen bir iplik, sarının etrafında kabarcıklardan bir taç, bir pelerin gibi açılan bir tül… Her bardak farklıdır ve seninki henüz okumadığımız bir mesaj saklıyor.",
    p2: "Bu yüzden bu hafta sana bir hediye vermek istiyorum: bir sonraki bardak okuman benden. Eksiksiz bir okuma; çizgilerle işaretlenmiş fotoğrafınla neler çıktığını ve seni neyin beklediğini göreceksin. Hiçbir ücret ödemeden.",
    tarjeta: "Hediyen",
    lectura: "1 bardak okuması",
    hasta: (f: string) => `Son açma tarihi: ${f}`,
    pasos: "Çok kolay:",
    paso1: "Arınmanı acele etmeden yap; bu gece ya da ihtiyaç duyduğunu hissettiğin bir zaman.",
    paso2: "Bardağın fotoğrafını yandan, su hizasından ve iyi bir ışıkta çek.",
    paso3: "Fotoğrafı yükle; neler çıktığını ve neyin habercisi olduğunu ben çizgilerle işaretleyeyim.",
    boton: "Hediyemi aç 🎁",
    prueba: "TikTok'ta bardağının ne söylediğini keşfeden 1.300'den fazla kişiyiz bile.",
    ps: (f: string) => `Not: Bugün arınma günün değilse bu e-postayı sakla. Hediyen seni bekliyor, son tarih: ${f}.`,
    firma: "Sevgiyle,\nArcana'dan Sibila",
    porque: "Bu e-postayı Arcana'da bir hesabın olduğu için alıyorsun.",
    baja: "E-posta almayı bırak",
  },
  ar: {
    asunto: (n: string) => `${n}، كوبك يحمل لك رسالة 🥚`,
    previa: "تركتُ لك هدية: قراءتك القادمة للكوب على حسابي.",
    saludo: (n: string) => `مرحبًا ${n}،`,
    titulo: "هناك أشياء لا تظهر إلا حين يسكن الماء",
    p1: "خيط يصعد مستقيمًا، وتاج من الفقاعات حول الصفار، وغشاء ينفتح كالعباءة… كل كوب مختلف، وكوبك يحمل رسالة لم نقرأها بعد.",
    p2: "لذلك أودّ هذا الأسبوع أن أقدّم لك هدية: قراءتك القادمة للكوب على حسابي. قراءة كاملة، مع صورتك وعليها خطوط توضّح ما ظهر وما ينتظرك. ومجانًا بالكامل.",
    tarjeta: "هديتك",
    lectura: "1 قراءة للكوب",
    hasta: (f: string) => `يمكنك فتحها حتى ${f}`,
    pasos: "الأمر بسيط:",
    paso1: "يمكنك القيام بجلسة التنقية بهدوء، الليلة أو متى شعرت بالحاجة إليها.",
    paso2: "يكفي التقاط صورة للكوب من الجانب، على مستوى سطح الماء وفي إضاءة جيدة.",
    paso3: "بعد رفع الصورة، أرسم لك عليها خطوطًا تبيّن ما ظهر وما يُنبئ به.",
    boton: "فتح هديتي 🎁",
    prueba: "نحن أكثر من 1,300 شخص على TikTok نكتشف ما يقوله الكوب.",
    ps: (f: string) => `ملاحظة: إن لم يكن اليوم مناسبًا لجلسة التنقية، يمكنك الاحتفاظ بهذه الرسالة. هديتك بانتظارك حتى ${f}.`,
    firma: "بكل محبة،\nسيبيلا، من Arcana",
    porque: "تصلك هذه الرسالة لأن لديك حسابًا على Arcana.",
    baja: "إيقاف استلام الرسائل",
  },
  id: {
    asunto: (n: string) => `${n}, gelasmu punya sesuatu untuk disampaikan 🥚`,
    previa: "Aku meninggalkan hadiah untukmu: bacaan gelas berikutnya aku yang tanggung.",
    saludo: (n: string) => `Hai ${n},`,
    titulo: "Ada hal-hal yang hanya terlihat saat air sudah tenang",
    p1: "Seutas benang yang naik lurus, mahkota gelembung di sekitar kuning telur, selubung yang terbuka seperti jubah… Setiap gelas berbeda, dan gelasmu menyimpan pesan yang belum kita baca.",
    p2: "Karena itu, minggu ini aku ingin memberimu hadiah: bacaan gelas berikutnya aku yang tanggung. Lengkap, dengan fotomu yang ditandai garis-garis, tentang apa yang muncul dan apa yang akan datang untukmu. Tanpa bayar apa pun.",
    tarjeta: "Hadiahmu",
    lectura: "1 bacaan gelas",
    hasta: (f: string) => `Kamu bisa membukanya sampai ${f}`,
    pasos: "Caranya mudah:",
    paso1: "Lakukan pembersihanmu dengan tenang, malam ini atau kapan pun kamu merasa membutuhkannya.",
    paso2: "Foto gelasnya dari samping, sejajar dengan permukaan air dan dengan cahaya yang cukup.",
    paso3: "Unggah fotonya, lalu aku tandai dengan garis apa yang muncul dan apa pertandanya.",
    boton: "Buka hadiahku 🎁",
    prueba: "Sudah lebih dari 1.300 orang di TikTok yang menemukan apa kata gelas mereka.",
    ps: (f: string) => `P.S. Kalau hari ini bukan waktunya untuk pembersihanmu, simpan email ini. Hadiahmu menunggumu sampai ${f}.`,
    firma: "Dengan sayang,\nSibila, dari Arcana",
    porque: "Kamu menerima email ini karena kamu punya akun di Arcana.",
    baja: "Berhenti menerima email",
  },
  hi: {
    asunto: (n: string) => `${n}, आपका गिलास आपसे कुछ कहना चाहता है 🥚`,
    previa: "मैंने आपके लिए एक तोहफ़ा छोड़ा है: गिलास की आपकी अगली रीडिंग मेरी ओर से।",
    saludo: (n: string) => `नमस्ते ${n},`,
    titulo: "कुछ बातें तभी दिखती हैं जब पानी ठहर जाता है",
    p1: "सीधा ऊपर उठता एक धागा, ज़र्दी के चारों ओर बुलबुलों का एक मुकुट, चादर की तरह खुलता एक परदा… हर गिलास अलग होता है, और आपका गिलास एक ऐसा संदेश सँजोए है जिसे हमने अभी तक नहीं पढ़ा।",
    p2: "इसलिए इस हफ़्ते मैं आपको एक तोहफ़ा देना चाहती हूँ: गिलास की आपकी अगली रीडिंग मेरी ओर से। पूरी रीडिंग, आपकी तस्वीर पर रेखाओं के निशान के साथ, कि क्या दिखा और आपके लिए आगे क्या है। बिना कुछ चुकाए।",
    tarjeta: "आपका तोहफ़ा",
    lectura: "गिलास की 1 रीडिंग",
    hasta: (f: string) => `आप इसे ${f} तक खोल सकते हैं`,
    pasos: "बहुत आसान है:",
    paso1: "अपनी शुद्धि आराम से करें, आज रात या जब भी आपको इसकी ज़रूरत महसूस हो।",
    paso2: "गिलास की तस्वीर बगल से, पानी की सतह की ऊँचाई पर और अच्छी रोशनी में लें।",
    paso3: "तस्वीर अपलोड करें और मैं रेखाओं से दिखाऊँगी कि क्या उभरा और वह किस ओर इशारा करता है।",
    boton: "मेरा तोहफ़ा खोलें 🎁",
    prueba: "TikTok पर हम 1,300 से ज़्यादा लोग पहले से जान रहे हैं कि हमारा गिलास क्या कहता है।",
    ps: (f: string) => `पुनश्च: अगर आज आपकी शुद्धि का दिन नहीं है, तो यह ईमेल सँभालकर रखें। आपका तोहफ़ा ${f} तक आपका इंतज़ार करेगा।`,
    firma: "प्यार सहित,\nArcana से सिबिला",
    porque: "आपको यह ईमेल इसलिए मिला है क्योंकि Arcana पर आपका खाता है।",
    baja: "ईमेल पाना बंद करें",
  },
} as const;

/** Cómo se le llama a la persona cuando no hay nombre. */
const SIN_NOMBRE: Record<Idioma, string> = { es: "querida alma", en: "friend", pt: "querida alma", fr: "chère âme", tr: "canım", ar: "أيتها الروح العزيزة", id: "sahabat", hi: "प्रिय मित्र" };

const ORO = "#d9b45a";
const ORO_SUAVE = "#f1d99a";
const NOCHE = "#0b0716";
const SUPERFICIE = "#150f26";
const TEXTO = "#ece6f7";
const TEXTO_SUAVE = "#a89fc0";

export function correoRegaloVaso(d: { nombre: string | null; idioma: Idioma; vence: number; url: string; urlBaja: string }) {
  const t = TEXTOS[d.idioma] ?? TEXTOS.es;
  const base = sitio();
  const nombre = d.nombre?.trim().split(/\s+/)[0] || SIN_NOMBRE[d.idioma];
  const limite = fechaLimite(d.vence, d.idioma);
  const asunto = t.asunto(nombre);
  // En árabe el correo va de derecha a izquierda: dir en el documento y en las tablas, y alineación explícita
  // (algunos clientes de correo ignoran dir).
  const rtl = IDIOMAS_RTL.includes(d.idioma);
  const dir = rtl ? "rtl" : "ltr";
  const alinear = rtl ? "text-align:right;" : "";
  const p = (texto: string, extra = "") => `<p style="margin:14px 0 0;font:16px/1.65 Inter,Arial,sans-serif;color:${TEXTO};${alinear}${extra}">${escaparHtml(texto)}</p>`;
  const paso = (n: number, texto: string) =>
    `<tr><td valign="top" style="padding:${rtl ? "8px 0 0 12px" : "8px 12px 0 0"};"><span style="display:inline-block;width:26px;height:26px;border-radius:999px;background:${ORO};color:${NOCHE};font:700 14px/26px Inter,Arial,sans-serif;text-align:center;">${n}</span></td><td style="padding:8px 0 0;font:15px/1.55 Inter,Arial,sans-serif;color:${TEXTO};${alinear}">${escaparHtml(texto)}</td></tr>`;

  const html = `<!doctype html>
<html lang="${d.idioma}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><title>${escaparHtml(asunto)}</title></head>
<body dir="${dir}" style="margin:0;padding:0;background:${NOCHE};direction:${dir};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escaparHtml(t.previa)}</div>
<table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" style="background:${NOCHE};direction:${dir};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" style="direction:${dir};max-width:560px;background:${SUPERFICIE};border:1px solid rgba(217,180,90,0.35);border-radius:18px;overflow:hidden;">
<tr><td><a href="${d.url}"><img src="${base}/marca/correo-vaso.jpg" width="560" alt="" style="display:block;width:100%;max-width:560px;height:auto;"></a></td></tr>
<tr><td style="padding:26px 28px 0;">
  <p style="margin:0;font:15px/1.5 Inter,Arial,sans-serif;color:${TEXTO_SUAVE};${alinear}">${escaparHtml(t.saludo(nombre))}</p>
  <h1 style="margin:8px 0 0;font:600 30px/1.15 'Cormorant Garamond',Georgia,'Times New Roman',serif;color:${ORO_SUAVE};${alinear}">${escaparHtml(t.titulo)}</h1>
  ${p(t.p1)}
  ${p(t.p2)}
</td></tr>
<tr><td align="center" style="padding:24px 28px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:2px dashed ${ORO};border-radius:16px;background:rgba(217,180,90,0.08);">
    <tr><td align="center" style="padding:20px 16px;">
      <p style="margin:0;font:600 12px/1.4 Inter,Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:${TEXTO_SUAVE};">🎁 ${escaparHtml(t.tarjeta)}</p>
      <p style="margin:6px 0 0;font:600 30px/1.15 'Cormorant Garamond',Georgia,serif;color:${ORO_SUAVE};">${escaparHtml(t.lectura)}</p>
      <p style="margin:6px 0 0;font:14px/1.5 Inter,Arial,sans-serif;color:${TEXTO};">${escaparHtml(t.hasta(limite))}</p>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:22px 28px 0;">
  <p style="margin:0;font:600 15px/1.5 Inter,Arial,sans-serif;color:${ORO_SUAVE};${alinear}">${escaparHtml(t.pasos)}</p>
  <table role="presentation" dir="${dir}" cellpadding="0" cellspacing="0">${paso(1, t.paso1)}${paso(2, t.paso2)}${paso(3, t.paso3)}</table>
</td></tr>
<tr><td align="center" style="padding:26px 28px 6px;">
  <a href="${d.url}" style="display:inline-block;background:${ORO};color:${NOCHE};font:700 16px/1 Inter,Arial,sans-serif;text-decoration:none;padding:16px 34px;border-radius:999px;">${escaparHtml(t.boton)}</a>
</td></tr>
<tr><td style="padding:14px 28px 26px;">
  <p style="margin:0;font:italic 14px/1.6 Inter,Arial,sans-serif;color:${TEXTO_SUAVE};text-align:center;">${escaparHtml(t.prueba)}</p>
  ${p(t.ps(limite), `color:${TEXTO_SUAVE};font-size:14px;`)}
  <p style="margin:16px 0 0;font:italic 17px/1.5 'Cormorant Garamond',Georgia,serif;color:${ORO_SUAVE};white-space:pre-line;${alinear}">${escaparHtml(t.firma)}</p>
</td></tr>
</table>
<table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;direction:${dir};">
<tr><td align="center" style="padding:18px 20px 0;">
  <p style="margin:0;font:12px/1.7 Inter,Arial,sans-serif;color:#6f6689;">${escaparHtml(t.porque)} <a href="${d.urlBaja}" style="color:#9a90b8;text-decoration:underline;">${escaparHtml(t.baja)}</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const texto = [
    t.saludo(nombre),
    "",
    t.titulo,
    "",
    t.p1,
    "",
    t.p2,
    "",
    `🎁 ${t.tarjeta}: ${t.lectura}. ${t.hasta(limite)}.`,
    "",
    t.pasos,
    `1. ${t.paso1}`,
    `2. ${t.paso2}`,
    `3. ${t.paso3}`,
    "",
    `${t.boton}: ${d.url}`,
    "",
    t.prueba,
    "",
    t.ps(limite),
    "",
    t.firma,
    "",
    `${t.porque} ${t.baja}: ${d.urlBaja}`,
  ].join("\n");

  return { asunto, html, texto };
}

export interface DestinoRegalo {
  id: string;
  correo: string;
  nombre: string | null;
  idioma: Idioma;
}

const DIA = 86_400_000;

/**
 * Quien recibe el regalo: acepta correos, tiene el correo confirmado, la cuenta tiene al menos 3 días, se quedó
 * en 0 créditos (sin pase ilimitado), nunca recibió este regalo y no le llegó ningún correo en los últimos 6 días.
 */
export async function destinosRegalo(): Promise<DestinoRegalo[]> {
  const admin = getSupabaseAdmin();
  const ahora = Date.now();
  const { data: perfiles, error } = await admin
    .from("perfiles")
    .select("id, nombre, idioma, creado_en")
    .eq("recibe_correos", true)
    .eq("creditos", 0)
    .eq("ilimitado", false)
    .lte("creado_en", new Date(ahora - 3 * DIA).toISOString())
    .limit(5000);
  if (error) throw new Error(`perfiles: ${error.message}`);
  if (!perfiles?.length) return [];
  const { data: correos } = await admin.from("correos").select("usuario_id, tipo, creado_en").gte("creado_en", new Date(ahora - 365 * DIA).toISOString()).limit(20000);
  const excluir = new Set<string>();
  for (const c of correos ?? []) if (c.tipo === REGALO_VASO.tipo || ahora - Date.parse(c.creado_en) < 6 * DIA) excluir.add(c.usuario_id);
  const correoDe = new Map<string, string>();
  for (let pagina = 1; pagina <= 20; pagina++) {
    const { data, error: e } = await admin.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    if (e) throw new Error(`auth: ${e.message}`);
    for (const u of data.users) if (u.email && u.email_confirmed_at) correoDe.set(u.id, u.email);
    if (data.users.length < 1000) break;
  }
  return perfiles
    .filter((p) => !excluir.has(p.id) && correoDe.has(p.id))
    .map((p) => ({ id: p.id, correo: correoDe.get(p.id) as string, nombre: p.nombre, idioma: esIdioma(p.idioma) ? p.idioma : IDIOMA_PREDETERMINADO }));
}

/** Envía el regalo a una persona y lo anota (si `registrar`, cuenta para los 6 días y para no repetirlo). */
export async function enviarRegaloVaso(d: DestinoRegalo, registrar = true) {
  const vence = Math.floor((Date.now() + REGALO_VASO.horas * 3_600_000) / 1000);
  const baja = urlBaja(d.id);
  const correo = correoRegaloVaso({ nombre: d.nombre, idioma: d.idioma, vence, url: urlRegalo(d.id, vence), urlBaja: baja });
  const r = await enviarCorreo({
    para: d.correo,
    asunto: correo.asunto,
    html: correo.html,
    texto: correo.texto,
    etiqueta: REGALO_VASO.tipo,
    cabeceras: { "List-Unsubscribe": `<${baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
  if (registrar) {
    await getSupabaseAdmin().from("correos").insert({
      usuario_id: d.id,
      tipo: REGALO_VASO.tipo,
      asunto: correo.asunto,
      estado: r.ok ? "enviado" : "error",
      id_proveedor: r.ok ? r.id : null,
      detalle: r.ok ? null : r.error,
    });
  }
  return r;
}

/** Correos enviados hoy (hora de Colombia), de cualquier tipo: Resend gratuito admite 100 al día. */
export async function enviadosHoy() {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  const { count } = await getSupabaseAdmin().from("correos").select("id", { count: "exact", head: true }).gte("creado_en", `${hoy}T05:00:00Z`);
  return count ?? 0;
}

/** Abre el regalo: suma los créditos una sola vez por correo. */
export async function abrirRegalo(usuarioId: string, vence: number): Promise<"abierto" | "ya" | "error"> {
  const admin = getSupabaseAdmin();
  const referencia = `correo:${vence}`;
  const { count } = await admin.from("movimientos_creditos").select("id", { count: "exact", head: true }).eq("usuario_id", usuarioId).eq("motivo", REGALO_VASO.motivo).eq("referencia", referencia);
  if (count) return "ya";
  const { error } = await admin.rpc("devolver_creditos", { p_usuario: usuarioId, p_cantidad: REGALO_VASO.creditos, p_motivo: REGALO_VASO.motivo, p_referencia: referencia });
  if (error) return error.code === "23505" ? "ya" : "error";
  return "abierto";
}

export async function regaloYaAbierto(usuarioId: string, vence: number) {
  const { count } = await getSupabaseAdmin()
    .from("movimientos_creditos")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", usuarioId)
    .eq("motivo", REGALO_VASO.motivo)
    .eq("referencia", `correo:${vence}`);
  return Boolean(count);
}
