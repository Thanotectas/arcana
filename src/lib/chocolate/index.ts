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
