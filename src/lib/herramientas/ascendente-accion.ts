"use server";

/**
 * Calculadora pública de ascendente y Luna (sin cuenta): usa el mismo motor que la carta astral completa
 * (calcularCarta) y añade la Luna sideral (Lahiri) con su nakshatra. Solo calcula: no guarda nada.
 */
import { calcularCarta, localAUtc } from "@/lib/astro/carta";
import { posiciones } from "@/lib/astro/efemerides";
import { signoPorLongitud, gradoEnSigno } from "@/lib/zodiaco";
import { ayanamsaLahiri, longitudSideral, nakshatraDeLongitud } from "./sideral";

export interface PuntoCalculado {
  signo: string; // id del signo (aries, tauro…)
  longitud: number;
  grado: number; // grados dentro del signo, 0-30
}

export interface ResultadoAscendente {
  ok: true;
  sol: PuntoCalculado;
  luna: PuntoCalculado;
  ascendente: PuntoCalculado | null;
  /** Si no se sabe la hora y la Luna cambió de signo ese día: el otro signo posible. */
  lunaOtroSigno: string | null;
  vedica: {
    ayanamsa: number;
    rashi: PuntoCalculado;
    nakshatra: number; // 0-26
    pada: number; // 1-4
    rashiOtro: string | null;
    nakshatraOtro: number | null;
  };
}

export type RespuestaAscendente = ResultadoAscendente | { ok: false; error: "datos" | "lugar" };

export interface EntradaAscendente {
  fecha: string;
  hora: string;
  horaDesconocida: boolean;
  latitud: number;
  longitud: number;
  zonaHoraria: string;
}

function punto(longitud: number): PuntoCalculado {
  return { signo: signoPorLongitud(longitud).id, longitud, grado: gradoEnSigno(longitud) };
}

function zonaValida(zona: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zona });
    return true;
  } catch {
    return false;
  }
}

export async function calcularAscendente(entrada: EntradaAscendente): Promise<RespuestaAscendente> {
  const fecha = String(entrada?.fecha ?? "");
  const horaDesconocida = Boolean(entrada?.horaDesconocida);
  const hora = horaDesconocida ? "12:00" : String(entrada?.hora ?? "");
  const latitud = Number(entrada?.latitud);
  const longitud = Number(entrada?.longitud);
  const zonaHoraria = String(entrada?.zonaHoraria ?? "").slice(0, 64);

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!m || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) return { ok: false, error: "datos" };
  const anio = Number(m[1]);
  if (anio < 1900 || anio > 2100 || Number(m[2]) < 1 || Number(m[2]) > 12 || Number(m[3]) < 1 || Number(m[3]) > 31) return { ok: false, error: "datos" };
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud) || Math.abs(latitud) > 90 || Math.abs(longitud) > 180 || !zonaValida(zonaHoraria)) {
    return { ok: false, error: "lugar" };
  }

  const carta = calcularCarta({ nombre: "", fecha, hora, horaDesconocida, lugar: "", latitud, longitud, zonaHoraria });
  const instante = new Date(carta.fechaUtc);
  const sol = carta.planetas.find((p) => p.cuerpo === "sol")!.longitud;
  const luna = carta.planetas.find((p) => p.cuerpo === "luna")!.longitud;
  const rashi = longitudSideral(luna, instante);
  const { indice, pada } = nakshatraDeLongitud(rashi);

  // Sin hora: la Luna recorre unos 13° al día; se mira dónde estaba al empezar y al terminar el día.
  let lunaOtroSigno: string | null = null;
  let rashiOtro: string | null = null;
  let nakshatraOtro: number | null = null;
  if (horaDesconocida) {
    for (const h of ["00:00", "23:59"]) {
      const t = localAUtc(fecha, h, zonaHoraria);
      const l = posiciones(t).find((p) => p.cuerpo === "luna")!.longitud;
      const tropical = signoPorLongitud(l).id;
      if (tropical !== signoPorLongitud(luna).id) lunaOtroSigno = tropical;
      const sid = longitudSideral(l, t);
      if (signoPorLongitud(sid).id !== signoPorLongitud(rashi).id) rashiOtro = signoPorLongitud(sid).id;
      const n = nakshatraDeLongitud(sid).indice;
      if (n !== indice) nakshatraOtro = n;
    }
  }

  return {
    ok: true,
    sol: punto(sol),
    luna: punto(luna),
    ascendente: horaDesconocida ? null : punto(carta.ascendente.longitud),
    lunaOtroSigno,
    vedica: { ayanamsa: ayanamsaLahiri(instante), rashi: punto(rashi), nakshatra: indice, pada, rashiOtro, nakshatraOtro },
  };
}
