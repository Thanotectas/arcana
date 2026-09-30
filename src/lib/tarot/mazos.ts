import { MAZO, type CartaTarot } from "./deck";
import { ORACULO_ANGELES } from "./oraculo-angeles";

/**
 * Mazos disponibles. Rider-Waite y Marsella comparten ids de carta (misma
 * estructura de 78); el Oráculo de los Ángeles tiene 44 cartas propias.
 */
export type IdMazo = "rider" | "marsella" | "angeles";

export interface Mazo {
  id: IdMazo;
  nombre: string;
  cartas: CartaTarot[];
  /** Si el mazo admite cartas invertidas. */
  conInvertidas: boolean;
  /** Estilo visual de la cara de la carta. */
  estilo: "rider" | "marsella" | "angeles";
  /** Instrucciones de tradición para el modelo. */
  tradicion: string;
}

/** Diferencias de nombre y número entre Rider-Waite y Marsella (arcanos mayores). */
const MARSELLA_MAYORES: Record<string, { nombre: string; numero?: number }> = {
  "el-mago": { nombre: "El Mago" },
  "la-sacerdotisa": { nombre: "La Papisa" },
  "el-sumo-sacerdote": { nombre: "El Papa" },
  "los-enamorados": { nombre: "El Enamorado" },
  "la-fuerza": { nombre: "La Fuerza", numero: 11 },
  "la-justicia": { nombre: "La Justicia", numero: 8 },
  "la-muerte": { nombre: "El Arcano sin nombre" },
  "la-torre": { nombre: "La Casa de Dios" },
  "el-juicio": { nombre: "El Juicio" },
};

function construirMarsella(): CartaTarot[] {
  return MAZO.map((c) => {
    const cambio = c.arcano === "mayor" ? MARSELLA_MAYORES[c.id] : undefined;
    if (!cambio) return c;
    return { ...c, nombre: cambio.nombre, numero: cambio.numero ?? c.numero };
  }).sort((a, b) => {
    if (a.arcano !== b.arcano) return a.arcano === "mayor" ? -1 : 1;
    if (a.arcano === "mayor") return a.numero - b.numero;
    return 0;
  });
}

export const MAZOS: Record<IdMazo, Mazo> = {
  rider: {
    id: "rider",
    nombre: "Rider-Waite",
    cartas: MAZO,
    conInvertidas: true,
    estilo: "rider",
    tradicion:
      "Tradición Rider-Waite-Smith: lee las escenas de los arcanos menores como situaciones concretas y respeta las inversiones como bloqueo, exceso o interiorización de la energía de la carta.",
  },
  marsella: {
    id: "marsella",
    nombre: "Tarot de Marsella",
    cartas: construirMarsella(),
    conInvertidas: true,
    estilo: "marsella",
    tradicion:
      "Tradición del Tarot de Marsella: La Justicia es el arcano VIII y La Fuerza el XI; La Papisa, El Papa, El Enamorado, El Arcano sin nombre (XIII) y La Casa de Dios (XVI) conservan sus nombres marselleses. Los arcanos menores no tienen escenas: interprétalos por la numerología del número (1 potencial, 2 acumulación, 3 impulso, 4 estabilidad, 5 tránsito, 6 belleza, 7 acción, 8 perfección, 9 crisis, 10 fin de ciclo) combinada con el palo (bastos energía y creatividad, copas emoción, espadas mente y palabra, oros cuerpo y dinero). Da peso a la mirada de las figuras y a la dirección hacia la que apuntan dentro de la tirada.",
  },
  angeles: {
    id: "angeles",
    nombre: "Oráculo de los Ángeles",
    cartas: ORACULO_ANGELES,
    conInvertidas: false,
    estilo: "angeles",
    tradicion:
      "Oráculo de los Ángeles: no es tarot. Cada carta es un mensaje de acompañamiento. No hay cartas invertidas; el campo 'sombra' indica qué cuidar. Tono luminoso, concreto y práctico, sin ñoñería; evita predicciones. Cierra con una afirmación breve en primera persona que la persona pueda repetir.",
  },
};

export const IDS_MAZO = Object.keys(MAZOS) as IdMazo[];

export function esMazo(valor: unknown): valor is IdMazo {
  return typeof valor === "string" && valor in MAZOS;
}

export function cartaDeMazo(mazo: IdMazo, id: string): CartaTarot | undefined {
  return MAZOS[mazo].cartas.find((c) => c.id === id);
}
