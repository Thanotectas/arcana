/**
 * Restos de la vela: al final de la lectura el modelo agrega un anexo JSON con
 * cada cosa que vio en la foto (cera, hollín, mecha o figura, y su lugar), el
 * estado de la cera, el hollín y la mecha, cuánto avanza la intención y en qué
 * plazo. Sin dependencias de servidor.
 */

export type TipoResto = "cera" | "hollin" | "mecha" | "figura";
export const TIPOS_RESTO: TipoResto[] = ["cera", "hollin", "mecha", "figura"];
export type Cera = "limpia" | "abundante" | "oscura";
export type Hollin = "nada" | "arriba" | "abajo";
export type Mecha = "recta" | "derecha" | "izquierda";
export type Plazo = "pronto" | "semanas" | "meses";
export const PLAZOS: Plazo[] = ["pronto", "semanas", "meses"];

/** Algo que el modelo distingue en la foto de los restos (porcentajes sobre la foto). */
export interface MarcaResto {
  tipo: TipoResto;
  nombre: string;
  x: number;
  y: number;
  sentido: string;
}

export interface AnexoVelas {
  cuerpo: string;
  marcas: MarcaResto[];
  cera: Cera | null;
  hollin: Hollin | null;
  mecha: Mecha | null;
  /** Cuánto avanza la intención, de 0 (resiste) a 100 (fluye); null si no vino. */
  avance: number | null;
  plazo: Plazo | null;
}

const BLOQUE_ANEXO = /```json\s*(\{[\s\S]*?\})\s*```\s*$/;

function una<T extends string>(valor: unknown, opciones: readonly T[]): T | null {
  return (opciones as readonly unknown[]).includes(valor) ? (valor as T) : null;
}

/** Separa el texto de la lectura del anexo JSON final (si existe). */
export function separarRestos(texto: string): AnexoVelas {
  const vacio: AnexoVelas = { cuerpo: texto, marcas: [], cera: null, hollin: null, mecha: null, avance: null, plazo: null };
  const m = texto.match(BLOQUE_ANEXO);
  if (!m) return vacio;
  const cuerpo = texto.replace(BLOQUE_ANEXO, "").trim();
  try {
    const json = JSON.parse(m[1]) as Record<string, unknown> & { marcas?: unknown[] };
    const marcas = (json.marcas ?? [])
      .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
      .map(
        (s): MarcaResto => ({
          tipo: una(s.tipo, TIPOS_RESTO) ?? "figura",
          nombre: String(s.nombre ?? "").trim().slice(0, 40),
          x: Number(s.x),
          y: Number(s.y),
          sentido: String(s.sentido ?? "").trim().slice(0, 60),
        }),
      )
      .filter((s) => s.nombre && Number.isFinite(s.x) && Number.isFinite(s.y) && s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100)
      .slice(0, 8);
    const n = Number(json.avance);
    return {
      cuerpo,
      marcas,
      cera: una(json.cera, ["limpia", "abundante", "oscura"] as const),
      hollin: una(json.hollin, ["nada", "arriba", "abajo"] as const),
      mecha: una(json.mecha, ["recta", "derecha", "izquierda"] as const),
      avance: json.avance != null && Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : null,
      plazo: una(json.plazo, PLAZOS),
    };
  } catch {
    return { ...vacio, cuerpo };
  }
}

export const INSTRUCCION_RESTOS =
  "Al final, después de la lectura, añade un bloque de código con este formato exacto y nada más dentro:\n" +
  '```json\n{"marcas":[{"tipo":"figura","nombre":"corazón de cera","x":42,"y":61,"sentido":"un afecto que se afianza"}],"cera":"limpia","hollin":"nada","mecha":"derecha","avance":70,"plazo":"semanas"}\n```\n' +
  "con una entrada por cada cosa que nombraste en «Lo que veo en los restos» (máximo 8), en el mismo orden. tipo: cera, hollin, mecha o figura (formas de la cera: corazón, llave, camino, animal, letra, número…); " +
  "nombre: como lo dijiste, en el idioma de la lectura; x e y: porcentajes enteros (0 a 100) sobre el ancho y el alto de la foto, en el centro de lo que señalas; sentido: de 3 a 6 palabras con lo que dice. " +
  "cera: limpia (poca y clara), abundante u oscura; hollin: nada, arriba o abajo; mecha: recta, derecha o izquierda; " +
  "avance: número entero de 0 a 100 con cuánto avanza la intención según la llama y los restos (0 = resiste mucho, 100 = fluye); plazo: pronto (días), semanas o meses, como en «Lo que la vela anuncia». " +
  "Si no estás segura de un estado, omítelo. No expliques el bloque.";
