/**
 * Textos de la astrología védica (Kundli y Kundli milan) en los 8 idiomas.
 * El hindi es el público principal: hindi cotidiano con los términos de Jyotish.
 */
import type { Idioma } from "@/lib/i18n/idiomas";
import type { IdGraha } from "./calculo";
import type { Gana, IdKoota, Nadi, Varna, Vashya, Yoni } from "./milan";

export interface TextosVedica {
  kundli: {
    seccion: string;
    titulo: string;
    intro: string;
    descripcion: string;
    nombre: string;
    fecha: string;
    calcular: string; // {n} créditos
    calculando: string;
    nota: string;
    tituloLectura: string; // {nombre}
  };
  milan: {
    seccion: string;
    titulo: string;
    intro: string;
    descripcion: string;
    personaA: string;
    personaB: string;
    notaRoles: string;
    calcular: string; // {n}
    calculando: string;
    nota: string;
    tituloLectura: string; // {a} {b} {total}
  };
  errores: {
    nombre: string;
    fecha: string;
    hora: string;
    lugar: string;
    anio: string;
    segunda: string; // {error}
  };
  vista: {
    cartaTitulo: string;
    cartaNota: string;
    lagna: string;
    chandraLagna: string;
    sinHora: string;
    rashiLunar: string;
    nakshatra: string;
    pada: string; // {n}
    ayanamsa: string;
    tablaTitulo: string;
    graha: string;
    rashi: string;
    grado: string;
    casa: string;
    retrogrado: string;
    dignidades: { exaltado: string; debilitado: string; propio: string };
    dashaTitulo: string;
    dashaNota: string;
    balance: string; // {graha} {a} {m} {d}
    mahadasha: string;
    antardasha: string;
    ahora: string;
    hasta: string; // {fecha}
    antardashasDe: string; // {graha}
    proximos: string;
    manglikTitulo: string;
    manglikEstados: { si: string; parcial: string; no: string };
    manglikDetalle: string; // {lagna} {luna}
    manglikDetalleLuna: string; // {luna}
    manglikAtenuado: string;
    manglikNota: string;
  };
  milanVista: {
    gunas: string;
    de36: string;
    niveles: Record<"bajo" | "medio" | "bueno" | "excelente", { titulo: string; texto: string }>;
    kootaTitulo: string;
    total: string;
    koota: string;
    puntos: string;
    kootas: Record<IdKoota, { nombre: string; sentido: string }>;
    lunaDe: string; // {nombre}
    varna: string;
    vashya: string;
    yoni: string;
    gana: string;
    nadi: string;
    sinHora: string;
    doshasTitulo: string;
    doshas: Record<"nadi" | "bhakoot" | "gana", string>;
    excepciones: Record<ResultadoExcepcion, string>;
    manglik: Record<"ninguno" | "ambos" | "solo_a" | "solo_b", string>; // {a} {b}
    notaCalma: string;
  };
  nombres: {
    grahas: Record<IdGraha, string>;
    abreviaturas: Record<IdGraha, string> & { lagna: string };
    rashis: string[];
    nakshatras: string[];
    varnas: Record<Varna, string>;
    vashyas: Record<Vashya, string>;
    yonis: Record<Yoni, string>;
    ganas: Record<Gana, string>;
    nadis: Record<Nadi, string>;
  };
}

type ResultadoExcepcion = "nadi_misma_rashi" | "nadi_mismo_nakshatra_otro_pada" | "bhakoot_mismo_senor" | "bhakoot_senores_amigos";

const NAKSHATRAS_LATINO = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const SANSCRITO_RASHI = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
/** "Mesha (Aries)" a partir de los nombres occidentales de cada idioma. */
const conSanscrito = (occidental: string[]) => occidental.map((n, i) => `${SANSCRITO_RASHI[i]} (${n})`);

const TERMINOS_LATINO = {
  varnas: { brahmin: "Brahmin", kshatriya: "Kshatriya", vaishya: "Vaishya", shudra: "Shudra" },
  ganas: { deva: "Deva", manushya: "Manushya", rakshasa: "Rakshasa" },
  nadis: { aadi: "Aadi", madhya: "Madhya", antya: "Antya" },
};

export const TEXTOS_VEDICA: Record<Idioma, TextosVedica> = {
  // ---------------------------------------------------------------------------
  hi: {
    kundli: {
      seccion: "वैदिक ज्योतिष",
      titulo: "आपकी जन्म कुंडली",
      intro: "जन्म की तारीख, समय और जगह से आपकी वैदिक कुंडली बनती है: लग्न, चंद्र राशि, नक्षत्र और पद, नौ ग्रहों की स्थिति और विंशोत्तरी दशा। फिर सिबिला इसे आपके लिए आसान भाषा में पढ़ती हैं।",
      descripcion: "लाहिड़ी अयनांश से बनी वैदिक जन्म कुंडली: लग्न, राशि, नक्षत्र, ग्रह, विंशोत्तरी महादशा और अंतर्दशा, और सिबिला की व्याख्या।",
      nombre: "आपका नाम",
      fecha: "जन्म तिथि",
      calcular: "मेरी कुंडली बनाएँ · {n} क्रेडिट",
      calculando: "ग्रहों की गणना हो रही है…",
      nota: "लग्न हर दो घंटे में बदल जाता है, इसलिए जन्म का समय जितना सही हो, कुंडली उतनी सटीक बनती है। समय न पता हो तो भी कुंडली बनेगी, पर घर चंद्र लग्न से गिने जाएँगे।",
      tituloLectura: "{nombre} की कुंडली",
    },
    milan: {
      seccion: "वैदिक ज्योतिष",
      titulo: "कुंडली मिलान",
      intro: "अष्टकूट गुण मिलान: दोनों के चंद्र नक्षत्र और राशि से 36 में से गुण, आठों कूटों का अलग-अलग हिसाब, और दोनों की मांगलिक स्थिति। सिबिला इसे शांति से, बिना डर के समझाती हैं।",
      descripcion: "अष्टकूट गुण मिलान (36 गुण): वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट और नाड़ी, दोनों की मांगलिक स्थिति और सिबिला की व्याख्या।",
      personaA: "वर पक्ष (लड़का)",
      personaB: "वधू पक्ष (लड़की)",
      notaRoles: "पारंपरिक तालिकाओं में वर और वधू का पक्ष अलग गिना जाता है, इसलिए इसी क्रम में भरें।",
      calcular: "गुण मिलाएँ · {n} क्रेडिट",
      calculando: "दोनों कुंडलियाँ मिलाई जा रही हैं…",
      nota: "गुण मिलान चंद्रमा के नक्षत्र पर टिका है। चंद्रमा एक नक्षत्र में लगभग एक दिन रहता है, इसलिए समय का अंदाज़ा भी काम आता है।",
      tituloLectura: "{a} और {b}: 36 में से {total} गुण",
    },
    errores: {
      nombre: "कृपया नाम लिखें।",
      fecha: "कृपया सही जन्म तिथि चुनें।",
      hora: "कृपया जन्म का समय लिखें, या “समय नहीं पता” पर निशान लगाएँ।",
      lugar: "कृपया सूची में से जन्म स्थान चुनें।",
      anio: "जन्म का वर्ष 1900 से आज तक के बीच होना चाहिए।",
      segunda: "दूसरे व्यक्ति का विवरण देखें: {error}",
    },
    vista: {
      cartaTitulo: "जन्म कुंडली (लग्न चक्र)",
      cartaNota: "उत्तर भारतीय शैली: ऊपर बीच वाला घर पहला भाव है, संख्या राशि बताती है।",
      lagna: "लग्न",
      chandraLagna: "चंद्र लग्न",
      sinHora: "जन्म का समय नहीं पता था: दोपहर 12 बजे का समय लिया गया है और भाव चंद्र लग्न से गिने गए हैं। चंद्रमा का नक्षत्र भी थोड़ा अलग हो सकता है।",
      rashiLunar: "चंद्र राशि",
      nakshatra: "नक्षत्र",
      pada: "पद {n}",
      ayanamsa: "लाहिड़ी अयनांश",
      tablaTitulo: "ग्रह स्थिति",
      graha: "ग्रह",
      rashi: "राशि",
      grado: "अंश",
      casa: "भाव",
      retrogrado: "वक्री",
      dignidades: { exaltado: "उच्च", debilitado: "नीच", propio: "स्वराशि" },
      dashaTitulo: "विंशोत्तरी दशा",
      dashaNota: "120 वर्षों का चक्र, जन्म के समय चंद्रमा के नक्षत्र से शुरू होता है।",
      balance: "जन्म के समय {graha} महादशा के {a} वर्ष, {m} महीने और {d} दिन बाकी थे।",
      mahadasha: "महादशा",
      antardasha: "अंतर्दशा",
      ahora: "अभी",
      hasta: "{fecha} तक",
      antardashasDe: "{graha} महादशा की अंतर्दशाएँ",
      proximos: "आगे की अंतर्दशाएँ",
      manglikTitulo: "मांगलिक स्थिति",
      manglikEstados: { si: "मांगलिक", parcial: "आंशिक मांगलिक", no: "मांगलिक नहीं" },
      manglikDetalle: "मंगल लग्न से {lagna} भाव में और चंद्रमा से {luna} भाव में है।",
      manglikDetalleLuna: "मंगल चंद्रमा से {luna} भाव में है।",
      manglikAtenuado: "मंगल अपनी राशि या उच्च राशि में है, परंपरा इसे हल्का मानती है।",
      manglikNota: "मांगलिक होना बहुत आम है, लगभग आधी कुंडलियों में दिखता है। इसका मतलब है ज़्यादा ऊर्जा, जोश और सीधी बात: रिश्ते में धैर्य, खुलकर बात करना और इस ऊर्जा को काम या खेल में लगाना इसे ताकत बना देता है। अकेले यह किसी रिश्ते का फ़ैसला नहीं करता।",
    },
    milanVista: {
      gunas: "गुण",
      de36: "36 में से",
      niveles: {
        bajo: { titulo: "मेहनत माँगने वाला मेल", texto: "कम गुण का मतलब है कि कुछ बातों पर ध्यान और बातचीत ज़्यादा चाहिए। ऐसे अंकों वाले कई जोड़े भी समझदारी से खुशहाल रिश्ता बनाते हैं। नीचे देखें कि कौन से कूट कम हैं।" },
        medio: { titulo: "ठीक-ठाक मेल", texto: "18 से ज़्यादा गुण परंपरा में स्वीकार्य माने जाते हैं। मज़बूत कूट रिश्ते का सहारा हैं और कम वाले बताते हैं कि किस बात पर साथ मिलकर काम करना है।" },
        bueno: { titulo: "अच्छा मेल", texto: "गुण अच्छे हैं: स्वभाव, भावनाएँ और रोज़मर्रा की ज़िंदगी में तालमेल के आसार हैं।" },
        excelente: { titulo: "बहुत अच्छा मेल", texto: "बहुत ऊँचे गुण: गहरा तालमेल। फिर भी हर रिश्ता रोज़ के प्यार, सम्मान और बातचीत से ही बढ़ता है।" },
      },
      kootaTitulo: "अष्टकूट तालिका",
      total: "कुल गुण",
      koota: "कूट",
      puntos: "गुण",
      kootas: {
        varna: { nombre: "वर्ण", sentido: "काम और सोच का स्तर" },
        vashya: { nombre: "वश्य", sentido: "आपसी आकर्षण और असर" },
        tara: { nombre: "तारा", sentido: "भाग्य और सेहत का साथ" },
        yoni: { nombre: "योनि", sentido: "शारीरिक और सहज तालमेल" },
        graha_maitri: { nombre: "ग्रह मैत्री", sentido: "मन की दोस्ती" },
        gana: { nombre: "गण", sentido: "स्वभाव" },
        bhakoot: { nombre: "भकूट", sentido: "भावनात्मक जुड़ाव, परिवार और समृद्धि" },
        nadi: { nombre: "नाड़ी", sentido: "सेहत और शारीरिक प्रकृति" },
      },
      lunaDe: "{nombre} का चंद्रमा",
      varna: "वर्ण",
      vashya: "वश्य",
      yoni: "योनि",
      gana: "गण",
      nadi: "नाड़ी",
      sinHora: "समय अनुमानित (दोपहर 12 बजे)",
      doshasTitulo: "किन बातों पर ध्यान दें",
      doshas: {
        nadi: "नाड़ी दोष: दोनों की नाड़ी एक है, यानी शरीर की प्रकृति मिलती-जुलती है। इसे सेहत और दिनचर्या पर ध्यान देने का इशारा समझें: अच्छा खान-पान, आराम और एक-दूसरे की देखभाल।",
        bhakoot: "भकूट दोष: दोनों की चंद्र राशियों की दूरी परंपरा में चुनौती वाली मानी जाती है। यह भावनाओं और पैसों के मामलों में अलग नज़रिए की ओर इशारा करता है, जिसे खुली बातचीत और साझा योजना संभाल लेती है।",
        gana: "गण का अंतर: दोनों का स्वभाव अलग है। एक को शांति चाहिए तो दूसरे को जोश; एक-दूसरे की लय को समझना यहाँ सबसे काम की बात है।",
      },
      excepciones: {
        nadi_misma_rashi: "दोनों की चंद्र राशि एक है और नक्षत्र अलग, शास्त्र इसे नाड़ी दोष का परिहार मानते हैं।",
        nadi_mismo_nakshatra_otro_pada: "नक्षत्र एक है पर पद अलग, शास्त्र इसे नाड़ी दोष का परिहार मानते हैं।",
        bhakoot_mismo_senor: "दोनों राशियों का स्वामी एक ही ग्रह है, इसलिए परंपरा में भकूट दोष हल्का माना जाता है।",
        bhakoot_senores_amigos: "दोनों राशियों के स्वामी आपस में मित्र हैं, इसलिए परंपरा में भकूट दोष हल्का माना जाता है।",
      },
      manglik: {
        ninguno: "दोनों में से कोई मांगलिक नहीं है।",
        ambos: "दोनों मांगलिक हैं: परंपरा में इसे संतुलित जोड़ी माना जाता है।",
        solo_a: "केवल {a} मांगलिक हैं: इसका मतलब है ज़्यादा जोश और सीधापन, जिसे धैर्य और बातचीत से अच्छी दिशा मिलती है।",
        solo_b: "केवल {b} मांगलिक हैं: इसका मतलब है ज़्यादा जोश और सीधापन, जिसे धैर्य और बातचीत से अच्छी दिशा मिलती है।",
      },
      notaCalma: "गुण मिलान एक पुरानी परंपरा का नक्शा है, फ़ैसला नहीं। यह बताता है कि रिश्ते में कहाँ आसानी है और कहाँ समझदारी चाहिए; रिश्ते को असल में आप दोनों का व्यवहार बनाता है।",
    },
    nombres: {
      grahas: { surya: "सूर्य", chandra: "चंद्र", mangal: "मंगल", budh: "बुध", guru: "गुरु", shukra: "शुक्र", shani: "शनि", rahu: "राहु", ketu: "केतु" },
      abreviaturas: { surya: "सू", chandra: "चं", mangal: "मं", budh: "बु", guru: "गु", shukra: "शु", shani: "श", rahu: "रा", ketu: "के", lagna: "लग्न" },
      rashis: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
      nakshatras: [
        "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा",
        "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा",
        "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती",
      ],
      varnas: { brahmin: "ब्राह्मण", kshatriya: "क्षत्रिय", vaishya: "वैश्य", shudra: "शूद्र" },
      vashyas: { chatushpada: "चतुष्पद", manava: "मानव", jalachara: "जलचर", vanachara: "वनचर", keeta: "कीट" },
      yonis: { ashwa: "अश्व", gaja: "गज", mesha: "मेष (भेड़)", sarpa: "सर्प", shwana: "श्वान", marjara: "मार्जार", mushaka: "मूषक", gau: "गौ", mahisha: "महिष", vyaghra: "व्याघ्र", mriga: "मृग", vanara: "वानर", nakula: "नकुल", simha: "सिंह" },
      ganas: { deva: "देव", manushya: "मनुष्य", rakshasa: "राक्षस" },
      nadis: { aadi: "आदि", madhya: "मध्य", antya: "अंत्य" },
    },
  },
  // ---------------------------------------------------------------------------
  en: {
    kundli: {
      seccion: "Vedic astrology",
      titulo: "Your Vedic birth chart (Kundli)",
      intro: "Your date, time and place of birth give your Vedic kundli: Lagna, Moon sign (rashi), nakshatra and pada, the nine grahas, and your Vimshottari dasha. Then Sibila reads it for you in plain words.",
      descripcion: "Vedic birth chart with Lahiri ayanamsa: Lagna, rashi, nakshatra, planets, Vimshottari mahadasha and antardasha, read by Sibila.",
      nombre: "Your name",
      fecha: "Date of birth",
      calcular: "Create my kundli · {n} credits",
      calculando: "Calculating the grahas…",
      nota: "The Lagna changes about every two hours, so the more exact your birth time, the more precise the chart. Without a time the chart still works, with houses counted from the Moon.",
      tituloLectura: "{nombre}'s kundli",
    },
    milan: {
      seccion: "Vedic astrology",
      titulo: "Kundli milan (match making)",
      intro: "Ashtakoot Guna Milan: the 36-point match from both Moon nakshatras and rashis, every koota scored, plus each person's Manglik status. Sibila explains it calmly, without fear.",
      descripcion: "Ashtakoot Guna Milan (36 gunas): Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi, Manglik status of both, read by Sibila.",
      personaA: "Person 1 (groom's side)",
      personaB: "Person 2 (bride's side)",
      notaRoles: "The traditional tables count the groom's and the bride's side differently; for any couple, just enter them in this order.",
      calcular: "Match our gunas · {n} credits",
      calculando: "Matching both charts…",
      nota: "Guna milan rests on the Moon's nakshatra. The Moon stays about a day in each nakshatra, so even an approximate time helps.",
      tituloLectura: "{a} & {b}: {total} of 36 gunas",
    },
    errores: {
      nombre: "Please write a name.",
      fecha: "Please choose a valid date of birth.",
      hora: "Please enter the birth time, or tick “I don't know the time”.",
      lugar: "Please choose the birth place from the list.",
      anio: "The birth year must be between 1900 and today.",
      segunda: "Check the second person's details: {error}",
    },
    vista: {
      cartaTitulo: "Birth chart (Lagna chart)",
      cartaNota: "North Indian style: the top centre house is the 1st house; numbers show the rashi.",
      lagna: "Lagna",
      chandraLagna: "Chandra Lagna",
      sinHora: "The birth time was unknown: noon was used and the houses are counted from the Moon (Chandra Lagna). The Moon's nakshatra may also differ slightly.",
      rashiLunar: "Moon sign",
      nakshatra: "Nakshatra",
      pada: "pada {n}",
      ayanamsa: "Lahiri ayanamsa",
      tablaTitulo: "Planetary positions",
      graha: "Graha",
      rashi: "Rashi",
      grado: "Degree",
      casa: "House",
      retrogrado: "retrograde",
      dignidades: { exaltado: "exalted", debilitado: "debilitated", propio: "own sign" },
      dashaTitulo: "Vimshottari dasha",
      dashaNota: "A 120-year cycle that starts from the Moon's nakshatra at birth.",
      balance: "At birth, {a} years, {m} months and {d} days of the {graha} mahadasha remained.",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      ahora: "now",
      hasta: "until {fecha}",
      antardashasDe: "Antardashas of the {graha} mahadasha",
      proximos: "Coming antardashas",
      manglikTitulo: "Manglik status",
      manglikEstados: { si: "Manglik", parcial: "Partly Manglik", no: "Not Manglik" },
      manglikDetalle: "Mars is in house {lagna} from the Lagna and house {luna} from the Moon.",
      manglikDetalleLuna: "Mars is in house {luna} from the Moon.",
      manglikAtenuado: "Mars is in its own or exalted sign, which tradition sees as softening it.",
      manglikNota: "Being Manglik is very common: it shows up in about half of all charts. It speaks of extra drive, passion and directness; patience, open talk and channelling that energy into work or sport turn it into a strength. On its own it decides nothing about a relationship.",
    },
    milanVista: {
      gunas: "gunas",
      de36: "out of 36",
      niveles: {
        bajo: { titulo: "A match that asks for effort", texto: "Fewer gunas means a few areas need more attention and conversation. Many couples with scores like this build happy lives with awareness. See below which kootas are low." },
        medio: { titulo: "A workable match", texto: "Tradition considers more than 18 gunas acceptable. The strong kootas support you; the low ones show what to work on together." },
        bueno: { titulo: "A good match", texto: "Good gunas: there is harmony in temperament, feelings and daily life." },
        excelente: { titulo: "An excellent match", texto: "Very high gunas: deep harmony. Still, every relationship grows through daily love, respect and conversation." },
      },
      kootaTitulo: "Ashtakoot table",
      total: "Total",
      koota: "Koota",
      puntos: "Gunas",
      kootas: {
        varna: { nombre: "Varna", sentido: "Work and outlook" },
        vashya: { nombre: "Vashya", sentido: "Mutual attraction and influence" },
        tara: { nombre: "Tara", sentido: "Shared fortune and wellbeing" },
        yoni: { nombre: "Yoni", sentido: "Physical and instinctive harmony" },
        graha_maitri: { nombre: "Graha Maitri", sentido: "Friendship of minds" },
        gana: { nombre: "Gana", sentido: "Temperament" },
        bhakoot: { nombre: "Bhakoot", sentido: "Emotional bond, family and prosperity" },
        nadi: { nombre: "Nadi", sentido: "Health and constitution" },
      },
      lunaDe: "{nombre}'s Moon",
      varna: "Varna",
      vashya: "Vashya",
      yoni: "Yoni",
      gana: "Gana",
      nadi: "Nadi",
      sinHora: "approximate time (noon)",
      doshasTitulo: "What to pay attention to",
      doshas: {
        nadi: "Nadi dosha: you share the same nadi, a similar constitution. Read it as a nudge to care for health and routines: good food, rest and looking after each other.",
        bhakoot: "Bhakoot dosha: the distance between your Moon signs is traditionally a challenging one. It points to different views on feelings and money, which open talk and shared plans handle well.",
        gana: "Gana difference: your temperaments differ. One may need calm while the other needs intensity; understanding each other's rhythm is the key here.",
      },
      excepciones: {
        nadi_misma_rashi: "You share the same Moon sign with different nakshatras, which the texts count as a cancellation of Nadi dosha.",
        nadi_mismo_nakshatra_otro_pada: "Same nakshatra but different pada, which the texts count as a cancellation of Nadi dosha.",
        bhakoot_mismo_senor: "Both Moon signs share the same ruling planet, so tradition sees the Bhakoot dosha as mild.",
        bhakoot_senores_amigos: "The lords of both Moon signs are friends, so tradition sees the Bhakoot dosha as mild.",
      },
      manglik: {
        ninguno: "Neither of you is Manglik.",
        ambos: "Both of you are Manglik: tradition sees this as a balanced pair.",
        solo_a: "Only {a} is Manglik: it means more drive and directness, which patience and conversation channel well.",
        solo_b: "Only {b} is Manglik: it means more drive and directness, which patience and conversation channel well.",
      },
      notaCalma: "Guna milan is a map from an old tradition, not a verdict. It shows where a relationship flows easily and where it asks for understanding; what truly shapes it is how you both treat each other.",
    },
    nombres: {
      grahas: { surya: "Sun", chandra: "Moon", mangal: "Mars", budh: "Mercury", guru: "Jupiter", shukra: "Venus", shani: "Saturn", rahu: "Rahu", ketu: "Ketu" },
      abreviaturas: { surya: "Su", chandra: "Mo", mangal: "Ma", budh: "Me", guru: "Ju", shukra: "Ve", shani: "Sa", rahu: "Ra", ketu: "Ke", lagna: "Asc" },
      rashis: conSanscrito(["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]),
      nakshatras: NAKSHATRAS_LATINO,
      ...TERMINOS_LATINO,
      vashyas: { chatushpada: "Chatushpada (quadruped)", manava: "Manava (human)", jalachara: "Jalachara (water)", vanachara: "Vanachara (wild)", keeta: "Keeta (insect)" },
      yonis: { ashwa: "Horse", gaja: "Elephant", mesha: "Sheep", sarpa: "Serpent", shwana: "Dog", marjara: "Cat", mushaka: "Rat", gau: "Cow", mahisha: "Buffalo", vyaghra: "Tiger", mriga: "Deer", vanara: "Monkey", nakula: "Mongoose", simha: "Lion" },
    },
  },
  // ---------------------------------------------------------------------------
  es: {
    kundli: {
      seccion: "Astrología védica",
      titulo: "Tu carta védica (Kundli)",
      intro: "Con tu fecha, hora y lugar de nacimiento se levanta tu kundli védico: Lagna, signo lunar (rashi), nakshatra y pada, los nueve grahas y tu Vimshottari dasha. Luego Sibila te lo lee con palabras sencillas.",
      descripcion: "Carta natal védica con ayanamsa Lahiri: Lagna, rashi, nakshatra, planetas, mahadasha y antardasha Vimshottari, interpretada por Sibila.",
      nombre: "Tu nombre",
      fecha: "Fecha de nacimiento",
      calcular: "Calcular mi kundli · {n} créditos",
      calculando: "Calculando los grahas…",
      nota: "El Lagna cambia más o menos cada dos horas: cuanto más exacta sea la hora, más precisa la carta. Sin hora también funciona, con las casas contadas desde la Luna.",
      tituloLectura: "Kundli de {nombre}",
    },
    milan: {
      seccion: "Astrología védica",
      titulo: "Kundli milan (compatibilidad védica)",
      intro: "Ashtakoot Guna Milan: la compatibilidad de 36 puntos a partir de los nakshatras y rashis lunares de los dos, cada koota con su puntaje y el estado Manglik de cada persona. Sibila lo explica con calma, sin miedo.",
      descripcion: "Ashtakoot Guna Milan (36 gunas): Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot y Nadi, el Manglik de ambos y la lectura de Sibila.",
      personaA: "Persona 1 (lado del novio)",
      personaB: "Persona 2 (lado de la novia)",
      notaRoles: "Las tablas tradicionales cuentan distinto el lado del novio y el de la novia; para cualquier pareja, ingrésenlos en este orden.",
      calcular: "Calcular nuestros gunas · {n} créditos",
      calculando: "Uniendo las dos cartas…",
      nota: "El guna milan se basa en el nakshatra de la Luna. La Luna pasa cerca de un día en cada nakshatra, así que hasta una hora aproximada sirve.",
      tituloLectura: "{a} y {b}: {total} de 36 gunas",
    },
    errores: {
      nombre: "Escribe un nombre.",
      fecha: "Elige una fecha de nacimiento válida.",
      hora: "Escribe la hora de nacimiento o marca «no la conozco».",
      lugar: "Elige el lugar de nacimiento de la lista.",
      anio: "El año de nacimiento debe estar entre 1900 y hoy.",
      segunda: "Revisa los datos de la segunda persona: {error}",
    },
    vista: {
      cartaTitulo: "Carta natal (Lagna)",
      cartaNota: "Estilo del norte de la India: la casa de arriba al centro es la casa 1; los números indican el rashi.",
      lagna: "Lagna",
      chandraLagna: "Chandra Lagna",
      sinHora: "No se conocía la hora: se usó el mediodía y las casas se cuentan desde la Luna (Chandra Lagna). El nakshatra lunar también podría variar un poco.",
      rashiLunar: "Signo lunar",
      nakshatra: "Nakshatra",
      pada: "pada {n}",
      ayanamsa: "Ayanamsa Lahiri",
      tablaTitulo: "Posiciones de los grahas",
      graha: "Graha",
      rashi: "Rashi",
      grado: "Grado",
      casa: "Casa",
      retrogrado: "retrógrado",
      dignidades: { exaltado: "exaltado", debilitado: "debilitado", propio: "signo propio" },
      dashaTitulo: "Vimshottari dasha",
      dashaNota: "Un ciclo de 120 años que arranca en el nakshatra de la Luna al nacer.",
      balance: "Al nacer quedaban {a} años, {m} meses y {d} días del mahadasha de {graha}.",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      ahora: "ahora",
      hasta: "hasta el {fecha}",
      antardashasDe: "Antardashas del mahadasha de {graha}",
      proximos: "Los antardashas que vienen",
      manglikTitulo: "Estado Manglik",
      manglikEstados: { si: "Manglik", parcial: "Manglik parcial", no: "No Manglik" },
      manglikDetalle: "Marte está en la casa {lagna} desde el Lagna y en la casa {luna} desde la Luna.",
      manglikDetalleLuna: "Marte está en la casa {luna} desde la Luna.",
      manglikAtenuado: "Marte está en su signo propio o exaltado, y la tradición lo considera atenuado.",
      manglikNota: "Ser Manglik es muy común: aparece en cerca de la mitad de las cartas. Habla de más empuje, pasión y franqueza; la paciencia, hablar las cosas y canalizar esa energía en el trabajo o el deporte la vuelven una fortaleza. Por sí solo no decide nada sobre una relación.",
    },
    milanVista: {
      gunas: "gunas",
      de36: "de 36",
      niveles: {
        bajo: { titulo: "Una unión que pide trabajo", texto: "Menos gunas significa que algunas áreas piden más atención y conversación. Muchas parejas con puntajes así construyen una vida feliz con conciencia. Mira abajo qué kootas salen bajos." },
        medio: { titulo: "Una unión viable", texto: "La tradición considera aceptable más de 18 gunas. Los kootas fuertes los sostienen; los bajos muestran qué trabajar juntos." },
        bueno: { titulo: "Una buena unión", texto: "Buenos gunas: hay armonía en el temperamento, los sentimientos y la vida diaria." },
        excelente: { titulo: "Una unión excelente", texto: "Gunas muy altos: una armonía profunda. Aun así, toda relación crece con amor, respeto y conversación de cada día." },
      },
      kootaTitulo: "Tabla Ashtakoot",
      total: "Total",
      koota: "Koota",
      puntos: "Gunas",
      kootas: {
        varna: { nombre: "Varna", sentido: "Trabajo y visión de la vida" },
        vashya: { nombre: "Vashya", sentido: "Atracción e influencia mutua" },
        tara: { nombre: "Tara", sentido: "Fortuna y bienestar compartidos" },
        yoni: { nombre: "Yoni", sentido: "Armonía física e instintiva" },
        graha_maitri: { nombre: "Graha Maitri", sentido: "Amistad entre las mentes" },
        gana: { nombre: "Gana", sentido: "Temperamento" },
        bhakoot: { nombre: "Bhakoot", sentido: "Vínculo emocional, familia y prosperidad" },
        nadi: { nombre: "Nadi", sentido: "Salud y constitución" },
      },
      lunaDe: "La Luna de {nombre}",
      varna: "Varna",
      vashya: "Vashya",
      yoni: "Yoni",
      gana: "Gana",
      nadi: "Nadi",
      sinHora: "hora aproximada (mediodía)",
      doshasTitulo: "A qué prestar atención",
      doshas: {
        nadi: "Nadi dosha: comparten la misma nadi, una constitución parecida. Tómalo como una invitación a cuidar la salud y las rutinas: buena comida, descanso y cuidarse el uno al otro.",
        bhakoot: "Bhakoot dosha: la distancia entre sus signos lunares es de las que la tradición llama retadoras. Señala miradas distintas sobre los sentimientos y el dinero, que se manejan bien hablando claro y haciendo planes juntos.",
        gana: "Diferencia de gana: sus temperamentos son distintos. Uno puede necesitar calma y el otro intensidad; entender el ritmo del otro es la clave.",
      },
      excepciones: {
        nadi_misma_rashi: "Comparten el signo lunar con nakshatras distintos: los textos lo cuentan como anulación del Nadi dosha.",
        nadi_mismo_nakshatra_otro_pada: "Mismo nakshatra pero distinto pada: los textos lo cuentan como anulación del Nadi dosha.",
        bhakoot_mismo_senor: "Los dos signos lunares tienen el mismo regente, así que la tradición considera leve el Bhakoot dosha.",
        bhakoot_senores_amigos: "Los regentes de los dos signos lunares son amigos, así que la tradición considera leve el Bhakoot dosha.",
      },
      manglik: {
        ninguno: "Ninguno de los dos es Manglik.",
        ambos: "Los dos son Manglik: la tradición lo ve como una pareja equilibrada.",
        solo_a: "Solo {a} es Manglik: significa más empuje y franqueza, que la paciencia y la conversación encauzan bien.",
        solo_b: "Solo {b} es Manglik: significa más empuje y franqueza, que la paciencia y la conversación encauzan bien.",
      },
      notaCalma: "El guna milan es un mapa de una tradición antigua, no un veredicto. Muestra dónde la relación fluye fácil y dónde pide comprensión; lo que de verdad la forma es cómo se tratan.",
    },
    nombres: {
      grahas: { surya: "Sol", chandra: "Luna", mangal: "Marte", budh: "Mercurio", guru: "Júpiter", shukra: "Venus", shani: "Saturno", rahu: "Rahu", ketu: "Ketu" },
      abreviaturas: { surya: "So", chandra: "Lu", mangal: "Ma", budh: "Me", guru: "Jú", shukra: "Ve", shani: "Sa", rahu: "Ra", ketu: "Ke", lagna: "Asc" },
      rashis: conSanscrito(["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"]),
      nakshatras: NAKSHATRAS_LATINO,
      ...TERMINOS_LATINO,
      vashyas: { chatushpada: "Chatushpada (cuadrúpedo)", manava: "Manava (humano)", jalachara: "Jalachara (acuático)", vanachara: "Vanachara (salvaje)", keeta: "Keeta (insecto)" },
      yonis: { ashwa: "Caballo", gaja: "Elefante", mesha: "Oveja", sarpa: "Serpiente", shwana: "Perro", marjara: "Gato", mushaka: "Rata", gau: "Vaca", mahisha: "Búfalo", vyaghra: "Tigre", mriga: "Ciervo", vanara: "Mono", nakula: "Mangosta", simha: "León" },
    },
  },
  // ---------------------------------------------------------------------------
  pt: {
    kundli: {
      seccion: "Astrologia védica",
      titulo: "Seu mapa védico (Kundli)",
      intro: "Com sua data, hora e local de nascimento levantamos seu kundli védico: Lagna, signo lunar (rashi), nakshatra e pada, os nove grahas e seu Vimshottari dasha. Depois a Sibila lê tudo para você com palavras simples.",
      descripcion: "Mapa natal védico com ayanamsa Lahiri: Lagna, rashi, nakshatra, planetas, mahadasha e antardasha Vimshottari, interpretado pela Sibila.",
      nombre: "Seu nome",
      fecha: "Data de nascimento",
      calcular: "Calcular meu kundli · {n} créditos",
      calculando: "Calculando os grahas…",
      nota: "O Lagna muda mais ou menos a cada duas horas: quanto mais exata a hora, mais preciso o mapa. Sem a hora também funciona, com as casas contadas a partir da Lua.",
      tituloLectura: "Kundli de {nombre}",
    },
    milan: {
      seccion: "Astrologia védica",
      titulo: "Kundli milan (compatibilidade védica)",
      intro: "Ashtakoot Guna Milan: a compatibilidade de 36 pontos a partir dos nakshatras e rashis lunares de vocês dois, cada koota com sua pontuação e o estado Manglik de cada pessoa. A Sibila explica com calma, sem medo.",
      descripcion: "Ashtakoot Guna Milan (36 gunas): Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot e Nadi, o Manglik de ambos e a leitura da Sibila.",
      personaA: "Pessoa 1 (lado do noivo)",
      personaB: "Pessoa 2 (lado da noiva)",
      notaRoles: "As tabelas tradicionais contam de forma diferente o lado do noivo e o da noiva; para qualquer casal, basta preencher nesta ordem.",
      calcular: "Calcular nossos gunas · {n} créditos",
      calculando: "Unindo os dois mapas…",
      nota: "O guna milan se baseia no nakshatra da Lua. A Lua passa cerca de um dia em cada nakshatra, então até uma hora aproximada ajuda.",
      tituloLectura: "{a} e {b}: {total} de 36 gunas",
    },
    errores: {
      nombre: "Escreva um nome.",
      fecha: "Escolha uma data de nascimento válida.",
      hora: "Informe a hora de nascimento ou marque “não sei a hora”.",
      lugar: "Escolha o local de nascimento na lista.",
      anio: "O ano de nascimento deve estar entre 1900 e hoje.",
      segunda: "Confira os dados da segunda pessoa: {error}",
    },
    vista: {
      cartaTitulo: "Mapa natal (Lagna)",
      cartaNota: "Estilo do norte da Índia: a casa do alto, no centro, é a casa 1; os números indicam o rashi.",
      lagna: "Lagna",
      chandraLagna: "Chandra Lagna",
      sinHora: "A hora não era conhecida: usamos o meio-dia e as casas são contadas a partir da Lua (Chandra Lagna). O nakshatra lunar também pode variar um pouco.",
      rashiLunar: "Signo lunar",
      nakshatra: "Nakshatra",
      pada: "pada {n}",
      ayanamsa: "Ayanamsa Lahiri",
      tablaTitulo: "Posições dos grahas",
      graha: "Graha",
      rashi: "Rashi",
      grado: "Grau",
      casa: "Casa",
      retrogrado: "retrógrado",
      dignidades: { exaltado: "exaltado", debilitado: "debilitado", propio: "signo próprio" },
      dashaTitulo: "Vimshottari dasha",
      dashaNota: "Um ciclo de 120 anos que começa no nakshatra da Lua no nascimento.",
      balance: "No nascimento restavam {a} anos, {m} meses e {d} dias do mahadasha de {graha}.",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      ahora: "agora",
      hasta: "até {fecha}",
      antardashasDe: "Antardashas do mahadasha de {graha}",
      proximos: "Os próximos antardashas",
      manglikTitulo: "Estado Manglik",
      manglikEstados: { si: "Manglik", parcial: "Manglik parcial", no: "Não Manglik" },
      manglikDetalle: "Marte está na casa {lagna} a partir do Lagna e na casa {luna} a partir da Lua.",
      manglikDetalleLuna: "Marte está na casa {luna} a partir da Lua.",
      manglikAtenuado: "Marte está em seu signo próprio ou de exaltação, e a tradição o considera atenuado.",
      manglikNota: "Ser Manglik é muito comum: aparece em cerca de metade dos mapas. Fala de mais garra, paixão e franqueza; paciência, conversa aberta e canalizar essa energia no trabalho ou no esporte fazem dela uma força. Sozinho, não decide nada sobre uma relação.",
    },
    milanVista: {
      gunas: "gunas",
      de36: "de 36",
      niveles: {
        bajo: { titulo: "Uma união que pede dedicação", texto: "Menos gunas significa que algumas áreas pedem mais atenção e conversa. Muitos casais com pontuações assim constroem uma vida feliz com consciência. Veja abaixo quais kootas estão baixos." },
        medio: { titulo: "Uma união viável", texto: "A tradição considera aceitável mais de 18 gunas. Os kootas fortes sustentam vocês; os baixos mostram o que trabalhar juntos." },
        bueno: { titulo: "Uma boa união", texto: "Bons gunas: há harmonia no temperamento, nos sentimentos e na vida diária." },
        excelente: { titulo: "Uma união excelente", texto: "Gunas muito altos: uma harmonia profunda. Ainda assim, toda relação cresce com amor, respeito e conversa no dia a dia." },
      },
      kootaTitulo: "Tabela Ashtakoot",
      total: "Total",
      koota: "Koota",
      puntos: "Gunas",
      kootas: {
        varna: { nombre: "Varna", sentido: "Trabalho e visão de vida" },
        vashya: { nombre: "Vashya", sentido: "Atração e influência mútua" },
        tara: { nombre: "Tara", sentido: "Sorte e bem-estar compartilhados" },
        yoni: { nombre: "Yoni", sentido: "Harmonia física e instintiva" },
        graha_maitri: { nombre: "Graha Maitri", sentido: "Amizade entre as mentes" },
        gana: { nombre: "Gana", sentido: "Temperamento" },
        bhakoot: { nombre: "Bhakoot", sentido: "Vínculo emocional, família e prosperidade" },
        nadi: { nombre: "Nadi", sentido: "Saúde e constituição" },
      },
      lunaDe: "A Lua de {nombre}",
      varna: "Varna",
      vashya: "Vashya",
      yoni: "Yoni",
      gana: "Gana",
      nadi: "Nadi",
      sinHora: "hora aproximada (meio-dia)",
      doshasTitulo: "No que prestar atenção",
      doshas: {
        nadi: "Nadi dosha: vocês têm a mesma nadi, uma constituição parecida. Veja como um convite a cuidar da saúde e da rotina: boa comida, descanso e cuidado um com o outro.",
        bhakoot: "Bhakoot dosha: a distância entre os signos lunares é das que a tradição chama de desafiadoras. Indica olhares diferentes sobre sentimentos e dinheiro, que se resolvem bem com conversa franca e planos em comum.",
        gana: "Diferença de gana: os temperamentos são distintos. Um pode precisar de calma e o outro de intensidade; entender o ritmo do outro é a chave.",
      },
      excepciones: {
        nadi_misma_rashi: "Vocês têm o mesmo signo lunar com nakshatras diferentes: os textos contam isso como anulação do Nadi dosha.",
        nadi_mismo_nakshatra_otro_pada: "Mesmo nakshatra, mas pada diferente: os textos contam isso como anulação do Nadi dosha.",
        bhakoot_mismo_senor: "Os dois signos lunares têm o mesmo regente, então a tradição considera o Bhakoot dosha leve.",
        bhakoot_senores_amigos: "Os regentes dos dois signos lunares são amigos, então a tradição considera o Bhakoot dosha leve.",
      },
      manglik: {
        ninguno: "Nenhum de vocês é Manglik.",
        ambos: "Os dois são Manglik: a tradição vê isso como um par equilibrado.",
        solo_a: "Só {a} é Manglik: significa mais garra e franqueza, que paciência e conversa canalizam bem.",
        solo_b: "Só {b} é Manglik: significa mais garra e franqueza, que paciência e conversa canalizam bem.",
      },
      notaCalma: "O guna milan é um mapa de uma tradição antiga, não um veredito. Mostra onde a relação flui fácil e onde pede compreensão; o que de fato a forma é como vocês se tratam.",
    },
    nombres: {
      grahas: { surya: "Sol", chandra: "Lua", mangal: "Marte", budh: "Mercúrio", guru: "Júpiter", shukra: "Vênus", shani: "Saturno", rahu: "Rahu", ketu: "Ketu" },
      abreviaturas: { surya: "So", chandra: "Lu", mangal: "Ma", budh: "Me", guru: "Jú", shukra: "Vê", shani: "Sa", rahu: "Ra", ketu: "Ke", lagna: "Asc" },
      rashis: conSanscrito(["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"]),
      nakshatras: NAKSHATRAS_LATINO,
      ...TERMINOS_LATINO,
      vashyas: { chatushpada: "Chatushpada (quadrúpede)", manava: "Manava (humano)", jalachara: "Jalachara (aquático)", vanachara: "Vanachara (selvagem)", keeta: "Keeta (inseto)" },
      yonis: { ashwa: "Cavalo", gaja: "Elefante", mesha: "Ovelha", sarpa: "Serpente", shwana: "Cão", marjara: "Gato", mushaka: "Rato", gau: "Vaca", mahisha: "Búfalo", vyaghra: "Tigre", mriga: "Cervo", vanara: "Macaco", nakula: "Mangusto", simha: "Leão" },
    },
  },
  // ---------------------------------------------------------------------------
  fr: {
    kundli: {
      seccion: "Astrologie védique",
      titulo: "Ton thème védique (Kundli)",
      intro: "Avec ta date, ton heure et ton lieu de naissance, on dresse ton kundli védique : Lagna, signe lunaire (rashi), nakshatra et pada, les neuf grahas et ton Vimshottari dasha. Ensuite, Sibila te le lit avec des mots simples.",
      descripcion: "Thème natal védique avec l'ayanamsa Lahiri : Lagna, rashi, nakshatra, planètes, mahadasha et antardasha Vimshottari, interprété par Sibila.",
      nombre: "Ton prénom",
      fecha: "Date de naissance",
      calcular: "Calculer mon kundli · {n} crédits",
      calculando: "Calcul des grahas…",
      nota: "Le Lagna change environ toutes les deux heures : plus l'heure est exacte, plus le thème est précis. Sans heure, ça marche aussi, avec les maisons comptées depuis la Lune.",
      tituloLectura: "Kundli de {nombre}",
    },
    milan: {
      seccion: "Astrologie védique",
      titulo: "Kundli milan (compatibilité védique)",
      intro: "Ashtakoot Guna Milan : la compatibilité sur 36 points à partir des nakshatras et rashis lunaires de vous deux, chaque koota avec son score, et le statut Manglik de chacun. Sibila l'explique avec calme, sans peur.",
      descripcion: "Ashtakoot Guna Milan (36 gunas) : Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot et Nadi, le Manglik de chacun et la lecture de Sibila.",
      personaA: "Personne 1 (côté du marié)",
      personaB: "Personne 2 (côté de la mariée)",
      notaRoles: "Les tables traditionnelles comptent différemment le côté du marié et celui de la mariée ; pour tout couple, entrez-les simplement dans cet ordre.",
      calcular: "Calculer nos gunas · {n} crédits",
      calculando: "On réunit les deux thèmes…",
      nota: "Le guna milan repose sur le nakshatra de la Lune. La Lune reste environ un jour dans chaque nakshatra : même une heure approximative aide.",
      tituloLectura: "{a} et {b} : {total} gunas sur 36",
    },
    errores: {
      nombre: "Écris un prénom.",
      fecha: "Choisis une date de naissance valide.",
      hora: "Indique l'heure de naissance ou coche « je ne la connais pas ».",
      lugar: "Choisis le lieu de naissance dans la liste.",
      anio: "L'année de naissance doit être comprise entre 1900 et aujourd'hui.",
      segunda: "Vérifie les données de la deuxième personne : {error}",
    },
    vista: {
      cartaTitulo: "Thème natal (Lagna)",
      cartaNota: "Style du nord de l'Inde : la maison en haut au centre est la maison 1 ; les chiffres indiquent le rashi.",
      lagna: "Lagna",
      chandraLagna: "Chandra Lagna",
      sinHora: "L'heure n'était pas connue : midi a été utilisé et les maisons sont comptées depuis la Lune (Chandra Lagna). Le nakshatra lunaire peut aussi varier un peu.",
      rashiLunar: "Signe lunaire",
      nakshatra: "Nakshatra",
      pada: "pada {n}",
      ayanamsa: "Ayanamsa Lahiri",
      tablaTitulo: "Positions des grahas",
      graha: "Graha",
      rashi: "Rashi",
      grado: "Degré",
      casa: "Maison",
      retrogrado: "rétrograde",
      dignidades: { exaltado: "exalté", debilitado: "en chute", propio: "signe propre" },
      dashaTitulo: "Vimshottari dasha",
      dashaNota: "Un cycle de 120 ans qui part du nakshatra de la Lune à la naissance.",
      balance: "À la naissance, il restait {a} ans, {m} mois et {d} jours du mahadasha de {graha}.",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      ahora: "maintenant",
      hasta: "jusqu'au {fecha}",
      antardashasDe: "Antardashas du mahadasha de {graha}",
      proximos: "Les prochains antardashas",
      manglikTitulo: "Statut Manglik",
      manglikEstados: { si: "Manglik", parcial: "Manglik partiel", no: "Pas Manglik" },
      manglikDetalle: "Mars est en maison {lagna} depuis le Lagna et en maison {luna} depuis la Lune.",
      manglikDetalleLuna: "Mars est en maison {luna} depuis la Lune.",
      manglikAtenuado: "Mars est dans son propre signe ou en exaltation : la tradition le considère atténué.",
      manglikNota: "Être Manglik est très courant : c'est le cas d'environ la moitié des thèmes. Cela parle d'élan, de passion et de franchise ; la patience, le dialogue et une énergie mise dans le travail ou le sport en font une force. À lui seul, il ne décide rien d'une relation.",
    },
    milanVista: {
      gunas: "gunas",
      de36: "sur 36",
      niveles: {
        bajo: { titulo: "Une union qui demande des efforts", texto: "Moins de gunas veut dire que certains domaines demandent plus d'attention et de dialogue. Beaucoup de couples avec ce genre de score construisent une vie heureuse en conscience. Regarde plus bas quels kootas sont faibles." },
        medio: { titulo: "Une union viable", texto: "La tradition juge acceptable plus de 18 gunas. Les kootas forts vous portent ; les faibles montrent ce qu'il y a à travailler ensemble." },
        bueno: { titulo: "Une belle union", texto: "De bons gunas : il y a de l'harmonie dans le tempérament, les sentiments et la vie quotidienne." },
        excelente: { titulo: "Une union excellente", texto: "Des gunas très élevés : une harmonie profonde. Pourtant, toute relation grandit avec l'amour, le respect et le dialogue de chaque jour." },
      },
      kootaTitulo: "Tableau Ashtakoot",
      total: "Total",
      koota: "Koota",
      puntos: "Gunas",
      kootas: {
        varna: { nombre: "Varna", sentido: "Travail et vision de la vie" },
        vashya: { nombre: "Vashya", sentido: "Attirance et influence mutuelles" },
        tara: { nombre: "Tara", sentido: "Chance et bien-être partagés" },
        yoni: { nombre: "Yoni", sentido: "Harmonie physique et instinctive" },
        graha_maitri: { nombre: "Graha Maitri", sentido: "Amitié des esprits" },
        gana: { nombre: "Gana", sentido: "Tempérament" },
        bhakoot: { nombre: "Bhakoot", sentido: "Lien affectif, famille et prospérité" },
        nadi: { nombre: "Nadi", sentido: "Santé et constitution" },
      },
      lunaDe: "La Lune de {nombre}",
      varna: "Varna",
      vashya: "Vashya",
      yoni: "Yoni",
      gana: "Gana",
      nadi: "Nadi",
      sinHora: "heure approximative (midi)",
      doshasTitulo: "Points d'attention",
      doshas: {
        nadi: "Nadi dosha : vous partagez la même nadi, une constitution proche. Prends-le comme une invitation à soigner la santé et les rythmes : bonne alimentation, repos et attention l'un à l'autre.",
        bhakoot: "Bhakoot dosha : la distance entre vos signes lunaires fait partie de celles que la tradition dit exigeantes. Elle indique des regards différents sur les sentiments et l'argent, qu'un dialogue franc et des projets communs gèrent bien.",
        gana: "Différence de gana : vos tempéraments diffèrent. L'un peut avoir besoin de calme, l'autre d'intensité ; comprendre le rythme de l'autre est la clé.",
      },
      excepciones: {
        nadi_misma_rashi: "Même signe lunaire avec des nakshatras différents : les textes y voient une annulation du Nadi dosha.",
        nadi_mismo_nakshatra_otro_pada: "Même nakshatra mais pada différent : les textes y voient une annulation du Nadi dosha.",
        bhakoot_mismo_senor: "Vos deux signes lunaires ont le même maître : la tradition juge le Bhakoot dosha léger.",
        bhakoot_senores_amigos: "Les maîtres de vos deux signes lunaires sont amis : la tradition juge le Bhakoot dosha léger.",
      },
      manglik: {
        ninguno: "Aucun de vous deux n'est Manglik.",
        ambos: "Vous êtes Manglik tous les deux : la tradition y voit un couple équilibré.",
        solo_a: "Seul·e {a} est Manglik : cela signifie plus d'élan et de franchise, que la patience et le dialogue canalisent bien.",
        solo_b: "Seul·e {b} est Manglik : cela signifie plus d'élan et de franchise, que la patience et le dialogue canalisent bien.",
      },
      notaCalma: "Le guna milan est une carte issue d'une tradition ancienne, pas un verdict. Il montre où la relation coule facilement et où elle demande de la compréhension ; ce qui la façonne vraiment, c'est la façon dont vous vous traitez.",
    },
    nombres: {
      grahas: { surya: "Soleil", chandra: "Lune", mangal: "Mars", budh: "Mercure", guru: "Jupiter", shukra: "Vénus", shani: "Saturne", rahu: "Rahu", ketu: "Ketu" },
      abreviaturas: { surya: "So", chandra: "Lu", mangal: "Ma", budh: "Me", guru: "Ju", shukra: "Vé", shani: "Sa", rahu: "Ra", ketu: "Ke", lagna: "Asc" },
      rashis: conSanscrito(["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"]),
      nakshatras: NAKSHATRAS_LATINO,
      ...TERMINOS_LATINO,
      vashyas: { chatushpada: "Chatushpada (quadrupède)", manava: "Manava (humain)", jalachara: "Jalachara (aquatique)", vanachara: "Vanachara (sauvage)", keeta: "Keeta (insecte)" },
      yonis: { ashwa: "Cheval", gaja: "Éléphant", mesha: "Mouton", sarpa: "Serpent", shwana: "Chien", marjara: "Chat", mushaka: "Rat", gau: "Vache", mahisha: "Buffle", vyaghra: "Tigre", mriga: "Cerf", vanara: "Singe", nakula: "Mangouste", simha: "Lion" },
    },
  },
  // ---------------------------------------------------------------------------
  tr: {
    kundli: {
      seccion: "Vedik astroloji",
      titulo: "Vedik doğum haritan (Kundli)",
      intro: "Doğum tarihin, saatin ve yerinle Vedik kundlin çıkarılır: Lagna, Ay burcu (rashi), nakshatra ve pada, dokuz graha ve Vimshottari dasha'n. Sonra Sibila sana sade bir dille okur.",
      descripcion: "Lahiri ayanamsa ile Vedik doğum haritası: Lagna, rashi, nakshatra, gezegenler, Vimshottari mahadasha ve antardasha, Sibila'nın yorumuyla.",
      nombre: "Adın",
      fecha: "Doğum tarihi",
      calcular: "Kundlimi hesapla · {n} kredi",
      calculando: "Grahalar hesaplanıyor…",
      nota: "Lagna yaklaşık iki saatte bir değişir: saat ne kadar doğruysa harita o kadar kesin olur. Saat olmadan da çalışır; evler o zaman Ay'dan sayılır.",
      tituloLectura: "{nombre} için kundli",
    },
    milan: {
      seccion: "Vedik astroloji",
      titulo: "Kundli milan (Vedik uyum)",
      intro: "Ashtakoot Guna Milan: ikinizin Ay nakshatra ve rashi'lerinden 36 puanlık uyum, her koota'nın puanı ve herkesin Manglik durumu. Sibila bunu korkutmadan, sakin bir dille anlatır.",
      descripcion: "Ashtakoot Guna Milan (36 guna): Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot ve Nadi, ikinizin Manglik durumu ve Sibila'nın yorumu.",
      personaA: "1. kişi (damat tarafı)",
      personaB: "2. kişi (gelin tarafı)",
      notaRoles: "Geleneksel tablolar damat ve gelin tarafını farklı sayar; her çift için bilgileri bu sırayla girmeniz yeterli.",
      calcular: "Gunalarımızı hesapla · {n} kredi",
      calculando: "İki harita birleştiriliyor…",
      nota: "Guna milan Ay'ın nakshatra'sına dayanır. Ay her nakshatra'da yaklaşık bir gün kalır; yaklaşık bir saat bile işe yarar.",
      tituloLectura: "{a} ve {b}: 36 üzerinden {total} guna",
    },
    errores: {
      nombre: "Lütfen bir isim yaz.",
      fecha: "Lütfen geçerli bir doğum tarihi seç.",
      hora: "Doğum saatini yaz ya da “saati bilmiyorum” kutusunu işaretle.",
      lugar: "Lütfen doğum yerini listeden seç.",
      anio: "Doğum yılı 1900 ile bugün arasında olmalı.",
      segunda: "İkinci kişinin bilgilerini kontrol et: {error}",
    },
    vista: {
      cartaTitulo: "Doğum haritası (Lagna)",
      cartaNota: "Kuzey Hindistan stili: üst ortadaki ev 1. evdir; sayılar rashi'yi gösterir.",
      lagna: "Lagna",
      chandraLagna: "Chandra Lagna",
      sinHora: "Doğum saati bilinmiyordu: öğle saati kullanıldı ve evler Ay'dan (Chandra Lagna) sayıldı. Ay'ın nakshatra'sı da biraz farklı olabilir.",
      rashiLunar: "Ay burcu",
      nakshatra: "Nakshatra",
      pada: "pada {n}",
      ayanamsa: "Lahiri ayanamsa",
      tablaTitulo: "Grahaların konumları",
      graha: "Graha",
      rashi: "Rashi",
      grado: "Derece",
      casa: "Ev",
      retrogrado: "retro",
      dignidades: { exaltado: "yüceliminde", debilitado: "düşüşünde", propio: "kendi burcunda" },
      dashaTitulo: "Vimshottari dasha",
      dashaNota: "Doğumdaki Ay nakshatra'sından başlayan 120 yıllık bir döngü.",
      balance: "Doğduğunda {graha} mahadasha'sının {a} yıl, {m} ay ve {d} günü kalmıştı.",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      ahora: "şimdi",
      hasta: "{fecha} tarihine kadar",
      antardashasDe: "{graha} mahadasha'sının antardasha'ları",
      proximos: "Sıradaki antardasha'lar",
      manglikTitulo: "Manglik durumu",
      manglikEstados: { si: "Manglik", parcial: "Kısmen Manglik", no: "Manglik değil" },
      manglikDetalle: "Mars, Lagna'dan {lagna}. evde, Ay'dan {luna}. evde.",
      manglikDetalleLuna: "Mars, Ay'dan {luna}. evde.",
      manglikAtenuado: "Mars kendi burcunda ya da yüceliminde; gelenek bunu yumuşatıcı sayar.",
      manglikNota: "Manglik olmak çok yaygındır: haritaların yaklaşık yarısında görülür. Fazladan enerji, tutku ve dobralık anlatır; sabır, açık konuşma ve bu enerjiyi işe ya da spora yöneltmek onu bir güce dönüştürür. Tek başına bir ilişki hakkında hiçbir şeye karar vermez.",
    },
    milanVista: {
      gunas: "guna",
      de36: "36 üzerinden",
      niveles: {
        bajo: { titulo: "Emek isteyen bir uyum", texto: "Daha az guna, bazı alanların daha çok ilgi ve konuşma istediği anlamına gelir. Böyle puanları olan pek çok çift bilinçle mutlu bir hayat kurar. Aşağıda hangi koota'ların düşük olduğuna bak." },
        medio: { titulo: "Yürüyebilecek bir uyum", texto: "Gelenek 18'in üzerindeki gunaları kabul edilebilir sayar. Güçlü koota'lar sizi destekler; düşük olanlar birlikte neye çalışacağınızı gösterir." },
        bueno: { titulo: "İyi bir uyum", texto: "İyi gunalar: mizaçta, duygularda ve gündelik hayatta ahenk var." },
        excelente: { titulo: "Harika bir uyum", texto: "Çok yüksek gunalar: derin bir ahenk. Yine de her ilişki her gün sevgi, saygı ve konuşmayla büyür." },
      },
      kootaTitulo: "Ashtakoot tablosu",
      total: "Toplam",
      koota: "Koota",
      puntos: "Guna",
      kootas: {
        varna: { nombre: "Varna", sentido: "İş ve hayata bakış" },
        vashya: { nombre: "Vashya", sentido: "Karşılıklı çekim ve etki" },
        tara: { nombre: "Tara", sentido: "Ortak şans ve esenlik" },
        yoni: { nombre: "Yoni", sentido: "Fiziksel ve içgüdüsel uyum" },
        graha_maitri: { nombre: "Graha Maitri", sentido: "Zihinlerin dostluğu" },
        gana: { nombre: "Gana", sentido: "Mizaç" },
        bhakoot: { nombre: "Bhakoot", sentido: "Duygusal bağ, aile ve bereket" },
        nadi: { nombre: "Nadi", sentido: "Sağlık ve beden yapısı" },
      },
      lunaDe: "{nombre} için Ay",
      varna: "Varna",
      vashya: "Vashya",
      yoni: "Yoni",
      gana: "Gana",
      nadi: "Nadi",
      sinHora: "yaklaşık saat (öğle)",
      doshasTitulo: "Dikkat edilecekler",
      doshas: {
        nadi: "Nadi dosha: aynı nadi'yi, benzer bir beden yapısını paylaşıyorsunuz. Bunu sağlığa ve düzene özen gösterme daveti olarak gör: iyi beslenme, dinlenme ve birbirinize bakmak.",
        bhakoot: "Bhakoot dosha: Ay burçlarınız arasındaki mesafe, geleneğin zorlayıcı dediklerinden. Duygulara ve paraya farklı bakışları gösterir; açık konuşma ve ortak planlarla iyi yönetilir.",
        gana: "Gana farkı: mizaçlarınız farklı. Biri sakinlik, diğeri yoğunluk isteyebilir; birbirinizin ritmini anlamak burada anahtardır.",
      },
      excepciones: {
        nadi_misma_rashi: "Ay burcunuz aynı, nakshatra'larınız farklı: metinler bunu Nadi dosha'nın kalkması sayar.",
        nadi_mismo_nakshatra_otro_pada: "Nakshatra aynı ama pada farklı: metinler bunu Nadi dosha'nın kalkması sayar.",
        bhakoot_mismo_senor: "İki Ay burcunun yöneticisi aynı gezegen; gelenek Bhakoot dosha'yı hafif sayar.",
        bhakoot_senores_amigos: "İki Ay burcunun yöneticileri dost; gelenek Bhakoot dosha'yı hafif sayar.",
      },
      manglik: {
        ninguno: "İkinizden hiçbiri Manglik değil.",
        ambos: "İkiniz de Manglik'siniz: gelenek bunu dengeli bir çift sayar.",
        solo_a: "Yalnızca {a} Manglik: daha fazla enerji ve dobralık demek; sabır ve konuşma bunu iyi yönlendirir.",
        solo_b: "Yalnızca {b} Manglik: daha fazla enerji ve dobralık demek; sabır ve konuşma bunu iyi yönlendirir.",
      },
      notaCalma: "Guna milan eski bir geleneğin haritasıdır, hüküm değil. İlişkinin nerede kolay aktığını, nerede anlayış istediğini gösterir; onu asıl şekillendiren birbirinize nasıl davrandığınızdır.",
    },
    nombres: {
      grahas: { surya: "Güneş", chandra: "Ay", mangal: "Mars", budh: "Merkür", guru: "Jüpiter", shukra: "Venüs", shani: "Satürn", rahu: "Rahu", ketu: "Ketu" },
      abreviaturas: { surya: "Gü", chandra: "Ay", mangal: "Ma", budh: "Me", guru: "Jü", shukra: "Ve", shani: "Sa", rahu: "Ra", ketu: "Ke", lagna: "Asc" },
      rashis: conSanscrito(["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"]),
      nakshatras: NAKSHATRAS_LATINO,
      ...TERMINOS_LATINO,
      vashyas: { chatushpada: "Chatushpada (dört ayaklı)", manava: "Manava (insan)", jalachara: "Jalachara (su)", vanachara: "Vanachara (yabani)", keeta: "Keeta (böcek)" },
      yonis: { ashwa: "At", gaja: "Fil", mesha: "Koyun", sarpa: "Yılan", shwana: "Köpek", marjara: "Kedi", mushaka: "Fare", gau: "İnek", mahisha: "Manda", vyaghra: "Kaplan", mriga: "Geyik", vanara: "Maymun", nakula: "Firavunfaresi", simha: "Aslan" },
    },
  },
  // ---------------------------------------------------------------------------
  ar: {
    kundli: {
      seccion: "الفلك الفيدي",
      titulo: "خريطتك الفيدية (كوندلي)",
      intro: "من تاريخ ميلادك وساعته ومكانه نرسم الكوندلي الفيدي الخاص بك: اللَّغنا (الطالع)، وبرج القمر (راشي)، والنَكشاترا ورُبعها، والكواكب التسعة، ودورات فيمشوتاري داشا. ثم تقرؤه لك سيبيلا بكلمات بسيطة.",
      descripcion: "خريطة ميلاد فيدية بأيانامشا لاهيري: الطالع، الراشي، النكشاترا، الكواكب، المهاداشا والأنترداشا، مع قراءة سيبيلا.",
      nombre: "اسمك",
      fecha: "تاريخ الميلاد",
      calcular: "احسب الكوندلي الخاص بي · {n} أرصدة",
      calculando: "جارٍ حساب الكواكب…",
      nota: "يتغيّر الطالع كل ساعتين تقريبًا، فكلما كانت ساعة الميلاد أدق كانت الخريطة أدق. وبدون الساعة تعمل الخريطة أيضًا، وتُحسب البيوت من القمر.",
      tituloLectura: "كوندلي {nombre}",
    },
    milan: {
      seccion: "الفلك الفيدي",
      titulo: "كوندلي ميلان (التوافق الفيدي)",
      intro: "أشتاكوت غونا ميلان: توافق من 36 نقطة يُحسب من نكشاترا القمر وبرجه لدى كل منكما، مع درجة كل كوتا، وحالة المانغليك لكل شخص. تشرح سيبيلا ذلك بهدوء ومن دون تخويف.",
      descripcion: "أشتاكوت غونا ميلان (36 غونا): فارنا، فاشيا، تارا، يوني، غراها مايتري، غانا، بهاكوت وناضي، وحالة المانغليك لكليكما مع قراءة سيبيلا.",
      personaA: "الشخص الأول (جهة العريس)",
      personaB: "الشخص الثاني (جهة العروس)",
      notaRoles: "تحسب الجداول التقليدية جهة العريس وجهة العروس بشكل مختلف؛ لأي زوجين يكفي إدخال البيانات بهذا الترتيب.",
      calcular: "احسب الغونا · {n} أرصدة",
      calculando: "جارٍ الجمع بين الخريطتين…",
      nota: "يعتمد غونا ميلان على نكشاترا القمر. يبقى القمر نحو يوم في كل نكشاترا، لذلك تفيد حتى الساعة التقريبية.",
      tituloLectura: "{a} و{b}: {total} من 36 غونا",
    },
    errores: {
      nombre: "اكتب اسمًا من فضلك.",
      fecha: "اختر تاريخ ميلاد صحيحًا.",
      hora: "اكتب ساعة الميلاد أو اختر «لا أعرف الساعة».",
      lugar: "اختر مكان الميلاد من القائمة.",
      anio: "يجب أن تكون سنة الميلاد بين 1900 واليوم.",
      segunda: "راجع بيانات الشخص الثاني: {error}",
    },
    vista: {
      cartaTitulo: "خريطة الميلاد (اللَّغنا)",
      cartaNota: "على طريقة شمال الهند: البيت العلوي في الوسط هو البيت الأول، والأرقام تدل على الراشي.",
      lagna: "اللَّغنا (الطالع)",
      chandraLagna: "تشاندرا لَغنا",
      sinHora: "لم تكن ساعة الميلاد معروفة: استُخدم الظهر وتُحسب البيوت من القمر (تشاندرا لَغنا). وقد تختلف نكشاترا القمر قليلًا.",
      rashiLunar: "برج القمر",
      nakshatra: "النكشاترا",
      pada: "الربع {n}",
      ayanamsa: "أيانامشا لاهيري",
      tablaTitulo: "مواقع الكواكب",
      graha: "الكوكب",
      rashi: "الراشي",
      grado: "الدرجة",
      casa: "البيت",
      retrogrado: "راجع",
      dignidades: { exaltado: "في شرفه", debilitado: "في هبوطه", propio: "في بيته" },
      dashaTitulo: "فيمشوتاري داشا",
      dashaNota: "دورة من 120 سنة تبدأ من نكشاترا القمر عند الميلاد.",
      balance: "عند الميلاد بقي من مهاداشا {graha} {a} سنة و{m} أشهر و{d} يومًا.",
      mahadasha: "المهاداشا",
      antardasha: "الأنترداشا",
      ahora: "الآن",
      hasta: "حتى {fecha}",
      antardashasDe: "أنترداشات مهاداشا {graha}",
      proximos: "الأنترداشات القادمة",
      manglikTitulo: "حالة المانغليك",
      manglikEstados: { si: "مانغليك", parcial: "مانغليك جزئيًا", no: "ليس مانغليك" },
      manglikDetalle: "المريخ في البيت {lagna} من الطالع وفي البيت {luna} من القمر.",
      manglikDetalleLuna: "المريخ في البيت {luna} من القمر.",
      manglikAtenuado: "المريخ في بيته أو في شرفه، والتقليد يراه مخففًا.",
      manglikNota: "أن تكون مانغليك أمر شائع جدًا: يظهر في نحو نصف الخرائط. يدل على اندفاع وشغف وصراحة أكبر؛ والصبر والحوار وتوجيه هذه الطاقة إلى العمل أو الرياضة يجعلها قوة. ولا يقرر وحده شيئًا في أي علاقة.",
    },
    milanVista: {
      gunas: "غونا",
      de36: "من 36",
      niveles: {
        bajo: { titulo: "توافق يحتاج إلى جهد", texto: "قلة الغونا تعني أن بعض الجوانب تحتاج إلى انتباه وحوار أكثر. وكثير من الأزواج بدرجات كهذه يبنون حياة سعيدة بوعي. انظر في الأسفل أي الكوتات منخفضة." },
        medio: { titulo: "توافق مقبول", texto: "يعدّ التقليد أكثر من 18 غونا مقبولًا. الكوتات القوية تسندكما، والمنخفضة تبيّن ما تعملان عليه معًا." },
        bueno: { titulo: "توافق جيد", texto: "غونا جيدة: هناك انسجام في الطبع والمشاعر والحياة اليومية." },
        excelente: { titulo: "توافق ممتاز", texto: "غونا عالية جدًا: انسجام عميق. ومع ذلك تنمو كل علاقة بالحب والاحترام والحوار كل يوم." },
      },
      kootaTitulo: "جدول أشتاكوت",
      total: "المجموع",
      koota: "الكوتا",
      puntos: "الغونا",
      kootas: {
        varna: { nombre: "فارنا", sentido: "العمل والنظرة إلى الحياة" },
        vashya: { nombre: "فاشيا", sentido: "الجاذبية والتأثير المتبادل" },
        tara: { nombre: "تارا", sentido: "الحظ والعافية المشتركة" },
        yoni: { nombre: "يوني", sentido: "الانسجام الجسدي والفطري" },
        graha_maitri: { nombre: "غراها مايتري", sentido: "صداقة العقول" },
        gana: { nombre: "غانا", sentido: "الطبع" },
        bhakoot: { nombre: "بهاكوت", sentido: "الرابط العاطفي والأسرة والرخاء" },
        nadi: { nombre: "ناضي", sentido: "الصحة والبنية" },
      },
      lunaDe: "قمر {nombre}",
      varna: "فارنا",
      vashya: "فاشيا",
      yoni: "يوني",
      gana: "غانا",
      nadi: "ناضي",
      sinHora: "ساعة تقريبية (الظهر)",
      doshasTitulo: "ما يستحق الانتباه",
      doshas: {
        nadi: "ناضي دوشا: تتشاركان الناضي نفسها، أي بنية متقاربة. خذها دعوة للعناية بالصحة والعادات اليومية: غذاء جيد وراحة واهتمام كلٍّ منكما بالآخر.",
        bhakoot: "بهاكوت دوشا: المسافة بين برجي القمر من تلك التي يسميها التقليد صعبة. تشير إلى نظرات مختلفة للمشاعر والمال، ويعالجها الحوار الصريح والخطط المشتركة جيدًا.",
        gana: "اختلاف الغانا: طبعاكما مختلفان. قد يحتاج أحدكما إلى الهدوء والآخر إلى الحماسة؛ وفهم إيقاع الآخر هو المفتاح.",
      },
      excepciones: {
        nadi_misma_rashi: "برج القمر واحد والنكشاترا مختلفة: تعدّ النصوص ذلك إلغاءً لناضي دوشا.",
        nadi_mismo_nakshatra_otro_pada: "النكشاترا واحدة والربع مختلف: تعدّ النصوص ذلك إلغاءً لناضي دوشا.",
        bhakoot_mismo_senor: "لبرجي القمر الحاكم نفسه، لذا يرى التقليد بهاكوت دوشا خفيفًا.",
        bhakoot_senores_amigos: "حاكما برجي القمر صديقان، لذا يرى التقليد بهاكوت دوشا خفيفًا.",
      },
      manglik: {
        ninguno: "لا أحد منكما مانغليك.",
        ambos: "كلاكما مانغليك: يرى التقليد في ذلك زوجين متوازنين.",
        solo_a: "{a} وحده مانغليك: يعني ذلك اندفاعًا وصراحة أكبر، يوجّههما الصبر والحوار جيدًا.",
        solo_b: "{b} وحدها مانغليك: يعني ذلك اندفاعًا وصراحة أكبر، يوجّههما الصبر والحوار جيدًا.",
      },
      notaCalma: "غونا ميلان خريطة من تقليد قديم وليس حكمًا. يبيّن أين تسير العلاقة بسهولة وأين تحتاج إلى تفهّم؛ وما يصنعها حقًا هو طريقة معاملتكما لبعضكما.",
    },
    nombres: {
      grahas: { surya: "الشمس", chandra: "القمر", mangal: "المريخ", budh: "عطارد", guru: "المشتري", shukra: "الزهرة", shani: "زحل", rahu: "راهو", ketu: "كيتو" },
      abreviaturas: { surya: "شم", chandra: "قم", mangal: "مر", budh: "عط", guru: "مش", shukra: "زه", shani: "زح", rahu: "را", ketu: "كي", lagna: "طالع" },
      rashis: ["الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت"],
      nakshatras: [
        "أشويني", "بهاراني", "كريتيكا", "روهيني", "مريغاشيرا", "أردرا", "بونارفاسو", "بوشيا", "أشليشا",
        "ماغا", "بورفا فالغوني", "أوتارا فالغوني", "هاستا", "تشيترا", "سواتي", "فيشاخا", "أنورادها", "جييشثا",
        "مولا", "بورفا أشادها", "أوتارا أشادها", "شرافانا", "دهانيشثا", "شاتابهيشا", "بورفا بهادرابادا", "أوتارا بهادرابادا", "ريفاتي",
      ],
      varnas: { brahmin: "براهمن", kshatriya: "كشاتريا", vaishya: "فايشيا", shudra: "شودرا" },
      vashyas: { chatushpada: "تشاتوشبادا (رباعي الأرجل)", manava: "مانافا (إنسان)", jalachara: "جالاتشارا (مائي)", vanachara: "فاناتشارا (بري)", keeta: "كيتا (حشرة)" },
      yonis: { ashwa: "حصان", gaja: "فيل", mesha: "خروف", sarpa: "أفعى", shwana: "كلب", marjara: "قط", mushaka: "فأر", gau: "بقرة", mahisha: "جاموس", vyaghra: "نمر", mriga: "غزال", vanara: "قرد", nakula: "نمس", simha: "أسد" },
      ganas: { deva: "ديفا", manushya: "مانوشيا", rakshasa: "راكشاسا" },
      nadis: { aadi: "آدي", madhya: "مادهيا", antya: "أنتيا" },
    },
  },
  // ---------------------------------------------------------------------------
  id: {
    kundli: {
      seccion: "Astrologi Weda",
      titulo: "Peta kelahiran Weda-mu (Kundli)",
      intro: "Dari tanggal, jam, dan tempat lahirmu disusun kundli Weda: Lagna, rasi Bulan (rashi), nakshatra dan pada, sembilan graha, dan Vimshottari dasha-mu. Lalu Sibila membacakannya untukmu dengan bahasa sederhana.",
      descripcion: "Peta kelahiran Weda dengan ayanamsa Lahiri: Lagna, rashi, nakshatra, planet, mahadasha dan antardasha Vimshottari, ditafsirkan Sibila.",
      nombre: "Namamu",
      fecha: "Tanggal lahir",
      calcular: "Hitung kundli-ku · {n} kredit",
      calculando: "Menghitung para graha…",
      nota: "Lagna berganti kira-kira tiap dua jam: makin tepat jam lahirmu, makin akurat petanya. Tanpa jam pun tetap bisa, dengan rumah dihitung dari Bulan.",
      tituloLectura: "Kundli {nombre}",
    },
    milan: {
      seccion: "Astrologi Weda",
      titulo: "Kundli milan (kecocokan Weda)",
      intro: "Ashtakoot Guna Milan: kecocokan 36 poin dari nakshatra dan rashi Bulan kalian berdua, skor tiap koota, dan status Manglik masing-masing. Sibila menjelaskannya dengan tenang, tanpa menakut-nakuti.",
      descripcion: "Ashtakoot Guna Milan (36 guna): Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, dan Nadi, status Manglik keduanya, dan bacaan Sibila.",
      personaA: "Orang 1 (pihak mempelai pria)",
      personaB: "Orang 2 (pihak mempelai wanita)",
      notaRoles: "Tabel tradisional menghitung pihak pria dan wanita secara berbeda; untuk pasangan mana pun, cukup isi dengan urutan ini.",
      calcular: "Hitung guna kami · {n} kredit",
      calculando: "Menyatukan dua peta…",
      nota: "Guna milan bertumpu pada nakshatra Bulan. Bulan berada sekitar sehari di tiap nakshatra, jadi jam perkiraan pun membantu.",
      tituloLectura: "{a} & {b}: {total} dari 36 guna",
    },
    errores: {
      nombre: "Tulis sebuah nama.",
      fecha: "Pilih tanggal lahir yang valid.",
      hora: "Tulis jam lahir atau centang “saya tidak tahu jamnya”.",
      lugar: "Pilih tempat lahir dari daftar.",
      anio: "Tahun lahir harus antara 1900 dan hari ini.",
      segunda: "Periksa data orang kedua: {error}",
    },
    vista: {
      cartaTitulo: "Peta kelahiran (Lagna)",
      cartaNota: "Gaya India Utara: rumah di tengah atas adalah rumah 1; angka menunjukkan rashi.",
      lagna: "Lagna",
      chandraLagna: "Chandra Lagna",
      sinHora: "Jam lahir tidak diketahui: dipakai jam 12 siang dan rumah dihitung dari Bulan (Chandra Lagna). Nakshatra Bulan juga bisa sedikit berbeda.",
      rashiLunar: "Rasi Bulan",
      nakshatra: "Nakshatra",
      pada: "pada {n}",
      ayanamsa: "Ayanamsa Lahiri",
      tablaTitulo: "Posisi para graha",
      graha: "Graha",
      rashi: "Rashi",
      grado: "Derajat",
      casa: "Rumah",
      retrogrado: "retrograd",
      dignidades: { exaltado: "eksaltasi", debilitado: "lemah", propio: "rasi sendiri" },
      dashaTitulo: "Vimshottari dasha",
      dashaNota: "Siklus 120 tahun yang dimulai dari nakshatra Bulan saat lahir.",
      balance: "Saat lahir, mahadasha {graha} tersisa {a} tahun, {m} bulan, dan {d} hari.",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      ahora: "sekarang",
      hasta: "sampai {fecha}",
      antardashasDe: "Antardasha dalam mahadasha {graha}",
      proximos: "Antardasha berikutnya",
      manglikTitulo: "Status Manglik",
      manglikEstados: { si: "Manglik", parcial: "Manglik sebagian", no: "Bukan Manglik" },
      manglikDetalle: "Mars ada di rumah {lagna} dari Lagna dan rumah {luna} dari Bulan.",
      manglikDetalleLuna: "Mars ada di rumah {luna} dari Bulan.",
      manglikAtenuado: "Mars berada di rasinya sendiri atau eksaltasi; tradisi menganggapnya lebih ringan.",
      manglikNota: "Menjadi Manglik itu sangat umum: muncul di sekitar separuh peta kelahiran. Artinya dorongan, gairah, dan keterusterangan yang lebih besar; kesabaran, bicara terbuka, dan menyalurkan energi ini ke kerja atau olahraga menjadikannya kekuatan. Sendirian, ia tidak menentukan apa pun tentang sebuah hubungan.",
    },
    milanVista: {
      gunas: "guna",
      de36: "dari 36",
      niveles: {
        bajo: { titulo: "Kecocokan yang butuh usaha", texto: "Guna yang lebih sedikit berarti beberapa hal butuh perhatian dan obrolan lebih. Banyak pasangan dengan skor seperti ini membangun hidup bahagia dengan kesadaran. Lihat di bawah koota mana yang rendah." },
        medio: { titulo: "Kecocokan yang bisa dijalani", texto: "Tradisi menganggap lebih dari 18 guna dapat diterima. Koota yang kuat menopang kalian; yang rendah menunjukkan apa yang perlu dikerjakan bersama." },
        bueno: { titulo: "Kecocokan yang baik", texto: "Guna yang baik: ada keselarasan dalam watak, perasaan, dan kehidupan sehari-hari." },
        excelente: { titulo: "Kecocokan yang istimewa", texto: "Guna sangat tinggi: keselarasan yang dalam. Tetap saja, setiap hubungan tumbuh lewat cinta, hormat, dan obrolan setiap hari." },
      },
      kootaTitulo: "Tabel Ashtakoot",
      total: "Total",
      koota: "Koota",
      puntos: "Guna",
      kootas: {
        varna: { nombre: "Varna", sentido: "Kerja dan cara pandang" },
        vashya: { nombre: "Vashya", sentido: "Daya tarik dan pengaruh timbal balik" },
        tara: { nombre: "Tara", sentido: "Keberuntungan dan kesejahteraan bersama" },
        yoni: { nombre: "Yoni", sentido: "Keselarasan fisik dan naluri" },
        graha_maitri: { nombre: "Graha Maitri", sentido: "Persahabatan pikiran" },
        gana: { nombre: "Gana", sentido: "Watak" },
        bhakoot: { nombre: "Bhakoot", sentido: "Ikatan emosional, keluarga, dan rezeki" },
        nadi: { nombre: "Nadi", sentido: "Kesehatan dan konstitusi tubuh" },
      },
      lunaDe: "Bulan milik {nombre}",
      varna: "Varna",
      vashya: "Vashya",
      yoni: "Yoni",
      gana: "Gana",
      nadi: "Nadi",
      sinHora: "jam perkiraan (siang)",
      doshasTitulo: "Yang perlu diperhatikan",
      doshas: {
        nadi: "Nadi dosha: kalian punya nadi yang sama, konstitusi tubuh yang mirip. Anggap ini ajakan menjaga kesehatan dan rutinitas: makan baik, istirahat, dan saling merawat.",
        bhakoot: "Bhakoot dosha: jarak antara rasi Bulan kalian termasuk yang disebut tradisi menantang. Ini menunjukkan cara pandang berbeda soal perasaan dan uang, yang bisa ditangani dengan bicara jujur dan rencana bersama.",
        gana: "Perbedaan gana: watak kalian berbeda. Yang satu mungkin butuh tenang, yang lain butuh semangat; memahami ritme pasangan adalah kuncinya.",
      },
      excepciones: {
        nadi_misma_rashi: "Rasi Bulan kalian sama dengan nakshatra berbeda: kitab-kitab menghitungnya sebagai pembatal Nadi dosha.",
        nadi_mismo_nakshatra_otro_pada: "Nakshatra sama tetapi pada berbeda: kitab-kitab menghitungnya sebagai pembatal Nadi dosha.",
        bhakoot_mismo_senor: "Kedua rasi Bulan punya planet penguasa yang sama, jadi tradisi menganggap Bhakoot dosha ringan.",
        bhakoot_senores_amigos: "Penguasa kedua rasi Bulan bersahabat, jadi tradisi menganggap Bhakoot dosha ringan.",
      },
      manglik: {
        ninguno: "Tidak ada di antara kalian yang Manglik.",
        ambos: "Kalian berdua Manglik: tradisi melihatnya sebagai pasangan yang seimbang.",
        solo_a: "Hanya {a} yang Manglik: artinya dorongan dan keterusterangan lebih besar, yang tersalurkan baik lewat kesabaran dan obrolan.",
        solo_b: "Hanya {b} yang Manglik: artinya dorongan dan keterusterangan lebih besar, yang tersalurkan baik lewat kesabaran dan obrolan.",
      },
      notaCalma: "Guna milan adalah peta dari tradisi kuno, bukan vonis. Ia menunjukkan di mana hubungan mengalir mudah dan di mana butuh pengertian; yang sungguh membentuknya adalah cara kalian saling memperlakukan.",
    },
    nombres: {
      grahas: { surya: "Matahari", chandra: "Bulan", mangal: "Mars", budh: "Merkurius", guru: "Yupiter", shukra: "Venus", shani: "Saturnus", rahu: "Rahu", ketu: "Ketu" },
      abreviaturas: { surya: "Mt", chandra: "Bl", mangal: "Ma", budh: "Me", guru: "Yu", shukra: "Ve", shani: "Sa", rahu: "Ra", ketu: "Ke", lagna: "Asc" },
      rashis: conSanscrito(["Aries", "Taurus", "Gemini", "Kanser", "Leo", "Virgo", "Libra", "Skorpio", "Sagitarius", "Kaprikornus", "Akuarius", "Pisces"]),
      nakshatras: NAKSHATRAS_LATINO,
      ...TERMINOS_LATINO,
      vashyas: { chatushpada: "Chatushpada (berkaki empat)", manava: "Manava (manusia)", jalachara: "Jalachara (air)", vanachara: "Vanachara (liar)", keeta: "Keeta (serangga)" },
      yonis: { ashwa: "Kuda", gaja: "Gajah", mesha: "Domba", sarpa: "Ular", shwana: "Anjing", marjara: "Kucing", mushaka: "Tikus", gau: "Sapi", mahisha: "Kerbau", vyaghra: "Harimau", mriga: "Rusa", vanara: "Kera", nakula: "Luwak", simha: "Singa" },
    },
  },
};

export function textosVedica(idioma: Idioma): TextosVedica {
  return TEXTOS_VEDICA[idioma] ?? TEXTOS_VEDICA.es;
}
