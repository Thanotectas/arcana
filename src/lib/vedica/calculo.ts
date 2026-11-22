/**
 * Kundli védico (Jyotish): posiciones siderales con ayanamsa Lahiri, Lagna con
 * casas de signo entero, rashi y nakshatra de la Luna, Vimshottari dasha y
 * Manglik dosha. Cálculo puro: parte del motor tropical de src/lib/astro.
 */
import { localAUtc, type DatosNacimiento } from "../astro/carta";
import { posiciones, diasJulianos } from "../astro/efemerides";
import { calcularCasas } from "../astro/casas";
import { nutation } from "astronomia";

export type IdGraha = "surya" | "chandra" | "mangal" | "budh" | "guru" | "shukra" | "shani" | "rahu" | "ketu";
export type Dignidad = "exaltado" | "debilitado" | "propio";

/** Orden clásico de los nueve grahas (Sol, Luna, Marte, Mercurio, Júpiter, Venus, Saturno, Rahu, Ketu). */
export const GRAHAS: IdGraha[] = ["surya", "chandra", "mangal", "budh", "guru", "shukra", "shani", "rahu", "ketu"];

/** Nombres sánscritos (transliteración) para el prompt y las tablas. */
export const NOMBRE_GRAHA: Record<IdGraha, string> = {
  surya: "Surya (Sol)",
  chandra: "Chandra (Luna)",
  mangal: "Mangal (Marte)",
  budh: "Budh (Mercurio)",
  guru: "Guru (Júpiter)",
  shukra: "Shukra (Venus)",
  shani: "Shani (Saturno)",
  rahu: "Rahu (nodo norte medio)",
  ketu: "Ketu (nodo sur)",
};

export const RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
export const RASHIS_OCCIDENTAL = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

/** Regente de cada rashi (índice 0 = Mesha). */
export const SENOR_RASHI: IdGraha[] = ["mangal", "shukra", "budh", "chandra", "surya", "budh", "shukra", "mangal", "guru", "shani", "shani", "guru"];

/** Secuencia Vimshottari (empieza en Ashwini → Ketu) y años de cada mahadasha (suman 120). */
export const SECUENCIA_DASHA: IdGraha[] = ["ketu", "shukra", "surya", "chandra", "mangal", "rahu", "guru", "shani", "budh"];
export const ANIOS_DASHA: Record<IdGraha, number> = { ketu: 7, shukra: 20, surya: 6, chandra: 10, mangal: 7, rahu: 18, guru: 16, shani: 19, budh: 17 };

const EXALTACION: Partial<Record<IdGraha, number>> = { surya: 0, chandra: 1, mangal: 9, budh: 5, guru: 3, shukra: 11, shani: 6 };
const DEBILITACION: Partial<Record<IdGraha, number>> = { surya: 6, chandra: 7, mangal: 3, budh: 11, guru: 9, shukra: 5, shani: 0 };

const NAKSHATRA = 360 / 27; // 13°20'
const PADA = NAKSHATRA / 4; // 3°20'
/** Año para los dashas: año juliano de 365,25 días (el más usado por el software indio). */
const ANIO_MS = 365.25 * 86400000;

export interface GrahaKundli {
  id: IdGraha;
  /** Longitud sideral (Lahiri) en grados [0, 360). */
  longitud: number;
  rashi: number; // 0-11 (0 = Mesha)
  grado: number; // grados dentro del rashi (0-30)
  nakshatra: number; // 0-26 (0 = Ashwini)
  pada: number; // 1-4
  casa: number; // 1-12, signo entero desde la referencia (Lagna o Luna)
  retrogrado: boolean;
  dignidad: Dignidad | null;
}

export interface PeriodoDasha {
  senor: IdGraha;
  inicio: string; // YYYY-MM-DD
  fin: string;
}

export interface MahadashaKundli extends PeriodoDasha {
  antardashas: PeriodoDasha[];
}

export interface ManglikPersona {
  /** Casa de Mangal contada desde el Lagna (null si la hora es desconocida). */
  casaDesdeLagna: number | null;
  casaDesdeLuna: number;
  desdeLagna: boolean | null;
  desdeLuna: boolean;
  /** Mangal en signo propio (Mesha, Vrishchika) o exaltado (Makara): la tradición lo considera atenuado. */
  atenuado: boolean;
  /** "si": desde Lagna y desde la Luna; "parcial": solo desde uno; "no": ninguno. */
  estado: "si" | "parcial" | "no";
}

export interface ResultadoKundli {
  version: 1;
  nombre: string;
  fechaUtc: string;
  /** Instante en que se calculó (fija el dasha "actual" de la lectura). */
  fechaCalculo: string;
  ayanamsa: number;
  horaDesconocida: boolean;
  /** Ascendente sideral; null si la hora es desconocida. */
  lagna: { longitud: number; rashi: number; grado: number; nakshatra: number; pada: number } | null;
  /** Desde dónde se cuentan las casas: el Lagna o, sin hora, la Luna (Chandra Lagna). */
  referencia: "lagna" | "chandra";
  /** Rashi que ocupa la casa 1 del dibujo. */
  rashiCasa1: number;
  grahas: GrahaKundli[];
  luna: { rashi: number; nakshatra: number; pada: number; senorNakshatra: IdGraha };
  dasha: {
    /** Lo que quedaba del primer mahadasha al nacer. */
    balance: { senor: IdGraha; anios: number; meses: number; dias: number };
    mahadashas: MahadashaKundli[];
    actual: { maha: PeriodoDasha; antar: PeriodoDasha } | null;
    /** Los antardashas que siguen al actual (hasta 4, pueden cruzar al siguiente mahadasha). */
    proximos: (PeriodoDasha & { maha: IdGraha })[];
  };
  manglik: ManglikPersona;
}

function norm360(g: number) {
  return ((g % 360) + 360) % 360;
}

const redondear = (x: number, d = 4) => Math.round(x * 10 ** d) / 10 ** d;

/**
 * Ayanamsa Lahiri (Chitrapaksha) media: 23°51'25.46" en J2000.0 más la
 * precesión general en longitud (IAU 2006). Coincide con Swiss Ephemeris
 * (SE_SIDM_LAHIRI) al segundo de arco entre 1900 y 2100.
 */
export function ayanamsaLahiriMedia(jde: number) {
  const t = (jde - 2451545.0) / 36525;
  const precesion = 5028.796195 * t + 1.1054348 * t * t + 0.00007964 * t * t * t; // segundos de arco
  return 23.857073 + precesion / 3600;
}

/** Ayanamsa verdadera (media + nutación en longitud), la que corresponde a posiciones aparentes. */
export function ayanamsaLahiri(jde: number) {
  const [dPsi] = nutation.nutation(jde);
  return ayanamsaLahiriMedia(jde) + (dPsi * 180) / Math.PI;
}

function fechaIso(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

function dignidad(id: IdGraha, rashi: number): Dignidad | null {
  if (EXALTACION[id] === rashi) return "exaltado";
  if (DEBILITACION[id] === rashi) return "debilitado";
  if (id !== "rahu" && id !== "ketu" && SENOR_RASHI[rashi] === id) return "propio";
  return null;
}

/** Nakshatra (0-26) y pada (1-4) de una longitud sideral. */
export function nakshatraDe(longitud: number) {
  const l = norm360(longitud);
  const nakshatra = Math.min(26, Math.floor(l / NAKSHATRA));
  const pada = Math.min(4, Math.floor((l - nakshatra * NAKSHATRA) / PADA) + 1);
  return { nakshatra, pada };
}

/** Casa de Mangal que activa el Manglik dosha (1, 2, 4, 7, 8, 12, la regla más extendida). */
const CASAS_MANGLIK = [1, 2, 4, 7, 8, 12];

export function casaDesde(rashiPlaneta: number, rashiReferencia: number) {
  return ((rashiPlaneta - rashiReferencia + 12) % 12) + 1;
}

/**
 * Vimshottari dasha desde la longitud sideral de la Luna. El primer mahadasha
 * es el del regente del nakshatra lunar, y al nacer ya había transcurrido la
 * fracción del nakshatra que la Luna había recorrido.
 */
export function vimshottari(longitudLuna: number, nacimientoMs: number, ahoraMs: number): ResultadoKundli["dasha"] {
  const l = norm360(longitudLuna);
  const { nakshatra } = nakshatraDe(l);
  const recorrido = (l - nakshatra * NAKSHATRA) / NAKSHATRA; // 0..1
  const inicioIdx = nakshatra % 9;
  const primero = SECUENCIA_DASHA[inicioIdx];
  const restanteAnios = (1 - recorrido) * ANIOS_DASHA[primero];

  let inicio = nacimientoMs - recorrido * ANIOS_DASHA[primero] * ANIO_MS;
  const mahadashas: MahadashaKundli[] = [];
  const crudos: { senor: IdGraha; ini: number; fin: number; antar: { senor: IdGraha; ini: number; fin: number }[] }[] = [];
  for (let i = 0; i < 9; i++) {
    const senor = SECUENCIA_DASHA[(inicioIdx + i) % 9];
    const duracion = ANIOS_DASHA[senor] * ANIO_MS;
    const fin = inicio + duracion;
    const antar: { senor: IdGraha; ini: number; fin: number }[] = [];
    let a = inicio;
    const idx = SECUENCIA_DASHA.indexOf(senor);
    for (let j = 0; j < 9; j++) {
      const sub = SECUENCIA_DASHA[(idx + j) % 9];
      const d = (duracion * ANIOS_DASHA[sub]) / 120;
      antar.push({ senor: sub, ini: a, fin: a + d });
      a += d;
    }
    crudos.push({ senor, ini: inicio, fin, antar });
    mahadashas.push({
      senor,
      inicio: fechaIso(inicio),
      fin: fechaIso(fin),
      antardashas: antar.map((x) => ({ senor: x.senor, inicio: fechaIso(x.ini), fin: fechaIso(x.fin) })),
    });
    inicio = fin;
  }

  // Dasha actual y los siguientes antardashas.
  let actual: ResultadoKundli["dasha"]["actual"] = null;
  const proximos: ResultadoKundli["dasha"]["proximos"] = [];
  const planos = crudos.flatMap((m) => m.antar.map((x) => ({ ...x, maha: m.senor, mahaIni: m.ini, mahaFin: m.fin })));
  const k = planos.findIndex((x) => ahoraMs >= x.ini && ahoraMs < x.fin);
  if (k >= 0) {
    const x = planos[k];
    actual = {
      maha: { senor: x.maha, inicio: fechaIso(x.mahaIni), fin: fechaIso(x.mahaFin) },
      antar: { senor: x.senor, inicio: fechaIso(x.ini), fin: fechaIso(x.fin) },
    };
    for (const y of planos.slice(k + 1, k + 5)) proximos.push({ senor: y.senor, maha: y.maha, inicio: fechaIso(y.ini), fin: fechaIso(y.fin) });
  }

  // Balance al nacer en años, meses y días (meses de 30,4375 días).
  const totalDias = restanteAnios * 365.25;
  const anios = Math.floor(totalDias / 365.25);
  const restoDias = totalDias - anios * 365.25;
  const meses = Math.floor(restoDias / 30.4375);
  const dias = Math.floor(restoDias - meses * 30.4375);

  return { balance: { senor: primero, anios, meses, dias }, mahadashas, actual, proximos };
}

export function manglikDe(rashiMangal: number, rashiLagna: number | null, rashiLuna: number): ManglikPersona {
  const casaDesdeLuna = casaDesde(rashiMangal, rashiLuna);
  const casaDesdeLagna = rashiLagna === null ? null : casaDesde(rashiMangal, rashiLagna);
  const desdeLuna = CASAS_MANGLIK.includes(casaDesdeLuna);
  const desdeLagna = casaDesdeLagna === null ? null : CASAS_MANGLIK.includes(casaDesdeLagna);
  const cuenta = (desdeLuna ? 1 : 0) + (desdeLagna ? 1 : 0);
  // Sin hora solo se puede mirar desde la Luna: como mucho, "parcial".
  const estado = cuenta === 2 ? "si" : cuenta === 1 ? "parcial" : "no";
  const atenuado = cuenta > 0 && (rashiMangal === 0 || rashiMangal === 7 || rashiMangal === 9);
  return { casaDesdeLagna, casaDesdeLuna, desdeLagna, desdeLuna, atenuado, estado };
}

/** Calcula el kundli completo. `ahora` fija el dasha actual (por defecto, este instante). */
export function calcularKundli(datos: DatosNacimiento, ahora: Date = new Date()): ResultadoKundli {
  const hora = datos.horaDesconocida ? "12:00" : datos.hora;
  const fechaUtc = localAUtc(datos.fecha, hora, datos.zonaHoraria);
  const { jde } = diasJulianos(fechaUtc);
  const ayanVerdadera = ayanamsaLahiri(jde);
  const ayanMedia = ayanamsaLahiriMedia(jde);

  const pos = posiciones(fechaUtc);
  const tropical = (c: string) => pos.find((p) => p.cuerpo === c)!;
  // Las posiciones aparentes llevan nutación; el nodo medio de `posiciones` no, así que se resta la ayanamsa media.
  const sideral = (c: string, media = false) => norm360(tropical(c).longitud - (media ? ayanMedia : ayanVerdadera));

  const longitudes: Record<IdGraha, { lon: number; retro: boolean }> = {
    surya: { lon: sideral("sol"), retro: false },
    chandra: { lon: sideral("luna"), retro: false },
    mangal: { lon: sideral("marte"), retro: tropical("marte").retrogrado },
    budh: { lon: sideral("mercurio"), retro: tropical("mercurio").retrogrado },
    guru: { lon: sideral("jupiter"), retro: tropical("jupiter").retrogrado },
    shukra: { lon: sideral("venus"), retro: tropical("venus").retrogrado },
    shani: { lon: sideral("saturno"), retro: tropical("saturno").retrogrado },
    rahu: { lon: sideral("nodo_norte", true), retro: true },
    ketu: { lon: norm360(sideral("nodo_norte", true) + 180), retro: true },
  };

  let lagna: ResultadoKundli["lagna"] = null;
  if (!datos.horaDesconocida) {
    const asc = norm360(calcularCasas(fechaUtc, datos.latitud, datos.longitud).ascendente - ayanVerdadera);
    lagna = { longitud: redondear(asc), rashi: Math.floor(asc / 30), grado: redondear(asc % 30), ...nakshatraDe(asc) };
  }

  const rashiLuna = Math.floor(longitudes.chandra.lon / 30);
  const rashiCasa1 = lagna ? lagna.rashi : rashiLuna;

  const grahas: GrahaKundli[] = GRAHAS.map((id) => {
    const { lon, retro } = longitudes[id];
    const rashi = Math.floor(lon / 30);
    return {
      id,
      longitud: redondear(lon),
      rashi,
      grado: redondear(lon % 30),
      ...nakshatraDe(lon),
      casa: casaDesde(rashi, rashiCasa1),
      retrogrado: retro,
      dignidad: dignidad(id, rashi),
    };
  });

  const lunaNak = nakshatraDe(longitudes.chandra.lon);
  return {
    version: 1,
    nombre: datos.nombre,
    fechaUtc: fechaUtc.toISOString(),
    fechaCalculo: ahora.toISOString(),
    ayanamsa: redondear(ayanVerdadera, 5),
    horaDesconocida: datos.horaDesconocida,
    lagna,
    referencia: lagna ? "lagna" : "chandra",
    rashiCasa1,
    grahas,
    luna: { rashi: rashiLuna, ...lunaNak, senorNakshatra: SECUENCIA_DASHA[lunaNak.nakshatra % 9] },
    dasha: vimshottari(longitudes.chandra.lon, fechaUtc.getTime(), ahora.getTime()),
    manglik: manglikDe(Math.floor(longitudes.mangal.lon / 30), lagna ? lagna.rashi : null, rashiLuna),
  };
}

/** Grado dentro del signo como 12°34'. */
export function formatoGradoVedico(grado: number) {
  const g = Math.floor(grado);
  const m = Math.floor((grado - g) * 60);
  return `${g}°${String(m).padStart(2, "0")}'`;
}
