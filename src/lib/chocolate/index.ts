import { datoDeUsuario } from "../seguridad";

/**
 * Lectura del chocolate: tradición popular (Colombia, Venezuela, el Caribe)
 * de leer las figuras que deja la espuma y el poso del chocolate caliente
 * en el interior de la taza, prima de la tasografía del café y del té.
 */
export interface EntradaChocolate {
  foto: string; // ruta dentro del bucket 'palmas' (fotos de lecturas)
  pregunta: string;
  idioma?: string;
}

/** Texto para el modelo con el contexto de la taza. */
export function resumenChocolate(e: EntradaChocolate) {
  const lineas = ["Foto adjunta: el interior de una taza de chocolate caliente ya bebido, vista desde arriba, con las figuras que dejaron la espuma y el poso."];
  const pregunta = datoDeUsuario(e.pregunta, 300);
  if (pregunta) lineas.push(`Lo que la persona quiere saber: ${pregunta}`);
  return lineas.join("\n");
}

export const TRADICION_CHOCOLATE =
  "Lectura del chocolate (tradición popular hispanoamericana, prima de la tasografía): se leen las figuras que dejó la espuma y el poso en el interior de la taza. " +
  "Mapa de la taza: el borde habla de lo cercano en el tiempo y el fondo de lo lejano o lo profundo; el lado del asa es la persona y su casa, el lado opuesto lo que viene de fuera; la derecha lo que llega, la izquierda lo que se va. " +
  "Figuras clásicas: animales (ave = noticia; perro = amistad fiel; gato = cautela; pez = abundancia; serpiente = sabiduría o engaño según la cara), objetos (llave = puerta que se abre; anillo = compromiso; camino = viaje o decisión; casa = estabilidad; corazón = afecto; barco = cambio que llega; árbol = crecimiento; estrella = suerte; luna = intuición; sol = alegría), letras (iniciales de personas) y números (plazos o cantidades). " +
  "Las manchas grandes y claras pesan más que las pequeñas. Describe primero con honestidad lo que sí se distingue en la foto; si una zona está borrosa o no se ve nada claro, dilo y no inventes figuras. Tono cálido y popular, como una abuela que sabe leer la taza, sin fatalismos ni predicciones absolutas.";

/** Zona de la taza: el borde es lo cercano en el tiempo y el fondo lo lejano. */
export type ZonaTaza = "borde" | "medio" | "fondo";
export const ZONAS: ZonaTaza[] = ["borde", "medio", "fondo"];

/** Una figura que el modelo distingue en la foto, con su lugar (porcentajes sobre la foto). */
export interface FiguraTaza {
  nombre: string;
  x: number;
  y: number;
  zona: ZonaTaza;
  sentido: string;
}

const BLOQUE_ANEXO = /```json\s*(\{[\s\S]*?\})\s*```\s*$/;

/** Separa el texto de la lectura del anexo JSON final con las figuras (si existe). */
export function separarFiguras(texto: string): { cuerpo: string; figuras: FiguraTaza[] } {
  const m = texto.match(BLOQUE_ANEXO);
  if (!m) return { cuerpo: texto, figuras: [] };
  let figuras: FiguraTaza[] = [];
  try {
    const json = JSON.parse(m[1]) as { figuras?: unknown[] };
    figuras = (json.figuras ?? [])
      .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
      .map((f) => ({
        nombre: String(f.nombre ?? "").trim().slice(0, 40),
        x: Number(f.x),
        y: Number(f.y),
        zona: (ZONAS as unknown[]).includes(f.zona) ? (f.zona as ZonaTaza) : "medio",
        sentido: String(f.sentido ?? "").trim().slice(0, 60),
      }))
      .filter((f) => f.nombre && Number.isFinite(f.x) && Number.isFinite(f.y) && f.x >= 0 && f.x <= 100 && f.y >= 0 && f.y <= 100)
      .slice(0, 8);
  } catch {
    figuras = [];
  }
  return { cuerpo: texto.replace(BLOQUE_ANEXO, "").trim(), figuras };
}

export const INSTRUCCION_FIGURAS =
  "Al final, después de la lectura, añade un bloque de código con este formato exacto y nada más dentro:\n" +
  '```json\n{"figuras":[{"nombre":"ave","x":62,"y":30,"zona":"borde","sentido":"una noticia que llega"}]}\n```\n' +
  "con una entrada por cada figura que nombraste en «Figura por figura» (máximo 8), en el mismo orden: nombre como lo dijiste (en el idioma de la lectura), " +
  "x e y en porcentajes enteros (0 a 100) sobre el ancho y el alto de la foto, en el centro de la figura; zona: borde, medio o fondo de la taza; " +
  "sentido: de 3 a 6 palabras con lo que anuncia. Si no distinguiste ninguna figura, deja la lista vacía. No expliques el bloque.";
