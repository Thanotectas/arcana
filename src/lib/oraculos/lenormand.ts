import { datoDeUsuario } from "../seguridad";
import type { Texto, TiradaOraculo, PiezaSacada } from "./comun";

/**
 * Petit Lenormand: 36 cartas de imágenes sencillas que se leen en parejas y
 * en frases, muy concretas para el día a día. No se leen invertidas.
 */
export interface CartaLenormand {
  id: string;
  numero: number;
  nombre: Texto;
  emoji: string;
  sentido: string;
}

const C = (numero: number, es: string, en: string, pt: string, fr: string, tr: string, ar: string, id: string, hi: string, emoji: string, sentido: string): CartaLenormand => ({ id: `l${numero}`, numero, nombre: { es, en, pt, fr, tr, ar, id, hi }, emoji, sentido });

export const LENORMAND: CartaLenormand[] = [
  C(1, "El Jinete", "Rider", "Cavaleiro", "Le Cavalier", "Atlı", "الفارس", "Penunggang", "घुड़सवार", "🏇", "noticias que llegan, una visita, rapidez"),
  C(2, "El Trébol", "Clover", "Trevo", "Le Trèfle", "Yonca", "البرسيم", "Semanggi", "तिपतिया घास", "☘️", "un golpe de suerte breve, oportunidad que hay que tomar ya"),
  C(3, "El Barco", "Ship", "Navio", "Le Bateau", "Gemi", "السفينة", "Kapal", "जहाज़", "⛵", "viaje, distancia, comercio, un cambio que se pone en marcha"),
  C(4, "La Casa", "House", "Casa", "La Maison", "Ev", "البيت", "Rumah", "घर", "🏠", "hogar, familia, estabilidad, lo propio"),
  C(5, "El Árbol", "Tree", "Árvore", "L'Arbre", "Ağaç", "الشجرة", "Pohon", "पेड़", "🌳", "raíces, crecimiento lento, energía vital y bienestar"),
  C(6, "Las Nubes", "Clouds", "Nuvens", "Les Nuages", "Bulutlar", "الغيوم", "Awan", "बादल", "☁️", "dudas, confusión pasajera, algo que aún no se ve claro"),
  C(7, "La Serpiente", "Snake", "Serpente", "Le Serpent", "Yılan", "الأفعى", "Ular", "साँप", "🐍", "complicación, un rodeo; una persona astuta o rival"),
  C(8, "El Ataúd", "Coffin", "Caixão", "Le Cercueil", "Tabut", "التابوت", "Peti Mati", "ताबूत", "⚱️", "cierre, final de una etapa, transformación (nunca muerte literal)"),
  C(9, "El Ramo", "Bouquet", "Buquê", "Le Bouquet", "Buket", "الباقة", "Buket", "गुलदस्ता", "💐", "regalo, alegría, invitación, aprecio"),
  C(10, "La Guadaña", "Scythe", "Foice", "La Faux", "Tırpan", "المنجل", "Sabit", "हँसिया", "🌾", "corte repentino, decisión rápida, sorpresa"),
  C(11, "El Látigo", "Whip", "Chicote", "Le Fouet", "Kırbaç", "السوط", "Cambuk", "चाबुक", "〰️", "discusión, repetición, tensión, esfuerzo físico"),
  C(12, "Los Pájaros", "Birds", "Pássaros", "Les Oiseaux", "Kuşlar", "الطيور", "Burung", "पक्षी", "🐦", "conversaciones, nervios, llamadas, una pareja que habla"),
  C(13, "El Niño", "Child", "Criança", "L'Enfant", "Çocuk", "الطفل", "Anak", "बच्चा", "🧒", "comienzo, algo nuevo y pequeño, inocencia"),
  C(14, "El Zorro", "Fox", "Raposa", "Le Renard", "Tilki", "الثعلب", "Rubah", "लोमड़ी", "🦊", "astucia, trabajo, desconfianza: ojo con quien se acerca"),
  C(15, "El Oso", "Bear", "Urso", "L'Ours", "Ayı", "الدب", "Beruang", "भालू", "🐻", "fuerza, protección, una figura poderosa, dinero"),
  C(16, "Las Estrellas", "Stars", "Estrelas", "L'Étoile", "Yıldız", "النجمة", "Bintang", "तारा", "✨", "esperanza, claridad, deseos que se cumplen"),
  C(17, "La Cigüeña", "Stork", "Cegonha", "La Cigogne", "Leylek", "اللقلق", "Bangau", "सारस", "🕊️", "cambio para mejor, mudanza, renovación"),
  C(18, "El Perro", "Dog", "Cachorro", "Le Chien", "Köpek", "الكلب", "Anjing", "कुत्ता", "🐕", "amistad leal, apoyo, alguien de confianza"),
  C(19, "La Torre", "Tower", "Torre", "La Tour", "Kule", "البرج", "Menara", "मीनार", "🗼", "instituciones, empresa, soledad, mirar desde arriba"),
  C(20, "El Jardín", "Garden", "Jardim", "Le Jardin", "Bahçe", "الحديقة", "Taman", "बगीचा", "🌷", "vida social, eventos, público, redes"),
  C(21, "La Montaña", "Mountain", "Montanha", "La Montagne", "Dağ", "الجبل", "Gunung", "पहाड़", "⛰️", "obstáculo, demora, algo que pide paciencia"),
  C(22, "Los Caminos", "Crossroads", "Caminhos", "Les Chemins", "Yollar", "الطرق", "Persimpangan", "रास्ते", "🔀", "decisión, opciones, bifurcación"),
  C(23, "Los Ratones", "Mice", "Ratos", "Les Souris", "Fareler", "الفئران", "Tikus", "चूहे", "🐭", "desgaste, pérdida pequeña, estrés que roe"),
  C(24, "El Corazón", "Heart", "Coração", "Le Cœur", "Kalp", "القلب", "Hati", "दिल", "❤️", "amor, afecto, lo que se quiere de verdad"),
  C(25, "El Anillo", "Ring", "Anel", "La Bague", "Yüzük", "الخاتم", "Cincin", "अंगूठी", "💍", "compromiso, contrato, un ciclo que se repite"),
  C(26, "El Libro", "Book", "Livro", "Le Livre", "Kitap", "الكتاب", "Buku", "किताब", "📖", "secreto, estudio, algo que aún no se sabe"),
  C(27, "La Carta", "Letter", "Carta", "La Lettre", "Mektup", "الرسالة", "Surat", "चिट्ठी", "✉️", "mensaje, documento, papeles"),
  C(28, "El Hombre", "Man", "Homem", "L'Homme", "Adam", "الرجل", "Pria", "पुरुष", "👨", "un hombre importante en la consulta (o el consultante)"),
  C(29, "La Mujer", "Woman", "Mulher", "La Femme", "Kadın", "المرأة", "Wanita", "स्त्री", "👩", "una mujer importante en la consulta (o la consultante)"),
  C(30, "Los Lirios", "Lilies", "Lírios", "Les Lys", "Zambaklar", "الزنابق", "Bunga Lili", "कुमुदिनी", "⚜️", "paz, madurez, armonía familiar, sensualidad serena"),
  C(31, "El Sol", "Sun", "Sol", "Le Soleil", "Güneş", "الشمس", "Matahari", "सूरज", "☀️", "éxito, energía, gran suerte, todo sale a la luz"),
  C(32, "La Luna", "Moon", "Lua", "La Lune", "Ay", "القمر", "Bulan", "चाँद", "🌙", "emociones, reconocimiento, intuición, fama"),
  C(33, "La Llave", "Key", "Chave", "La Clé", "Anahtar", "المفتاح", "Kunci", "चाबी", "🗝️", "solución, certeza, una puerta que se abre"),
  C(34, "Los Peces", "Fish", "Peixes", "Les Poissons", "Balıklar", "الأسماك", "Ikan", "मछलियाँ", "🐟", "dinero, abundancia, negocios"),
  C(35, "El Ancla", "Anchor", "Âncora", "L'Ancre", "Çapa", "المرساة", "Jangkar", "लंगर", "⚓", "estabilidad, trabajo seguro, perseverancia"),
  C(36, "La Cruz", "Cross", "Cruz", "La Croix", "Haç", "الصليب", "Salib", "क्रॉस", "✝️", "una carga o prueba que da sentido; fe, destino"),
];

/** Cartas con ilustración en public/cartas/lenormand/<id>.webp (500×600). Al sumar archivos, ampliar el rango. */
export const LENORMAND_CON_IMAGEN = new Set(Array.from({ length: 36 }, (_, i) => `l${i + 1}`));

export function cartaLenormand(id: string) {
  return LENORMAND.find((c) => c.id === id);
}

export const TIRADAS_LENORMAND: TiradaOraculo[] = [
  {
    id: "tres",
    nombre: { es: "Frase de tres", en: "Three-card line", pt: "Frase de três", fr: "Phrase de trois", tr: "Üç kartlık cümle", ar: "جملة من ثلاث أوراق", id: "Kalimat tiga kartu", hi: "तीन पत्तों का वाक्य" },
    descripcion: { es: "Tres cartas que se leen como una frase: la respuesta corta y concreta.", en: "Three cards read as a sentence: a short, concrete answer.", pt: "Três cartas lidas como uma frase: a resposta curta e concreta.", fr: "Trois cartes qui se lisent comme une phrase : la réponse courte et concrète.", tr: "Bir cümle gibi okunan üç kart: kısa ve net cevap.", ar: "ثلاث أوراق تُقرأ كجملة واحدة: إجابة قصيرة وواضحة.", id: "Tiga kartu yang dibaca seperti satu kalimat: jawaban singkat dan jelas.", hi: "तीन पत्ते जो एक वाक्य की तरह पढ़े जाते हैं: छोटा और साफ़ उत्तर।" },
    posiciones: [
      { nombre: { es: "El tema", en: "The topic", pt: "O tema", fr: "Le sujet", tr: "Konu", ar: "الموضوع", id: "Topik", hi: "विषय" }, sentido: "de qué trata la respuesta" },
      { nombre: { es: "El centro", en: "The core", pt: "O centro", fr: "Le centre", tr: "Merkez", ar: "المركز", id: "Inti", hi: "केंद्र" }, sentido: "lo que matiza el tema" },
      { nombre: { es: "El desenlace", en: "The outcome", pt: "O desfecho", fr: "Le dénouement", tr: "Sonuç", ar: "الخاتمة", id: "Hasil akhir", hi: "परिणाम" }, sentido: "cómo termina" },
    ],
  },
  {
    id: "cinco",
    nombre: { es: "Línea de cinco", en: "Five-card line", pt: "Linha de cinco", fr: "Ligne de cinq", tr: "Beş kartlık dizi", ar: "خط من خمس أوراق", id: "Barisan lima kartu", hi: "पाँच पत्तों की पंक्ति" },
    descripcion: { es: "Cinco cartas: de dónde viene, el corazón del asunto y hacia dónde va.", en: "Five cards: where it comes from, the heart of the matter and where it goes.", pt: "Cinco cartas: de onde vem, o coração do assunto e para onde vai.", fr: "Cinq cartes : d'où ça vient, le cœur du sujet et où ça va.", tr: "Beş kart: nereden geldiği, meselenin özü ve nereye gittiği.", ar: "خمس أوراق: من أين يأتي الأمر، وقلب المسألة، وإلى أين يتجه.", id: "Lima kartu: dari mana asalnya, inti persoalan, dan ke mana arahnya.", hi: "पाँच पत्ते: बात कहाँ से आई, मामले का मूल और यह किस ओर जा रही है।" },
    posiciones: [
      { nombre: { es: "El origen", en: "The origin", pt: "A origem", fr: "L'origine", tr: "Köken", ar: "الأصل", id: "Asal-usul", hi: "उद्गम" }, sentido: "el pasado del asunto" },
      { nombre: { es: "Lo reciente", en: "Recent", pt: "O recente", fr: "Le passé récent", tr: "Yakın geçmiş", ar: "الماضي القريب", id: "Yang baru terjadi", hi: "हाल का समय" }, sentido: "lo que acaba de pasar" },
      { nombre: { es: "El corazón", en: "The heart", pt: "O coração", fr: "Le cœur", tr: "Öz", ar: "القلب", id: "Jantung persoalan", hi: "हृदय" }, sentido: "el centro de la situación" },
      { nombre: { es: "Lo próximo", en: "Next", pt: "O próximo", fr: "Ce qui suit", tr: "Sıradaki", ar: "ما يلي", id: "Berikutnya", hi: "आगे क्या" }, sentido: "lo que viene enseguida" },
      { nombre: { es: "El desenlace", en: "The outcome", pt: "O desfecho", fr: "Le dénouement", tr: "Sonuç", ar: "الخاتمة", id: "Hasil akhir", hi: "परिणाम" }, sentido: "cómo se resuelve" },
    ],
  },
];

export function resumenLenormand(tirada: TiradaOraculo, piezas: PiezaSacada[], pregunta: string) {
  const lineas = [`Tirada: ${tirada.nombre.es} (Petit Lenormand, 36 cartas).`];
  const p = datoDeUsuario(pregunta, 300);
  if (p) lineas.push(`Pregunta de la persona: ${p}`);
  for (const pieza of piezas) {
    const c = cartaLenormand(pieza.id);
    const pos = tirada.posiciones[pieza.posicion];
    if (c && pos) lineas.push(`- ${pos.nombre.es} (${pos.sentido}): ${c.numero}. ${c.nombre.es}: ${c.sentido}.`);
  }
  return lineas.join("\n");
}

export const TRADICION_LENORMAND =
  "Petit Lenormand: las cartas se leen en parejas y en frase, de izquierda a derecha; la primera carta es el sujeto y la siguiente lo matiza como un adjetivo (Corazón + Anillo = compromiso amoroso; Barco + Peces = negocio que viene de lejos; Nubes + Sol = la confusión se aclara). " +
  "Es un oráculo concreto y práctico: habla de hechos, personas y plazos cortos, no de psicología. Las cartas 'difíciles' (Serpiente, Ataúd, Guadaña, Látigo, Ratones, Montaña, Cruz) se leen como retos o cierres, nunca como desgracias literales; el Ataúd no es muerte. " +
  "Si aparece el Hombre o la Mujer, ubica a la persona consultante o a alguien clave y lee lo que tiene cerca. Responde con claridad: primero la frase que forman las cartas, luego el detalle.";
