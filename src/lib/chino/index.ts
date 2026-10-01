/**
 * Calendario chino: animal y elemento del año de nacimiento (con el Año Nuevo
 * chino real, no el 1 de enero), animal de la hora ("animal secreto"),
 * relaciones tradicionales y el año en curso. Puede usarse en el navegador.
 */

export type Animal = "rata" | "buey" | "tigre" | "conejo" | "dragon" | "serpiente" | "caballo" | "cabra" | "mono" | "gallo" | "perro" | "cerdo";
export type ElementoChino = "madera" | "fuego" | "tierra" | "metal" | "agua";
export type Polaridad = "yang" | "yin";

export const ANIMALES: Animal[] = ["rata", "buey", "tigre", "conejo", "dragon", "serpiente", "caballo", "cabra", "mono", "gallo", "perro", "cerdo"];
export const ELEMENTOS: ElementoChino[] = ["madera", "fuego", "tierra", "metal", "agua"];

export interface FichaAnimal {
  nombre: string;
  caracter: string;
  /** Elemento fijo del animal (rama terrestre). */
  elementoFijo: ElementoChino;
  rasgos: [string, string, string];
  horas: string;
}

export const FICHA: Record<Animal, FichaAnimal> = {
  rata: { nombre: "Rata", caracter: "鼠", elementoFijo: "agua", rasgos: ["ingenio", "encanto", "previsión"], horas: "23:00–01:00" },
  buey: { nombre: "Buey", caracter: "牛", elementoFijo: "tierra", rasgos: ["constancia", "lealtad", "paciencia"], horas: "01:00–03:00" },
  tigre: { nombre: "Tigre", caracter: "虎", elementoFijo: "madera", rasgos: ["valor", "impulso", "carisma"], horas: "03:00–05:00" },
  conejo: { nombre: "Conejo", caracter: "兔", elementoFijo: "madera", rasgos: ["diplomacia", "sensibilidad", "elegancia"], horas: "05:00–07:00" },
  dragon: { nombre: "Dragón", caracter: "龙", elementoFijo: "tierra", rasgos: ["ambición", "vitalidad", "fortuna"], horas: "07:00–09:00" },
  serpiente: { nombre: "Serpiente", caracter: "蛇", elementoFijo: "fuego", rasgos: ["sabiduría", "intuición", "reserva"], horas: "09:00–11:00" },
  caballo: { nombre: "Caballo", caracter: "马", elementoFijo: "fuego", rasgos: ["libertad", "entusiasmo", "franqueza"], horas: "11:00–13:00" },
  cabra: { nombre: "Cabra", caracter: "羊", elementoFijo: "tierra", rasgos: ["creatividad", "ternura", "calma"], horas: "13:00–15:00" },
  mono: { nombre: "Mono", caracter: "猴", elementoFijo: "metal", rasgos: ["astucia", "curiosidad", "versatilidad"], horas: "15:00–17:00" },
  gallo: { nombre: "Gallo", caracter: "鸡", elementoFijo: "metal", rasgos: ["precisión", "honestidad", "orgullo"], horas: "17:00–19:00" },
  perro: { nombre: "Perro", caracter: "狗", elementoFijo: "tierra", rasgos: ["fidelidad", "justicia", "protección"], horas: "19:00–21:00" },
  cerdo: { nombre: "Cerdo", caracter: "猪", elementoFijo: "agua", rasgos: ["generosidad", "sinceridad", "disfrute"], horas: "21:00–23:00" },
};

export const NOMBRE_ELEMENTO: Record<ElementoChino, string> = { madera: "Madera", fuego: "Fuego", tierra: "Tierra", metal: "Metal", agua: "Agua" };
export const COLOR_ELEMENTO: Record<ElementoChino, string> = { madera: "#7fd6a4", fuego: "#ff8a5b", tierra: "#d9b45a", metal: "#e6e6ef", agua: "#8fc7ff" };
export const CARACTER_ELEMENTO: Record<ElementoChino, string> = { madera: "木", fuego: "火", tierra: "土", metal: "金", agua: "水" };

/** Los tres animales de cada triángulo de afinidad (San He). */
export const TRINOS: Animal[][] = [
  ["rata", "dragon", "mono"],
  ["buey", "serpiente", "gallo"],
  ["tigre", "caballo", "perro"],
  ["conejo", "cabra", "cerdo"],
];
/** Pares opuestos (Liu Chong). */
export const CHOQUES: Record<Animal, Animal> = {
  rata: "caballo", caballo: "rata", buey: "cabra", cabra: "buey", tigre: "mono", mono: "tigre",
  conejo: "gallo", gallo: "conejo", dragon: "perro", perro: "dragon", serpiente: "cerdo", cerdo: "serpiente",
};
/** Amigo secreto (Liu He). */
export const AMIGOS: Record<Animal, Animal> = {
  rata: "buey", buey: "rata", tigre: "cerdo", cerdo: "tigre", conejo: "perro", perro: "conejo",
  dragon: "gallo", gallo: "dragon", serpiente: "mono", mono: "serpiente", caballo: "cabra", cabra: "caballo",
};

/** Fecha gregoriana (mes, día) del Año Nuevo chino, 1900–2044. */
const ANO_NUEVO: Record<number, [number, number]> = {
  1900: [1, 31], 1901: [2, 19], 1902: [2, 8], 1903: [1, 29], 1904: [2, 16], 1905: [2, 4], 1906: [1, 25], 1907: [2, 13], 1908: [2, 2], 1909: [1, 22],
  1910: [2, 10], 1911: [1, 30], 1912: [2, 18], 1913: [2, 6], 1914: [1, 26], 1915: [2, 14], 1916: [2, 3], 1917: [1, 23], 1918: [2, 11], 1919: [2, 1],
  1920: [2, 20], 1921: [2, 8], 1922: [1, 28], 1923: [2, 16], 1924: [2, 5], 1925: [1, 24], 1926: [2, 13], 1927: [2, 2], 1928: [1, 23], 1929: [2, 10],
  1930: [1, 30], 1931: [2, 17], 1932: [2, 6], 1933: [1, 26], 1934: [2, 14], 1935: [2, 4], 1936: [1, 24], 1937: [2, 11], 1938: [1, 31], 1939: [2, 19],
  1940: [2, 8], 1941: [1, 27], 1942: [2, 15], 1943: [2, 5], 1944: [1, 25], 1945: [2, 13], 1946: [2, 2], 1947: [1, 22], 1948: [2, 10], 1949: [1, 29],
  1950: [2, 17], 1951: [2, 6], 1952: [1, 27], 1953: [2, 14], 1954: [2, 3], 1955: [1, 24], 1956: [2, 12], 1957: [1, 31], 1958: [2, 18], 1959: [2, 8],
  1960: [1, 28], 1961: [2, 15], 1962: [2, 5], 1963: [1, 25], 1964: [2, 13], 1965: [2, 2], 1966: [1, 21], 1967: [2, 9], 1968: [1, 30], 1969: [2, 17],
  1970: [2, 6], 1971: [1, 27], 1972: [2, 15], 1973: [2, 3], 1974: [1, 23], 1975: [2, 11], 1976: [1, 31], 1977: [2, 18], 1978: [2, 7], 1979: [1, 28],
  1980: [2, 16], 1981: [2, 5], 1982: [1, 25], 1983: [2, 13], 1984: [2, 2], 1985: [2, 20], 1986: [2, 9], 1987: [1, 29], 1988: [2, 17], 1989: [2, 6],
  1990: [1, 27], 1991: [2, 15], 1992: [2, 4], 1993: [1, 23], 1994: [2, 10], 1995: [1, 31], 1996: [2, 19], 1997: [2, 7], 1998: [1, 28], 1999: [2, 16],
  2000: [2, 5], 2001: [1, 24], 2002: [2, 12], 2003: [2, 1], 2004: [1, 22], 2005: [2, 9], 2006: [1, 29], 2007: [2, 18], 2008: [2, 7], 2009: [1, 26],
  2010: [2, 14], 2011: [2, 3], 2012: [1, 23], 2013: [2, 10], 2014: [1, 31], 2015: [2, 19], 2016: [2, 8], 2017: [1, 28], 2018: [2, 16], 2019: [2, 5],
  2020: [1, 25], 2021: [2, 12], 2022: [2, 1], 2023: [1, 22], 2024: [2, 10], 2025: [1, 29], 2026: [2, 17], 2027: [2, 6], 2028: [1, 26], 2029: [2, 13],
  2030: [2, 3], 2031: [1, 23], 2032: [2, 11], 2033: [1, 31], 2034: [2, 19], 2035: [2, 8], 2036: [1, 28], 2037: [2, 15], 2038: [2, 4], 2039: [1, 24],
  2040: [2, 12], 2041: [2, 1], 2042: [1, 22], 2043: [2, 10], 2044: [1, 30],
};

/** Año chino (el que empieza en el Año Nuevo lunar) de una fecha gregoriana. */
export function anioChinoDe(anio: number, mes: number, dia: number) {
  const inicio = ANO_NUEVO[anio] ?? [2, 4];
  const antes = mes < inicio[0] || (mes === inicio[0] && dia < inicio[1]);
  return antes ? anio - 1 : anio;
}

function modulo(n: number, m: number) {
  return ((n % m) + m) % m;
}

export interface PilarAnio {
  anio: number;
  animal: Animal;
  elemento: ElementoChino;
  polaridad: Polaridad;
}

/** Animal, elemento (tallo celeste) y polaridad de un año chino. 1924 = Rata de Madera yang. */
export function pilarDeAnio(anioChino: number): PilarAnio {
  const n = anioChino - 1924;
  const tallo = modulo(n, 10);
  return { anio: anioChino, animal: ANIMALES[modulo(n, 12)], elemento: ELEMENTOS[Math.floor(tallo / 2)], polaridad: tallo % 2 === 0 ? "yang" : "yin" };
}

export function animalDeHora(hora: string): Animal | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hora);
  if (!m) return null;
  const h = Number(m[1]);
  if (h < 0 || h > 23) return null;
  return ANIMALES[Math.floor(((h + 1) % 24) / 2)];
}

export type Relacion = "mismo" | "trino" | "amigo" | "choque" | "neutra";

export function relacionEntre(a: Animal, b: Animal): Relacion {
  if (a === b) return "mismo";
  if (TRINOS.some((t) => t.includes(a) && t.includes(b))) return "trino";
  if (AMIGOS[a] === b) return "amigo";
  if (CHOQUES[a] === b) return "choque";
  return "neutra";
}

export interface ResultadoChino {
  fecha: string;
  hora: string | null;
  pilar: PilarAnio;
  animalHora: Animal | null;
  companeros: Animal[];
  amigo: Animal;
  choque: Animal;
  anioActual: PilarAnio;
  relacionAnioActual: Relacion;
}

export function calcularChino(fecha: string, hora: string | null = null, hoy = new Date()): ResultadoChino {
  const [a, m, d] = fecha.split("-").map(Number);
  const pilar = pilarDeAnio(anioChinoDe(a, m, d));
  const anioActual = pilarDeAnio(anioChinoDe(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate()));
  return {
    fecha,
    hora,
    pilar,
    animalHora: hora ? animalDeHora(hora) : null,
    companeros: TRINOS.find((t) => t.includes(pilar.animal))!.filter((x) => x !== pilar.animal),
    amigo: AMIGOS[pilar.animal],
    choque: CHOQUES[pilar.animal],
    anioActual,
    relacionAnioActual: relacionEntre(pilar.animal, anioActual.animal),
  };
}

export function nombrePilar(p: PilarAnio) {
  return `${FICHA[p.animal].nombre} de ${NOMBRE_ELEMENTO[p.elemento]}`;
}

const TEXTO_RELACION: Record<Relacion, string> = {
  mismo: "es su propio signo (año de 'ben ming nian', tradicionalmente exigente, pide cuidado y protección)",
  trino: "forma triángulo de afinidad con su animal (año favorable, de apoyo)",
  amigo: "es su amigo secreto (año de alianzas y ayuda inesperada)",
  choque: "está en choque con su animal (año de fricción, pide prudencia y flexibilidad)",
  neutra: "no tiene relación especial con su animal (año neutro, depende de las decisiones)",
};

/** Resumen en texto plano para el modelo. */
export function resumenChino(r: ResultadoChino, nombre: string) {
  const f = FICHA[r.pilar.animal];
  const lineas = [
    `Persona: ${nombre}. Fecha de nacimiento: ${r.fecha}${r.hora ? ` a las ${r.hora}` : " (hora desconocida)"}.`,
    `Año chino de nacimiento: ${r.pilar.anio}, ${nombrePilar(r.pilar)} (${f.caracter}, ${CARACTER_ELEMENTO[r.pilar.elemento]}), polaridad ${r.pilar.polaridad}. Elemento fijo del animal: ${NOMBRE_ELEMENTO[f.elementoFijo]}. Rasgos tradicionales: ${f.rasgos.join(", ")}.`,
    r.animalHora ? `Animal de la hora de nacimiento ("animal secreto", el carácter íntimo): ${FICHA[r.animalHora].nombre}.` : "Sin animal de la hora (hora desconocida).",
    `Afinidades: triángulo con ${r.companeros.map((x) => FICHA[x].nombre).join(" y ")}; amigo secreto: ${FICHA[r.amigo].nombre}; choque: ${FICHA[r.choque].nombre}.`,
    `Año en curso: ${r.anioActual.anio}, ${nombrePilar(r.anioActual)}, que ${TEXTO_RELACION[r.relacionAnioActual]}.`,
  ];
  return lineas.join("\n");
}
