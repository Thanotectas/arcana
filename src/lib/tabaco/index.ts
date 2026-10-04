import { datoDeUsuario } from "../seguridad";

/**
 * Lectura del tabaco: tradición caribeña (Cuba, Venezuela, Colombia) de leer
 * cómo arde un puro: la ceniza, la quema, el humo y las marcas de la capa.
 * Solo para mayores de edad; es un ritual simbólico, no una recomendación.
 */
export interface EntradaTabaco {
  foto: string; // ruta en el bucket 'palmas'
  pregunta: string;
  idioma?: string;
}

export function resumenTabaco(e: EntradaTabaco) {
  const lineas = ["Foto adjunta: un tabaco (puro) encendido o recién apagado, con su ceniza y la parte quemada visibles."];
  const pregunta = datoDeUsuario(e.pregunta, 300);
  if (pregunta) lineas.push(`Lo que la persona quiere saber: ${pregunta}`);
  return lineas.join("\n");
}

export const TRADICION_TABACO =
  "Lectura del tabaco según la tradición popular caribeña (Cuba, Venezuela, la costa colombiana): el tabaco 'habla' por la forma en que arde. " +
  "La ceniza: blanca y compacta = camino limpio, la petición avanza; gris = avance con esfuerzo; negra o con puntos oscuros = hay algo que limpiar o alguien que estorba; ceniza larga que no cae = firmeza, paciencia que rinde; que se cae sola = una etapa que termina. " +
  "La quema: pareja y redonda = equilibrio y buena señal; torcida o 'canoa' (un lado arde más) = desequilibrio, el lado que arde más indica de dónde viene la presión; si se apaga solo = resistencia, no es el momento; si arde rápido = respuesta pronta pero pasajera. " +
  "La capa: grietas o 'ojos' abiertos = obstáculos o terceras personas; manchas o marcas = mensajes, personas que aparecen; una abertura en la punta ('boca') = noticias que llegan. El humo: blanco y recto = claridad; espeso y bajo = cargas; que se va hacia la persona = lo que llega, hacia fuera = lo que se va. " +
  "Describe primero con honestidad lo que sí se ve en la foto (ceniza, quema, capa, punta) y dónde; si algo no se distingue, dilo y no inventes. Tono cálido y popular, como un lector de tabaco de barrio, sin fatalismos ni predicciones absolutas. No hables de salud ni recomiendes fumar: es un ritual simbólico tradicional.";
