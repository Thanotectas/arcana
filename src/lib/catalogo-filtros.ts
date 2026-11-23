import type { Idioma } from "./i18n/idiomas";

/**
 * Formas de buscar en la biblioteca de Arcana: por lo que la persona quiere saber, por tipo de práctica y por la
 * tradición o el país de donde viene. Cada producto del catálogo (por su clave) tiene sus etiquetas aquí; uno nuevo
 * sin etiquetas aparece igual en «todo» y en su búsqueda por nombre.
 */
export const NECESIDADES = ["amor", "respuesta", "destino", "senal", "energia", "alma", "diario"] as const;
export const PRACTICAS = ["cartas", "astrologia", "numeros", "oraculos", "calendarios", "senales", "energia", "alma"] as const;
export const ORIGENES = ["latinoamerica", "europa", "mesoamerica", "china", "india", "indonesia", "arabe", "turquia", "mundo"] as const;

export type Necesidad = (typeof NECESIDADES)[number];
export type Practica = (typeof PRACTICAS)[number];
export type Origen = (typeof ORIGENES)[number];

export interface Etiquetas {
  necesidades: Necesidad[];
  practica: Practica;
  origenes: Origen[];
}

export const ETIQUETAS: Record<string, Etiquetas> = {
  tarot: { necesidades: ["respuesta", "amor"], practica: "cartas", origenes: ["europa"] },
  marsella: { necesidades: ["respuesta", "amor"], practica: "cartas", origenes: ["europa"] },
  baraja: { necesidades: ["respuesta", "amor"], practica: "cartas", origenes: ["latinoamerica", "europa"] },
  lenormand: { necesidades: ["respuesta"], practica: "cartas", origenes: ["europa"] },
  iskambil: { necesidades: ["respuesta", "amor"], practica: "cartas", origenes: ["turquia"] },
  siono: { necesidades: ["respuesta"], practica: "oraculos", origenes: ["mundo"] },
  pendulo: { necesidades: ["respuesta"], practica: "oraculos", origenes: ["mundo"] },
  runas: { necesidades: ["respuesta"], practica: "oraculos", origenes: ["europa"] },
  iching: { necesidades: ["respuesta"], practica: "oraculos", origenes: ["china"] },
  geomancia: { necesidades: ["respuesta"], practica: "oraculos", origenes: ["arabe"] },
  astral: { necesidades: ["destino"], practica: "astrologia", origenes: ["europa"] },
  revolucion: { necesidades: ["destino"], practica: "astrologia", origenes: ["europa"] },
  ascendente: { necesidades: ["destino"], practica: "astrologia", origenes: ["europa"] },
  kundli: { necesidades: ["destino"], practica: "astrologia", origenes: ["india"] },
  cruce: { necesidades: ["destino"], practica: "astrologia", origenes: ["mundo"] },
  hoy: { necesidades: ["diario"], practica: "astrologia", origenes: ["europa"] },
  horoscopo: { necesidades: ["diario"], practica: "astrologia", origenes: ["europa"] },
  luna: { necesidades: ["diario", "energia"], practica: "astrologia", origenes: ["mundo"] },
  compatibilidad: { necesidades: ["amor"], practica: "astrologia", origenes: ["europa"] },
  sinastria: { necesidades: ["amor"], practica: "astrologia", origenes: ["europa"] },
  milan: { necesidades: ["amor"], practica: "astrologia", origenes: ["india"] },
  numerologia: { necesidades: ["destino"], practica: "numeros", origenes: ["europa"] },
  abjad: { necesidades: ["destino"], practica: "numeros", origenes: ["arabe"] },
  angeles: { necesidades: ["diario", "senal"], practica: "numeros", origenes: ["mundo"] },
  nombres: { necesidades: ["amor"], practica: "numeros", origenes: ["india", "arabe"] },
  maya: { necesidades: ["destino"], practica: "calendarios", origenes: ["mesoamerica"] },
  chino: { necesidades: ["destino"], practica: "calendarios", origenes: ["china"] },
  weton: { necesidades: ["destino"], practica: "calendarios", origenes: ["indonesia"] },
  jodoh: { necesidades: ["amor"], practica: "calendarios", origenes: ["indonesia"] },
  huevo: { necesidades: ["senal", "energia"], practica: "senales", origenes: ["latinoamerica"] },
  chocolate: { necesidades: ["senal"], practica: "senales", origenes: ["latinoamerica"] },
  cafe: { necesidades: ["senal"], practica: "senales", origenes: ["turquia", "arabe"] },
  velas: { necesidades: ["senal", "energia"], practica: "senales", origenes: ["latinoamerica"] },
  tabaco: { necesidades: ["senal"], practica: "senales", origenes: ["latinoamerica"] },
  quiromancia: { necesidades: ["destino", "senal"], practica: "senales", origenes: ["india", "europa"] },
  suenos: { necesidades: ["senal"], practica: "senales", origenes: ["mundo"] },
  aura: { necesidades: ["energia"], practica: "energia", origenes: ["mundo"] },
  rituales: { necesidades: ["energia"], practica: "energia", origenes: ["latinoamerica", "mundo"] },
  piedras: { necesidades: ["energia"], practica: "energia", origenes: ["mundo"] },
  vidas: { necesidades: ["alma"], practica: "alma", origenes: ["india", "mundo"] },
  akashicos: { necesidades: ["alma"], practica: "alma", origenes: ["mundo"] },
};

/** Lo que la persona tiene a mano (segunda pregunta de la guía): qué prácticas le sirven. */
export const A_MANO = ["fecha", "pregunta", "foto", "nada"] as const;
export type AMano = (typeof A_MANO)[number];
export const PRACTICAS_POR_A_MANO: Record<AMano, Practica[]> = {
  fecha: ["astrologia", "numeros", "calendarios", "alma"],
  pregunta: ["cartas", "oraculos"],
  foto: ["senales", "energia"],
  nada: [],
};

export interface TextosFiltros {
  buscar: string;
  vistas: { necesidad: string; practica: string; origen: string; gratis: string; todo: string };
  necesidades: Record<Necesidad, string>;
  practicas: Record<Practica, string>;
  origenes: Record<Origen, string>;
  gratis: string;
  sinResultados: string;
  guia: {
    titulo: string;
    texto: string;
    p1: string;
    p2: string;
    aMano: Record<AMano, string>;
    resultado: string;
    otraVez: string;
    sibila: string;
    sibilaPregunta: string;
  };
  sugerir: { titulo: string; texto: string; campo: string; correo: string; enviar: string; enviando: string; ok: string; error: string };
}

export const TEXTOS_FILTROS: Record<Idioma, TextosFiltros> = {
  es: {
    buscar: "Busca una práctica: tarot, limpia, kundli, runas…",
    vistas: { necesidad: "Lo que quieres saber", practica: "Tipo de práctica", origen: "Tradición y país", gratis: "Gratis", todo: "Todo" },
    necesidades: { amor: "Amor y pareja", respuesta: "Una respuesta ahora", destino: "Quién eres y tu destino", senal: "Lee una señal", energia: "Limpieza y energía", alma: "Tu alma y vidas pasadas", diario: "Para cada día" },
    practicas: { cartas: "Cartas", astrologia: "Astrología", numeros: "Números", oraculos: "Oráculos", calendarios: "Calendarios sagrados", senales: "Lectura de señales", energia: "Energía y rituales", alma: "Alma" },
    origenes: { latinoamerica: "Latinoamérica", europa: "Europa y Occidente", mesoamerica: "Maya y Mesoamérica", china: "China", india: "India", indonesia: "Indonesia (Java)", arabe: "Mundo árabe y África", turquia: "Turquía", mundo: "De todo el mundo" },
    gratis: "Gratis",
    sinResultados: "No encontramos esa práctica todavía. Cuéntanos abajo y Sibila la investiga.",
    guia: {
      titulo: "¿No sabes por dónde empezar?",
      texto: "Responde dos preguntas y te recomiendo las prácticas para ti.",
      p1: "¿Qué quieres saber?",
      p2: "¿Qué tienes a mano?",
      aMano: { fecha: "Mi fecha de nacimiento", pregunta: "Una pregunta en la cabeza", foto: "Una foto: mi vaso, mi taza o mi mano", nada: "Nada, solo curiosidad" },
      resultado: "Te recomiendo empezar por:",
      otraVez: "Empezar de nuevo",
      sibila: "Prefiero contárselo a Sibila",
      sibilaPregunta: "Hola Sibila, soy nueva/o en esto. ¿Qué lectura me recomiendas?",
    },
    sugerir: {
      titulo: "¿Tu práctica no está?",
      texto: "Queremos la biblioteca esotérica más completa del mundo. Cuéntanos qué practicas o qué te gustaría consultar y Sibila lo investiga.",
      campo: "¿Qué práctica, de dónde viene y cómo se hace?",
      correo: "Tu correo (opcional, para avisarte cuando esté)",
      enviar: "Enviar sugerencia",
      enviando: "Enviando…",
      ok: "¡Gracias! La anotamos y te avisamos cuando esté lista.",
      error: "No se pudo enviar. Intenta de nuevo.",
    },
  },
  en: {
    buscar: "Search a practice: tarot, egg cleansing, kundli, runes…",
    vistas: { necesidad: "What you want to know", practica: "Type of practice", origen: "Tradition and country", gratis: "Free", todo: "All" },
    necesidades: { amor: "Love and relationships", respuesta: "An answer now", destino: "Who you are and your destiny", senal: "Read a sign", energia: "Cleansing and energy", alma: "Your soul and past lives", diario: "For every day" },
    practicas: { cartas: "Cards", astrologia: "Astrology", numeros: "Numbers", oraculos: "Oracles", calendarios: "Sacred calendars", senales: "Reading signs", energia: "Energy and rituals", alma: "Soul" },
    origenes: { latinoamerica: "Latin America", europa: "Europe and the West", mesoamerica: "Maya and Mesoamerica", china: "China", india: "India", indonesia: "Indonesia (Java)", arabe: "Arab world and Africa", turquia: "Turkey", mundo: "From all over the world" },
    gratis: "Free",
    sinResultados: "We don't have that practice yet. Tell us below and Sibila will research it.",
    guia: {
      titulo: "Not sure where to start?",
      texto: "Answer two questions and I'll recommend the practices for you.",
      p1: "What do you want to know?",
      p2: "What do you have at hand?",
      aMano: { fecha: "My birth date", pregunta: "A question on my mind", foto: "A photo: my glass, my cup or my hand", nada: "Nothing, just curious" },
      resultado: "I recommend you start with:",
      otraVez: "Start over",
      sibila: "I'd rather tell Sibila",
      sibilaPregunta: "Hi Sibila, I'm new to this. Which reading do you recommend for me?",
    },
    sugerir: {
      titulo: "Is your practice missing?",
      texto: "We want the most complete esoteric library in the world. Tell us what you practice or would like to consult and Sibila will research it.",
      campo: "Which practice, where does it come from and how is it done?",
      correo: "Your email (optional, to let you know when it's ready)",
      enviar: "Send suggestion",
      enviando: "Sending…",
      ok: "Thank you! We noted it and will let you know when it's ready.",
      error: "It couldn't be sent. Please try again.",
    },
  },
  pt: {
    buscar: "Busque uma prática: tarô, limpeza com ovo, kundli, runas…",
    vistas: { necesidad: "O que você quer saber", practica: "Tipo de prática", origen: "Tradição e país", gratis: "Grátis", todo: "Tudo" },
    necesidades: { amor: "Amor e relacionamento", respuesta: "Uma resposta agora", destino: "Quem você é e seu destino", senal: "Leia um sinal", energia: "Limpeza e energia", alma: "Sua alma e vidas passadas", diario: "Para todo dia" },
    practicas: { cartas: "Cartas", astrologia: "Astrologia", numeros: "Números", oraculos: "Oráculos", calendarios: "Calendários sagrados", senales: "Leitura de sinais", energia: "Energia e rituais", alma: "Alma" },
    origenes: { latinoamerica: "América Latina", europa: "Europa e Ocidente", mesoamerica: "Maia e Mesoamérica", china: "China", india: "Índia", indonesia: "Indonésia (Java)", arabe: "Mundo árabe e África", turquia: "Turquia", mundo: "Do mundo todo" },
    gratis: "Grátis",
    sinResultados: "Ainda não temos essa prática. Conte para nós abaixo e a Sibila pesquisa.",
    guia: {
      titulo: "Não sabe por onde começar?",
      texto: "Responda duas perguntas e eu recomendo as práticas para você.",
      p1: "O que você quer saber?",
      p2: "O que você tem em mãos?",
      aMano: { fecha: "Minha data de nascimento", pregunta: "Uma pergunta na cabeça", foto: "Uma foto: meu copo, minha xícara ou minha mão", nada: "Nada, só curiosidade" },
      resultado: "Recomendo começar por:",
      otraVez: "Começar de novo",
      sibila: "Prefiro contar para a Sibila",
      sibilaPregunta: "Oi Sibila, sou nova/o nisso. Que leitura você me recomenda?",
    },
    sugerir: {
      titulo: "Sua prática não está aqui?",
      texto: "Queremos a biblioteca esotérica mais completa do mundo. Conte o que você pratica ou gostaria de consultar e a Sibila pesquisa.",
      campo: "Qual prática, de onde vem e como se faz?",
      correo: "Seu e-mail (opcional, para avisar quando estiver pronta)",
      enviar: "Enviar sugestão",
      enviando: "Enviando…",
      ok: "Obrigada! Anotamos e avisamos quando estiver pronta.",
      error: "Não foi possível enviar. Tente de novo.",
    },
  },
  fr: {
    buscar: "Cherche une pratique : tarot, nettoyage à l'œuf, kundli, runes…",
    vistas: { necesidad: "Ce que tu veux savoir", practica: "Type de pratique", origen: "Tradition et pays", gratis: "Gratuit", todo: "Tout" },
    necesidades: { amor: "Amour et couple", respuesta: "Une réponse maintenant", destino: "Qui tu es et ton destin", senal: "Lire un signe", energia: "Purification et énergie", alma: "Ton âme et tes vies antérieures", diario: "Pour chaque jour" },
    practicas: { cartas: "Cartes", astrologia: "Astrologie", numeros: "Nombres", oraculos: "Oracles", calendarios: "Calendriers sacrés", senales: "Lecture des signes", energia: "Énergie et rituels", alma: "Âme" },
    origenes: { latinoamerica: "Amérique latine", europa: "Europe et Occident", mesoamerica: "Maya et Mésoamérique", china: "Chine", india: "Inde", indonesia: "Indonésie (Java)", arabe: "Monde arabe et Afrique", turquia: "Turquie", mundo: "Du monde entier" },
    gratis: "Gratuit",
    sinResultados: "Nous n'avons pas encore cette pratique. Dis-le-nous ci-dessous et Sibila fera des recherches.",
    guia: {
      titulo: "Tu ne sais pas par où commencer ?",
      texto: "Réponds à deux questions et je te recommande les pratiques faites pour toi.",
      p1: "Que veux-tu savoir ?",
      p2: "Qu'as-tu sous la main ?",
      aMano: { fecha: "Ma date de naissance", pregunta: "Une question en tête", foto: "Une photo : mon verre, ma tasse ou ma main", nada: "Rien, juste par curiosité" },
      resultado: "Je te recommande de commencer par :",
      otraVez: "Recommencer",
      sibila: "Je préfère en parler à Sibila",
      sibilaPregunta: "Bonjour Sibila, je débute. Quelle lecture me conseilles-tu ?",
    },
    sugerir: {
      titulo: "Ta pratique n'est pas là ?",
      texto: "Nous voulons la bibliothèque ésotérique la plus complète du monde. Dis-nous ce que tu pratiques ou aimerais consulter et Sibila fera des recherches.",
      campo: "Quelle pratique, d'où vient-elle et comment se fait-elle ?",
      correo: "Ton e-mail (facultatif, pour te prévenir quand elle sera prête)",
      enviar: "Envoyer la suggestion",
      enviando: "Envoi…",
      ok: "Merci ! Nous l'avons notée et te préviendrons quand elle sera prête.",
      error: "L'envoi n'a pas marché. Réessaie.",
    },
  },
  tr: {
    buscar: "Bir uygulama ara: tarot, yumurta temizliği, kundli, rünler…",
    vistas: { necesidad: "Ne öğrenmek istiyorsun", practica: "Uygulama türü", origen: "Gelenek ve ülke", gratis: "Ücretsiz", todo: "Tümü" },
    necesidades: { amor: "Aşk ve ilişki", respuesta: "Hemen bir cevap", destino: "Kim olduğun ve kaderin", senal: "Bir işareti oku", energia: "Arınma ve enerji", alma: "Ruhun ve geçmiş yaşamların", diario: "Her gün için" },
    practicas: { cartas: "Kartlar", astrologia: "Astroloji", numeros: "Sayılar", oraculos: "Kehanet araçları", calendarios: "Kutsal takvimler", senales: "İşaret okuma", energia: "Enerji ve ritüeller", alma: "Ruh" },
    origenes: { latinoamerica: "Latin Amerika", europa: "Avrupa ve Batı", mesoamerica: "Maya ve Mezoamerika", china: "Çin", india: "Hindistan", indonesia: "Endonezya (Java)", arabe: "Arap dünyası ve Afrika", turquia: "Türkiye", mundo: "Dünyanın her yerinden" },
    gratis: "Ücretsiz",
    sinResultados: "Bu uygulama henüz yok. Aşağıda bize anlat, Sibila araştırsın.",
    guia: {
      titulo: "Nereden başlayacağını bilmiyor musun?",
      texto: "İki soruyu cevapla, sana uygun olanları önereyim.",
      p1: "Ne öğrenmek istiyorsun?",
      p2: "Elinde ne var?",
      aMano: { fecha: "Doğum tarihim", pregunta: "Aklımda bir soru", foto: "Bir fotoğraf: bardağım, fincanım ya da elim", nada: "Hiçbir şey, sadece merak" },
      resultado: "Şunlarla başlamanı öneririm:",
      otraVez: "Baştan başla",
      sibila: "Sibila'ya anlatmayı tercih ederim",
      sibilaPregunta: "Merhaba Sibila, bu işlerde yeniyim. Bana hangi falı önerirsin?",
    },
    sugerir: {
      titulo: "Senin uygulaman yok mu?",
      texto: "Dünyanın en kapsamlı ezoterik kütüphanesini istiyoruz. Ne uyguladığını ya da neye baktırmak istediğini anlat, Sibila araştırsın.",
      campo: "Hangi uygulama, nereden geliyor ve nasıl yapılıyor?",
      correo: "E-postan (isteğe bağlı, hazır olunca haber vermek için)",
      enviar: "Öneriyi gönder",
      enviando: "Gönderiliyor…",
      ok: "Teşekkürler! Not aldık, hazır olunca haber vereceğiz.",
      error: "Gönderilemedi. Tekrar dene.",
    },
  },
  ar: {
    buscar: "ابحث عن ممارسة: تاروت، التطهير بالبيض، كوندلي، رونات…",
    vistas: { necesidad: "ما تريد معرفته", practica: "نوع الممارسة", origen: "التقليد والبلد", gratis: "مجاني", todo: "الكل" },
    necesidades: { amor: "الحب والعلاقة", respuesta: "إجابة الآن", destino: "من أنت وقدرك", senal: "اقرأ علامة", energia: "التطهير والطاقة", alma: "روحك وحيواتك السابقة", diario: "لكل يوم" },
    practicas: { cartas: "الأوراق", astrologia: "علم التنجيم", numeros: "الأعداد", oraculos: "أدوات العرافة", calendarios: "التقاويم المقدسة", senales: "قراءة العلامات", energia: "الطاقة والطقوس", alma: "الروح" },
    origenes: { latinoamerica: "أمريكا اللاتينية", europa: "أوروبا والغرب", mesoamerica: "المايا وأمريكا الوسطى", china: "الصين", india: "الهند", indonesia: "إندونيسيا (جاوة)", arabe: "العالم العربي وأفريقيا", turquia: "تركيا", mundo: "من كل العالم" },
    gratis: "مجاني",
    sinResultados: "لا تتوفر هذه الممارسة بعد. أخبرنا في الأسفل وستبحث عنها سيبيلا.",
    guia: {
      titulo: "لا تعرف من أين تبدأ؟",
      texto: "أجب عن سؤالين وسأقترح عليك الممارسات المناسبة لك.",
      p1: "ماذا تريد أن تعرف؟",
      p2: "ماذا لديك الآن؟",
      aMano: { fecha: "تاريخ ميلادي", pregunta: "سؤال في ذهني", foto: "صورة: كأسي أو فنجاني أو يدي", nada: "لا شيء، مجرد فضول" },
      resultado: "أنصحك أن تبدأ بـ:",
      otraVez: "ابدأ من جديد",
      sibila: "أفضّل أن أخبر سيبيلا",
      sibilaPregunta: "مرحبًا سيبيلا، أنا جديد في هذا. أي قراءة تنصحينني بها؟",
    },
    sugerir: {
      titulo: "ممارستك غير موجودة؟",
      texto: "نريد أكمل مكتبة باطنية في العالم. أخبرنا بما تمارسه أو بما تود استشارته وستبحث عنه سيبيلا.",
      campo: "ما الممارسة، ومن أين تأتي، وكيف تُمارَس؟",
      correo: "بريدك الإلكتروني (اختياري، لنخبرك عندما تجهز)",
      enviar: "أرسل الاقتراح",
      enviando: "جارٍ الإرسال…",
      ok: "شكرًا! سجّلناها وسنخبرك عندما تجهز.",
      error: "تعذّر الإرسال. حاول مرة أخرى.",
    },
  },
  id: {
    buscar: "Cari praktik: tarot, pembersihan telur, kundli, rune…",
    vistas: { necesidad: "Yang ingin kamu ketahui", practica: "Jenis praktik", origen: "Tradisi dan negara", gratis: "Gratis", todo: "Semua" },
    necesidades: { amor: "Cinta dan pasangan", respuesta: "Jawaban sekarang", destino: "Siapa dirimu dan takdirmu", senal: "Baca sebuah tanda", energia: "Pembersihan dan energi", alma: "Jiwamu dan kehidupan lalu", diario: "Untuk setiap hari" },
    practicas: { cartas: "Kartu", astrologia: "Astrologi", numeros: "Angka", oraculos: "Orakel", calendarios: "Kalender sakral", senales: "Membaca tanda", energia: "Energi dan ritual", alma: "Jiwa" },
    origenes: { latinoamerica: "Amerika Latin", europa: "Eropa dan Barat", mesoamerica: "Maya dan Mesoamerika", china: "Tiongkok", india: "India", indonesia: "Indonesia (Jawa)", arabe: "Dunia Arab dan Afrika", turquia: "Turki", mundo: "Dari seluruh dunia" },
    gratis: "Gratis",
    sinResultados: "Praktik itu belum ada. Ceritakan di bawah dan Sibila akan menelitinya.",
    guia: {
      titulo: "Bingung mulai dari mana?",
      texto: "Jawab dua pertanyaan dan aku rekomendasikan praktik yang cocok untukmu.",
      p1: "Apa yang ingin kamu ketahui?",
      p2: "Apa yang kamu punya sekarang?",
      aMano: { fecha: "Tanggal lahirku", pregunta: "Sebuah pertanyaan di kepala", foto: "Sebuah foto: gelasku, cangkirku, atau tanganku", nada: "Tidak ada, hanya penasaran" },
      resultado: "Aku sarankan mulai dari:",
      otraVez: "Mulai lagi",
      sibila: "Aku lebih suka cerita ke Sibila",
      sibilaPregunta: "Halo Sibila, aku baru dalam hal ini. Bacaan apa yang kamu sarankan untukku?",
    },
    sugerir: {
      titulo: "Praktikmu tidak ada?",
      texto: "Kami ingin perpustakaan esoterik terlengkap di dunia. Ceritakan apa yang kamu praktikkan atau ingin kamu tanyakan, dan Sibila akan menelitinya.",
      campo: "Praktik apa, dari mana asalnya, dan bagaimana caranya?",
      correo: "Emailmu (opsional, untuk memberi tahu saat sudah siap)",
      enviar: "Kirim saran",
      enviando: "Mengirim…",
      ok: "Terima kasih! Sudah kami catat dan akan kami kabari saat siap.",
      error: "Gagal mengirim. Coba lagi.",
    },
  },
  hi: {
    buscar: "कोई विधा खोजें: टैरो, अंडे से शुद्धि, कुंडली, रून्स…",
    vistas: { necesidad: "आप क्या जानना चाहते हैं", practica: "विधा का प्रकार", origen: "परंपरा और देश", gratis: "मुफ़्त", todo: "सभी" },
    necesidades: { amor: "प्रेम और रिश्ता", respuesta: "अभी एक जवाब", destino: "आप कौन हैं और आपका भाग्य", senal: "एक संकेत पढ़ें", energia: "शुद्धि और ऊर्जा", alma: "आपकी आत्मा और पिछले जन्म", diario: "हर दिन के लिए" },
    practicas: { cartas: "कार्ड", astrologia: "ज्योतिष", numeros: "अंक", oraculos: "भविष्यसूचक साधन", calendarios: "पवित्र पंचांग", senales: "संकेत पढ़ना", energia: "ऊर्जा और अनुष्ठान", alma: "आत्मा" },
    origenes: { latinoamerica: "लैटिन अमेरिका", europa: "यूरोप और पश्चिम", mesoamerica: "माया और मेसोअमेरिका", china: "चीन", india: "भारत", indonesia: "इंडोनेशिया (जावा)", arabe: "अरब दुनिया और अफ़्रीका", turquia: "तुर्की", mundo: "पूरी दुनिया से" },
    gratis: "मुफ़्त",
    sinResultados: "यह विधा अभी हमारे पास नहीं है। नीचे बताइए, सिबिला इस पर खोज करेंगी।",
    guia: {
      titulo: "समझ नहीं आ रहा कहाँ से शुरू करें?",
      texto: "दो सवालों के जवाब दें और मैं आपके लिए सही विधाएँ सुझाऊँगी।",
      p1: "आप क्या जानना चाहते हैं?",
      p2: "आपके पास अभी क्या है?",
      aMano: { fecha: "मेरी जन्म तिथि", pregunta: "मन में एक सवाल", foto: "एक फ़ोटो: मेरा गिलास, मेरा कप या मेरा हाथ", nada: "कुछ नहीं, बस जिज्ञासा" },
      resultado: "मेरा सुझाव है कि आप यहाँ से शुरू करें:",
      otraVez: "फिर से शुरू करें",
      sibila: "मैं सिबिला को बताना पसंद करूँगा/करूँगी",
      sibilaPregunta: "नमस्ते सिबिला, मैं इसमें नया/नई हूँ। आप मुझे कौन-सी रीडिंग सुझाएँगी?",
    },
    sugerir: {
      titulo: "आपकी विधा यहाँ नहीं है?",
      texto: "हम दुनिया की सबसे संपूर्ण गूढ़ विद्या लाइब्रेरी चाहते हैं। बताइए आप क्या करते हैं या क्या पूछना चाहेंगे, सिबिला इस पर खोज करेंगी।",
      campo: "कौन-सी विधा, यह कहाँ से आती है और कैसे की जाती है?",
      correo: "आपका ईमेल (वैकल्पिक, तैयार होने पर बताने के लिए)",
      enviar: "सुझाव भेजें",
      enviando: "भेजा जा रहा है…",
      ok: "धन्यवाद! हमने नोट कर लिया है, तैयार होने पर आपको बताएँगे।",
      error: "भेजा नहीं जा सका। फिर से कोशिश करें।",
    },
  },
};
