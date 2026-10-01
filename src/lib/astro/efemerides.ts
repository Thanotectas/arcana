/**
 * Posiciones planetarias geocéntricas (longitud eclíptica de la fecha) con
 * VSOP87 vía `astronomia`. Precisión de minutos de arco: suficiente para
 * signo, grado y aspectos.
 */
import {
  base,
  julian,
  planetposition,
  solar,
  moonposition,
  pluto,
  nutation,
  coord,
  precess,
  deltat,
} from "astronomia";
import data from "astronomia/data";

const R2D = 180 / Math.PI;

import type { Cuerpo } from "./textos";
export type { Cuerpo } from "./textos";
export { NOMBRES_CUERPO, SIMBOLOS_CUERPO } from "./textos";

let planetas: Record<string, planetposition.Planet> | null = null;

function getPlanetas() {
  if (!planetas) {
    planetas = {
      tierra: new planetposition.Planet(data.vsop87Bearth),
      mercurio: new planetposition.Planet(data.vsop87Bmercury),
      venus: new planetposition.Planet(data.vsop87Bvenus),
      marte: new planetposition.Planet(data.vsop87Bmars),
      jupiter: new planetposition.Planet(data.vsop87Bjupiter),
      saturno: new planetposition.Planet(data.vsop87Bsaturn),
      urano: new planetposition.Planet(data.vsop87Buranus),
      neptuno: new planetposition.Planet(data.vsop87Bneptune),
    };
  }
  return planetas;
}

function norm360(g: number) {
  return ((g % 360) + 360) % 360;
}

/** Día juliano (UT) y día juliano de efemérides (TD) para una fecha UTC. */
export function diasJulianos(fechaUtc: Date) {
  const jd = julian.DateToJD(fechaUtc);
  const anioDecimal = fechaUtc.getUTCFullYear() + (fechaUtc.getUTCMonth() + 0.5) / 12;
  const dT = deltat.deltaT(anioDecimal); // segundos
  const jde = jd + dT / 86400;
  return { jd, jde };
}

/** Longitud geocéntrica de un planeta a partir de posiciones heliocéntricas. */
function geocentrica(
  planeta: planetposition.Planet,
  tierra: planetposition.Planet,
  jde: number,
) {
  const t = tierra.position(jde);
  const x0 = t.range * Math.cos(t.lat) * Math.cos(t.lon);
  const y0 = t.range * Math.cos(t.lat) * Math.sin(t.lon);
  const z0 = t.range * Math.sin(t.lat);

  let jdeLuz = jde;
  let lon = 0;
  let dist = 0;
  // Dos iteraciones de corrección por tiempo-luz.
  for (let i = 0; i < 2; i++) {
    const p = planeta.position(jdeLuz);
    const x = p.range * Math.cos(p.lat) * Math.cos(p.lon) - x0;
    const y = p.range * Math.cos(p.lat) * Math.sin(p.lon) - y0;
    const z = p.range * Math.sin(p.lat) - z0;
    dist = Math.sqrt(x * x + y * y + z * z);
    lon = Math.atan2(y, x);
    jdeLuz = jde - 0.0057755183 * dist;
  }
  return norm360(lon * R2D);
}

function plutonGeocentrico(tierra: planetposition.Planet, jde: number) {
  const p = pluto.heliocentric(jde); // J2000
  const t = tierra.position2000(jde); // J2000
  const x = p.range * Math.cos(p.lat) * Math.cos(p.lon) - t.range * Math.cos(t.lat) * Math.cos(t.lon);
  const y = p.range * Math.cos(p.lat) * Math.sin(p.lon) - t.range * Math.cos(t.lat) * Math.sin(t.lon);
  const z = p.range * Math.sin(p.lat) - t.range * Math.sin(t.lat);
  const lon2000 = Math.atan2(y, x);
  const lat2000 = Math.atan2(z, Math.sqrt(x * x + y * y));
  const ecl = precess.eclipticPosition(
    new coord.Ecliptic(lon2000, lat2000),
    2000,
    base.JDEToJulianYear(jde),
  );
  return norm360(ecl.lon * R2D);
}

export interface PosicionCuerpo {
  cuerpo: Cuerpo;
  longitud: number; // grados [0,360)
  retrogrado: boolean;
}

/** Posiciones de todos los cuerpos para un instante UTC. */
export function posiciones(fechaUtc: Date): PosicionCuerpo[] {
  const { jde } = diasJulianos(fechaUtc);
  const pl = getPlanetas();
  const [dPsi] = nutation.nutation(jde);
  const nut = dPsi * R2D;

  const calcular = (j: number): Record<Cuerpo, number> => ({
    sol: norm360(solar.apparentVSOP87(pl.tierra, j).lon * R2D),
    luna: norm360(moonposition.position(j).lon * R2D + nut),
    mercurio: norm360(geocentrica(pl.mercurio, pl.tierra, j) + nut),
    venus: norm360(geocentrica(pl.venus, pl.tierra, j) + nut),
    marte: norm360(geocentrica(pl.marte, pl.tierra, j) + nut),
    jupiter: norm360(geocentrica(pl.jupiter, pl.tierra, j) + nut),
    saturno: norm360(geocentrica(pl.saturno, pl.tierra, j) + nut),
    urano: norm360(geocentrica(pl.urano, pl.tierra, j) + nut),
    neptuno: norm360(geocentrica(pl.neptuno, pl.tierra, j) + nut),
    pluton: norm360(plutonGeocentrico(pl.tierra, j) + nut),
    nodo_norte: norm360(moonposition.node(j) * R2D),
  });

  const ahora = calcular(jde);
  const antes = calcular(jde - 1); // un día antes, para detectar retrogradación

  return (Object.keys(ahora) as Cuerpo[]).map((cuerpo) => {
    const delta = ((ahora[cuerpo] - antes[cuerpo] + 540) % 360) - 180;
    return {
      cuerpo,
      longitud: ahora[cuerpo],
      retrogrado:
        cuerpo === "sol" || cuerpo === "luna"
          ? false
          : cuerpo === "nodo_norte"
            ? true
            : delta < 0,
    };
  });
}

/** Solo Sol y Luna (longitudes aparentes): barato, para buscar lunaciones. */
export function solYLuna(fechaUtc: Date): { sol: number; luna: number } {
  const { jde } = diasJulianos(fechaUtc);
  const pl = getPlanetas();
  const [dPsi] = nutation.nutation(jde);
  const nut = dPsi * R2D;
  return {
    sol: norm360(solar.apparentVSOP87(pl.tierra, jde).lon * R2D),
    luna: norm360(moonposition.position(jde).lon * R2D + nut),
  };
}

/** Oblicuidad verdadera de la eclíptica (grados). */
export function oblicuidad(jde: number) {
  const [, dEps] = nutation.nutation(jde);
  return (nutation.meanObliquity(jde) + dEps) * R2D;
}
