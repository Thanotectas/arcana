/**
 * Kundli milan: Ashtakoot Guna Milan (36 gunas) entre dos personas a partir del
 * nakshatra y el rashi de la Luna de cada una, más el Manglik de cada kundli.
 * Las tablas distinguen el lado del novio (persona A) y el de la novia (B),
 * como en la tradición; para Tara, Yoni, Graha Maitri, Bhakoot y Nadi da igual.
 */
import type { DatosNacimiento } from "../astro/carta";
import { calcularKundli, SENOR_RASHI, type IdGraha, type ManglikPersona } from "./calculo";

export type IdKoota = "varna" | "vashya" | "tara" | "yoni" | "graha_maitri" | "gana" | "bhakoot" | "nadi";
export const KOOTAS: IdKoota[] = ["varna", "vashya", "tara", "yoni", "graha_maitri", "gana", "bhakoot", "nadi"];
export const MAXIMO_KOOTA: Record<IdKoota, number> = { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 6, bhakoot: 7, nadi: 8 };

export type Varna = "brahmin" | "kshatriya" | "vaishya" | "shudra";
export type Vashya = "chatushpada" | "manava" | "jalachara" | "vanachara" | "keeta";
export type Yoni = "ashwa" | "gaja" | "mesha" | "sarpa" | "shwana" | "marjara" | "mushaka" | "gau" | "mahisha" | "vyaghra" | "mriga" | "vanara" | "nakula" | "simha";
export type Gana = "deva" | "manushya" | "rakshasa";
export type Nadi = "aadi" | "madhya" | "antya";

// Varna por rashi: agua Brahmin, fuego Kshatriya, tierra Vaishya, aire Shudra.
const VARNA_RASHI: Varna[] = ["kshatriya", "vaishya", "shudra", "brahmin", "kshatriya", "vaishya", "shudra", "brahmin", "kshatriya", "vaishya", "shudra", "brahmin"];
const RANGO_VARNA: Record<Varna, number> = { brahmin: 4, kshatriya: 3, vaishya: 2, shudra: 1 };

const VASHYAS: Vashya[] = ["chatushpada", "manava", "jalachara", "vanachara", "keeta"];
// Novio (fila) × novia (columna), en el orden de VASHYAS.
const TABLA_VASHYA = [
  [2, 1, 1, 0.5, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0.5, 0, 1, 2, 0],
  [1, 1, 1, 0, 2],
];

/** Vashya por rashi; Dhanu y Makara cambian a mitad de signo. */
export function vashyaDe(rashi: number, grado: number): Vashya {
  switch (rashi) {
    case 0:
    case 1:
      return "chatushpada";
    case 2:
    case 5:
    case 6:
    case 10:
      return "manava";
    case 3:
    case 11:
      return "jalachara";
    case 4:
      return "vanachara";
    case 7:
      return "keeta";
    case 8:
      return grado < 15 ? "manava" : "chatushpada";
    default: // 9, Makara
      return grado < 15 ? "chatushpada" : "jalachara";
  }
}

const YONIS: Yoni[] = ["ashwa", "gaja", "mesha", "sarpa", "shwana", "marjara", "mushaka", "gau", "mahisha", "vyaghra", "mriga", "vanara", "nakula", "simha"];
/** Yoni (animal) de cada nakshatra, de Ashwini a Revati. */
export const YONI_NAKSHATRA: Yoni[] = [
  "ashwa", "gaja", "mesha", "sarpa", "sarpa", "shwana", "marjara", "mesha", "marjara",
  "mushaka", "mushaka", "gau", "mahisha", "vyaghra", "mahisha", "vyaghra", "mriga", "mriga",
  "shwana", "vanara", "nakula", "vanara", "simha", "ashwa", "simha", "gau", "gaja",
];
// Tabla clásica de Yoni (simétrica); 0 = pareja de enemigos naturales.
const TABLA_YONI = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

// Amistades naturales de los grahas (Parashara): 1 amigo, 0 neutro, -1 enemigo.
const AMISTAD: Partial<Record<IdGraha, Partial<Record<IdGraha, number>>>> = {
  surya: { chandra: 1, mangal: 1, guru: 1, budh: 0, shukra: -1, shani: -1 },
  chandra: { surya: 1, budh: 1, mangal: 0, guru: 0, shukra: 0, shani: 0 },
  mangal: { surya: 1, chandra: 1, guru: 1, shukra: 0, shani: 0, budh: -1 },
  budh: { surya: 1, shukra: 1, mangal: 0, guru: 0, shani: 0, chandra: -1 },
  guru: { surya: 1, chandra: 1, mangal: 1, shani: 0, budh: -1, shukra: -1 },
  shukra: { budh: 1, shani: 1, mangal: 0, guru: 0, surya: -1, chandra: -1 },
  shani: { budh: 1, shukra: 1, guru: 0, surya: -1, chandra: -1, mangal: -1 },
};

export function relacionGrahas(a: IdGraha, b: IdGraha) {
  return a === b ? 1 : (AMISTAD[a]?.[b] ?? 0);
}

/** Gana de cada nakshatra. */
export const GANA_NAKSHATRA: Gana[] = [
  "deva", "manushya", "rakshasa", "manushya", "deva", "manushya", "deva", "deva", "rakshasa",
  "rakshasa", "manushya", "manushya", "deva", "rakshasa", "deva", "rakshasa", "deva", "rakshasa",
  "rakshasa", "manushya", "manushya", "deva", "rakshasa", "rakshasa", "manushya", "manushya", "deva",
];
const GANAS: Gana[] = ["deva", "manushya", "rakshasa"];
// Novio (fila) × novia (columna).
const TABLA_GANA = [
  [6, 6, 1],
  [5, 6, 0],
  [1, 0, 6],
];

/** Nadi en zigzag: Aadi, Madhya, Antya, Antya, Madhya, Aadi… */
export function nadiDe(nakshatra: number): Nadi {
  return (["aadi", "madhya", "antya", "antya", "madhya", "aadi"] as const)[nakshatra % 6];
}

export interface PersonaMilan {
  nombre: string;
  rashi: number;
  gradoLuna: number;
  nakshatra: number;
  pada: number;
  horaDesconocida: boolean;
  varna: Varna;
  vashya: Vashya;
  yoni: Yoni;
  gana: Gana;
  nadi: Nadi;
  senorRashi: IdGraha;
  manglik: ManglikPersona;
}

export interface KootaMilan {
  id: IdKoota;
  puntos: number;
  maximo: number;
}

export interface ResultadoMilan {
  version: 1;
  /** Persona A: lado del novio en las tablas clásicas; B: lado de la novia. */
  a: PersonaMilan;
  b: PersonaMilan;
  kootas: KootaMilan[];
  total: number;
  nivel: "bajo" | "medio" | "bueno" | "excelente";
  /** Doshas tradicionales presentes (puntuación 0 en Nadi, Bhakoot o Gana). */
  doshas: ("nadi" | "bhakoot" | "gana")[];
  /** Excepciones clásicas que suavizan un dosha. */
  excepciones: ("nadi_misma_rashi" | "nadi_mismo_nakshatra_otro_pada" | "bhakoot_mismo_senor" | "bhakoot_senores_amigos")[];
  /** Ambos Manglik (la tradición lo considera equilibrado) o solo uno. */
  manglik: "ninguno" | "ambos" | "solo_a" | "solo_b";
}

function persona(d: DatosNacimiento): PersonaMilan {
  const k = calcularKundli(d);
  const luna = k.grahas.find((g) => g.id === "chandra")!;
  return {
    nombre: d.nombre,
    rashi: luna.rashi,
    gradoLuna: luna.grado,
    nakshatra: luna.nakshatra,
    pada: luna.pada,
    horaDesconocida: d.horaDesconocida,
    varna: VARNA_RASHI[luna.rashi],
    vashya: vashyaDe(luna.rashi, luna.grado),
    yoni: YONI_NAKSHATRA[luna.nakshatra],
    gana: GANA_NAKSHATRA[luna.nakshatra],
    nadi: nadiDe(luna.nakshatra),
    senorRashi: SENOR_RASHI[luna.rashi],
    manglik: k.manglik,
  };
}

/** Tara: cuenta de nakshatras de uno al otro; 3, 5 y 7 (Vipat, Pratyari, Vadha) son desfavorables. */
function taraFavorable(desde: number, hasta: number) {
  const cuenta = ((hasta - desde + 27) % 27) + 1;
  const tara = cuenta % 9 || 9;
  return ![3, 5, 7].includes(tara);
}

/** Puntúa los ocho kootas a partir de las dos Lunas (A = lado del novio). */
export function puntuarKootas(a: Omit<PersonaMilan, "manglik" | "nombre" | "horaDesconocida">, b: Omit<PersonaMilan, "manglik" | "nombre" | "horaDesconocida">): KootaMilan[] {
  const varna = RANGO_VARNA[a.varna] >= RANGO_VARNA[b.varna] ? 1 : 0;
  const vashya = TABLA_VASHYA[VASHYAS.indexOf(a.vashya)][VASHYAS.indexOf(b.vashya)];
  const taras = (taraFavorable(b.nakshatra, a.nakshatra) ? 1 : 0) + (taraFavorable(a.nakshatra, b.nakshatra) ? 1 : 0);
  const tara = taras * 1.5;
  const yoni = TABLA_YONI[YONIS.indexOf(a.yoni)][YONIS.indexOf(b.yoni)];

  const ra = relacionGrahas(a.senorRashi, b.senorRashi);
  const rb = relacionGrahas(b.senorRashi, a.senorRashi);
  let maitri: number;
  if (a.senorRashi === b.senorRashi || (ra === 1 && rb === 1)) maitri = 5;
  else if (ra + rb === 1 && ra >= 0 && rb >= 0) maitri = 4; // amigo + neutro
  else if (ra === 0 && rb === 0) maitri = 3;
  else if (ra + rb === 0) maitri = 1; // amigo + enemigo
  else if (ra + rb === -1) maitri = 0.5; // neutro + enemigo
  else maitri = 0;

  const gana = TABLA_GANA[GANAS.indexOf(a.gana)][GANAS.indexOf(b.gana)];

  const dist = ((a.rashi - b.rashi + 12) % 12) + 1; // de B a A
  const bhakoot = [2, 12, 5, 9, 6, 8].includes(dist) ? 0 : 7;
  const nadi = a.nadi === b.nadi ? 0 : 8;

  const puntos: Record<IdKoota, number> = { varna, vashya, tara, yoni, graha_maitri: maitri, gana, bhakoot, nadi };
  return KOOTAS.map((id) => ({ id, puntos: puntos[id], maximo: MAXIMO_KOOTA[id] }));
}

export function calcularMilan(datosA: DatosNacimiento, datosB: DatosNacimiento): ResultadoMilan {
  const a = persona(datosA);
  const b = persona(datosB);
  const kootas = puntuarKootas(a, b);
  const total = kootas.reduce((s, k) => s + k.puntos, 0);
  const pts = (id: IdKoota) => kootas.find((k) => k.id === id)!.puntos;

  const doshas: ResultadoMilan["doshas"] = [];
  if (pts("nadi") === 0) doshas.push("nadi");
  if (pts("bhakoot") === 0) doshas.push("bhakoot");
  if (pts("gana") === 0) doshas.push("gana");

  const excepciones: ResultadoMilan["excepciones"] = [];
  if (pts("nadi") === 0) {
    if (a.rashi === b.rashi && a.nakshatra !== b.nakshatra) excepciones.push("nadi_misma_rashi");
    if (a.nakshatra === b.nakshatra && a.pada !== b.pada) excepciones.push("nadi_mismo_nakshatra_otro_pada");
  }
  if (pts("bhakoot") === 0) {
    if (a.senorRashi === b.senorRashi) excepciones.push("bhakoot_mismo_senor");
    else if (relacionGrahas(a.senorRashi, b.senorRashi) === 1 && relacionGrahas(b.senorRashi, a.senorRashi) === 1) excepciones.push("bhakoot_senores_amigos");
  }

  const ma = a.manglik.estado !== "no";
  const mb = b.manglik.estado !== "no";
  return {
    version: 1,
    a,
    b,
    kootas,
    total,
    nivel: total < 18 ? "bajo" : total <= 24 ? "medio" : total <= 32 ? "bueno" : "excelente",
    doshas,
    excepciones,
    manglik: ma && mb ? "ambos" : ma ? "solo_a" : mb ? "solo_b" : "ninguno",
  };
}
