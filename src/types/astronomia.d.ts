/* Tipos mínimos para la parte de `astronomia` que usa Arcana. */
declare module "astronomia" {
  export interface Coord {
    lon: number;
    lat: number;
    range: number;
  }
  export namespace base {
    function J2000Century(jde: number): number;
    function JDEToJulianYear(jde: number): number;
    function pmod(x: number, y: number): number;
  }
  export namespace julian {
    function DateToJD(date: Date): number;
  }
  export namespace planetposition {
    class Planet {
      constructor(series: unknown);
      position(jde: number): Coord;
      position2000(jde: number): Coord;
    }
  }
  export namespace solar {
    function apparentVSOP87(earth: planetposition.Planet, jde: number): Coord;
  }
  export namespace moonposition {
    function position(jde: number): Coord;
    function node(jde: number): number;
  }
  export namespace pluto {
    function heliocentric(jde: number): Coord;
  }
  export namespace nutation {
    function nutation(jde: number): [number, number];
    function meanObliquity(jde: number): number;
  }
  export namespace sidereal {
    function apparent(jd: number): number;
  }
  export namespace deltat {
    function deltaT(decimalYear: number): number;
  }
  export namespace coord {
    class Ecliptic {
      constructor(lon: number, lat: number);
      lon: number;
      lat: number;
    }
  }
  export namespace precess {
    function eclipticPosition(
      ecl: coord.Ecliptic,
      epochFrom: number,
      epochTo: number,
    ): coord.Ecliptic;
  }
}
declare module "astronomia/data" {
  const data: Record<string, unknown>;
  export default data;
}
