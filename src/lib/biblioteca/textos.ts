import type { Idioma } from "@/lib/i18n/idiomas";

/** Textos fijos de El Arcano de Sibila (portada y fichas) en los 8 idiomas. El nombre es el del menú de cada idioma. */
export interface TextosArcano {
  inicio: string;
  nombre: string;
  antetitulo: string;
  intro: string;
  descripcion: string;
  leer: string;
  fuentes: string;
  preguntas: string;
  nota: string;
  traduciendo: string;
}

export const TEXTOS_ARCANO: Record<Idioma, TextosArcano> = {
  es: {
    inicio: "Inicio",
    nombre: "El Arcano de Sibila",
    antetitulo: "Tradiciones del mundo",
    intro: "Cada práctica tiene una historia, un lenguaje y una forma de vivirse. Aquí guardamos la de cada una: de dónde viene, cómo se hace y qué dicen sus símbolos.",
    descripcion: "La historia, los símbolos y la forma de practicar cada tradición: la lectura del café, el tarot, la limpia con huevo, el mal de ojo y muchas más.",
    leer: "Leer",
    fuentes: "Fuentes",
    preguntas: "Preguntas frecuentes",
    nota: "Sin tarjeta de crédito · Tu primera lectura es gratis",
    traduciendo: "Estamos preparando esta ficha en tu idioma.",
  },
  en: {
    inicio: "Home",
    nombre: "Sibila's Arcanum",
    antetitulo: "Traditions of the world",
    intro: "Every practice has a history, a language and a way of being lived. Here we keep each one: where it comes from, how it is done and what its symbols say.",
    descripcion: "The history, symbols and practice of each tradition: coffee reading, tarot, the egg cleansing, the evil eye and many more.",
    leer: "Read",
    fuentes: "Sources",
    preguntas: "Frequently asked questions",
    nota: "No credit card · Your first reading is free",
    traduciendo: "We're preparing this page in English. In the meantime, here it is in Spanish.",
  },
  pt: {
    inicio: "Início",
    nombre: "O Arcano de Sibila",
    antetitulo: "Tradições do mundo",
    intro: "Cada prática tem uma história, uma linguagem e um jeito de ser vivida. Aqui guardamos a de cada uma: de onde vem, como se faz e o que dizem os seus símbolos.",
    descripcion: "A história, os símbolos e a prática de cada tradição: a leitura do café, o tarô, a limpeza com ovo, o mau-olhado e muito mais.",
    leer: "Ler",
    fuentes: "Fontes",
    preguntas: "Perguntas frequentes",
    nota: "Sem cartão de crédito · Sua primeira leitura é grátis",
    traduciendo: "Estamos preparando esta página em português. Enquanto isso, aqui está em espanhol.",
  },
  fr: {
    inicio: "Accueil",
    nombre: "L'Arcane de Sibila",
    antetitulo: "Traditions du monde",
    intro: "Chaque pratique a une histoire, une langue et une façon d'être vécue. Ici, nous gardons celle de chacune : d'où elle vient, comment elle se fait et ce que disent ses symboles.",
    descripcion: "L'histoire, les symboles et la pratique de chaque tradition : la lecture du café, le tarot, le nettoyage à l'œuf, le mauvais œil et bien d'autres.",
    leer: "Lire",
    fuentes: "Sources",
    preguntas: "Questions fréquentes",
    nota: "Sans carte bancaire · Ta première lecture est gratuite",
    traduciendo: "Nous préparons cette page en français. En attendant, la voici en espagnol.",
  },
  tr: {
    inicio: "Ana sayfa",
    nombre: "Sibila'nın Sırları",
    antetitulo: "Dünyanın gelenekleri",
    intro: "Her pratiğin bir tarihi, bir dili ve yaşanış biçimi var. Burada her birini saklıyoruz: nereden gelir, nasıl yapılır ve sembolleri ne söyler.",
    descripcion: "Her geleneğin tarihi, sembolleri ve uygulanışı: kahve falı, tarot, yumurta ile arınma, nazar ve daha fazlası.",
    leer: "Oku",
    fuentes: "Kaynaklar",
    preguntas: "Sık sorulan sorular",
    nota: "Kredi kartı gerekmez · İlk okuman ücretsiz",
    traduciendo: "Bu sayfayı Türkçe hazırlıyoruz. Bu arada İspanyolcası burada.",
  },
  ar: {
    inicio: "الرئيسية",
    nombre: "أسرار سيبيلا",
    antetitulo: "تقاليد العالم",
    intro: "لكل ممارسة تاريخ ولغة وطريقة تُعاش بها. هنا نحفظ حكاية كل واحدة: من أين جاءت، وكيف تُمارَس، وماذا تقول رموزها.",
    descripcion: "تاريخ كل تقليد ورموزه وطريقة ممارسته: قراءة الفنجان، والتاروت، وتنقية البيضة، والعين، والمزيد.",
    leer: "اقرأ",
    fuentes: "المصادر",
    preguntas: "أسئلة شائعة",
    nota: "بدون بطاقة ائتمان · قراءتك الأولى مجانية",
    traduciendo: "نُعِدّ هذه الصفحة بالعربية. وإلى ذلك الحين، ها هي بالإسبانية.",
  },
  id: {
    inicio: "Beranda",
    nombre: "Rahasia Sibila",
    antetitulo: "Tradisi dunia",
    intro: "Setiap praktik punya sejarah, bahasa, dan cara menjalaninya. Di sini kami menyimpan kisah masing-masing: dari mana asalnya, bagaimana dilakukan, dan apa arti simbol-simbolnya.",
    descripcion: "Sejarah, simbol, dan cara menjalankan setiap tradisi: membaca ampas kopi, tarot, pembersihan dengan telur, mata jahat, dan banyak lagi.",
    leer: "Baca",
    fuentes: "Sumber",
    preguntas: "Pertanyaan yang sering diajukan",
    nota: "Tanpa kartu kredit · Bacaan pertamamu gratis",
    traduciendo: "Kami sedang menyiapkan halaman ini dalam bahasa Indonesia. Sementara itu, ini versi bahasa Spanyolnya.",
  },
  hi: {
    inicio: "होम",
    nombre: "सिबिला के रहस्य",
    antetitulo: "दुनिया की परंपराएँ",
    intro: "हर परंपरा का अपना इतिहास, अपनी भाषा और जीने का अपना तरीका होता है। यहाँ हम हर एक की कहानी सहेजते हैं: वह कहाँ से आई, कैसे की जाती है और उसके प्रतीक क्या कहते हैं।",
    descripcion: "हर परंपरा का इतिहास, प्रतीक और उसे करने का तरीका: कॉफ़ी कप पढ़ना, टैरो, अंडे से शुद्धि, नज़र और बहुत कुछ।",
    leer: "पढ़ें",
    fuentes: "स्रोत",
    preguntas: "अक्सर पूछे जाने वाले सवाल",
    nota: "क्रेडिट कार्ड की ज़रूरत नहीं · आपकी पहली रीडिंग मुफ़्त है",
    traduciendo: "हम यह पेज हिंदी में तैयार कर रहे हैं। तब तक, यह स्पेनिश में है।",
  },
};
