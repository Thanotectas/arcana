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

const C = (numero: number, es: string, en: string, pt: string, fr: string, tr: string, emoji: string, sentido: string): CartaLenormand => ({ id: `l${numero}`, numero, nombre: { es, en, pt, fr, tr }, emoji, sentido });

export const LENORMAND: CartaLenormand[] = [
  C(1, "El Jinete", "Rider", "Cavaleiro", "Le Cavalier", "Atlı", "🏇", "noticias que llegan, una visita, rapidez"),
  C(2, "El Trébol", "Clover", "Trevo", "Le Trèfle", "Yonca", "☘️", "un golpe de suerte breve, oportunidad que hay que tomar ya"),
  C(3, "El Barco", "Ship", "Navio", "Le Bateau", "Gemi", "⛵", "viaje, distancia, comercio, un cambio que se pone en marcha"),
  C(4, "La Casa", "House", "Casa", "La Maison", "Ev", "🏠", "hogar, familia, estabilidad, lo propio"),
  C(5, "El Árbol", "Tree", "Árvore", "L'Arbre", "Ağaç", "🌳", "raíces, crecimiento lento, energía vital y bienestar"),
  C(6, "Las Nubes", "Clouds", "Nuvens", "Les Nuages", "Bulutlar", "☁️", "dudas, confusión pasajera, algo que aún no se ve claro"),
  C(7, "La Serpiente", "Snake", "Serpente", "Le Serpent", "Yılan", "🐍", "complicación, un rodeo; una persona astuta o rival"),
  C(8, "El Ataúd", "Coffin", "Caixão", "Le Cercueil", "Tabut", "⚱️", "cierre, final de una etapa, transformación (nunca muerte literal)"),
  C(9, "El Ramo", "Bouquet", "Buquê", "Le Bouquet", "Buket", "💐", "regalo, alegría, invitación, aprecio"),
  C(10, "La Guadaña", "Scythe", "Foice", "La Faux", "Tırpan", "🌾", "corte repentino, decisión rápida, sorpresa"),
  C(11, "El Látigo", "Whip", "Chicote", "Le Fouet", "Kırbaç", "〰️", "discusión, repetición, tensión, esfuerzo físico"),
  C(12, "Los Pájaros", "Birds", "Pássaros", "Les Oiseaux", "Kuşlar", "🐦", "conversaciones, nervios, llamadas, una pareja que habla"),
  C(13, "El Niño", "Child", "Criança", "L'Enfant", "Çocuk", "🧒", "comienzo, algo nuevo y pequeño, inocencia"),
  C(14, "El Zorro", "Fox", "Raposa", "Le Renard", "Tilki", "🦊", "astucia, trabajo, desconfianza: ojo con quien se acerca"),
  C(15, "El Oso", "Bear", "Urso", "L'Ours", "Ayı", "🐻", "fuerza, protección, una figura poderosa, dinero"),
  C(16, "Las Estrellas", "Stars", "Estrelas", "L'Étoile", "Yıldız", "✨", "esperanza, claridad, deseos que se cumplen"),
  C(17, "La Cigüeña", "Stork", "Cegonha", "La Cigogne", "Leylek", "🕊️", "cambio para mejor, mudanza, renovación"),
  C(18, "El Perro", "Dog", "Cachorro", "Le Chien", "Köpek", "🐕", "amistad leal, apoyo, alguien de confianza"),
  C(19, "La Torre", "Tower", "Torre", "La Tour", "Kule", "🗼", "instituciones, empresa, soledad, mirar desde arriba"),
  C(20, "El Jardín", "Garden", "Jardim", "Le Jardin", "Bahçe", "🌷", "vida social, eventos, público, redes"),
  C(21, "La Montaña", "Mountain", "Montanha", "La Montagne", "Dağ", "⛰️", "obstáculo, demora, algo que pide paciencia"),
  C(22, "Los Caminos", "Crossroads", "Caminhos", "Les Chemins", "Yollar", "🔀", "decisión, opciones, bifurcación"),
  C(23, "Los Ratones", "Mice", "Ratos", "Les Souris", "Fareler", "🐭", "desgaste, pérdida pequeña, estrés que roe"),
  C(24, "El Corazón", "Heart", "Coração", "Le Cœur", "Kalp", "❤️", "amor, afecto, lo que se quiere de verdad"),
  C(25, "El Anillo", "Ring", "Anel", "La Bague", "Yüzük", "💍", "compromiso, contrato, un ciclo que se repite"),
  C(26, "El Libro", "Book", "Livro", "Le Livre", "Kitap", "📖", "secreto, estudio, algo que aún no se sabe"),
  C(27, "La Carta", "Letter", "Carta", "La Lettre", "Mektup", "✉️", "mensaje, documento, papeles"),
  C(28, "El Hombre", "Man", "Homem", "L'Homme", "Adam", "👨", "un hombre importante en la consulta (o el consultante)"),
  C(29, "La Mujer", "Woman", "Mulher", "La Femme", "Kadın", "👩", "una mujer importante en la consulta (o la consultante)"),
  C(30, "Los Lirios", "Lilies", "Lírios", "Les Lys", "Zambaklar", "⚜️", "paz, madurez, armonía familiar, sensualidad serena"),
  C(31, "El Sol", "Sun", "Sol", "Le Soleil", "Güneş", "☀️", "éxito, energía, gran suerte, todo sale a la luz"),
  C(32, "La Luna", "Moon", "Lua", "La Lune", "Ay", "🌙", "emociones, reconocimiento, intuición, fama"),
  C(33, "La Llave", "Key", "Chave", "La Clé", "Anahtar", "🗝️", "solución, certeza, una puerta que se abre"),
  C(34, "Los Peces", "Fish", "Peixes", "Les Poissons", "Balıklar", "🐟", "dinero, abundancia, negocios"),
  C(35, "El Ancla", "Anchor", "Âncora", "L'Ancre", "Çapa", "⚓", "estabilidad, trabajo seguro, perseverancia"),
  C(36, "La Cruz", "Cross", "Cruz", "La Croix", "Haç", "✝️", "una carga o prueba que da sentido; fe, destino"),
];

/** Cartas con ilustración en public/cartas/lenormand/<id>.webp (500×600). Al sumar archivos, ampliar el rango. */
export const LENORMAND_CON_IMAGEN = new Set(Array.from({ length: 36 }, (_, i) => `l${i + 1}`));

export function cartaLenormand(id: string) {
  return LENORMAND.find((c) => c.id === id);
}

export const TIRADAS_LENORMAND: TiradaOraculo[] = [
  {
    id: "tres",
    nombre: { es: "Frase de tres", en: "Three-card line", pt: "Frase de três", fr: "Phrase de trois", tr: "Üç kartlık cümle" },
    descripcion: { es: "Tres cartas que se leen como una frase: la respuesta corta y concreta.", en: "Three cards read as a sentence: a short, concrete answer.", pt: "Três cartas lidas como uma frase: a resposta curta e concreta.", fr: "Trois cartes qui se lisent comme une phrase : la réponse courte et concrète.", tr: "Bir cümle gibi okunan üç kart: kısa ve net cevap." },
    posiciones: [
      { nombre: { es: "El tema", en: "The topic", pt: "O tema", fr: "Le sujet", tr: "Konu" }, sentido: "de qué trata la respuesta" },
      { nombre: { es: "El centro", en: "The core", pt: "O centro", fr: "Le centre", tr: "Merkez" }, sentido: "lo que matiza el tema" },
      { nombre: { es: "El desenlace", en: "The outcome", pt: "O desfecho", fr: "Le dénouement", tr: "Sonuç" }, sentido: "cómo termina" },
    ],
  },
  {
    id: "cinco",
    nombre: { es: "Línea de cinco", en: "Five-card line", pt: "Linha de cinco", fr: "Ligne de cinq", tr: "Beş kartlık dizi" },
    descripcion: { es: "Cinco cartas: de dónde viene, el corazón del asunto y hacia dónde va.", en: "Five cards: where it comes from, the heart of the matter and where it goes.", pt: "Cinco cartas: de onde vem, o coração do assunto e para onde vai.", fr: "Cinq cartes : d'où ça vient, le cœur du sujet et où ça va.", tr: "Beş kart: nereden geldiği, meselenin özü ve nereye gittiği." },
    posiciones: [
      { nombre: { es: "El origen", en: "The origin", pt: "A origem", fr: "L'origine", tr: "Köken" }, sentido: "el pasado del asunto" },
      { nombre: { es: "Lo reciente", en: "Recent", pt: "O recente", fr: "Le passé récent", tr: "Yakın geçmiş" }, sentido: "lo que acaba de pasar" },
      { nombre: { es: "El corazón", en: "The heart", pt: "O coração", fr: "Le cœur", tr: "Öz" }, sentido: "el centro de la situación" },
      { nombre: { es: "Lo próximo", en: "Next", pt: "O próximo", fr: "Ce qui suit", tr: "Sıradaki" }, sentido: "lo que viene enseguida" },
      { nombre: { es: "El desenlace", en: "The outcome", pt: "O desfecho", fr: "Le dénouement", tr: "Sonuç" }, sentido: "cómo se resuelve" },
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
