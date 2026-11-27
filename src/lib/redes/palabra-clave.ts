import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Palabra clave por mensaje directo: quien escribe «اسمي» (o «NOMBRE», «isim»…) recibe al instante el enlace directo a
 * la lectura completa de su nombre. En los comentarios el enlace no se puede tocar; por mensaje, sí.
 */
const CLAVES: Record<string, Idioma> = {
  "اسمي": "ar", "اسمى": "ar", "قراءة اسمي": "ar", "القراءة الكاملة": "ar", "الرابط": "ar",
  "nombre": "es", "mi nombre": "es", "enlace": "es",
  "name": "en", "my name": "en", "link": "en",
  "nome": "pt", "meu nome": "pt",
  "prenom": "fr", "mon prenom": "fr", "lien": "fr",
  "isim": "tr", "ismim": "tr", "adim": "tr", "link at": "tr",
};

/** El idioma de la palabra clave si el mensaje es solo eso (con emojis o signos alrededor); si no, null. */
export function palabraClave(texto: string): Idioma | null {
  const limpio = texto
    .normalize("NFD")
    .replace(/[̀-ًͯ-ٰٟ]/g, "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (CLAVES[limpio]) return CLAVES[limpio];
  // «اسمي فاطمة», «mi nombre es Ana»: la palabra clave seguida del nombre (hasta tres palabras) también vale.
  const m = limpio.match(/^(اسمي|اسمى|mi nombre es|mi nombre|my name is|meu nome e|mon prenom est|ismim|benim adim)\s+(\S+(?:\s\S+){0,2})$/u);
  return m ? (CLAVES[m[1].replace(/ (es|is|e|est)$/, "")] ?? (m[1] === "benim adim" ? "tr" : null)) : null;
}

/** Palabra que se invita a escribir en cada idioma (la primera de su lista). */
export const PALABRA: Record<Idioma, string> = { ar: "اسمي", es: "NOMBRE", en: "NAME", pt: "NOME", fr: "PRÉNOM", tr: "İSİM", id: "NAMA", hi: "NAME" };

const INVITACION: Record<Idioma, string> = {
  ar: "✉️ اكتب «اسمي» في الخاص وأرسل لك رابط القراءة الكاملة.",
  es: "✉️ Escríbeme «NOMBRE» por mensaje y te envío el enlace a tu lectura completa.",
  en: "✉️ Message me «NAME» and I'll send you the link to your full reading.",
  pt: "✉️ Me mande «NOME» por mensagem e te envio o link da sua leitura completa.",
  fr: "✉️ Écris-moi «PRÉNOM» en message privé et je t'envoie le lien de ta lecture complète.",
  tr: "✉️ Bana mesajla «İSİM» yaz, tam okumanın bağlantısını göndereyim.",
  id: "✉️ Kirimi aku pesan «NAMA» dan aku kirim tautan bacaan lengkapmu.",
  hi: "✉️ मुझे संदेश में «NAME» लिखें, मैं आपकी पूरी रीडिंग का लिंक भेजूँगी।",
};

/** La línea que se suma a la respuesta pública cuando los mensajes directos de esa red funcionan. */
export function invitacionPalabraClave(idioma: Idioma) {
  return INVITACION[idioma] ?? INVITACION.es;
}

const RESPUESTA: Record<Idioma, (url: string) => string> = {
  ar: (u) => `أهلًا بك 🌙 هذه هي القراءة الكاملة لاسمك بعلم الحروف: الحرف الذي يحكم اسمك، وكيف تحب وماذا تحتاج، ومواهبك وطريقك 🔮\n\n👉 ${u}\n\nتبدأ بنقاط ترحيب مجانية، والقراءة الكاملة بـ5 نقاط. وإن كان عندك سؤال، اكتبه لي هنا.`,
  es: (u) => `¡Hola! 🌙 Aquí está la lectura completa de tu nombre según la ciencia de las letras: la letra que lo rige, cómo amas y qué necesitas, tus dones y tu camino 🔮\n\n👉 ${u}\n\nEmpiezas con créditos de bienvenida gratis, y la lectura completa cuesta 5 créditos. Si tienes alguna pregunta, escríbeme aquí.`,
  en: (u) => `Hi! 🌙 Here's the complete reading of your name through the science of letters: the letter that rules it, how you love and what you need, your gifts and your path 🔮\n\n👉 ${u}\n\nYou start with free welcome credits, and the full reading costs 5 credits. Any question, write me here.`,
  pt: (u) => `Oi! 🌙 Aqui está a leitura completa do seu nome pela ciência das letras: a letra que o rege, como você ama e do que precisa, seus dons e seu caminho 🔮\n\n👉 ${u}\n\nVocê começa com créditos de boas-vindas grátis, e a leitura completa custa 5 créditos. Qualquer dúvida, me escreva aqui.`,
  fr: (u) => `Bonjour ! 🌙 Voici la lecture complète de ton prénom selon la science des lettres : la lettre qui le gouverne, comment tu aimes et ce dont tu as besoin, tes dons et ton chemin 🔮\n\n👉 ${u}\n\nTu commences avec des crédits de bienvenue gratuits, et la lecture complète coûte 5 crédits. Une question ? Écris-moi ici.`,
  tr: (u) => `Merhaba! 🌙 İşte harf ilmine göre adının tam okuması: adını yöneten harf, nasıl sevdiğin ve neye ihtiyaç duyduğun, yeteneklerin ve yolun 🔮\n\n👉 ${u}\n\nÜcretsiz hoş geldin kredileriyle başlarsın; tam okuma 5 kredi. Sorun olursa buraya yaz.`,
  id: (u) => `Halo! 🌙 Ini bacaan lengkap namamu menurut ilmu huruf: huruf yang menguasainya, caramu mencintai dan apa yang kamu butuhkan, bakat dan jalanmu 🔮\n\n👉 ${u}\n\nKamu mulai dengan kredit sambutan gratis, dan bacaan lengkap seharga 5 kredit. Ada pertanyaan? Tulis di sini.`,
  hi: (u) => `नमस्ते! 🌙 यह रही अक्षरों के विज्ञान से आपके नाम की पूरी रीडिंग: आपके नाम पर शासन करने वाला अक्षर, आप कैसे प्रेम करते हैं और आपको क्या चाहिए, आपकी प्रतिभाएँ और राह 🔮\n\n👉 ${u}\n\nआप मुफ़्त स्वागत क्रेडिट से शुरू करते हैं, और पूरी रीडिंग 5 क्रेडिट की है। कोई सवाल हो तो यहीं लिखें।`,
};

/** Respuesta por mensaje con el enlace directo (con origen de la red) a la lectura completa del nombre. */
export function respuestaPalabraClave(idioma: Idioma, red: "instagram" | "facebook") {
  const corto = red === "instagram" ? "ig" : "fb";
  const url = `https://miarcana.com/${corto}${idioma === "es" ? "" : `/${idioma}`}/abjad`;
  return (RESPUESTA[idioma] ?? RESPUESTA.es)(url);
}
