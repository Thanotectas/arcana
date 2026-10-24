import { datoDeUsuario } from "../seguridad";
import type { Texto, TiradaOraculo, PiezaSacada } from "./comun";

/**
 * Runas del Futhark antiguo (24). Cada runa trae su trazo para dibujarla en
 * SVG (no dependemos de que el dispositivo tenga una fuente rúnica).
 */
export interface Runa {
  id: string;
  nombre: string;
  glifo: string;
  significado: Texto;
  sentido: string;
  /** Sentido cuando sale invertida (merkstave); las simétricas no se invierten. */
  invertida?: string;
  /** Trazos en una cuadrícula de 10 × 16. */
  trazos: [number, number][][];
}

const ASTA: [number, number][] = [[5, 0], [5, 16]];
const ASTA_IZQ: [number, number][] = [[3, 0], [3, 16]];

export const RUNAS: Runa[] = [
  { id: "fehu", nombre: "Fehu", glifo: "ᚠ", significado: { es: "Riqueza", en: "Wealth", pt: "Riqueza" }, sentido: "riqueza, ganado, lo que se gana con esfuerzo, abundancia que circula", invertida: "pérdida o dinero que se escapa; cuidar lo ganado", trazos: [ASTA_IZQ, [[3, 6], [8, 1]], [[3, 10], [8, 5]]] },
  { id: "uruz", nombre: "Uruz", glifo: "ᚢ", significado: { es: "Fuerza", en: "Strength", pt: "Força" }, sentido: "fuerza, vitalidad, coraje para empezar", invertida: "fuerza mal dirigida, cansancio, oportunidad que se deja pasar", trazos: [[[2, 16], [2, 0], [8, 5], [8, 16]]] },
  { id: "thurisaz", nombre: "Thurisaz", glifo: "ᚦ", significado: { es: "Umbral", en: "Threshold", pt: "Limiar" }, sentido: "defensa, un umbral, decidir antes de cruzar", invertida: "impulsividad, conflicto que se busca sin necesidad", trazos: [ASTA_IZQ, [[3, 4], [8, 8], [3, 12]]] },
  { id: "ansuz", nombre: "Ansuz", glifo: "ᚨ", significado: { es: "Mensaje", en: "Message", pt: "Mensagem" }, sentido: "mensaje, palabra, consejo de alguien sabio", invertida: "malentendido, engaño en las palabras", trazos: [ASTA_IZQ, [[3, 0], [8, 4]], [[3, 5], [8, 9]]] },
  { id: "raidho", nombre: "Raidho", glifo: "ᚱ", significado: { es: "Viaje", en: "Journey", pt: "Viagem" }, sentido: "viaje, movimiento, el camino correcto", invertida: "retraso en un viaje o desvío del camino", trazos: [ASTA_IZQ, [[3, 0], [8, 4], [3, 8], [8, 16]]] },
  { id: "kenaz", nombre: "Kenaz", glifo: "ᚲ", significado: { es: "Antorcha", en: "Torch", pt: "Tocha" }, sentido: "claridad, creatividad, una pasión que se enciende", invertida: "algo que se apaga, falta de inspiración", trazos: [[[8, 2], [3, 8], [8, 14]]] },
  { id: "gebo", nombre: "Gebo", glifo: "ᚷ", significado: { es: "Regalo", en: "Gift", pt: "Presente" }, sentido: "regalo, unión, intercambio justo, pareja", trazos: [[[2, 2], [8, 14]], [[8, 2], [2, 14]]] },
  { id: "wunjo", nombre: "Wunjo", glifo: "ᚹ", significado: { es: "Alegría", en: "Joy", pt: "Alegria" }, sentido: "alegría, armonía, deseo cumplido", invertida: "tristeza pasajera, una alegría que se retrasa", trazos: [ASTA_IZQ, [[3, 0], [8, 4], [3, 8]]] },
  { id: "hagalaz", nombre: "Hagalaz", glifo: "ᚺ", significado: { es: "Granizo", en: "Hail", pt: "Granizo" }, sentido: "sacudida que no se controla y que limpia el camino", trazos: [[[2, 0], [2, 16]], [[8, 0], [8, 16]], [[2, 5], [8, 11]]] },
  { id: "nauthiz", nombre: "Nauthiz", glifo: "ᚾ", significado: { es: "Necesidad", en: "Need", pt: "Necessidade" }, sentido: "necesidad, paciencia, aprender de la carencia", trazos: [ASTA, [[2, 6], [8, 10]]] },
  { id: "isa", nombre: "Isa", glifo: "ᛁ", significado: { es: "Hielo", en: "Ice", pt: "Gelo" }, sentido: "pausa, algo congelado, esperar", trazos: [ASTA] },
  { id: "jera", nombre: "Jera", glifo: "ᛃ", significado: { es: "Cosecha", en: "Harvest", pt: "Colheita" }, sentido: "cosecha, recompensa a su tiempo, ciclo de un año", trazos: [[[4, 3], [1, 8], [4, 13]], [[6, 3], [9, 8], [6, 13]]] },
  { id: "eihwaz", nombre: "Eihwaz", glifo: "ᛇ", significado: { es: "Tejo", en: "Yew", pt: "Teixo" }, sentido: "resistencia, protección, transformación profunda", trazos: [ASTA, [[5, 0], [8, 3]], [[5, 16], [2, 13]]] },
  { id: "perthro", nombre: "Perthro", glifo: "ᛈ", significado: { es: "Misterio", en: "Mystery", pt: "Mistério" }, sentido: "misterio, azar, un secreto que se revela", invertida: "sorpresa desagradable, algo oculto que pesa", trazos: [ASTA_IZQ, [[3, 1], [7, 5], [9, 2]], [[3, 15], [7, 11], [9, 14]]] },
  { id: "algiz", nombre: "Algiz", glifo: "ᛉ", significado: { es: "Protección", en: "Protection", pt: "Proteção" }, sentido: "protección, guía, un escudo", invertida: "vulnerabilidad, bajar la guardia", trazos: [ASTA, [[5, 6], [1, 1]], [[5, 6], [9, 1]]] },
  { id: "sowilo", nombre: "Sowilo", glifo: "ᛊ", significado: { es: "Sol", en: "Sun", pt: "Sol" }, sentido: "éxito, victoria, energía y salud del ánimo", trazos: [[[7, 0], [3, 6], [7, 10], [3, 16]]] },
  { id: "tiwaz", nombre: "Tiwaz", glifo: "ᛏ", significado: { es: "Justicia", en: "Justice", pt: "Justiça" }, sentido: "justicia, victoria con honor, coraje", invertida: "derrota por falta de fe en uno mismo", trazos: [ASTA, [[1, 4], [5, 0], [9, 4]]] },
  { id: "berkano", nombre: "Berkano", glifo: "ᛒ", significado: { es: "Nacimiento", en: "Birth", pt: "Nascimento" }, sentido: "nuevo comienzo, crecimiento, lo que nace y se cuida", invertida: "estancamiento, un comienzo que se retrasa", trazos: [ASTA_IZQ, [[3, 0], [8, 4], [3, 8], [8, 12], [3, 16]]] },
  { id: "ehwaz", nombre: "Ehwaz", glifo: "ᛖ", significado: { es: "Caballo", en: "Horse", pt: "Cavalo" }, sentido: "movimiento, avance, alianza de confianza", invertida: "cambio que no se da, desconfianza", trazos: [[[2, 16], [2, 0], [5, 5], [8, 0], [8, 16]]] },
  { id: "mannaz", nombre: "Mannaz", glifo: "ᛗ", significado: { es: "Humanidad", en: "Humankind", pt: "Humanidade" }, sentido: "uno mismo, los demás, cooperación", invertida: "aislamiento, alguien que no es lo que parece", trazos: [[[2, 16], [2, 0], [8, 7]], [[8, 16], [8, 0], [2, 7]]] },
  { id: "laguz", nombre: "Laguz", glifo: "ᛚ", significado: { es: "Agua", en: "Water", pt: "Água" }, sentido: "intuición, emociones, dejarse llevar por la corriente", invertida: "confusión emocional, miedo a sentir", trazos: [ASTA_IZQ, [[3, 0], [8, 5]]] },
  { id: "ingwaz", nombre: "Ingwaz", glifo: "ᛜ", significado: { es: "Semilla", en: "Seed", pt: "Semente" }, sentido: "gestación, completar algo, descanso antes de empezar", trazos: [[[5, 3], [9, 8], [5, 13], [1, 8], [5, 3]]] },
  { id: "dagaz", nombre: "Dagaz", glifo: "ᛞ", significado: { es: "Amanecer", en: "Dawn", pt: "Alvorada" }, sentido: "amanecer, transformación, un gran cambio para bien", trazos: [[[1, 2], [1, 14], [9, 2], [9, 14], [1, 2]]] },
  { id: "othala", nombre: "Othala", glifo: "ᛟ", significado: { es: "Herencia", en: "Heritage", pt: "Herança" }, sentido: "hogar, herencia, familia, lo que se recibe de los mayores", invertida: "conflicto familiar o apego a lo viejo", trazos: [[[2, 16], [8, 6], [5, 1], [2, 6], [8, 16]]] },
];

export function runaPorId(id: string) {
  return RUNAS.find((r) => r.id === id);
}

export const TIRADAS_RUNAS: TiradaOraculo[] = [
  {
    id: "una",
    nombre: { es: "Una runa", en: "One rune", pt: "Uma runa" },
    descripcion: { es: "La runa de Odín: una respuesta directa para hoy.", en: "Odin's rune: a direct answer for today.", pt: "A runa de Odin: uma resposta direta para hoje." },
    posiciones: [{ nombre: { es: "La respuesta", en: "The answer", pt: "A resposta" }, sentido: "la respuesta directa" }],
  },
  {
    id: "nornas",
    nombre: { es: "Las tres Nornas", en: "The three Norns", pt: "As três Nornas" },
    descripcion: { es: "Urd, Verdandi y Skuld: lo que fue, lo que es y lo que será.", en: "Urd, Verdandi and Skuld: what was, what is and what shall be.", pt: "Urd, Verdandi e Skuld: o que foi, o que é e o que será." },
    posiciones: [
      { nombre: { es: "Urd · lo que fue", en: "Urd · what was", pt: "Urd · o que foi" }, sentido: "el pasado que pesa" },
      { nombre: { es: "Verdandi · lo que es", en: "Verdandi · what is", pt: "Verdandi · o que é" }, sentido: "el presente" },
      { nombre: { es: "Skuld · lo que será", en: "Skuld · what shall be", pt: "Skuld · o que será" }, sentido: "lo que viene" },
    ],
  },
];

export function resumenRunas(tirada: TiradaOraculo, piezas: PiezaSacada[], pregunta: string) {
  const lineas = [`Tirada: ${tirada.nombre.es} (runas del Futhark antiguo).`];
  const p = datoDeUsuario(pregunta, 300);
  if (p) lineas.push(`Pregunta de la persona: ${p}`);
  for (const pieza of piezas) {
    const r = runaPorId(pieza.id);
    const pos = tirada.posiciones[pieza.posicion];
    if (!r || !pos) continue;
    lineas.push(`- ${pos.nombre.es} (${pos.sentido}): ${r.nombre} (${r.significado.es})${pieza.invertida ? `, invertida: ${r.invertida}` : `: ${r.sentido}`}.`);
  }
  return lineas.join("\n");
}

export const TRADICION_RUNAS =
  "Runas del Futhark antiguo, el alfabeto sagrado germánico y nórdico. Cada runa es un sonido, una imagen y una fuerza: se leen como consejos del destino, con la voz serena de una völva (vidente nórdica). " +
  "Las runas simétricas no se invierten; una runa invertida (merkstave) no es una condena, señala la fuerza bloqueada o mal dirigida. Nombra la runa, su imagen (el ganado, el granizo, el sol…) y lo que pide hacer. Breve mitología si aporta (Odín colgado del árbol para obtenerlas, las Nornas tejiendo el destino), sin convertir la lectura en clase de historia.";
