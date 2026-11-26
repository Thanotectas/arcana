import type { Idioma } from "@/lib/i18n/idiomas";
import { idiomaConversacion } from "./respuestas-fijas";
import { idiomaDePublicacion } from "./abjad-comentarios";

/**
 * Reel «escribe la primera letra del nombre de quien ocupa tu mente»: quien comenta una sola letra recibe su
 * naturaleza según la ciencia de las letras (ʿilm al-ḥurūf, طبائع الحروف): en el orden del abjad, las letras van
 * fuego, aire, agua y tierra. Tabla fija y plantillas por idioma (nunca el modelo), como en los reels de abjad.
 */

type Elemento = "fuego" | "aire" | "agua" | "tierra";

/** Letras árabes por naturaleza (orden abjad: ا ب ج د → fuego, aire, agua, tierra, y así sucesivamente). */
const ORDEN = "ابجدهوزحطيكلمنسعفصقرشتثخذضظغ";
const ELEMENTO_ARABE: Readonly<Record<string, Elemento>> = Object.fromEntries([...ORDEN].map((c, i) => [c, (["fuego", "aire", "agua", "tierra"] as const)[i % 4]]));
const VARIANTES: Readonly<Record<string, string>> = { "أ": "ا", "إ": "ا", "آ": "ا", "ء": "ا", "ة": "ه", "ى": "ي", "ئ": "ي", "ؤ": "و" };

/** Letra latina → su equivalente árabe por el sonido (como se transcriben los nombres). */
const LATINA_A_ARABE: Readonly<Record<string, string>> = {
  a: "ا", b: "ب", c: "ك", "ç": "ج", d: "د", e: "ا", f: "ف", g: "غ", "ğ": "غ", h: "ه", i: "ي", "ı": "ي", j: "ج", k: "ك", l: "ل", m: "م", n: "ن", "ñ": "ن",
  o: "و", "ö": "و", p: "ب", q: "ق", r: "ر", s: "س", "ş": "ش", t: "ت", u: "و", "ü": "و", v: "ف", w: "و", x: "خ", y: "ي", z: "ز",
};

/** ¿La publicación es el reel de la inicial? (por su texto: caption de Instagram, mensaje de Facebook o título del Short). */
export function esPublicacionLetra(texto: string) {
  return /primera letra|la inicial|first letter|the initial|primeira letra|première lettre|ilk harf|أول حرف|اول حرف|الحرف الأول|الحرف الاول|huruf pertama|पहला अक्षर/i.test(texto);
}

/** La letra del comentario, si el comentario es una sola letra (con o sin emojis, signos o la palabra «letra»). */
export function letraDelComentario(texto: string): string | null {
  const limpio = texto
    .normalize("NFC")
    .replace(/@\S+/g, " ")
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/\b(letra|letter|lettre|harf|huruf|inicial|initial)\b|حرف|الحرف/giu, " ")
    .replace(/[^\p{L}]/gu, "");
  if ([...limpio].length !== 1) return null;
  return limpio;
}

function elementoDe(letra: string): { elemento: Elemento; arabe: string } | null {
  const arabe = VARIANTES[letra] ?? letra;
  if (ELEMENTO_ARABE[arabe]) return { elemento: ELEMENTO_ARABE[arabe], arabe };
  const base = letra.toLocaleLowerCase("tr") === "i" ? "i" : letra.toLowerCase();
  const sinTilde = LATINA_A_ARABE[base] ? base : base.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const eq = LATINA_A_ARABE[sinTilde];
  return eq ? { elemento: ELEMENTO_ARABE[eq], arabe: eq } : null;
}

const TEXTOS: Record<Idioma, { elementos: Record<Elemento, string>; cierres: [string, string] }> = {
  es: {
    elementos: {
      fuego: "letra de fuego 🔥. Dice la tradición que esa persona ama con intensidad y de frente: cuando quiere, se nota. Necesita admiración y que no le apagues el entusiasmo.",
      aire: "letra de aire 🌬️. Dice la tradición que esa persona ama con palabras e ideas: te conquista conversando. Necesita libertad y que la escuches de verdad.",
      agua: "letra de agua 💧. Dice la tradición que esa persona ama hondo y en silencio: siente más de lo que dice. Necesita ternura y saber que puede confiar en ti.",
      tierra: "letra de tierra 🌿. Dice la tradición que esa persona ama con hechos, despacio y para quedarse. Necesita constancia y que cumplas lo que prometes.",
    },
    cierres: ["¿Y tu inicial con la suya, se llevan? Escríbeme por mensaje y lo vemos 🔮", "¿Quieres saber si tu letra y la suya se atraen? Escríbeme por mensaje 🔮"],
  },
  en: {
    elementos: {
      fuego: "a fire letter 🔥. Tradition says this person loves intensely and openly: when they want you, it shows. They need admiration, and for you not to dim their spark.",
      aire: "an air letter 🌬️. Tradition says this person loves through words and ideas, and wins you over talking. They need freedom, and to be truly heard.",
      agua: "a water letter 💧. Tradition says this person loves deeply and quietly, feeling more than they say. They need tenderness, and to know they can trust you.",
      tierra: "an earth letter 🌿. Tradition says this person loves through actions, slowly and to stay. They need steadiness, and for you to keep your word.",
    },
    cierres: ["Does your initial match theirs? Message me and we'll look 🔮", "Want to know if your letter and theirs attract? Message me 🔮"],
  },
  pt: {
    elementos: {
      fuego: "letra de fogo 🔥. Diz a tradição que essa pessoa ama com intensidade e de frente: quando quer, dá para ver. Precisa de admiração e que você não apague o entusiasmo dela.",
      aire: "letra de ar 🌬️. Diz a tradição que essa pessoa ama com palavras e ideias: conquista conversando. Precisa de liberdade e de ser ouvida de verdade.",
      agua: "letra de água 💧. Diz a tradição que essa pessoa ama fundo e em silêncio: sente mais do que diz. Precisa de carinho e de saber que pode confiar em você.",
      tierra: "letra de terra 🌿. Diz a tradição que essa pessoa ama com atitudes, devagar e para ficar. Precisa de constância e que você cumpra o que promete.",
    },
    cierres: ["E a sua inicial combina com a dela? Me manda mensagem e a gente vê 🔮", "Quer saber se a sua letra e a dela se atraem? Me manda mensagem 🔮"],
  },
  fr: {
    elementos: {
      fuego: "une lettre de feu 🔥. La tradition dit que cette personne aime fort et franchement : quand elle veut, ça se voit. Elle a besoin d'admiration, et que tu n'éteignes pas son élan.",
      aire: "une lettre d'air 🌬️. La tradition dit que cette personne aime par les mots et les idées : elle te séduit en parlant. Elle a besoin de liberté, et d'être vraiment écoutée.",
      agua: "une lettre d'eau 💧. La tradition dit que cette personne aime profondément, en silence : elle ressent plus qu'elle ne dit. Elle a besoin de tendresse et de confiance.",
      tierra: "une lettre de terre 🌿. La tradition dit que cette personne aime par les actes, lentement et pour rester. Elle a besoin de constance, et que tu tiennes parole.",
    },
    cierres: ["Ton initiale s'accorde avec la sienne ? Écris-moi en message 🔮", "Ta lettre et la sienne s'attirent ? Écris-moi en message 🔮"],
  },
  tr: {
    elementos: {
      fuego: "ateş harfi 🔥. Geleneğe göre bu kişi yoğun ve açık sever: istediğinde belli eder. Takdir edilmeye ve hevesinin söndürülmemesine ihtiyaç duyar.",
      aire: "hava harfi 🌬️. Geleneğe göre bu kişi sözlerle ve fikirlerle sever: seni sohbetle kazanır. Özgürlüğe ve gerçekten dinlenmeye ihtiyaç duyar.",
      agua: "su harfi 💧. Geleneğe göre bu kişi derinden ve sessizce sever: söylediğinden fazlasını hisseder. Şefkate ve sana güvenebileceğini bilmeye ihtiyaç duyar.",
      tierra: "toprak harfi 🌿. Geleneğe göre bu kişi davranışlarıyla, yavaş ve kalıcı sever. İstikrara ve sözünü tutmana ihtiyaç duyar.",
    },
    cierres: ["Senin harfin onunkiyle uyumlu mu? Bana mesaj yaz, birlikte bakalım 🔮", "Harfin onun harfini çekiyor mu? Bana mesaj yaz 🔮"],
  },
  ar: {
    elementos: {
      fuego: "حرف ناري 🔥. تقول الحكمة القديمة إن صاحب هذا الحرف يحب بقوة ووضوح، وحين يريد يظهر ذلك. يحتاج إلى التقدير، وألا تطفئ حماسه.",
      aire: "حرف هوائي 🌬️. تقول الحكمة القديمة إن صاحب هذا الحرف يحب بالكلام والأفكار، ويأسرك بالحديث. يحتاج إلى الحرية، وإلى أن تُصغي إليه حقًا.",
      agua: "حرف مائي 💧. تقول الحكمة القديمة إن صاحب هذا الحرف يحب بعمق وفي صمت، ويشعر أكثر مما يقول. يحتاج إلى الحنان، وإلى أن يثق بك.",
      tierra: "حرف ترابي 🌿. تقول الحكمة القديمة إن صاحب هذا الحرف يحب بالأفعال، ببطء وليبقى. يحتاج إلى الثبات، وإلى أن تفي بوعودك.",
    },
    cierres: ["وهل يتوافق حرفك مع حرفه؟ راسلني في الخاص ونرى معًا 🔮", "هل يجذب حرفُك حرفَه؟ راسلني في الخاص 🔮"],
  },
  id: {
    elementos: {
      fuego: "huruf api 🔥. Kata tradisi, orang ini mencintai dengan kuat dan terang-terangan: kalau ia mau, itu terlihat. Ia butuh dikagumi, dan semangatnya jangan dipadamkan.",
      aire: "huruf udara 🌬️. Kata tradisi, orang ini mencintai lewat kata dan gagasan: ia memikatmu lewat obrolan. Ia butuh kebebasan, dan didengarkan sungguh-sungguh.",
      agua: "huruf air 💧. Kata tradisi, orang ini mencintai dalam dan diam-diam: ia merasa lebih dari yang ia ucapkan. Ia butuh kelembutan, dan bisa memercayaimu.",
      tierra: "huruf tanah 🌿. Kata tradisi, orang ini mencintai lewat tindakan, perlahan dan untuk menetap. Ia butuh kesetiaan, dan kamu menepati janji.",
    },
    cierres: ["Apakah inisialmu cocok dengan inisialnya? Kirim pesan padaku 🔮", "Ingin tahu apakah hurufmu dan hurufnya saling menarik? Kirim pesan padaku 🔮"],
  },
  hi: {
    elementos: {
      fuego: "अग्नि अक्षर 🔥। परंपरा कहती है कि यह व्यक्ति गहराई और खुलेपन से प्यार करता है: जब चाहता है, तो दिखता है। उसे सराहना चाहिए, और यह कि आप उसका उत्साह न बुझाएँ।",
      aire: "वायु अक्षर 🌬️। परंपरा कहती है कि यह व्यक्ति शब्दों और विचारों से प्यार करता है, बातों से दिल जीतता है। उसे आज़ादी चाहिए, और सच में सुना जाना।",
      agua: "जल अक्षर 💧। परंपरा कहती है कि यह व्यक्ति गहराई से और चुपचाप प्यार करता है, जितना कहता है उससे ज़्यादा महसूस करता है। उसे कोमलता और भरोसा चाहिए।",
      tierra: "पृथ्वी अक्षर 🌿। परंपरा कहती है कि यह व्यक्ति कर्मों से प्यार करता है, धीरे-धीरे और टिकने के लिए। उसे स्थिरता चाहिए, और यह कि आप वादे निभाएँ।",
    },
    cierres: ["क्या आपका अक्षर उसके अक्षर से मेल खाता है? मुझे मैसेज करें 🔮", "क्या आपका अक्षर और उसका अक्षर एक-दूसरे को खींचते हैं? मुझे मैसेज करें 🔮"],
  },
};

/**
 * Respuesta a un comentario que es una sola letra, en el reel de la inicial: null si no es una letra que se pueda
 * leer (entonces responde Sibila con el modelo, como a cualquier comentario). Idioma: árabe si la letra es árabe;
 * si no, el del comentario o, sin pistas, el de la publicación.
 */
export function respuestaLetra(comentario: string, textoPublicacion: string): string | null {
  const letra = letraDelComentario(comentario);
  if (!letra) return null;
  const e = elementoDe(letra);
  if (!e) return null;
  const esArabe = /[؀-ۿ]/.test(letra);
  const delComentario = idiomaConversacion(comentario);
  const idioma: Idioma = esArabe ? "ar" : delComentario !== "es" ? delComentario : idiomaDePublicacion(textoPublicacion);
  const t = TEXTOS[idioma];
  const mostrada = esArabe ? letra : `${letra.toLocaleUpperCase(idioma === "tr" ? "tr" : "es")} (${e.arabe})`;
  // Dos cierres que se alternan por letra: las respuestas no salen todas idénticas.
  const cierre = t.cierres[letra.codePointAt(0)! % 2];
  return `${mostrada}: ${t.elementos[e.elemento]} ${cierre}`;
}
