/**
 * Cartas del Tarot de Marsella que ya tienen ilustración propia en
 * public/cartas/marsella/<id>.webp (500×750, generadas con Gemini y
 * recortadas con scripts/… del cuaderno de trabajo). Las demás usan la cara
 * dibujada en SVG hasta que se completen. Actualizar esta lista al añadir
 * archivos.
 */
export const CON_IMAGEN_MARSELLA: ReadonlySet<string> = new Set([
  "el-loco",
  "el-mago",
  "la-sacerdotisa",
  "la-emperatriz",
  "el-emperador",
  "el-sumo-sacerdote",
  "los-enamorados",
  "el-carro",
  "la-justicia",
  "el-ermitano",
  "la-rueda-de-la-fortuna",
  "la-fuerza",
  "el-colgado",
  "la-muerte",
  "la-templanza",
  "el-diablo",
  "la-torre",
  "la-estrella",
  "la-luna",
  "el-sol",
  "el-juicio",
  "el-mundo",
  "as-de-oros",
  "dos-de-oros",
  "tres-de-oros",
  "cuatro-de-oros",
  "cinco-de-oros",
  "seis-de-oros",
]);
