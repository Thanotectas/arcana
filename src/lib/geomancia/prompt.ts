import type { Prompt } from "@/lib/lecturas/prompts";
import type { Idioma } from "@/lib/i18n/idiomas";
import { datoDeUsuario } from "@/lib/seguridad";
import { esResultadoGeomancia, type ResultadoGeomancia } from "./calculo";
import { figuraPorId, puntosDe, type IdFigura, type Matiz } from "./figuras";

const MATIZ: Record<Matiz, string> = {
  favorable: "favorable",
  mixta: "mixta, depende del contexto",
  exigente: "exigente (pide paciencia o cuidado, nunca es una amenaza)",
};

/** La tradición, para el sistema: cómo se levanta y se lee el escudo, y qué no se hace en esta lectura. */
export const TRADICION_GEOMANCIA =
  "La geomancia (ʿilm al-raml, «la ciencia de la arena»; en francés géomancie; en turco remil) nació en el mundo árabe medieval, llegó a Europa en el siglo XII por las traducciones latinas y sigue viva en el África occidental y en Madagascar (sikidy). Comparte la lógica binaria de 16 figuras con el Fa y el Ifá, pero son sistemas distintos: no los confundas ni hables en nombre de sus sacerdotes. " +
  "Se trazan al azar 16 líneas de marcas; cada línea impar da un punto y cada par, dos. Las líneas 1–4, 5–8, 9–12 y 13–16 forman las cuatro Madres (cabeza, cuello, cuerpo, pies). Las cuatro Hijas se leen fila a fila de las Madres. Las Sobrinas suman figuras de dos en dos (Madres I+II, III+IV; Hijas I+II, III+IV), el Testigo derecho suma las dos primeras Sobrinas, el izquierdo las dos últimas, y el Juez suma los dos Testigos: el Juez siempre tiene un número par de puntos. El Reconciliador suma el Juez y la primera Madre. " +
  "Lectura clásica: el Juez da la respuesta de fondo; el Testigo derecho habla de la persona que pregunta y de lo que viene de atrás, el izquierdo de lo consultado y de lo que viene; las Madres y las Hijas son el terreno de la pregunta; una figura que se repite insiste en su tema; el Reconciliador matiza la sentencia. Las figuras de puntos pares son estables y las impares, móviles. " +
  "Tono: reflexivo, sereno y concreto. Es una herramienta para pensar la pregunta, no un destino: sin miedo, sin maldiciones, sin garantías ni plazos exactos, y sin decidir por la persona asuntos médicos, legales o de dinero (si la pregunta los toca, recomienda con suavidad consultar a quien sabe). Sin talismanes, sin rituales, sin remedios ni protecciones, sin afirmaciones religiosas.";

function linea(rol: string, id: IdFigura) {
  const f = figuraPorId(id)!;
  return `${rol}: ${f.nombre.es} (${f.latin}; en árabe ${f.arabe}, ${f.arabeLatino}) · ${puntosDe(f.filas)} puntos · ${f.clave.es} · planeta ${f.planeta} · matiz ${MATIZ[f.matiz]}`;
}

export function resumenGeomancia(r: ResultadoGeomancia, pregunta: string) {
  const romanos = ["I", "II", "III", "IV"];
  return [
    pregunta ? `Pregunta: ${pregunta}` : "Pregunta: (sin pregunta escrita)",
    "",
    ...r.madres.map((f, i) => linea(`Madre ${romanos[i]}`, f)),
    ...r.hijas.map((f, i) => linea(`Hija ${romanos[i]}`, f)),
    ...r.sobrinas.map((f, i) => linea(`Sobrina ${romanos[i]}`, f)),
    linea("Testigo derecho", r.testigoDerecho),
    linea("Testigo izquierdo", r.testigoIzquierdo),
    linea("JUEZ", r.juez),
    linea("Reconciliador", r.reconciliador),
    "",
    r.repetidas?.length
      ? `Figuras que se repiten en el escudo: ${r.repetidas.map((x) => `${figuraPorId(x.id)!.nombre.es} ×${x.veces}`).join(", ")}`
      : "Ninguna figura se repite en el escudo.",
  ].join("\n");
}

export function promptGeomancia(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  if (!esResultadoGeomancia(resultado)) return { usuario: "Explica en dos frases que no se pudo leer este escudo geomántico y que la persona puede intentarlo de nuevo.", opciones: { idioma, effort: "low", maxTokens: 300 } };
  const pregunta = datoDeUsuario(entrada.pregunta, 300);
  return {
    usuario:
      `Lee este escudo de geomancia (ʿilm al-raml) para la persona.\n\n${resumenGeomancia(resultado, pregunta)}\n\n` +
      `Estructura: ## Tu pregunta en la arena (un encuadre breve de la pregunta y de cómo se levantó el escudo), ` +
      `## Las cuatro Madres (el terreno de la pregunta: una frase para cada Madre con su figura), ` +
      `## Las Hijas y las Sobrinas (cómo se mueve la situación; destaca solo lo que aporte), ` +
      `## Los dos Testigos (el derecho: la persona y lo que trae; el izquierdo: lo que rodea la pregunta y lo que viene), ` +
      `## El Juez (la figura, por qué siempre es par, y la respuesta de fondo a la pregunta: favorable, mixta o «todavía no», dicha con claridad y sin garantías), ` +
      `## El Reconciliador (el matiz final)${resultado.repetidas?.length ? ", ## Lo que insiste (las figuras repetidas y su tema)" : ""}, ` +
      `## Para llevarte (dos o tres consejos prácticos para los próximos días). ` +
      `Usa los nombres de las figuras en el idioma de la respuesta y, la primera vez, su nombre árabe o latino entre paréntesis. Una figura exigente se lee como invitación a la paciencia o al cuidado, nunca como amenaza. Extensión: 750 a 950 palabras.`,
    sistemaExtra: TRADICION_GEOMANCIA,
    opciones: { idioma, effort: "low", maxTokens: 3200 },
  };
}
