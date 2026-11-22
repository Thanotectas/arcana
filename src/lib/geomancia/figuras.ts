import type { Idioma } from "@/lib/i18n/idiomas";

/*
 * Las 16 figuras de la geomancia (ʿilm al-raml). Cada figura tiene cuatro filas, de la cabeza a los pies; cada fila
 * tiene un punto (impar) o dos puntos (par). Nombres árabes según la tradición del raml (Savage-Smith y Smith,
 * «Islamic Geomancy and a Thirteenth-Century Divinatory Device»); nombres franceses de la géomancie clásica.
 */

export type Punto = 1 | 2;
export type Filas = readonly [Punto, Punto, Punto, Punto];

export type IdFigura =
  | "via"
  | "populus"
  | "conjunctio"
  | "carcer"
  | "fortuna_major"
  | "fortuna_minor"
  | "acquisitio"
  | "amissio"
  | "laetitia"
  | "tristitia"
  | "puella"
  | "puer"
  | "albus"
  | "rubeus"
  | "caput_draconis"
  | "cauda_draconis";

/** Matiz tradicional de la figura (para el tono de la lectura, nunca para asustar). */
export type Matiz = "favorable" | "mixta" | "exigente";

export interface Figura {
  id: IdFigura;
  latin: string;
  filas: Filas;
  /** Nombre en el raml árabe. */
  arabe: string;
  /** Transcripción del nombre árabe. */
  arabeLatino: string;
  /** Planeta que le asocia la tradición (en español, para el prompt). */
  planeta: string;
  matiz: Matiz;
  nombre: Record<Idioma, string>;
  /** Palabras clave breves. */
  clave: Record<Idioma, string>;
}

export const FIGURAS: readonly Figura[] = [
  {
    id: "via",
    latin: "Via",
    filas: [1, 1, 1, 1],
    arabe: "الطريق",
    arabeLatino: "al-ṭarīq",
    planeta: "la Luna",
    matiz: "mixta",
    nombre: { es: "Vía", en: "The Way", pt: "Via", fr: "Voie", tr: "Yol", ar: "الطريق", id: "Jalan", hi: "मार्ग" },
    clave: {
      es: "camino, movimiento, cambio",
      en: "path, movement, change",
      pt: "caminho, movimento, mudança",
      fr: "chemin, mouvement, changement",
      tr: "yol, hareket, değişim",
      ar: "طريق وحركة وتغيّر",
      id: "jalan, gerak, perubahan",
      hi: "मार्ग, गति, परिवर्तन",
    },
  },
  {
    id: "populus",
    latin: "Populus",
    filas: [2, 2, 2, 2],
    arabe: "الجماعة",
    arabeLatino: "al-jamāʿa",
    planeta: "la Luna",
    matiz: "mixta",
    nombre: { es: "Pueblo", en: "The People", pt: "Povo", fr: "Peuple", tr: "Cemaat", ar: "الجماعة", id: "Khalayak", hi: "जनसमूह" },
    clave: {
      es: "reunión, receptividad, los demás",
      en: "gathering, receptivity, others",
      pt: "reunião, receptividade, os outros",
      fr: "rassemblement, réceptivité, les autres",
      tr: "topluluk, kabul, başkaları",
      ar: "اجتماع وتقبّل والآخرون",
      id: "perkumpulan, keterbukaan, orang lain",
      hi: "सभा, ग्रहणशीलता, दूसरे लोग",
    },
  },
  {
    id: "conjunctio",
    latin: "Conjunctio",
    filas: [2, 1, 1, 2],
    arabe: "الاجتماع",
    arabeLatino: "al-ijtimāʿ",
    planeta: "Mercurio",
    matiz: "mixta",
    nombre: { es: "Conjunción", en: "Conjunction", pt: "Conjunção", fr: "Conjonction", tr: "Birleşme", ar: "الاجتماع", id: "Persatuan", hi: "संयोग" },
    clave: {
      es: "encuentro, unión, acuerdo",
      en: "meeting, union, agreement",
      pt: "encontro, união, acordo",
      fr: "rencontre, union, accord",
      tr: "buluşma, birlik, uzlaşma",
      ar: "لقاء واتحاد واتفاق",
      id: "pertemuan, persatuan, kesepakatan",
      hi: "मिलन, एकता, सहमति",
    },
  },
  {
    id: "carcer",
    latin: "Carcer",
    filas: [1, 2, 2, 1],
    arabe: "العقلة",
    arabeLatino: "al-ʿuqla",
    planeta: "Saturno",
    matiz: "exigente",
    nombre: { es: "Cárcel", en: "Prison", pt: "Prisão", fr: "Prison", tr: "Ukle (Bağ)", ar: "العقلة", id: "Penjara", hi: "बंधन" },
    clave: {
      es: "límite, estructura, recogimiento",
      en: "limit, structure, retreat",
      pt: "limite, estrutura, recolhimento",
      fr: "limite, structure, retrait",
      tr: "sınır, yapı, içe dönüş",
      ar: "حدود وبنية وخلوة",
      id: "batas, struktur, menyepi",
      hi: "सीमा, संरचना, एकांत",
    },
  },
  {
    id: "fortuna_major",
    latin: "Fortuna Major",
    filas: [2, 2, 1, 1],
    arabe: "النصرة الداخلة",
    arabeLatino: "al-nuṣra al-dākhila",
    planeta: "el Sol",
    matiz: "favorable",
    nombre: { es: "Fortuna Mayor", en: "Greater Fortune", pt: "Fortuna Maior", fr: "Grande Fortune", tr: "Büyük Talih", ar: "النصرة الداخلة", id: "Untung Besar", hi: "महाभाग्य" },
    clave: {
      es: "gran apoyo, éxito que se sostiene",
      en: "great support, lasting success",
      pt: "grande apoio, sucesso duradouro",
      fr: "grand soutien, succès durable",
      tr: "büyük destek, kalıcı başarı",
      ar: "سند كبير ونجاح ثابت",
      id: "dukungan besar, keberhasilan yang langgeng",
      hi: "बड़ा सहारा, टिकाऊ सफलता",
    },
  },
  {
    id: "fortuna_minor",
    latin: "Fortuna Minor",
    filas: [1, 1, 2, 2],
    arabe: "النصرة الخارجة",
    arabeLatino: "al-nuṣra al-khārija",
    planeta: "el Sol",
    matiz: "favorable",
    nombre: { es: "Fortuna Menor", en: "Lesser Fortune", pt: "Fortuna Menor", fr: "Petite Fortune", tr: "Küçük Talih", ar: "النصرة الخارجة", id: "Untung Kecil", hi: "लघुभाग्य" },
    clave: {
      es: "ayuda pasajera, impulso rápido",
      en: "passing help, quick momentum",
      pt: "ajuda passageira, impulso rápido",
      fr: "aide passagère, élan rapide",
      tr: "geçici yardım, hızlı ivme",
      ar: "عون عابر واندفاع سريع",
      id: "bantuan sesaat, dorongan cepat",
      hi: "क्षणिक सहायता, तीव्र गति",
    },
  },
  {
    id: "acquisitio",
    latin: "Acquisitio",
    filas: [2, 1, 2, 1],
    arabe: "القبض الداخل",
    arabeLatino: "al-qabḍ al-dākhil",
    planeta: "Júpiter",
    matiz: "favorable",
    nombre: { es: "Adquisición", en: "Gain", pt: "Aquisição", fr: "Acquisition", tr: "Kazanç", ar: "القبض الداخل", id: "Perolehan", hi: "लाभ" },
    clave: {
      es: "ganancia, recibir, sumar",
      en: "gain, receiving, adding",
      pt: "ganho, receber, somar",
      fr: "gain, recevoir, ajouter",
      tr: "kazanç, almak, eklemek",
      ar: "كسب وتلقٍّ وزيادة",
      id: "keuntungan, menerima, bertambah",
      hi: "लाभ, प्राप्ति, वृद्धि",
    },
  },
  {
    id: "amissio",
    latin: "Amissio",
    filas: [1, 2, 1, 2],
    arabe: "القبض الخارج",
    arabeLatino: "al-qabḍ al-khārij",
    planeta: "Venus",
    matiz: "exigente",
    nombre: { es: "Pérdida", en: "Loss", pt: "Perda", fr: "Perte", tr: "Kayıp", ar: "القبض الخارج", id: "Pelepasan", hi: "हानि" },
    clave: {
      es: "soltar, dar, dejar ir",
      en: "letting go, giving, release",
      pt: "soltar, dar, deixar ir",
      fr: "lâcher prise, donner, laisser partir",
      tr: "bırakmak, vermek, salıvermek",
      ar: "تخلٍّ وعطاء وإفلات",
      id: "melepas, memberi, merelakan",
      hi: "छोड़ना, देना, मुक्त करना",
    },
  },
  {
    id: "laetitia",
    latin: "Laetitia",
    filas: [1, 2, 2, 2],
    arabe: "اللحيان",
    arabeLatino: "al-liḥyān",
    planeta: "Júpiter",
    matiz: "favorable",
    nombre: { es: "Alegría", en: "Joy", pt: "Alegria", fr: "Joie", tr: "Sevinç", ar: "اللحيان", id: "Sukacita", hi: "आनंद" },
    clave: {
      es: "alegría, ánimo que se eleva",
      en: "joy, rising spirits",
      pt: "alegria, ânimo que se eleva",
      fr: "joie, élan qui s'élève",
      tr: "sevinç, yükselen moral",
      ar: "فرح ونفس تعلو",
      id: "sukacita, semangat yang naik",
      hi: "आनंद, ऊपर उठता मन",
    },
  },
  {
    id: "tristitia",
    latin: "Tristitia",
    filas: [2, 2, 2, 1],
    arabe: "الإنكيس",
    arabeLatino: "al-inkīs",
    planeta: "Saturno",
    matiz: "exigente",
    nombre: { es: "Tristeza", en: "Sorrow", pt: "Tristeza", fr: "Tristesse", tr: "Hüzün", ar: "الإنكيس", id: "Kesedihan", hi: "विषाद" },
    clave: {
      es: "seriedad, profundidad, raíces",
      en: "seriousness, depth, roots",
      pt: "seriedade, profundidade, raízes",
      fr: "sérieux, profondeur, racines",
      tr: "ciddiyet, derinlik, kökler",
      ar: "جدّية وعمق وجذور",
      id: "kesungguhan, kedalaman, akar",
      hi: "गंभीरता, गहराई, जड़ें",
    },
  },
  {
    id: "puella",
    latin: "Puella",
    filas: [1, 2, 1, 1],
    arabe: "نقي الخد",
    arabeLatino: "naqī al-khadd",
    planeta: "Venus",
    matiz: "favorable",
    nombre: { es: "Niña", en: "The Girl", pt: "Menina", fr: "Fille", tr: "Kız", ar: "نقي الخد", id: "Gadis", hi: "कन्या" },
    clave: {
      es: "armonía, gracia, cuidado",
      en: "harmony, grace, care",
      pt: "harmonia, graça, cuidado",
      fr: "harmonie, grâce, douceur",
      tr: "uyum, zarafet, özen",
      ar: "انسجام ولطف وعناية",
      id: "keselarasan, keanggunan, kepedulian",
      hi: "सामंजस्य, सौम्यता, देखभाल",
    },
  },
  {
    id: "puer",
    latin: "Puer",
    filas: [1, 1, 2, 1],
    arabe: "الجودلة",
    arabeLatino: "al-jawdala",
    planeta: "Marte",
    matiz: "mixta",
    nombre: { es: "Niño", en: "The Boy", pt: "Menino", fr: "Garçon", tr: "Oğlan", ar: "الجودلة", id: "Pemuda", hi: "बालक" },
    clave: {
      es: "ímpetu, coraje, acción",
      en: "drive, courage, action",
      pt: "ímpeto, coragem, ação",
      fr: "fougue, courage, action",
      tr: "atılım, cesaret, eylem",
      ar: "اندفاع وشجاعة وفعل",
      id: "dorongan, keberanian, tindakan",
      hi: "उत्साह, साहस, कर्म",
    },
  },
  {
    id: "albus",
    latin: "Albus",
    filas: [2, 2, 1, 2],
    arabe: "البياض",
    arabeLatino: "al-bayāḍ",
    planeta: "Mercurio",
    matiz: "favorable",
    nombre: { es: "Blanco", en: "White", pt: "Branco", fr: "Blanc", tr: "Beyaz", ar: "البياض", id: "Putih", hi: "श्वेत" },
    clave: {
      es: "claridad, paz, buen juicio",
      en: "clarity, peace, good judgment",
      pt: "clareza, paz, bom juízo",
      fr: "clarté, paix, discernement",
      tr: "berraklık, huzur, sağduyu",
      ar: "صفاء وسلام وحكمة",
      id: "kejernihan, damai, pertimbangan baik",
      hi: "स्पष्टता, शांति, विवेक",
    },
  },
  {
    id: "rubeus",
    latin: "Rubeus",
    filas: [2, 1, 2, 2],
    arabe: "الحمرة",
    arabeLatino: "al-ḥumra",
    planeta: "Marte",
    matiz: "exigente",
    nombre: { es: "Rojo", en: "Red", pt: "Vermelho", fr: "Rouge", tr: "Kırmızı", ar: "الحمرة", id: "Merah", hi: "रक्त" },
    clave: {
      es: "pasión, intensidad, energía viva",
      en: "passion, intensity, raw energy",
      pt: "paixão, intensidade, energia viva",
      fr: "passion, intensité, énergie vive",
      tr: "tutku, yoğunluk, canlı enerji",
      ar: "شغف وحدّة وطاقة حيّة",
      id: "gairah, intensitas, energi yang hidup",
      hi: "जुनून, तीव्रता, जीवंत ऊर्जा",
    },
  },
  {
    id: "caput_draconis",
    latin: "Caput Draconis",
    filas: [2, 1, 1, 1],
    arabe: "العتبة الداخلة",
    arabeLatino: "al-ʿataba al-dākhila",
    planeta: "el Nodo Norte lunar",
    matiz: "favorable",
    nombre: { es: "Cabeza del Dragón", en: "Dragon's Head", pt: "Cabeça do Dragão", fr: "Tête du Dragon", tr: "Ejder Başı", ar: "العتبة الداخلة", id: "Kepala Naga", hi: "राहु (शीर्ष)" },
    clave: {
      es: "comienzo, umbral de entrada",
      en: "beginning, threshold of entry",
      pt: "começo, limiar de entrada",
      fr: "commencement, seuil d'entrée",
      tr: "başlangıç, giriş eşiği",
      ar: "بداية وعتبة دخول",
      id: "permulaan, ambang masuk",
      hi: "आरंभ, प्रवेश की दहलीज़",
    },
  },
  {
    id: "cauda_draconis",
    latin: "Cauda Draconis",
    filas: [1, 1, 1, 2],
    arabe: "العتبة الخارجة",
    arabeLatino: "al-ʿataba al-khārija",
    planeta: "el Nodo Sur lunar",
    matiz: "exigente",
    nombre: { es: "Cola del Dragón", en: "Dragon's Tail", pt: "Cauda do Dragão", fr: "Queue du Dragon", tr: "Ejder Kuyruğu", ar: "العتبة الخارجة", id: "Ekor Naga", hi: "केतु (पुच्छ)" },
    clave: {
      es: "cierre, umbral de salida",
      en: "closing, threshold of exit",
      pt: "encerramento, limiar de saída",
      fr: "clôture, seuil de sortie",
      tr: "kapanış, çıkış eşiği",
      ar: "ختام وعتبة خروج",
      id: "penutupan, ambang keluar",
      hi: "समापन, निकास की दहलीज़",
    },
  },
];

const POR_ID = new Map(FIGURAS.map((f) => [f.id, f]));
const POR_FILAS = new Map(FIGURAS.map((f) => [f.filas.join(""), f]));

export function figuraPorId(id: string): Figura | undefined {
  return POR_ID.get(id as IdFigura);
}

export function figuraPorFilas(filas: Filas): Figura {
  const f = POR_FILAS.get(filas.join(""));
  if (!f) throw new Error("Figura imposible");
  return f;
}

export function puntosDe(filas: Filas) {
  return filas.reduce<number>((s, p) => s + p, 0);
}
