import { faseLunar } from "@/lib/luna";
import { FICHA_INTENCION, TONO_COLOR, type ColorVela, type Intencion } from "@/lib/velas";

/** Lo que dice la tradición de cada fase (para la tarjeta «Tu Luna hoy»). */
const FASES = [
  { nombre: "Luna nueva", emoji: "🌑", sentido: "Tiempo de sembrar intenciones en silencio." },
  { nombre: "Luna creciente", emoji: "🌒", sentido: "La luz crece: es tiempo de atraer y empezar." },
  { nombre: "Cuarto creciente", emoji: "🌓", sentido: "Tiempo de decidir y poner manos a la obra." },
  { nombre: "Luna gibosa creciente", emoji: "🌔", sentido: "Lo que pediste toma forma: insiste con calma." },
  { nombre: "Luna llena", emoji: "🌕", sentido: "Todo se ilumina: tiempo de culminar, agradecer y ver claro." },
  { nombre: "Luna gibosa menguante", emoji: "🌖", sentido: "Tiempo de agradecer y compartir lo que llegó." },
  { nombre: "Cuarto menguante", emoji: "🌗", sentido: "La luz se retira: tiempo de soltar y limpiar." },
  { nombre: "Luna menguante", emoji: "🌘", sentido: "Tiempo de cerrar, descansar y despedir." },
];

export const NOMBRE_INTENCION: Record<Intencion, string> = {
  amor: "Amor y reconciliación",
  dinero: "Abundancia y prosperidad",
  proteccion: "Protección y limpieza",
  sanacion: "Calma y sanación emocional",
  claridad: "Claridad para decidir",
  cierre: "Cerrar un ciclo y soltar",
  exito: "Éxito y nuevos comienzos",
  intuicion: "Intuición y sueños",
};

const NOMBRE_COLOR: Record<ColorVela, string> = {
  rojo: "roja", rosa: "rosa", verde: "verde", amarillo: "amarilla", azul: "azul", blanco: "blanca", morado: "morada", naranja: "naranja", negro: "negra",
};
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const ASTRO_DIA = ["el Sol", "la Luna", "Marte", "Mercurio", "Júpiter", "Venus", "Saturno"];
const NOMBRE_FASE = { nueva: "Luna nueva", creciente: "Luna creciente", llena: "Luna llena", menguante: "Luna menguante" } as const;

/** La Luna de hoy, con su sentido en la tradición. */
export function lunaHoy(fecha = new Date()) {
  const f = faseLunar(fecha);
  return { ...FASES[f.indice], iluminacion: f.iluminacion };
}

/** ¿Esta fracción del ciclo lunar corresponde a la fase pedida? (con margen para que coincida con un día de la semana) */
function enFase(fraccion: number, fase: keyof typeof NOMBRE_FASE) {
  if (fase === "nueva") return fraccion < 0.07 || fraccion > 0.93;
  if (fase === "llena") return fraccion > 0.43 && fraccion < 0.57;
  if (fase === "creciente") return fraccion >= 0.03 && fraccion <= 0.47;
  return fraccion >= 0.53 && fraccion <= 0.97;
}

/** Día de la semana de una fecha en la zona horaria de la persona. */
function diaEnZona(fecha: Date, zona: string) {
  const corto = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: zona }).format(fecha);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(corto);
}

/** Tu vela: color, día, astro y Luna de la intención, y la próxima fecha en que coinciden el día y la Luna. */
export function tuVela(intencion: Intencion, zona: string, desde = new Date()) {
  const f = FICHA_INTENCION[intencion];
  let fecha: Date | null = null;
  for (let d = 0; d < 60 && !fecha; d++) {
    const dia = new Date(desde.getTime() + d * 86400_000);
    if (diaEnZona(dia, zona) === f.dia && enFase(faseLunar(dia).fraccion, f.fase)) fecha = dia;
  }
  // Si en dos meses no coinciden el día y la fase, basta con el día de la semana.
  if (!fecha) for (let d = 0; d < 7 && !fecha; d++) {
    const dia = new Date(desde.getTime() + d * 86400_000);
    if (diaEnZona(dia, zona) === f.dia) fecha = dia;
  }
  const cuando = fecha ? new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: zona }).format(fecha) : null;
  return {
    color: `Vela ${NOMBRE_COLOR[f.color]}`,
    tono: TONO_COLOR[f.color],
    alterno: `o ${NOMBRE_COLOR[f.alterno]}`,
    dia: DIAS[f.dia],
    astro: ASTRO_DIA[f.dia],
    fase: NOMBRE_FASE[f.fase],
    cuando,
  };
}

/** Pone el nombre en el saludo de la lección. */
export function conNombre(texto: string, nombre: string | null | undefined) {
  return nombre ? texto.replace(/\{nombre\}/g, nombre) : texto.replace(/\{nombre\},\s*/g, "").replace(/^./, (c) => c.toUpperCase());
}

export type Trato = "a" | "o" | "e";

const GRADOS: Record<Trato, string[]> = {
  a: ["Buscadora", "Aprendiz", "Iniciada", "Adepta", "Maestra de rituales"],
  o: ["Buscador", "Aprendiz", "Iniciado", "Adepto", "Maestro de rituales"],
  e: ["En búsqueda", "Aprendiz", "En iniciación", "En el grado adepto", "Maestría de rituales"],
};

/**
 * El grado del camino de iniciación según las llaves que tiene (de 7): Buscador (0), Aprendiz (1–2), Iniciado (3–4),
 * Adepto (5–6) y, con las siete, Maestra o Maestro de rituales del Primer Círculo. Es simbólico: un camino de aprendizaje.
 */
export function grado(llaves: number, trato: Trato | null | undefined, total = 7) {
  const t = trato ?? "e";
  const i = llaves >= total ? 4 : llaves >= 5 ? 3 : llaves >= 3 ? 2 : llaves >= 1 ? 1 : 0;
  return { titulo: GRADOS[t][i], nivel: i, completo: i === 4, conCirculo: i === 4 ? `${GRADOS[t][4]} del Primer Círculo` : GRADOS[t][i] };
}
