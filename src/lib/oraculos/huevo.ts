/**
 * Señales del vaso en la limpia con huevo: al final de la lectura el modelo
 * agrega un anexo JSON con cada señal que vio (tipo y lugar en la foto), dónde
 * quedó la yema, cómo está el agua y cuánto soltó la limpia. Sin dependencias
 * de servidor.
 */

/** Las señales clásicas del vaso. */
export type SenalHuevo = "yema" | "burbujas" | "hilos" | "clara" | "manchas" | "figura";
export const SENALES_HUEVO: SenalHuevo[] = ["yema", "burbujas", "hilos", "clara", "manchas", "figura"];
export type PosicionYema = "fondo" | "sube" | "flota";
export type Agua = "clara" | "turbia";

/** Una señal que el modelo distingue en la foto (porcentajes sobre la foto). */
export interface MarcaHuevo {
  tipo: SenalHuevo;
  nombre: string;
  x: number;
  y: number;
  sentido: string;
}

export interface AnexoHuevo {
  cuerpo: string;
  marcas: MarcaHuevo[];
  yema: PosicionYema | null;
  agua: Agua | null;
  /** Cuánto soltó la limpia, de 0 (casi nada) a 100 (mucho); null si no vino. */
  soltado: number | null;
}

const BLOQUE_ANEXO = /```json\s*(\{[\s\S]*?\})\s*```\s*$/;
const POSICIONES: PosicionYema[] = ["fondo", "sube", "flota"];

/** Separa el texto de la lectura del anexo JSON final (si existe). */
export function separarSenales(texto: string): AnexoHuevo {
  const vacio: AnexoHuevo = { cuerpo: texto, marcas: [], yema: null, agua: null, soltado: null };
  const m = texto.match(BLOQUE_ANEXO);
  if (!m) return vacio;
  const cuerpo = texto.replace(BLOQUE_ANEXO, "").trim();
  try {
    const json = JSON.parse(m[1]) as { senales?: unknown[]; yema?: unknown; agua?: unknown; soltado?: unknown };
    const marcas = (json.senales ?? [])
      .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
      .map(
        (s): MarcaHuevo => ({
          tipo: (SENALES_HUEVO as unknown[]).includes(s.tipo) ? (s.tipo as SenalHuevo) : "figura",
          nombre: String(s.nombre ?? "").trim().slice(0, 40),
          x: Number(s.x),
          y: Number(s.y),
          sentido: String(s.sentido ?? "").trim().slice(0, 60),
        }),
      )
      .filter((s) => s.nombre && Number.isFinite(s.x) && Number.isFinite(s.y) && s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100)
      .slice(0, 8);
    const n = Number(json.soltado);
    return {
      cuerpo,
      marcas,
      yema: (POSICIONES as unknown[]).includes(json.yema) ? (json.yema as PosicionYema) : null,
      agua: json.agua === "clara" || json.agua === "turbia" ? json.agua : null,
      soltado: json.soltado != null && Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : null,
    };
  } catch {
    return { ...vacio, cuerpo };
  }
}

export const INSTRUCCION_SENALES =
  "Al final, después de la lectura, añade un bloque de código con este formato exacto y nada más dentro:\n" +
  '```json\n{"senales":[{"tipo":"burbujas","nombre":"burbujas junto a la yema","x":48,"y":80,"sentido":"cansancio que se soltó"}],"yema":"fondo","agua":"clara","soltado":35}\n```\n' +
  "con una entrada por cada señal que nombraste en «Señal por señal» (máximo 8), en el mismo orden. tipo: yema, burbujas, hilos, clara (clara turbia, espuma o nube), manchas (puntitos o manchas) o figura (ojos, caras, picos, telarañas u otras formas); " +
  "nombre: como lo dijiste, en el idioma de la lectura; x e y: porcentajes enteros (0 a 100) sobre el ancho y el alto de la foto, en el centro de la señal; sentido: de 3 a 6 palabras con lo que dice. " +
  "yema: fondo, sube o flota; agua: clara o turbia; soltado: número entero de 0 a 100 con cuánto se llevó la limpia según lo que se ve (0 = vaso casi limpio, 100 = muchas señales). " +
  "Si no distinguiste ninguna señal, deja la lista vacía. No expliques el bloque.";
