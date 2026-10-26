/**
 * Señales del tabaco: al final de la lectura el modelo agrega un anexo JSON
 * con cada señal que vio (parte del tabaco y lugar en la foto) y el estado de
 * la ceniza, la quema y el humo, más lo que dice el tabaco en conjunto. Sin
 * dependencias de servidor.
 */

/** Las partes del tabaco que se leen. */
export type ParteTabaco = "ceniza" | "quema" | "capa" | "punta" | "humo";
export const PARTES_TABACO: ParteTabaco[] = ["ceniza", "quema", "capa", "punta", "humo"];
export type ColorCeniza = "blanca" | "gris" | "negra";
export type LargoCeniza = "larga" | "media" | "cayo";
export type Quema = "pareja" | "canoa" | "rapida" | "apagada";
export type Humo = "claro" | "espeso" | "noSeVe";
export type Veredicto = "abierto" | "esfuerzo" | "espera";

/** Una señal que el modelo distingue en la foto (porcentajes sobre la foto). */
export interface MarcaTabaco {
  tipo: ParteTabaco;
  nombre: string;
  x: number;
  y: number;
  sentido: string;
}

export interface EstadoTabaco {
  ceniza: ColorCeniza | null;
  largo: LargoCeniza | null;
  quema: Quema | null;
  humo: Humo | null;
  veredicto: Veredicto | null;
}

export interface AnexoTabaco extends EstadoTabaco {
  cuerpo: string;
  marcas: MarcaTabaco[];
}

const BLOQUE_ANEXO = /```json\s*(\{[\s\S]*?\})\s*```\s*$/;

function una<T extends string>(valor: unknown, opciones: readonly T[]): T | null {
  return (opciones as readonly unknown[]).includes(valor) ? (valor as T) : null;
}

/** Separa el texto de la lectura del anexo JSON final (si existe). */
export function separarTabaco(texto: string): AnexoTabaco {
  const vacio: AnexoTabaco = { cuerpo: texto, marcas: [], ceniza: null, largo: null, quema: null, humo: null, veredicto: null };
  const m = texto.match(BLOQUE_ANEXO);
  if (!m) return vacio;
  const cuerpo = texto.replace(BLOQUE_ANEXO, "").trim();
  try {
    const json = JSON.parse(m[1]) as Record<string, unknown> & { senales?: unknown[] };
    const marcas = (json.senales ?? [])
      .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
      .map(
        (s): MarcaTabaco => ({
          tipo: una(s.tipo, PARTES_TABACO) ?? "capa",
          nombre: String(s.nombre ?? "").trim().slice(0, 40),
          x: Number(s.x),
          y: Number(s.y),
          sentido: String(s.sentido ?? "").trim().slice(0, 60),
        }),
      )
      .filter((s) => s.nombre && Number.isFinite(s.x) && Number.isFinite(s.y) && s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100)
      .slice(0, 8);
    return {
      cuerpo,
      marcas,
      ceniza: una(json.ceniza, ["blanca", "gris", "negra"] as const),
      largo: una(json.largo, ["larga", "media", "cayo"] as const),
      quema: una(json.quema, ["pareja", "canoa", "rapida", "apagada"] as const),
      humo: una(json.humo, ["claro", "espeso", "noSeVe"] as const),
      veredicto: una(json.veredicto, ["abierto", "esfuerzo", "espera"] as const),
    };
  } catch {
    return { ...vacio, cuerpo };
  }
}

export const INSTRUCCION_TABACO =
  "Al final, después de la lectura, añade un bloque de código con este formato exacto y nada más dentro:\n" +
  '```json\n{"senales":[{"tipo":"ceniza","nombre":"ceniza blanca y larga","x":78,"y":22,"sentido":"camino limpio y firme"}],"ceniza":"blanca","largo":"larga","quema":"pareja","humo":"noSeVe","veredicto":"abierto"}\n```\n' +
  "con una entrada por cada señal que nombraste en «Señal por señal» (máximo 8), en el mismo orden. tipo: ceniza, quema, capa (grietas, ojos, manchas de la capa), punta (la boca o abertura) o humo; " +
  "nombre: como lo dijiste, en el idioma de la lectura; x e y: porcentajes enteros (0 a 100) sobre el ancho y el alto de la foto, en el centro de la señal; sentido: de 3 a 6 palabras con lo que dice. " +
  "ceniza: blanca, gris o negra; largo: larga, media o cayo (si se cayó o casi no hay); quema: pareja, canoa (un lado arde más), rapida o apagada; humo: claro, espeso o noSeVe (si la foto no lo muestra); " +
  "veredicto: lo que dice el tabaco en conjunto: abierto (el camino avanza), esfuerzo (avanza con trabajo) o espera (todavía no, paciencia). Si no estás segura de un estado, omítelo. No expliques el bloque.";
