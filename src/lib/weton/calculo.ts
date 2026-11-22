/*
 * Primbon Jawa: weton, neptu y wuku a partir de la fecha de nacimiento (cálculo puro, sin dependencias).
 *
 * - Hari (semana de 7 días, Minggu…Sabtu) y pasaran (semana de 5 días: Legi, Pahing, Pon, Wage, Kliwon).
 *   Las dos semanas giran juntas y se repiten cada 35 días (un "selapan"): esa combinación es el weton.
 * - Época de la pasaran: el viernes 17 de agosto de 1945 fue Jumat Legi (día de la Proclamación). La misma
 *   cuenta da Jumat Legi el 8 de julio de 1633 (1 Sura 1555, inicio del calendario de Sultan Agung), Senin Legi
 *   el 8 de julio de 2024 (1 Suro 1958) y Rabu Kliwon el 19 de noviembre de 2025 (Galungan).
 * - Wuku: ciclo Pawukon de 30 semanas de 7 días (210 días). Cada wuku empieza en Minggu. El 19 de noviembre
 *   de 2025 (Rabu Kliwon) cayó en wuku Galungan —la undécima—, así que el domingo 7 de septiembre de 2025 abrió
 *   un ciclo en wuku Sinta (Minggu Pahing, como enseña la tradición).
 * - En el día javanés la fecha cambia al ponerse el sol: quien nace después del atardecer pertenece al día
 *   siguiente, para el weton y para el wuku.
 */

export const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
/** Nombres javaneses antiguos de los días (los que usa el Primbon). */
export const HARI_JAWA = ["Radite", "Soma", "Anggara", "Buda", "Respati", "Sukra", "Tumpak"] as const;
export const NEPTU_HARI = [5, 4, 3, 7, 8, 6, 9] as const;

export const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"] as const;
export const NEPTU_PASARAN = [5, 9, 7, 4, 8] as const;

export const WUKU = [
  "Sinta", "Landep", "Wukir", "Kurantil", "Tolu", "Gumbreg", "Warigalit", "Warigagung", "Julungwangi", "Sungsang",
  "Galungan", "Kuningan", "Langkir", "Mandasiya", "Julungpujut", "Pahang", "Kuruwelut", "Marakeh", "Tambir", "Medangkungan",
  "Maktal", "Wuye", "Manahil", "Prangbakat", "Bala", "Wugu", "Wayang", "Kulawu", "Dukut", "Watugunung",
] as const;

/** "Laku" (camino) de la persona según su neptu, del 7 al 18, como lo recoge el Primbon. */
export const LAKU: Record<number, string> = {
  7: "Lebu katiup angin",
  8: "Lakuning geni",
  9: "Lakuning angin",
  10: "Pandito mbangun teki",
  11: "Aras tuding",
  12: "Aras kembang",
  13: "Lakuning lintang",
  14: "Lakuning rembulan",
  15: "Lakuning srengenge",
  16: "Lakuning banyu",
  17: "Lakuning bumi",
  18: "Lakuning paripurna",
};

/**
 * Resultado de pareja por la suma de neptu de los dos, dividida entre 8 (el esquema más extendido del Primbon):
 * resto 1 Pegat, 2 Ratu, 3 Jodoh, 4 Topo, 5 Tinari, 6 Padu, 7 Sujanan, 0 Pesthi.
 */
export const JODOH = ["pesthi", "pegat", "ratu", "jodoh", "topo", "tinari", "padu", "sujanan"] as const;
export type ClaveJodoh = (typeof JODOH)[number];
export const NOMBRE_JODOH: Record<ClaveJodoh, string> = {
  pegat: "Pegat",
  ratu: "Ratu",
  jodoh: "Jodoh",
  topo: "Topo",
  tinari: "Tinari",
  padu: "Padu",
  sujanan: "Sujanan",
  pesthi: "Pesthi",
};
/** Orden en que el Primbon recita el ciclo (resto 1 → 8). */
export const ORDEN_JODOH: ClaveJodoh[] = ["pegat", "ratu", "jodoh", "topo", "tinari", "padu", "sujanan", "pesthi"];

export interface ResultadoWeton {
  /** Fecha de nacimiento tal como la dio la persona (AAAA-MM-DD). */
  fecha: string;
  despuesAtardecer: boolean;
  /** Fecha que cuenta para el día javanés (la siguiente si nació tras la puesta del sol). */
  fechaJawa: string;
  hari: { indice: number; nombre: string; jawa: string; neptu: number };
  pasaran: { indice: number; nombre: string; neptu: number };
  /** "Jumat Legi". */
  weton: string;
  neptu: number;
  laku: string;
  wuku: { indice: number; nombre: string; /** 1 (Minggu) a 7 (Sabtu) */ dia: number };
}

export interface ResultadoJodoh {
  a: ResultadoWeton;
  b: ResultadoWeton;
  total: number;
  /** Resto de total / 8, contado de 1 a 8 (8 = sin resto). */
  resto: number;
  clave: ClaveJodoh;
  nombre: string;
}

const DIA_MS = 86_400_000;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Días desde el 1 de enero de 1970 (calendario gregoriano proléptico), sin husos horarios. */
export function diasDesdeEpoca(fecha: string): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return Math.round(Date.UTC(a, m - 1, d) / DIA_MS);
}

function fechaDeDias(dias: number): string {
  return new Date(dias * DIA_MS).toISOString().slice(0, 10);
}

/** ¿Es una fecha AAAA-MM-DD que existe en el calendario? */
export function fechaValida(fecha: unknown): fecha is string {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [a, m, d] = fecha.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
}

const EPOCA_PASARAN = diasDesdeEpoca("1945-08-17"); // Jumat Legi
const EPOCA_WUKU = diasDesdeEpoca("2025-09-07"); // Minggu Pahing, wuku Sinta

/** Weton del día javanés que corresponde a una fecha gregoriana. */
export function calcularWeton(fecha: string, despuesAtardecer = false): ResultadoWeton {
  if (!fechaValida(fecha)) throw new Error("Fecha no válida");
  const dias = diasDesdeEpoca(fecha) + (despuesAtardecer ? 1 : 0);
  const h = mod(dias + 4, 7); // 1970-01-01 fue jueves
  const p = mod(dias - EPOCA_PASARAN, 5);
  const enCiclo = mod(dias - EPOCA_WUKU, 210);
  const w = Math.floor(enCiclo / 7);
  const neptu = NEPTU_HARI[h] + NEPTU_PASARAN[p];
  return {
    fecha,
    despuesAtardecer,
    fechaJawa: fechaDeDias(dias),
    hari: { indice: h, nombre: HARI[h], jawa: HARI_JAWA[h], neptu: NEPTU_HARI[h] },
    pasaran: { indice: p, nombre: PASARAN[p], neptu: NEPTU_PASARAN[p] },
    weton: `${HARI[h]} ${PASARAN[p]}`,
    neptu,
    laku: LAKU[neptu],
    wuku: { indice: w, nombre: WUKU[w], dia: (enCiclo % 7) + 1 },
  };
}

/** Compatibilidad de pareja: suma de los dos neptu y su lugar en el ciclo de 8 (Pegat… Pesthi). */
export function calcularJodoh(a: ResultadoWeton, b: ResultadoWeton): ResultadoJodoh {
  const total = a.neptu + b.neptu;
  const r = total % 8;
  const clave = JODOH[r];
  return { a, b, total, resto: r === 0 ? 8 : r, clave, nombre: NOMBRE_JODOH[clave] };
}

/** Próxima fecha (desde `desde`, incluida) en que vuelve el mismo weton: cada 35 días. */
export function proximoWeton(r: Pick<ResultadoWeton, "fechaJawa">, desde: string): string {
  const base = diasDesdeEpoca(r.fechaJawa);
  const hoy = diasDesdeEpoca(desde);
  return fechaDeDias(hoy + mod(base - hoy, 35));
}

/** Vuelve a calcular un weton guardado (JSON) desde su fecha, para que siempre cuadre con las tablas. */
export function wetonDeGuardado(r: Record<string, unknown>): ResultadoWeton | null {
  return fechaValida(r.fecha) ? calcularWeton(r.fecha, r.despuesAtardecer === true) : null;
}

/** Igual para una pareja guardada ({ a, b, … }). */
export function jodohDeGuardado(r: Record<string, unknown>): ResultadoJodoh | null {
  const a = wetonDeGuardado((r.a ?? {}) as Record<string, unknown>);
  const b = wetonDeGuardado((r.b ?? {}) as Record<string, unknown>);
  return a && b ? calcularJodoh(a, b) : null;
}
