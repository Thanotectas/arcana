/**
 * Modelo de negocio: créditos prepagados.
 * 1 crédito ≈ una lectura sencilla. Los precios están en pesos colombianos.
 */

export type TipoLectura =
  | "tarot_carta"
  | "tarot_tres"
  | "tarot_celta"
  | "carta_astral"
  | "numerologia"
  | "compatibilidad"
  | "quiromancia"
  | "iching"
  | "chino"
  | "suenos"
  | "cruce";

export const COSTOS: Record<TipoLectura, number> = {
  tarot_carta: 0, // gratis: 1 por día (gancho de adquisición)
  tarot_tres: 1,
  tarot_celta: 3,
  carta_astral: 5,
  numerologia: 1,
  compatibilidad: 1,
  quiromancia: 3,
  iching: 2,
  chino: 2,
  suenos: 2,
  cruce: 4, // premium: combina dos sistemas con los datos de la persona
};

export const NOMBRES_LECTURA: Record<TipoLectura, string> = {
  tarot_carta: "Carta del día",
  tarot_tres: "Tirada de tres cartas",
  tarot_celta: "Cruz Celta",
  carta_astral: "Carta astral",
  numerologia: "Perfil numerológico",
  compatibilidad: "Compatibilidad",
  quiromancia: "Lectura de la mano",
  iching: "I Ching",
  chino: "Calendario chino",
  suenos: "Interpretación de sueños",
  cruce: "Lectura cruzada",
};

/** Pregunta de seguimiento sobre una lectura. */
export const COSTO_PREGUNTA = 1;
/** Preguntas gratis por lectura (la primera engancha; las demás se cobran). */
export const PREGUNTAS_GRATIS_POR_LECTURA = 1;

/** Créditos de regalo en la primera compra (ver acreditar_orden en la migración 0007). */
export const BONO_PRIMERA_COMPRA = 2;

/** Cartas del día gratuitas por usuario y día. */
export const CARTAS_DIA_GRATIS = 1;

export interface Paquete {
  id: string;
  nombre: string;
  creditos: number;
  precioCOP: number; // pesos, sin centavos
  destacado?: boolean;
  descripcion: string;
  /** Días de Círculo Arcana que incluye (pase mensual). */
  diasCirculo?: number;
}

/** Pase mensual: mensaje personal diario y preguntas sin cobro. */
export const CIRCULO = {
  id: "circulo",
  diasPorCompra: 30,
  preguntasPorDia: 15,
} as const;

export const PAQUETES: Paquete[] = [
  {
    id: "inicial",
    nombre: "Inicial",
    creditos: 5,
    precioCOP: 9900,
    descripcion: "Para probar: cinco lecturas sencillas o una carta astral.",
  },
  {
    id: "buscador",
    nombre: "Buscador",
    creditos: 15,
    precioCOP: 24900,
    destacado: true,
    descripcion: "El más elegido. Alcanza para un mes de consultas.",
  },
  {
    id: "iniciado",
    nombre: "Iniciado",
    creditos: 40,
    precioCOP: 54900,
    descripcion: "Para quien consulta a diario y comparte con otros.",
  },
];

export const PAQUETE_CIRCULO: Paquete = {
  id: "circulo",
  nombre: "Círculo Arcana",
  creditos: 15,
  precioCOP: 19900,
  diasCirculo: 30,
  descripcion: "30 días con tu cielo personal cada mañana, preguntas sin cobro y 15 créditos.",
};

/** Precio del Círculo por día, redondeado hacia arriba a la centena (para "menos de X al día"). */
export function precioCirculoPorDia() {
  return Math.ceil(PAQUETE_CIRCULO.precioCOP / PAQUETE_CIRCULO.diasCirculo! / 100) * 100;
}

export function paquetePorId(id: string) {
  if (id === PAQUETE_CIRCULO.id) return PAQUETE_CIRCULO;
  return PAQUETES.find((p) => p.id === id);
}

export function formatoCOP(pesos: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}
