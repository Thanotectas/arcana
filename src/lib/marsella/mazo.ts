import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Los 22 arcanos mayores del Tarot de Marsella para el «tirage en croix» de la cartomancia francesa.
 * Numeración de Marsella (no la de Rider-Waite): La Justice es la VIII y La Force la XI. Le Mat no lleva número
 * (cuenta 0 en la suma de la tirada) y el arcano XIII no lleva nombre en la lámina.
 * Módulo puro: sirve en el servidor y en el cliente.
 */
export interface ArcanoMarsella {
  id: string;
  /** Número de la lámina; 0 = Le Mat, que en el mazo no lleva número. */
  numero: number;
  /** Nombre grabado en la cartela inferior de la lámina (vacío en el arcano XIII, que no tiene nombre). */
  cartela: string;
  nombre: Record<Idioma, string>;
  /** Sentido en la cartomancia francesa clásica (va al modelo, en español). */
  sentido: string;
  /** Lo que se ve en la lámina, para la lectura simbólica y visual (va al modelo, en español). */
  imagen: string;
  /** Ilustración propia de Arcana (estilo Marsella, sin textos) en public/cartas/marsella/<ilustracion>.webp. */
  ilustracion: string;
}

export const ARCANOS_MARSELLA: readonly ArcanoMarsella[] = [
  {
    id: "le-bateleur",
    numero: 1,
    cartela: "LE BATELEUR",
    nombre: { fr: "Le Bateleur", es: "El Mago (Le Bateleur)", en: "The Magician (Le Bateleur)", pt: "O Mago (Le Bateleur)", tr: "Hokkabaz (Le Bateleur)", ar: "الساحر", id: "The Magician (Le Bateleur)", hi: "द मैजिशियन (ल बातलर)" },
    sentido: "Comienzo, iniciativa, habilidad, un proyecto que arranca, la juventud de una situación; tener las herramientas sobre la mesa.",
    imagen: "Un joven de pie tras una mesa con objetos (cubiletes, dados, un cuchillo, una bolsa); sostiene una varita y una moneda; sombrero en forma de ocho tumbado.",
    ilustracion: "el-mago",
  },
  {
    id: "la-papesse",
    numero: 2,
    cartela: "LA PAPESSE",
    nombre: { fr: "La Papesse", es: "La Papisa", en: "The Popess", pt: "A Papisa", tr: "Kadın Papa (La Papesse)", ar: "الكاهنة", id: "The Popess (La Papesse)", hi: "द पोपेस (ला पापेस)" },
    sentido: "Conocimiento, discreción, paciencia, estudio, secreto bien guardado, una mujer sabia; lo que madura en silencio.",
    imagen: "Una mujer sentada con tiara y velo, un libro abierto sobre las rodillas, una cortina detrás; mira de lado.",
    ilustracion: "la-sacerdotisa",
  },
  {
    id: "l-imperatrice",
    numero: 3,
    cartela: "L'IMPÉRATRICE",
    nombre: { fr: "L'Impératrice", es: "La Emperatriz", en: "The Empress", pt: "A Imperatriz", tr: "İmparatoriçe", ar: "الإمبراطورة", id: "The Empress", hi: "द एम्प्रेस" },
    sentido: "Inteligencia, comunicación, fecundidad, elegancia, una buena noticia escrita, éxito que crece; la creatividad en acción.",
    imagen: "Una mujer coronada, de frente, sentada en un trono con alas detrás; cetro en una mano y escudo con un águila en la otra.",
    ilustracion: "la-emperatriz",
  },
  {
    id: "l-empereur",
    numero: 4,
    cartela: "L'EMPEREUR",
    nombre: { fr: "L'Empereur", es: "El Emperador", en: "The Emperor", pt: "O Imperador", tr: "İmparator", ar: "الإمبراطور", id: "The Emperor", hi: "द एम्परर" },
    sentido: "Estabilidad, protección, lo concreto y material, autoridad, construir sobre bases firmes.",
    imagen: "Un hombre coronado de perfil, sentado o apoyado en un trono, piernas cruzadas en forma de cuatro, cetro en la mano y escudo con águila a sus pies.",
    ilustracion: "el-emperador",
  },
  {
    id: "le-pape",
    numero: 5,
    cartela: "LE PAPE",
    nombre: { fr: "Le Pape", es: "El Papa", en: "The Pope", pt: "O Papa", tr: "Papa (Le Pape)", ar: "البابا", id: "The Pope (Le Pape)", hi: "द पोप (ल पाप)" },
    sentido: "Consejo, enseñanza, compromiso, mediación, una persona de confianza, la palabra dada; unión formal.",
    imagen: "Un hombre con tiara de tres coronas, sentado entre dos columnas, bendice con la mano a dos discípulos de espaldas.",
    ilustracion: "el-sumo-sacerdote",
  },
  {
    id: "l-amoureux",
    numero: 6,
    cartela: "L'AMOUREUX",
    nombre: { fr: "L'Amoureux", es: "El Enamorado", en: "The Lover", pt: "O Enamorado", tr: "Âşık (L'Amoureux)", ar: "العاشق", id: "The Lover (L'Amoureux)", hi: "द लवर (लामूरो)" },
    sentido: "Elección, sentimientos, deseo, dudas del corazón, una unión posible; decidir con el corazón y no solo con la cabeza.",
    imagen: "Un joven entre dos mujeres que lo solicitan; arriba, un pequeño Cupido con un arco apunta su flecha desde un sol.",
    ilustracion: "los-enamorados",
  },
  {
    id: "le-chariot",
    numero: 7,
    cartela: "LE CHARIOT",
    nombre: { fr: "Le Chariot", es: "El Carro", en: "The Chariot", pt: "O Carro", tr: "Savaş Arabası", ar: "العربة", id: "The Chariot", hi: "द चैरियट" },
    sentido: "Avance, victoria, voluntad, un viaje o un desplazamiento, éxito obtenido por mérito propio.",
    imagen: "Un joven coronado de pie en un carro bajo un dosel, tirado por dos caballos de frente que miran en direcciones distintas.",
    ilustracion: "el-carro",
  },
  {
    id: "la-justice",
    numero: 8,
    cartela: "LA JUSTICE",
    nombre: { fr: "La Justice", es: "La Justicia", en: "Justice", pt: "A Justiça", tr: "Adalet", ar: "العدالة", id: "Justice", hi: "जस्टिस" },
    sentido: "Equilibrio, decisión justa, contratos, trámites, rigor, recibir lo que corresponde; poner las cosas en su sitio.",
    imagen: "Una mujer coronada, sentada de frente, con una espada alzada en una mano y una balanza en la otra.",
    ilustracion: "la-justicia",
  },
  {
    id: "l-hermite",
    numero: 9,
    cartela: "L'HERMITE",
    nombre: { fr: "L'Hermite", es: "El Ermitaño", en: "The Hermit", pt: "O Eremita", tr: "Ermiş", ar: "الناسك", id: "The Hermit", hi: "द हर्मिट" },
    sentido: "Prudencia, tiempo, búsqueda interior, sabiduría, paciencia; avanzar despacio pero con luz propia.",
    imagen: "Un anciano con capa y capucha, apoyado en un bastón, sostiene en alto una linterna; camina mirando hacia atrás.",
    ilustracion: "el-ermitano",
  },
  {
    id: "la-roue-de-fortune",
    numero: 10,
    cartela: "LA ROUE DE FORTUNE",
    nombre: { fr: "La Roue de Fortune", es: "La Rueda de la Fortuna", en: "Wheel of Fortune", pt: "A Roda da Fortuna", tr: "Kader Çarkı", ar: "عجلة الحظ", id: "Wheel of Fortune", hi: "व्हील ऑफ़ फ़ॉर्च्यून" },
    sentido: "Ciclo, cambio de rumbo, oportunidad, movimiento; algo se pone en marcha y hay que acompañarlo.",
    imagen: "Una rueda con manivela; un animal sube, otro baja y una esfinge coronada con espada espera arriba.",
    ilustracion: "la-rueda-de-la-fortuna",
  },
  {
    id: "la-force",
    numero: 11,
    cartela: "LA FORCE",
    nombre: { fr: "La Force", es: "La Fuerza", en: "Strength", pt: "A Força", tr: "Güç", ar: "القوة", id: "Strength", hi: "स्ट्रेंथ" },
    sentido: "Dominio de sí, valentía serena, energía, control de los impulsos; la suavidad que vence a la fuerza bruta.",
    imagen: "Una mujer con sombrero en forma de ocho tumbado abre sin esfuerzo las fauces de un león.",
    ilustracion: "la-fuerza",
  },
  {
    id: "le-pendu",
    numero: 12,
    cartela: "LE PENDU",
    nombre: { fr: "Le Pendu", es: "El Colgado", en: "The Hanged Man", pt: "O Enforcado", tr: "Asılan Adam", ar: "المعلَّق", id: "The Hanged Man", hi: "द हैंग्ड मैन" },
    sentido: "Pausa, espera fecunda, mirar las cosas de otra manera, soltar, un sacrificio que luego da fruto.",
    imagen: "Un joven colgado de un pie entre dos árboles podados, las manos a la espalda, el rostro tranquilo.",
    ilustracion: "el-colgado",
  },
  {
    id: "l-arcane-sans-nom",
    numero: 13,
    cartela: "",
    nombre: { fr: "L'Arcane sans nom", es: "El Arcano sin nombre", en: "The Nameless Arcanum", pt: "O Arcano sem nome", tr: "İsimsiz Arkana", ar: "الورقة التي بلا اسم", id: "Arkana Tanpa Nama", hi: "बिना नाम का आर्काना" },
    sentido: "Transformación profunda, poda, fin de una etapa para que empiece otra, renovación; despejar el terreno. Nunca es muerte física.",
    imagen: "Un esqueleto siega con una guadaña un suelo oscuro donde brotan manos, pies y cabezas: la siega que prepara la nueva cosecha. La lámina no lleva nombre.",
    ilustracion: "la-muerte",
  },
  {
    id: "temperance",
    numero: 14,
    cartela: "TEMPÉRANCE",
    nombre: { fr: "Tempérance", es: "La Templanza", en: "Temperance", pt: "A Temperança", tr: "Denge", ar: "الاعتدال", id: "Temperance", hi: "टेम्परेंस" },
    sentido: "Armonía, conciliación, paciencia, buena energía, protección; mezclar con calma lo que estaba separado.",
    imagen: "Un ángel con alas trasvasa un líquido de un jarrón a otro, de pie, con una flor en la frente.",
    ilustracion: "la-templanza",
  },
  {
    id: "le-diable",
    numero: 15,
    cartela: "LE DIABLE",
    nombre: { fr: "Le Diable", es: "El Diablo", en: "The Devil", pt: "O Diabo", tr: "Şeytan", ar: "الشيطان", id: "The Devil", hi: "द डेविल" },
    sentido: "Deseo, pasión, atracción, poder material y creatividad; también ataduras que conviene mirar de frente. Las cuerdas de la lámina están flojas: se pueden soltar.",
    imagen: "Una figura con alas de murciélago y antorcha sobre un pedestal; dos pequeños diablillos atados con cuerdas flojas.",
    ilustracion: "el-diablo",
  },
  {
    id: "la-maison-dieu",
    numero: 16,
    cartela: "LA MAISON DIEU",
    nombre: { fr: "La Maison Dieu", es: "La Casa de Dios", en: "The House of God", pt: "A Casa de Deus", tr: "Kule (La Maison Dieu)", ar: "البرج", id: "The Tower (La Maison Dieu)", hi: "द टावर (ला मेज़ों द्यो)" },
    sentido: "Liberación, apertura, algo que encerraba se abre y deja entrar aire, una revelación, una alegría repentina; romper un molde. Nunca catástrofe.",
    imagen: "Una torre cuya corona se abre bajo un penacho de llamas y luz; dos figuras caen o salen a tierra entre una lluvia de bolitas de colores.",
    ilustracion: "la-torre",
  },
  {
    id: "l-etoile",
    numero: 17,
    cartela: "L'ÉTOILE",
    nombre: { fr: "L'Étoile", es: "La Estrella", en: "The Star", pt: "A Estrela", tr: "Yıldız", ar: "النجمة", id: "The Star", hi: "द स्टार" },
    sentido: "Esperanza, inspiración, generosidad, protección, encontrar su lugar; dar y recibir sin cálculo.",
    imagen: "Una mujer desnuda arrodillada vierte agua de dos jarras en un río y en la tierra, bajo una gran estrella y siete más pequeñas; un pájaro en un árbol.",
    ilustracion: "la-estrella",
  },
  {
    id: "la-lune",
    numero: 18,
    cartela: "LA LUNE",
    nombre: { fr: "La Lune", es: "La Luna", en: "The Moon", pt: "A Lua", tr: "Ay", ar: "القمر", id: "The Moon", hi: "द मून" },
    sentido: "Intuición, imaginación, sensibilidad, sueños, lo que todavía no se dice; la madre, el hogar, lo íntimo. Invita a fiarse del instinto y esperar a ver claro.",
    imagen: "Una luna de perfil con rostro derrama gotas; dos perros le aúllan entre dos torres; un cangrejo sale de un estanque.",
    ilustracion: "la-luna",
  },
  {
    id: "le-soleil",
    numero: 19,
    cartela: "LE SOLEIL",
    nombre: { fr: "Le Soleil", es: "El Sol", en: "The Sun", pt: "O Sol", tr: "Güneş", ar: "الشمس", id: "The Sun", hi: "द सन" },
    sentido: "Éxito, claridad, alegría, fraternidad, unión feliz, construir juntos; todo sale a la luz.",
    imagen: "Un gran sol con rostro irradia rayos y gotas sobre dos niños que se abrazan delante de un muro.",
    ilustracion: "el-sol",
  },
  {
    id: "le-jugement",
    numero: 20,
    cartela: "LE JUGEMENT",
    nombre: { fr: "Le Jugement", es: "El Juicio", en: "Judgement", pt: "O Julgamento", tr: "Mahkeme", ar: "الحكم", id: "Judgement", hi: "जजमेंट" },
    sentido: "Renacimiento, una llamada, una buena noticia, despertar, una nueva conciencia; algo que se creía cerrado vuelve a la vida.",
    imagen: "Un ángel entre nubes toca una trompeta con estandarte; abajo, tres figuras se levantan de una tumba con las manos juntas.",
    ilustracion: "el-juicio",
  },
  {
    id: "le-monde",
    numero: 21,
    cartela: "LE MONDE",
    nombre: { fr: "Le Monde", es: "El Mundo", en: "The World", pt: "O Mundo", tr: "Dünya", ar: "العالم", id: "The World", hi: "द वर्ल्ड" },
    sentido: "Realización, logro completo, plenitud, reconocimiento, un viaje lejano; el éxito que se ve.",
    imagen: "Una figura danzante dentro de una guirnalda ovalada, rodeada por un ángel, un águila, un león y un buey.",
    ilustracion: "el-mundo",
  },
  {
    id: "le-mat",
    numero: 0,
    cartela: "LE MAT",
    nombre: { fr: "Le Mat", es: "El Loco (Le Mat)", en: "The Fool (Le Mat)", pt: "O Louco (Le Mat)", tr: "Deli (Le Mat)", ar: "الأحمق", id: "The Fool (Le Mat)", hi: "द फ़ूल (ल मा)" },
    sentido: "Libertad, impulso, viaje, lo imprevisto, energía que busca dirección; ir hacia adelante sin equipaje pesado.",
    imagen: "Un viajero con gorro de bufón y hatillo al hombro camina con su bastón; un perro le tira del pantalón.",
    ilustracion: "el-loco",
  },
];

const POR_ID = new Map(ARCANOS_MARSELLA.map((a) => [a.id, a]));
const POR_NUMERO = new Map(ARCANOS_MARSELLA.map((a) => [a.numero, a]));

export function arcanoMarsella(id: unknown): ArcanoMarsella | undefined {
  return typeof id === "string" ? POR_ID.get(id) : undefined;
}

/** Arcano por su número de Marsella (0 = Le Mat). */
export function arcanoPorNumero(numero: number): ArcanoMarsella | undefined {
  return POR_NUMERO.get(numero);
}

/**
 * Cifra romana tal como se graba en los mazos de Marsella: forma aditiva (IIII, VIIII, XIIII, XVIIII), sin restas.
 * Le Mat no lleva número: devuelve "".
 */
export function romanoMarsella(numero: number): string {
  if (!Number.isInteger(numero) || numero <= 0) return "";
  const resto = numero % 10;
  return "X".repeat(Math.floor(numero / 10)) + (resto < 5 ? "I".repeat(resto) : "V" + "I".repeat(resto - 5));
}

export function nombreArcano(id: unknown, idioma: Idioma): string {
  return arcanoMarsella(id)?.nombre[idioma] ?? String(id ?? "");
}
