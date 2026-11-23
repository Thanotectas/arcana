import { idiomaDeTexto } from "@/lib/en-vivo";
import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Respuestas fijas de Sibila en redes y WhatsApp (las que no pasan por la IA:
 * tope de fotos, respaldo si la IA falla, avisos del directo), en los 8
 * idiomas de la página. El idioma sale del mensaje o, si no trae texto (una
 * foto), de los mensajes anteriores de la conversación.
 */
const IDIOMAS: Idioma[] = ["es", "en", "pt", "fr", "tr", "ar", "id", "hi"];
/** El detector no reconoce indonesio por palabras: unas pocas bastan para los mensajes cortos de redes. */
/** Palabras sueltas en inglés que el detector no cuenta y que son típicas en mensajes cortos. */
const INGLES_CORTO = /(?<![\p{L}])(plz|pls|read|hand|palm|dream|thank you|thanks|please|help|hi|hello)(?![\p{L}])/giu;
const INDONESIO = /(?<![\p{L}])(saya|aku|kamu|anda|tolong|terima kasih|makasih|bisa|apa|bagaimana|kapan|dengan|untuk|yang|tidak|ini|itu|baca|ramalan|tangan|kopi|halo|selamat)(?![\p{L}])/giu;

function idiomaDe(texto: string): Idioma | null {
  const t = texto.replace(/^\[foto\]\s*/, "").trim();
  if (!t) return null;
  if ((t.match(INDONESIO) ?? []).length >= 2) return "id";
  if ((t.match(INGLES_CORTO) ?? []).length >= 2 && !/[áéíóúñ¿¡]/i.test(t)) return "en";
  const d = idiomaDeTexto(t)?.codigo;
  return d && (IDIOMAS as string[]).includes(d) ? (d as Idioma) : null;
}

/** Idioma del mensaje actual o, si no se nota, del más reciente de la conversación que lo deje ver (español por defecto). */
export function idiomaConversacion(actual: string, anteriores: string[] = []): Idioma {
  for (const t of [actual, ...anteriores]) {
    const i = idiomaDe(t);
    if (i) return i;
  }
  // Mensajes muy cortos («Plz read my hand»): juntos sí dejan ver el idioma.
  return idiomaDe([actual, ...anteriores].join(" ")) ?? "es";
}

/** Prefijo de idioma de la página (miarcana.com/ar/huevo); vacío en español. */
const ruta = (idioma: Idioma, camino: string) => `miarcana.com${idioma === "es" ? "" : `/${idioma}`}/${camino}`;

export function respuestaFotoFija(idioma: Idioma): string {
  const h = ruta(idioma, "huevo");
  const v = ruta(idioma, "velas");
  const t: Record<Idioma, string> = {
    es: `¡Recibí tu foto! 💛 Para leerla con calma, súbela en ${h} (o en ${v} si es una vela): te digo lo que salió, lo que viene y qué hacer. Tu primera lectura completa es gratis al crear tu cuenta.`,
    en: `I got your photo! 💛 To read it calmly, upload it at ${h} (or ${v} if it's a candle): I'll tell you what came out, what's coming and what to do. Your first full reading is free when you create your account.`,
    pt: `Recebi sua foto! 💛 Para lê-la com calma, envie em ${h} (ou em ${v} se for uma vela): eu te digo o que saiu, o que vem e o que fazer. Sua primeira leitura completa é grátis ao criar sua conta.`,
    fr: `J'ai bien reçu ta photo ! 💛 Pour la lire avec soin, dépose-la sur ${h} (ou sur ${v} si c'est une bougie) : je te dis ce qui est apparu, ce qui arrive et quoi faire. Ta première lecture complète est offerte à la création de ton compte.`,
    tr: `Fotoğrafını aldım! 💛 Sakin sakin okuyabilmem için ${h} adresine yükle (mumsa ${v}): ne çıktığını, ne geleceğini ve ne yapman gerektiğini söylerim. Hesabını açınca ilk tam okuman ücretsiz.`,
    ar: `وصلتني صورتك! 💛 لأقرأها بهدوء، ارفعها على ${h} (أو على ${v} إن كانت شمعة): أقول لك ما ظهر، وما هو آتٍ، وماذا تفعل. قراءتك الكاملة الأولى مجانية عند إنشاء حسابك.`,
    id: `Fotomu sudah kuterima! 💛 Supaya bisa kubaca dengan tenang, unggah di ${h} (atau di ${v} kalau itu lilin): kuceritakan apa yang muncul, apa yang akan datang, dan apa yang perlu dilakukan. Bacaan lengkap pertamamu gratis saat membuat akun.`,
    hi: `आपकी तस्वीर मिल गई! 💛 इसे आराम से पढ़ने के लिए ${h} पर अपलोड करें (मोमबत्ती हो तो ${v} पर): मैं बताऊँगी क्या दिखा, आगे क्या है और क्या करें। अकाउंट बनाने पर आपकी पहली पूरी रीडिंग मुफ़्त है।`,
  };
  return t[idioma];
}

export function respuestaLimite(idioma: Idioma): string {
  const s = ruta(idioma, "").replace(/\/$/, "");
  const t: Record<Idioma, string> = {
    es: `Me encantó conversar contigo 💛 Para seguir con calma, te espero en ${s}: tienes tu carta del día gratis y tu primera lectura completa de regalo al crear tu cuenta 🔮`,
    en: `I loved talking with you 💛 To continue calmly, I'll be waiting at ${s}: your card of the day is free, and your first full reading is a gift when you create your account 🔮`,
    pt: `Adorei conversar com você 💛 Para continuar com calma, te espero em ${s}: sua carta do dia é grátis e sua primeira leitura completa é um presente ao criar sua conta 🔮`,
    fr: `J'ai adoré discuter avec toi 💛 Pour continuer tranquillement, je t'attends sur ${s} : ta carte du jour est gratuite et ta première lecture complète t'est offerte à la création de ton compte 🔮`,
    tr: `Seninle konuşmak çok güzeldi 💛 Sakin sakin devam etmek için seni ${s} adresinde bekliyorum: günün kartı ücretsiz, hesabını açınca ilk tam okuman hediye 🔮`,
    ar: `سعدت كثيراً بالحديث معك 💛 لنكمل بهدوء، أنتظرك على ${s}: بطاقة يومك مجانية، وقراءتك الكاملة الأولى هدية عند إنشاء حسابك 🔮`,
    id: `Senang sekali ngobrol denganmu 💛 Supaya bisa lanjut dengan tenang, kutunggu di ${s}: kartu harianmu gratis dan bacaan lengkap pertamamu jadi hadiah saat membuat akun 🔮`,
    hi: `आपसे बात करके बहुत अच्छा लगा 💛 आराम से आगे बढ़ने के लिए मैं ${s} पर आपका इंतज़ार कर रही हूँ: आज का कार्ड मुफ़्त है और अकाउंट बनाने पर पहली पूरी रीडिंग उपहार है 🔮`,
  };
  return t[idioma];
}

/** WhatsApp, si la IA no devolvió nada. */
export function respuestaVacia(idioma: Idioma): string {
  const t: Record<Idioma, string> = {
    es: "Aquí estoy 🌙 ¿En qué te ayudo con Arcana?",
    en: "I'm here 🌙 How can I help you with Arcana?",
    pt: "Estou aqui 🌙 Como posso te ajudar com a Arcana?",
    fr: "Je suis là 🌙 Comment puis-je t'aider avec Arcana ?",
    tr: "Buradayım 🌙 Arcana ile ilgili sana nasıl yardımcı olabilirim?",
    ar: "أنا هنا 🌙 كيف أساعدك في أركانا؟",
    id: "Aku di sini 🌙 Ada yang bisa kubantu soal Arcana?",
    hi: "मैं यहाँ हूँ 🌙 Arcana में मैं आपकी क्या मदद करूँ?",
  };
  return t[idioma];
}

/** Locale para escribir la hora del directo en cada idioma. */
const LOCALE: Record<Idioma, string> = { es: "es-CO", en: "en-US", pt: "pt-BR", fr: "fr-FR", tr: "tr-TR", ar: "ar", id: "id-ID", hi: "hi-IN" };

/**
 * Respuestas a los comentarios en la publicación que anuncia el directo
 * (Facebook: sin enlaces, la dirección va en palabras).
 */
export function respuestasDirecto(idioma: Idioma, nombre: string, alAire: boolean, inicio: string) {
  const hora = new Intl.DateTimeFormat(LOCALE[idioma], { timeZone: "America/Bogota", hour: "numeric", minute: "2-digit" }).format(new Date(inicio));
  const n = nombre;
  const t = {
    es: {
      cuando: alAire ? "Ya estamos en vivo" : `Hoy a las ${hora} (Colombia)`,
      foto: (c: string) => `${n ? `${n}, ` : ""}¡qué bueno que la compartes! 🔮 Para que Sibila la lea en el directo, súbela en miarcana punto com barra vivo. ${c} en YouTube: búscanos como @miarcana.`,
      saludo: (c: string) => `${n ? `¡Gracias, ${n}! ` : "¡Gracias! "}${c} te espero en YouTube (@miarcana) 🔮 Déjame aquí tu signo y tu pregunta y te la leo en vivo.`,
      vivo: [`¡Anotada${n ? `, ${n}` : ""}! 🔮 Ya estamos en vivo en YouTube: búscanos como @miarcana, que tu lectura viene en la fila.`, `${n ? `${n}, ` : ""}tu pregunta ya está en la fila ✨ Entra ahora a YouTube (@miarcana) para escucharla en vivo, con tu nombre.`],
      antes: (c: string) => [`¡Anotada${n ? `, ${n}` : ""}! 🔮 ${c} te la leo en vivo en YouTube: búscanos como @miarcana y activa el recordatorio.`, `${n ? `${n}, ` : ""}tu pregunta quedó en la fila ✨ ${c} la escuchas en vivo, con tu nombre, en YouTube (@miarcana).`],
      firma: "— Sibila, de Arcana 🔮",
    },
    en: {
      cuando: alAire ? "We're live now" : `Today at ${hora} (Colombia time)`,
      foto: (c: string) => `${n ? `${n}, ` : ""}so glad you shared it! 🔮 For Sibila to read it on the live, upload it at miarcana dot com slash vivo. ${c} on YouTube: find us as @miarcana.`,
      saludo: (c: string) => `${n ? `Thank you, ${n}! ` : "Thank you! "}${c}, I'll be waiting on YouTube (@miarcana) 🔮 Leave your sign and your question here and I'll read it live.`,
      vivo: [`Got it${n ? `, ${n}` : ""}! 🔮 We're live on YouTube now: find us as @miarcana, your reading is in the queue.`, `${n ? `${n}, ` : ""}your question is in the queue ✨ Join YouTube (@miarcana) now to hear it live, with your name.`],
      antes: (c: string) => [`Got it${n ? `, ${n}` : ""}! 🔮 ${c} I'll read it live on YouTube: find us as @miarcana and turn on the reminder.`, `${n ? `${n}, ` : ""}your question is in the queue ✨ ${c} you'll hear it live, with your name, on YouTube (@miarcana).`],
      firma: "— Sibila, from Arcana 🔮",
    },
    pt: {
      cuando: alAire ? "Já estamos ao vivo" : `Hoje às ${hora} (horário da Colômbia)`,
      foto: (c: string) => `${n ? `${n}, ` : ""}que bom que você compartilhou! 🔮 Para a Sibila ler na live, envie em miarcana ponto com barra vivo. ${c} no YouTube: procure @miarcana.`,
      saludo: (c: string) => `${n ? `Obrigada, ${n}! ` : "Obrigada! "}${c} te espero no YouTube (@miarcana) 🔮 Deixe aqui seu signo e sua pergunta que eu leio ao vivo.`,
      vivo: [`Anotada${n ? `, ${n}` : ""}! 🔮 Já estamos ao vivo no YouTube: procure @miarcana, sua leitura está na fila.`, `${n ? `${n}, ` : ""}sua pergunta já está na fila ✨ Entre agora no YouTube (@miarcana) para ouvir ao vivo, com seu nome.`],
      antes: (c: string) => [`Anotada${n ? `, ${n}` : ""}! 🔮 ${c} eu leio ao vivo no YouTube: procure @miarcana e ative o lembrete.`, `${n ? `${n}, ` : ""}sua pergunta ficou na fila ✨ ${c} você ouve ao vivo, com seu nome, no YouTube (@miarcana).`],
      firma: "— Sibila, da Arcana 🔮",
    },
    fr: {
      cuando: alAire ? "Nous sommes en direct" : `Aujourd'hui à ${hora} (heure de Colombie)`,
      foto: (c: string) => `${n ? `${n}, ` : ""}merci de la partager ! 🔮 Pour que Sibila la lise en direct, dépose-la sur miarcana point com barre vivo. ${c} sur YouTube : cherche @miarcana.`,
      saludo: (c: string) => `${n ? `Merci, ${n} ! ` : "Merci ! "}${c}, je t'attends sur YouTube (@miarcana) 🔮 Laisse-moi ici ton signe et ta question, je te la lis en direct.`,
      vivo: [`C'est noté${n ? `, ${n}` : ""} ! 🔮 Nous sommes en direct sur YouTube : cherche @miarcana, ta lecture est dans la file.`, `${n ? `${n}, ` : ""}ta question est dans la file ✨ Rejoins YouTube (@miarcana) maintenant pour l'écouter en direct, avec ton prénom.`],
      antes: (c: string) => [`C'est noté${n ? `, ${n}` : ""} ! 🔮 ${c}, je te la lis en direct sur YouTube : cherche @miarcana et active le rappel.`, `${n ? `${n}, ` : ""}ta question est dans la file ✨ ${c}, tu l'écoutes en direct, avec ton prénom, sur YouTube (@miarcana).`],
      firma: "— Sibila, d'Arcana 🔮",
    },
    tr: {
      cuando: alAire ? "Şu an canlıdayız" : `Bugün saat ${hora}'da (Kolombiya saatiyle)`,
      foto: (c: string) => `${n ? `${n}, ` : ""}paylaştığın için çok sevindim! 🔮 Sibila'nın canlı yayında okuması için miarcana nokta com eğik çizgi vivo adresine yükle. ${c}, YouTube'da: @miarcana diye ara.`,
      saludo: (c: string) => `${n ? `Teşekkürler, ${n}! ` : "Teşekkürler! "}${c} YouTube'da (@miarcana) seni bekliyorum 🔮 Burçunu ve sorunu buraya bırak, canlıda okuyayım.`,
      vivo: [`Not aldım${n ? `, ${n}` : ""}! 🔮 Şu an YouTube'da canlıdayız: @miarcana diye ara, okuman sırada.`, `${n ? `${n}, ` : ""}sorun sırada ✨ Adınla canlı dinlemek için şimdi YouTube'a (@miarcana) gel.`],
      antes: (c: string) => [`Not aldım${n ? `, ${n}` : ""}! 🔮 ${c} YouTube'da canlı okuyacağım: @miarcana diye ara ve hatırlatıcıyı aç.`, `${n ? `${n}, ` : ""}sorun sıraya girdi ✨ ${c} adınla birlikte YouTube'da (@miarcana) canlı dinleyeceksin.`],
      firma: "— Arcana'dan Sibila 🔮",
    },
    ar: {
      cuando: alAire ? "نحن على الهواء الآن" : `اليوم الساعة ${hora} (بتوقيت كولومبيا)`,
      foto: (c: string) => `${n ? `${n}، ` : ""}يسعدني أنك شاركتها! 🔮 لتقرأها سيبيلا في البث المباشر، ارفعها على miarcana نقطة com شرطة vivo. ${c} على يوتيوب: ابحث عن ‎@miarcana.`,
      saludo: (c: string) => `${n ? `شكراً يا ${n}! ` : "شكراً! "}${c}، أنتظرك على يوتيوب (‎@miarcana) 🔮 اترك هنا برجك وسؤالك وأقرأه لك مباشرة.`,
      vivo: [`سجّلتها${n ? ` يا ${n}` : ""}! 🔮 نحن على الهواء الآن في يوتيوب: ابحث عن ‎@miarcana، قراءتك في الدور.`, `${n ? `${n}، ` : ""}سؤالك في الدور ✨ ادخل الآن إلى يوتيوب (‎@miarcana) لتسمعه مباشرة باسمك.`],
      antes: (c: string) => [`سجّلتها${n ? ` يا ${n}` : ""}! 🔮 ${c} أقرأها لك مباشرة على يوتيوب: ابحث عن ‎@miarcana وفعّل التذكير.`, `${n ? `${n}، ` : ""}سؤالك في الدور ✨ ${c} تسمعه مباشرة باسمك على يوتيوب (‎@miarcana).`],
      firma: "— سيبيلا، من أركانا 🔮",
    },
    id: {
      cuando: alAire ? "Kami sedang live" : `Hari ini pukul ${hora} (waktu Kolombia)`,
      foto: (c: string) => `${n ? `${n}, ` : ""}senang kamu membagikannya! 🔮 Supaya Sibila membacanya saat live, unggah di miarcana titik com garis miring vivo. ${c} di YouTube: cari @miarcana.`,
      saludo: (c: string) => `${n ? `Terima kasih, ${n}! ` : "Terima kasih! "}${c} kutunggu di YouTube (@miarcana) 🔮 Tinggalkan zodiak dan pertanyaanmu di sini, nanti kubacakan secara live.`,
      vivo: [`Sudah dicatat${n ? `, ${n}` : ""}! 🔮 Kami sedang live di YouTube: cari @miarcana, bacaanmu ada di antrean.`, `${n ? `${n}, ` : ""}pertanyaanmu sudah di antrean ✨ Masuk ke YouTube (@miarcana) sekarang untuk mendengarnya live, dengan namamu.`],
      antes: (c: string) => [`Sudah dicatat${n ? `, ${n}` : ""}! 🔮 ${c} kubacakan secara live di YouTube: cari @miarcana dan aktifkan pengingat.`, `${n ? `${n}, ` : ""}pertanyaanmu masuk antrean ✨ ${c} kamu bisa mendengarnya live, dengan namamu, di YouTube (@miarcana).`],
      firma: "— Sibila, dari Arcana 🔮",
    },
    hi: {
      cuando: alAire ? "हम अभी लाइव हैं" : `आज ${hora} बजे (कोलंबिया समय)`,
      foto: (c: string) => `${n ? `${n}, ` : ""}शेयर करने के लिए धन्यवाद! 🔮 Sibila लाइव में पढ़ें, इसके लिए इसे miarcana डॉट com स्लैश vivo पर अपलोड करें। ${c} YouTube पर: @miarcana खोजें।`,
      saludo: (c: string) => `${n ? `धन्यवाद, ${n}! ` : "धन्यवाद! "}${c} YouTube (@miarcana) पर आपका इंतज़ार है 🔮 अपनी राशि और सवाल यहाँ लिखें, मैं लाइव पढ़ूँगी।`,
      vivo: [`नोट कर लिया${n ? `, ${n}` : ""}! 🔮 हम अभी YouTube पर लाइव हैं: @miarcana खोजें, आपकी रीडिंग कतार में है।`, `${n ? `${n}, ` : ""}आपका सवाल कतार में है ✨ अभी YouTube (@miarcana) पर आएँ और अपने नाम के साथ लाइव सुनें।`],
      antes: (c: string) => [`नोट कर लिया${n ? `, ${n}` : ""}! 🔮 ${c} मैं YouTube पर लाइव पढ़ूँगी: @miarcana खोजें और रिमाइंडर चालू करें।`, `${n ? `${n}, ` : ""}आपका सवाल कतार में है ✨ ${c} आप इसे अपने नाम के साथ YouTube (@miarcana) पर लाइव सुनेंगे।`],
      firma: "— Arcana की Sibila 🔮",
    },
  }[idioma];
  return { foto: t.foto(t.cuando), saludo: t.saludo(t.cuando), consulta: alAire ? t.vivo : t.antes(t.cuando), firma: t.firma };
}
