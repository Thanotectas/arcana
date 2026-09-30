/**
 * Ascendente, Medio Cielo y cúspides de casas (sistema Placidus, con
 * respaldo de casas iguales en latitudes polares).
 */
import { sidereal } from "astronomia";
import { diasJulianos, oblicuidad } from "./efemerides";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function norm360(g: number) {
  return ((g % 360) + 360) % 360;
}

/** Longitud eclíptica de un punto de la eclíptica dado su AR (grados). */
function longitudDesdeAR(ar: number, eps: number) {
  const a = ar * D2R;
  return norm360(Math.atan2(Math.sin(a), Math.cos(a) * Math.cos(eps * D2R)) * R2D);
}

export interface Casas {
  sistema: "placidus" | "iguales";
  ascendente: number;
  medioCielo: number;
  cuspides: number[]; // 12 valores, índice 0 = casa 1
  tiempoSideralLocal: number; // grados
}

export function calcularCasas(fechaUtc: Date, latitud: number, longitud: number): Casas {
  const { jd, jde } = diasJulianos(fechaUtc);
  const eps = oblicuidad(jde);

  // Tiempo sideral aparente en Greenwich (segundos) -> grados, más longitud este.
  const gstSeg = sidereal.apparent(jd);
  const ramc = norm360((gstSeg / 240) + longitud); // 240 s = 1 grado
  const tsl = ramc;

  const phi = latitud * D2R;
  const e = eps * D2R;
  const ramcR = ramc * D2R;

  // Medio Cielo
  const medioCielo = longitudDesdeAR(ramc, eps);

  // Ascendente
  let asc = Math.atan2(
    Math.cos(ramcR),
    -(Math.sin(ramcR) * Math.cos(e) + Math.tan(phi) * Math.sin(e)),
  ) * R2D;
  asc = norm360(asc);
  // El ASC debe estar en el semicírculo oriental respecto al MC (MC + 0..180).
  if (norm360(asc - medioCielo) > 180) asc = norm360(asc + 180);

  const cuspides = new Array<number>(12).fill(0);
  cuspides[0] = asc;
  cuspides[9] = medioCielo;

  const polar = Math.abs(latitud) > 66;
  if (polar) {
    for (let i = 0; i < 12; i++) cuspides[i] = norm360(asc + i * 30);
    return { sistema: "iguales", ascendente: asc, medioCielo, cuspides, tiempoSideralLocal: tsl };
  }

  const tanPhiTanEps = Math.tan(phi) * Math.tan(e);

  // Casa 11: RA = RAMC + acos(-sin RA tanε tanφ)/3
  // Casa 12: RA = RAMC + 2·acos(-sin RA tanε tanφ)/3
  // Casa 2:  RA = RAMC + 180 − 2·acos(sin RA tanε tanφ)/3
  // Casa 3:  RA = RAMC + 180 − acos(sin RA tanε tanφ)/3
  const c11 = iterarSimple(ramc, 30, 1 / 3, tanPhiTanEps, false, eps);
  const c12 = iterarSimple(ramc, 60, 2 / 3, tanPhiTanEps, false, eps);
  const c2 = iterarSimple(ramc, 120, 2 / 3, tanPhiTanEps, true, eps);
  const c3 = iterarSimple(ramc, 150, 1 / 3, tanPhiTanEps, true, eps);

  cuspides[10] = c11;
  cuspides[11] = c12;
  cuspides[1] = c2;
  cuspides[2] = c3;
  cuspides[3] = norm360(medioCielo + 180);
  cuspides[4] = norm360(c11 + 180);
  cuspides[5] = norm360(c12 + 180);
  cuspides[6] = norm360(asc + 180);
  cuspides[7] = norm360(c2 + 180);
  cuspides[8] = norm360(c3 + 180);

  return { sistema: "placidus", ascendente: asc, medioCielo, cuspides, tiempoSideralLocal: tsl };
}

function iterarSimple(
  ramc: number,
  inicio: number,
  factor: number,
  tanPhiTanEps: number,
  inferior: boolean,
  eps: number,
) {
  let ra = norm360(ramc + inicio);
  for (let i = 0; i < 40; i++) {
    const s = Math.sin(ra * D2R) * tanPhiTanEps;
    let nuevo: number;
    if (!inferior) {
      const v = Math.max(-1, Math.min(1, -s));
      nuevo = norm360(ramc + Math.acos(v) * R2D * factor);
    } else {
      const v = Math.max(-1, Math.min(1, s));
      nuevo = norm360(ramc + 180 - Math.acos(v) * R2D * factor);
    }
    const diff = Math.abs(((nuevo - ra + 540) % 360) - 180);
    ra = nuevo;
    if (diff < 1e-7) break;
  }
  return longitudDesdeAR(ra, eps);
}

/** Casa (1-12) a la que pertenece una longitud dada unas cúspides. */
export function casaDeLongitud(longitud: number, cuspides: number[]) {
  for (let i = 0; i < 12; i++) {
    const ini = cuspides[i];
    const fin = cuspides[(i + 1) % 12];
    const tam = norm360(fin - ini);
    const pos = norm360(longitud - ini);
    if (pos < tam) return i + 1;
  }
  return 1;
}
