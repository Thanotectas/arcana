/**
 * Datos de los gráficos que el escenario del directo dibuja mientras Sibila
 * habla: la carta astral de quien pregunta, el cielo del día para su signo
 * (horóscopo) y la rueda doble de una sinastría. Sin dependencias de
 * servidor: los usa el escenario en el navegador.
 */
import type { Cuerpo, TipoAspecto } from "./astro/textos";

export interface PlanetaVivo {
  c: Cuerpo;
  /** Longitud eclíptica en grados. */
  lon: number;
  /** Retrógrado. */
  r: boolean;
}

export type GraficoVivo =
  | {
      tipo: "carta";
      planetas: PlanetaVivo[];
      /** Ascendente y medio cielo, solo con hora y ciudad. */
      asc: number | null;
      mc: number | null;
      aspectos: { a: Cuerpo; b: Cuerpo; t: TipoAspecto }[];
      fecha: string;
      hora: string | null;
      lugar: string | null;
    }
  | {
      tipo: "cielo";
      /** Signo de quien pregunta (casa 1). */
      signo: string;
      planetas: (PlanetaVivo & { trato: "mismo" | "apoyo" | "tension" | "neutro" })[];
    }
  | {
      tipo: "sinastria";
      a: { fecha: string; planetas: PlanetaVivo[] };
      b: { fecha: string; planetas: PlanetaVivo[] };
      hilos: { a: Cuerpo; b: Cuerpo; armonico: boolean }[];
      afinidad: number;
    };
