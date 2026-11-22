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
  | "sinastria"
  | "chocolate"
  | "velas"
  | "aura"
  | "tabaco"
  | "cruce"
  | "revolucion_solar"
  | "baraja_espanola"
  | "lenormand"
  | "runas"
  | "pendulo"
  | "cafe"
  | "huevo"
  | "maya"
  | "vidas_pasadas"
  | "akashicos"
  // Productos para los mercados nuevos (cada uno con su módulo en src/lib/<producto>/):
  | "kundli" // India: carta védica (sideral), nakshatras y dashas
  | "kundli_milan" // India: compatibilidad de pareja por gunas (Ashtakoot)
  | "weton" // Indonesia: weton javanés (Primbon)
  | "weton_jodoh" // Indonesia: compatibilidad de pareja por weton
  | "abjad" // mundo árabe: valor abjad del nombre
  | "geomancia" // África y mundo árabe: geomancia de 16 figuras
  | "marsella" // Francia: tarot de Marsella, tirada en cruz
  | "iskambil"; // Turquía: lectura con la baraja francesa (iskambil falı)

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
  sinastria: 4, // premium: dos cartas completas
  chocolate: 3,
  velas: 3,
  aura: 2,
  tabaco: 3,
  cruce: 4, // premium: combina dos sistemas con los datos de la persona
  revolucion_solar: 6, // premium: el año completo, de cumpleaños a cumpleaños
  baraja_espanola: 2,
  lenormand: 2,
  runas: 2,
  pendulo: 0, // gratis: 1 por día (gancho, como la carta del día)
  cafe: 3,
  huevo: 3,
  maya: 2,
  vidas_pasadas: 4, // premium: carta kármica + numerología kármica + tres cartas
  akashicos: 3,
  kundli: 5,
  kundli_milan: 4,
  weton: 2,
  weton_jodoh: 3,
  abjad: 2,
  geomancia: 2,
  marsella: 2,
  iskambil: 2,
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
  sinastria: "Sinastría",
  chocolate: "Lectura del chocolate",
  velas: "Ritual de velas",
  aura: "Lectura del aura",
  tabaco: "Lectura del tabaco",
  cruce: "Lectura cruzada",
  revolucion_solar: "Revolución solar",
  baraja_espanola: "Baraja española",
  lenormand: "Lenormand",
  runas: "Runas",
  pendulo: "Péndulo",
  cafe: "Lectura del café",
  huevo: "Limpia con huevo",
  maya: "Calendario maya",
  vidas_pasadas: "Tus vidas pasadas",
  akashicos: "Registros akáshicos",
  kundli: "Kundli védica",
  kundli_milan: "Kundli milan (compatibilidad védica)",
  weton: "Weton javanés",
  weton_jodoh: "Compatibilidad por weton",
  abjad: "Numerología abjad",
  geomancia: "Geomancia",
  marsella: "Tarot de Marsella",
  iskambil: "Iskambil falı (baraja francesa)",
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
  /** Precio internacional en centavos de dólar (Lemon Squeezy). */
  precioUSDCentavos: number;
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
    precioUSDCentavos: 249,
    descripcion: "Para probar: cinco lecturas sencillas o una carta astral.",
  },
  {
    id: "buscador",
    nombre: "Buscador",
    creditos: 15,
    precioCOP: 24900,
    precioUSDCentavos: 599,
    destacado: true,
    descripcion: "El más elegido. Alcanza para un mes de consultas.",
  },
  {
    id: "iniciado",
    nombre: "Iniciado",
    creditos: 40,
    precioCOP: 54900,
    precioUSDCentavos: 1299,
    descripcion: "Para quien consulta a diario y comparte con otros.",
  },
];

/** Paquete de prueba: la primera compra más pequeña posible ("por menos que un café"). */
export const PAQUETE_PRUEBA: Paquete = {
  id: "prueba",
  nombre: "Prueba",
  creditos: 1,
  // 3.900 COP ≈ 0,99 USD: el mismo valor en pesos y en dólares (antes 1.900 COP, que era la mitad del precio en dólares).
  precioCOP: 3900,
  precioUSDCentavos: 99,
  descripcion: "Un crédito para probar una lectura sencilla.",
};

/**
 * Oferta de fundadores: el Círculo a mitad de precio para las primeras
 * personas, hasta una fecha. Se vende como paquete 'circulo' con otro monto.
 */
export const OFERTA_FUNDADORES = {
  id: "fundadores",
  cupo: 50,
  hasta: "2026-10-31T23:59:59-05:00",
  precioCOP: 9900,
  precioUSDCentavos: 249,
} as const;

export const PAQUETE_CIRCULO: Paquete = {
  id: "circulo",
  nombre: "Círculo Arcana",
  creditos: 15,
  precioCOP: 19900,
  precioUSDCentavos: 499,
  diasCirculo: 30,
  descripcion: "30 días con tu cielo personal cada mañana, preguntas sin cobro y 15 créditos.",
};

/** Precio del Círculo por día, redondeado hacia arriba a la centena (para "menos de X al día"). */
export function precioCirculoPorDia() {
  return Math.ceil(PAQUETE_CIRCULO.precioCOP / PAQUETE_CIRCULO.diasCirculo! / 100) * 100;
}

export function paquetePorId(id: string) {
  if (id === PAQUETE_CIRCULO.id) return PAQUETE_CIRCULO;
  if (id === PAQUETE_PRUEBA.id) return PAQUETE_PRUEBA;
  if (id === OFERTA_FUNDADORES.id) return { ...PAQUETE_CIRCULO, precioCOP: OFERTA_FUNDADORES.precioCOP, precioUSDCentavos: OFERTA_FUNDADORES.precioUSDCentavos };
  return PAQUETES.find((p) => p.id === id);
}

export function formatoUSD(centavos: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(centavos / 100);
}

export function formatoCOP(pesos: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}
