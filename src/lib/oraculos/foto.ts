import { datoDeUsuario } from "../seguridad";

/**
 * Lecturas por foto que se suman al chocolate y al tabaco: la borra del café
 * y la limpia con huevo. La foto va al bucket privado 'palmas'.
 */
export interface EntradaFoto {
  foto: string;
  pregunta: string;
  idioma?: string;
}

export function resumenCafe(e: EntradaFoto) {
  const lineas = ["Foto adjunta: el interior de una taza de café ya bebido (café turco o de olla, sin filtrar), con la borra escurrida por las paredes después de voltear la taza sobre el plato."];
  const pregunta = datoDeUsuario(e.pregunta, 300);
  if (pregunta) lineas.push(`Lo que la persona quiere saber: ${pregunta}`);
  return lineas.join("\n");
}

export const TRADICION_CAFE =
  "Lectura de la borra del café (tasseografía; tradición turca, griega y árabe que llegó a Latinoamérica con los inmigrantes del Levante y se practica en Argentina, Chile, México y el Caribe). Se bebe el café sin filtrar pensando en la pregunta, se gira la taza tres veces, se voltea sobre el plato y se deja enfriar. " +
  "Mapa de la taza: el borde es lo próximo (días o semanas), el centro lo de los próximos meses y el fondo lo profundo o lejano; el lado del asa es la persona, su casa y su gente, el lado opuesto lo que viene de fuera; las figuras que suben hacia el borde se acercan, las que bajan se alejan. " +
  "Figuras clásicas: ave = noticias; pez = dinero y suerte; camino o líneas largas = viaje; serpiente = rival o envidia; anillo o círculo = compromiso o un ciclo que se cierra; corazón = amor; árbol = crecimiento; montaña = obstáculo que se supera; ojo = alguien que observa (envidias); letras = iniciales; puntos pequeños = dinero que llega en partes. Zonas limpias y blancas = caminos abiertos; borra muy espesa = cargas o preocupaciones. " +
  "Describe con honestidad lo que sí se distingue; si la foto no deja ver bien, dilo y no inventes. Voz de la vecina que lee el café en la sobremesa: cálida, pícara, sin fatalismos.";

export function resumenHuevo(e: EntradaFoto) {
  const lineas = ["Foto adjunta: un vaso de agua con un huevo crudo recién roto dentro, después de una limpia (el huevo se pasó por el cuerpo antes de romperlo)."];
  const pregunta = datoDeUsuario(e.pregunta, 300);
  if (pregunta) lineas.push(`Lo que la persona quiere saber o siente: ${pregunta}`);
  return lineas.join("\n");
}

export const TRADICION_HUEVO =
  "Limpia con huevo (tradición curandera popular de México, Centroamérica, Colombia, Perú y el Caribe): se pasa un huevo crudo por el cuerpo de la cabeza a los pies con una oración o intención, se rompe en un vaso de agua y se lee lo que dibuja. " +
  "Señales: yema entera en el fondo y agua clara = energía limpia, nada que temer; burbujas pequeñas alrededor = cansancio o cargas que se soltaron; hilos o 'velas' de clara que suben = mucha tensión acumulada o miradas pesadas (el popular 'mal de ojo' o envidias); clara turbia o espumosa = agotamiento, preocupaciones; puntitos o manchas = pequeñas cargas que se fueron; yema que sube o flota = la energía pide descanso; figuras (ojos, caras, picos, telarañas) se leen como símbolos, no como amenazas. " +
  "Reglas: nunca asustes ni hables de brujería, daños o 'trabajos', nunca recomiendes pagar a nadie por limpiezas; la limpia ya hizo su trabajo y lo que queda en el vaso es lo que se fue. Si la persona menciona síntomas físicos o un malestar que no pasa, recuérdale con cariño consultar a un médico. Termina con cómo desechar el agua (por el inodoro o la tierra, lejos de la casa) y un gesto sencillo de protección. Describe con honestidad lo que se ve en la foto; si no se distingue, dilo.";
