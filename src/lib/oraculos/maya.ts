import { datoDeUsuario } from "../seguridad";
import type { Texto } from "./comun";

/**
 * Calendario maya a partir de la fecha de nacimiento:
 * - el kin del Tzolkin según el Encantamiento del Sueño (el "kin maya" que
 *   la gente busca: sello solar, tono galáctico y oráculo), y
 * - el nawal de la cuenta tradicional k'iche' (correlación GMT 584283).
 */
export type ColorMaya = "rojo" | "blanco" | "azul" | "amarillo";

export interface Sello {
  numero: number; // 1..20
  nombre: Texto;
  color: ColorMaya;
  accion: string;
  poder: string;
  esencia: string;
  /** Concordancia en español y portugués: "Noche Cósmica Azul". */
  femenino: boolean;
  /** Concordancia en francés (no siempre coincide: Serpent y Aigle son masculinos): "Nuit Cosmique Bleue". */
  femeninoFr: boolean;
  /** Concordancia en árabe (الريح، الأرض، الشمس… son femeninos; الليل y القمر, masculinos): "العاصفة الكونية الزرقاء". */
  femeninoAr: boolean;
  /** En hindi solo concuerdan los colores en -ā (नीला → नीली): "नीली ब्रह्मांडीय रात". */
  femeninoHi: boolean;
}

const FEMENINOS = new Set([3, 4, 5, 7, 8, 9, 15, 17, 19]);
const FEMENINOS_FR = new Set([3, 4, 7, 8, 9, 17, 19]);
const FEMENINOS_AR = new Set([2, 4, 5, 7, 8, 17, 18, 19, 20]);
const FEMENINOS_HI = new Set([2, 3, 17]);

const S = (numero: number, es: string, en: string, pt: string, fr: string, tr: string, ar: string, id: string, hi: string, color: ColorMaya, accion: string, poder: string, esencia: string): Sello => ({ numero, nombre: { es, en, pt, fr, tr, ar, id, hi }, color, accion, poder, esencia, femenino: FEMENINOS.has(numero), femeninoFr: FEMENINOS_FR.has(numero), femeninoAr: FEMENINOS_AR.has(numero), femeninoHi: FEMENINOS_HI.has(numero) });

export const SELLOS: Sello[] = [
  S(1, "Dragón", "Dragon", "Dragão", "Dragon", "Ejderha", "التنين", "Naga", "ड्रैगन", "rojo", "nutrir", "nacimiento", "ser"),
  S(2, "Viento", "Wind", "Vento", "Vent", "Rüzgâr", "الريح", "Angin", "हवा", "blanco", "comunicar", "espíritu", "aliento"),
  S(3, "Noche", "Night", "Noite", "Nuit", "Gece", "الليل", "Malam", "रात", "azul", "soñar", "abundancia", "intuición"),
  S(4, "Semilla", "Seed", "Semente", "Graine", "Tohum", "البذرة", "Benih", "बीज", "amarillo", "enfocar", "florecimiento", "percepción"),
  S(5, "Serpiente", "Serpent", "Serpente", "Serpent", "Yılan", "الأفعى", "Ular", "सर्प", "rojo", "sobrevivir", "fuerza vital", "instinto"),
  S(6, "Enlazador de Mundos", "Worldbridger", "Enlaçador de Mundos", "Enchaîneur de Mondes", "Dünyalar Köprüsü", "رابط العوالم", "Penghubung Dunia", "विश्व-सेतु", "blanco", "igualar", "muerte (soltar)", "oportunidad"),
  S(7, "Mano", "Hand", "Mão", "Main", "El", "اليد", "Tangan", "हाथ", "azul", "conocer", "realización", "curación"),
  S(8, "Estrella", "Star", "Estrela", "Étoile", "Yıldız", "النجمة", "Bintang", "तारा", "amarillo", "embellecer", "elegancia", "arte"),
  S(9, "Luna", "Moon", "Lua", "Lune", "Ay", "القمر", "Bulan", "चंद्रमा", "rojo", "purificar", "agua universal", "flujo"),
  S(10, "Perro", "Dog", "Cachorro", "Chien", "Köpek", "الكلب", "Anjing", "कुत्ता", "blanco", "amar", "corazón", "lealtad"),
  S(11, "Mono", "Monkey", "Macaco", "Singe", "Maymun", "القرد", "Monyet", "बंदर", "azul", "jugar", "magia", "ilusión"),
  S(12, "Humano", "Human", "Humano", "Humain", "İnsan", "الإنسان", "Manusia", "मानव", "amarillo", "influenciar", "libre albedrío", "sabiduría"),
  S(13, "Caminante del Cielo", "Skywalker", "Caminhante do Céu", "Marcheur du Ciel", "Gökyüzü Yürüyücüsü", "سائر السماء", "Penjelajah Langit", "आकाशचारी", "rojo", "explorar", "espacio", "vigilancia"),
  S(14, "Mago", "Wizard", "Mago", "Sorcier", "Büyücü", "الحكيم", "Orang Bijak", "जादूगर", "blanco", "encantar", "atemporalidad", "receptividad"),
  S(15, "Águila", "Eagle", "Águia", "Aigle", "Kartal", "النسر", "Elang", "गरुड़", "azul", "crear", "visión", "mente"),
  S(16, "Guerrero", "Warrior", "Guerreiro", "Guerrier", "Savaşçı", "المحارب", "Pejuang", "योद्धा", "amarillo", "cuestionar", "inteligencia", "intrepidez"),
  S(17, "Tierra", "Earth", "Terra", "Terre", "Dünya", "الأرض", "Bumi", "पृथ्वी", "rojo", "evolucionar", "navegación", "sincronía"),
  S(18, "Espejo", "Mirror", "Espelho", "Miroir", "Ayna", "المرآة", "Cermin", "दर्पण", "blanco", "reflejar", "sinfín", "orden"),
  S(19, "Tormenta", "Storm", "Tormenta", "Tempête", "Fırtına", "العاصفة", "Badai", "तूफ़ान", "azul", "catalizar", "autogeneración", "energía"),
  S(20, "Sol", "Sun", "Sol", "Soleil", "Güneş", "الشمس", "Matahari", "सूर्य", "amarillo", "iluminar", "fuego universal", "vida"),
];

/** Formas femeninas de los idiomas que concuerdan en género (en inglés, turco e indonesio no hace falta). */
type Femenino = { es: string; pt: string; fr: string; ar: string; hi: string };

export const NOMBRE_COLOR: Record<ColorMaya, Texto & { fem: Femenino }> = {
  rojo: { es: "Rojo", en: "Red", pt: "Vermelho", fr: "Rouge", tr: "Kırmızı", ar: "الأحمر", id: "Merah", hi: "लाल", fem: { es: "Roja", pt: "Vermelha", fr: "Rouge", ar: "الحمراء", hi: "लाल" } },
  blanco: { es: "Blanco", en: "White", pt: "Branco", fr: "Blanc", tr: "Beyaz", ar: "الأبيض", id: "Putih", hi: "सफ़ेद", fem: { es: "Blanca", pt: "Branca", fr: "Blanche", ar: "البيضاء", hi: "सफ़ेद" } },
  azul: { es: "Azul", en: "Blue", pt: "Azul", fr: "Bleu", tr: "Mavi", ar: "الأزرق", id: "Biru", hi: "नीला", fem: { es: "Azul", pt: "Azul", fr: "Bleue", ar: "الزرقاء", hi: "नीली" } },
  amarillo: { es: "Amarillo", en: "Yellow", pt: "Amarelo", fr: "Jaune", tr: "Sarı", ar: "الأصفر", id: "Kuning", hi: "पीला", fem: { es: "Amarilla", pt: "Amarela", fr: "Jaune", ar: "الصفراء", hi: "पीली" } },
};

export const COLOR_CSS: Record<ColorMaya, string> = { rojo: "#d9534f", blanco: "#f2efe6", azul: "#4a7fd6", amarillo: "#e9c46a" };

export interface Tono {
  numero: number;
  nombre: Texto;
  fem: Femenino;
  sentido: string;
}

/** Femenino regular: Magnético → Magnética; los invariables (Lunar, Solar…) quedan igual. */
const femenino = (x: string) => x.replace(/o$/, "a");
/** En francés: Résonant → Résonante, Spectral → Spectrale; Magnétique y Cristal quedan igual. */
const femeninoFr = (x: string) => (/e$/.test(x) || x === "Cristal" ? x : `${x}e`);
/** En árabe el femenino va explícito (المغناطيسي → المغناطيسية); en hindi los tonos no cambian. */
const T = (numero: number, es: string, en: string, pt: string, fr: string, tr: string, ar: string, arFem: string, id: string, hi: string, sentido: string): Tono => ({ numero, nombre: { es, en, pt, fr, tr, ar, id, hi }, fem: { es: femenino(es), pt: femenino(pt), fr: femeninoFr(fr), ar: arFem, hi }, sentido });

export const TONOS: Tono[] = [
  T(1, "Magnético", "Magnetic", "Magnético", "Magnétique", "Manyetik", "المغناطيسي", "المغناطيسية", "Magnetik", "चुंबकीय", "unificar, el propósito: ¿cuál es mi meta?"),
  T(2, "Lunar", "Lunar", "Lunar", "Lunaire", "Lunar", "القمري", "القمرية", "Lunar", "चंद्र", "polarizar, el desafío: ¿qué me frena?"),
  T(3, "Eléctrico", "Electric", "Elétrico", "Électrique", "Elektrik", "الكهربائي", "الكهربائية", "Elektrik", "विद्युत", "activar, el servicio: ¿cómo sirvo mejor?"),
  T(4, "Autoexistente", "Self-Existing", "Autoexistente", "Auto-existant", "Öz Varlıklı", "القائم بذاته", "القائمة بذاتها", "Mandiri", "स्वयंभू", "definir, la forma: ¿qué forma toma mi servicio?"),
  T(5, "Entonado", "Overtone", "Harmônico", "Harmonique", "Harmonik", "التوافقي", "التوافقية", "Harmonik", "सुस्वर", "dar poder, el resplandor: ¿cómo me fortalezco?"),
  T(6, "Rítmico", "Rhythmic", "Rítmico", "Rythmique", "Ritmik", "الإيقاعي", "الإيقاعية", "Ritmik", "लयबद्ध", "organizar, la igualdad: ¿cómo encuentro equilibrio?"),
  T(7, "Resonante", "Resonant", "Ressonante", "Résonant", "Rezonant", "الرنّان", "الرنّانة", "Resonan", "अनुनादी", "canalizar, la sintonía: ¿cómo me alineo con lo que siento?"),
  T(8, "Galáctico", "Galactic", "Galáctico", "Galactique", "Galaktik", "المجرّي", "المجرّية", "Galaktik", "आकाशगंगीय", "armonizar, la integridad: ¿vivo lo que creo?"),
  T(9, "Solar", "Solar", "Solar", "Solaire", "Solar", "الشمسي", "الشمسية", "Solar", "सौर", "pulsar, la intención: ¿cómo logro mi propósito?"),
  T(10, "Planetario", "Planetary", "Planetário", "Planétaire", "Gezegensel", "الكوكبي", "الكوكبية", "Planeter", "ग्रहीय", "perfeccionar, la manifestación: ¿cómo lo hago realidad?"),
  T(11, "Espectral", "Spectral", "Espectral", "Spectral", "Spektral", "الطيفي", "الطيفية", "Spektral", "वर्णक्रमीय", "disolver, la liberación: ¿qué debo soltar?"),
  T(12, "Cristal", "Crystal", "Cristal", "Cristal", "Kristal", "البلّوري", "البلّورية", "Kristal", "स्फटिक", "dedicarse, la cooperación: ¿cómo comparto?"),
  T(13, "Cósmico", "Cosmic", "Cósmico", "Cosmique", "Kozmik", "الكوني", "الكونية", "Kosmik", "ब्रह्मांडीय", "perdurar, la presencia: ¿cómo trasciendo?"),
];

/** Nawales de la cuenta k'iche' (Guatemala), con su sentido tradicional. */
export const NAWALES: { nombre: string; sentido: string }[] = [
  { nombre: "Imox", sentido: "el agua, lo inconsciente, la intuición" },
  { nombre: "Iq'", sentido: "el viento, la palabra, la vida" },
  { nombre: "Aq'ab'al", sentido: "el amanecer, lo nuevo que despunta" },
  { nombre: "K'at", sentido: "la red, la abundancia y también los nudos" },
  { nombre: "Kan", sentido: "la serpiente emplumada, la energía y la justicia" },
  { nombre: "Kame", sentido: "la muerte y el renacer, los ancestros" },
  { nombre: "Kej", sentido: "el venado, la fuerza, el liderazgo" },
  { nombre: "Q'anil", sentido: "la semilla, la fertilidad de los proyectos" },
  { nombre: "Toj", sentido: "la ofrenda, el pago, la gratitud" },
  { nombre: "Tz'i'", sentido: "el perro, la ley, la lealtad" },
  { nombre: "B'atz'", sentido: "el hilo, el tiempo, el arte" },
  { nombre: "E", sentido: "el camino, el viaje, el destino" },
  { nombre: "Aj", sentido: "la caña, el hogar, la familia" },
  { nombre: "I'x", sentido: "el jaguar, la fuerza femenina, la Madre Tierra" },
  { nombre: "Tz'ikin", sentido: "el pájaro, la visión, la fortuna" },
  { nombre: "Ajmaq", sentido: "el perdón, la sabiduría de los errores" },
  { nombre: "No'j", sentido: "el pensamiento, la idea, la sabiduría" },
  { nombre: "Tijax", sentido: "el pedernal, el corte, la sanación" },
  { nombre: "Kawoq", sentido: "la tormenta, la comunidad, la mujer" },
  { nombre: "Ajpu", sentido: "el sol, el cazador, la victoria" },
];

export interface ResultadoMaya {
  kin: number;
  sello: number;
  tono: number;
  oraculo: { guia: number; analogo: number; antipoda: number; oculto: number };
  nawal: { numero: number; indice: number };
  /** Kin del día de la consulta, para hablar del momento. */
  kinHoy: number;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;
const sello20 = (n: number) => mod(n - 1, 20) + 1;

/** Días entre dos fechas sin contar los 29 de febrero (así cuenta el Encantamiento del Sueño). */
function diasSinBisiestos(desde: Date, hasta: Date) {
  const dias = Math.round((hasta.getTime() - desde.getTime()) / 86400000);
  const [a, b, signo] = dias >= 0 ? [desde, hasta, 1] : [hasta, desde, -1];
  let saltos = 0;
  for (let anio = a.getUTCFullYear(); anio <= b.getUTCFullYear(); anio++) {
    if ((anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0) {
      const f = Date.UTC(anio, 1, 29);
      if (f > a.getTime() && f <= b.getTime()) saltos++;
    }
  }
  return dias - signo * saltos;
}

// Referencia: 26 de julio de 1987 = kin 34 (Mago Galáctico Blanco).
const REFERENCIA = Date.UTC(1987, 6, 26);

export function kinDreamspell(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  // El 29 de febrero comparte kin con el 28.
  const dia = m === 2 && d === 29 ? 28 : d;
  const n = diasSinBisiestos(new Date(REFERENCIA), new Date(Date.UTC(y, m - 1, dia)));
  return mod(33 + n, 260) + 1;
}

function oraculo(sello: number, tono: number) {
  const desplazamiento = [0, 12, 4, 16, 8][mod(tono - 1, 5)];
  return {
    guia: sello20(sello + desplazamiento),
    analogo: sello20(19 - sello),
    antipoda: sello20(sello + 10),
    oculto: sello20(21 - sello),
  };
}

/** Nawal k'iche' por el día juliano (correlación GMT: 13.0.0.0.0 = 4 Ajpu). */
function nawal(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  const jdn = Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;
  const n = jdn - 584283;
  return { numero: mod(n + 3, 13) + 1, indice: mod(n + 19, 20) };
}

export function calcularMaya(fecha: string, hoy = new Date()): ResultadoMaya {
  const kin = kinDreamspell(fecha);
  const sello = sello20(kin);
  const tono = mod(kin - 1, 13) + 1;
  return { kin, sello, tono, oraculo: oraculo(sello, tono), nawal: nawal(fecha), kinHoy: kinDreamspell(hoy.toISOString().slice(0, 10)) };
}

export function selloPorNumero(n: number) {
  return SELLOS[sello20(n) - 1];
}

/** "Mago Galáctico Blanco". */
export function nombreKin(kin: number, idioma: keyof Texto = "es") {
  const s = selloPorNumero(kin);
  const tono = TONOS[mod(kin - 1, 13)];
  const color = NOMBRE_COLOR[s.color];
  // En inglés y en turco el color y el tono van delante: "White Galactic Wizard", "Beyaz Galaktik Büyücü".
  if (idioma === "en" || idioma === "tr") return `${color[idioma]} ${tono.nombre[idioma]} ${s.nombre[idioma]}`;
  // En hindi también van delante, y el color concuerda con el sello: "सफ़ेद आकाशगंगीय जादूगर", "नीली ब्रह्मांडीय रात".
  if (idioma === "hi") return `${s.femeninoHi ? color.fem.hi : color.hi} ${tono.nombre.hi} ${s.nombre.hi}`;
  // En indonesio todo va detrás y sin género: "Orang Bijak Galaktik Putih".
  if (idioma === "id") return `${s.nombre.id} ${tono.nombre.id} ${color.id}`;
  // En árabe, sello y adjetivos con artículo y concordancia: "الحكيم المجرّي الأبيض", "العاصفة الكونية الزرقاء".
  const fem = idioma === "fr" ? s.femeninoFr : idioma === "ar" ? s.femeninoAr : s.femenino;
  return fem ? `${s.nombre[idioma]} ${tono.fem[idioma]} ${color.fem[idioma]}` : `${s.nombre[idioma]} ${tono.nombre[idioma]} ${color[idioma]}`;
}

export function resumenMaya(r: ResultadoMaya, nombre: string, fecha: string) {
  const s = selloPorNumero(r.sello);
  const t = TONOS[r.tono - 1];
  const linea = (etiqueta: string, n: number) => {
    const x = selloPorNumero(n);
    return `- ${etiqueta}: ${x.nombre.es} ${x.color} (${x.accion}, ${x.poder}, ${x.esencia})`;
  };
  const nw = NAWALES[r.nawal.indice];
  return [
    `Persona: ${datoDeUsuario(nombre, 80) || "la persona"}. Fecha de nacimiento: ${fecha}.`,
    `Kin ${r.kin}: ${nombreKin(r.kin)}.`,
    `Sello solar: ${s.nombre.es} ${s.color} — acción: ${s.accion}; poder: ${s.poder}; esencia: ${s.esencia}.`,
    `Tono galáctico ${t.numero}, ${t.nombre.es}: ${t.sentido}.`,
    "Oráculo del destino:",
    linea("Guía (lo que te orienta)", r.oraculo.guia),
    linea("Análogo (tu aliado, lo que te apoya)", r.oraculo.analogo),
    linea("Antípoda (tu reto, lo que te enseña por oposición)", r.oraculo.antipoda),
    linea("Oculto (tu fuerza escondida)", r.oraculo.oculto),
    `Nawal de la cuenta tradicional k'iche': ${r.nawal.numero} ${nw.nombre} (${nw.sentido}).`,
    `Kin del día de la consulta: ${r.kinHoy}, ${nombreKin(r.kinHoy)}.`,
  ].join("\n");
}

export const TRADICION_MAYA =
  "Calendario sagrado maya de 260 días (Tzolkin): 20 sellos y 13 tonos. El kin y su oráculo siguen el Encantamiento del Sueño, la versión moderna que popularizó José Argüelles y que la mayoría conoce como 'kin maya'; el nawal sale de la cuenta tradicional que aún guardan los ajq'ij (guías espirituales) k'iche' de Guatemala. " +
  "Explica con respeto la diferencia entre ambas cuentas en una frase, sin restarle valor a ninguna. El sello describe la esencia, el tono la manera de actuar; el guía orienta, el análogo apoya, el antípoda reta y el oculto es la fuerza escondida. Tono luminoso y cercano, sin apropiarte de ceremonias ni prometer curaciones.";
