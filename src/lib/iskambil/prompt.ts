import type { Prompt } from "@/lib/lecturas/prompts";
import type { Idioma } from "@/lib/i18n/idiomas";
import { datoDeUsuario } from "@/lib/seguridad";
import { DATOS_PALO, cartaIskambil, nombreCartaIskambil } from "./mazo";
import { TIRADAS_ISKAMBIL, analizarIskambil, leerResultadoIskambil } from "./tirada";

/** Tradición para el modelo: el iskambil falı turco con la baraja francesa de 52 cartas. */
export const TRADICION_ISKAMBIL =
  "Iskambil falı: la lectura de cartas que se hace en las casas de Turquía con la baraja francesa de 52 cartas (sin comodines), con el tono cálido de una abla que mira el fal a una amiga. Las cartas no se leen invertidas. " +
  "Palos: kupa (corazones) = amor, sentimientos, hogar y alegría; karo (diamantes) = dinero, noticias, papeles y caminos cortos; sinek (tréboles) = trabajo, esfuerzo y amistades que ayudan; maça (picas) = obstáculos y advertencias. " +
  "Figuras: papaz (rey) = un hombre maduro o una autoridad; kız (reina) = una mujer; vale o bacak (jota) = una persona joven, un mensajero o un pensamiento. Kupa y karo describen tradicionalmente a personas de tez o cabello claros, sinek y maça a personas morenas: úsalo solo como pista suave, nunca como juicio. " +
  "Valores: el as es el corazón del asunto, un comienzo o una noticia importante; 10 algo grande o cumplido; 9 el deseo (el 9 de kupa es la «dilek kartı», la carta del deseo); 8 movimiento, visita o invitación; 7 espera o pequeña noticia; 6 camino corto o algo que vuelve del pasado; 5 cambio; 4 estabilidad; 3 reunión o papeles; 2 encuentro, pareja o elección. " +
  "Lectura de conjunto: el palo dominante da el tono de la lectura; dos o más cartas del mismo valor refuerzan su tema; las figuras pueden ser personas reales del entorno, descríbelas sin inventar nombres. " +
  "Cuando escribas en turco, usa con naturalidad las expresiones del fal (kısmet, yol, haber, kalbinden geçen, dilek, «üç vakte kadar» como plazo amplio de días, semanas o meses) y los nombres turcos de las cartas («Kupa Ası», «Maça Kızı», «Karo 7»); en otros idiomas, nombra cada carta en ese idioma y, la primera vez, el nombre turco entre paréntesis. " +
  "Las maça se explican con calma, como avisos para actuar con cuidado y paciencia: nunca anuncies desgracias, enfermedades, muertes ni traiciones seguras; el as de maça es un momento importante que pide reflexión, no una desgracia. " +
  "No prometas dinero ni ganancias (karo habla de oportunidades y noticias, nunca de cifras seguras), ni curaciones; en temas de salud, sugiere consultar a un profesional. No propongas hechizos, rituales, amuletos ni amarres. Habla de tendencias y consejos, con la libertad de la persona siempre por delante.";

/** Mensaje para Sibila con las cartas del fal. */
export function promptIskambil(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  const r = leerResultadoIskambil(resultado);
  const pregunta = datoDeUsuario(entrada.pregunta, 300);
  const corta = r?.tirada !== "bes";
  const lineas = [`Iskambil falı · tirada de ${corta ? "tres" : "cinco"} cartas`, `Deseo o pregunta de la persona: ${pregunta || "(sin pregunta específica)"}`, "Cartas:"];
  if (r) {
    const sentidos = TIRADAS_ISKAMBIL[r.tirada].sentidos;
    for (const c of r.cartas) {
      const carta = cartaIskambil(c.id)!;
      lineas.push(`- Posición ${c.posicion + 1}, ${sentidos[c.posicion]}: ${nombreCartaIskambil(c.id, "tr")} (${nombreCartaIskambil(c.id, "es")}). Palo: ${DATOS_PALO[carta.palo].tema}. Sentido: ${carta.sentido}`);
    }
    const a = analizarIskambil(r.cartas.map((c) => c.id));
    const conteo = (Object.keys(a.conteo) as (keyof typeof a.conteo)[]).filter((p) => a.conteo[p] > 0).map((p) => `${DATOS_PALO[p].nombre.tr} ${a.conteo[p]}`).join(", ");
    lineas.push(`Conjunto: ${conteo}. ${a.dominante ? `Palo dominante: ${DATOS_PALO[a.dominante].nombre.tr} (da el tono de la lectura).` : "Ningún palo domina: lectura equilibrada entre temas."}`);
    if (a.repetidos.length) lineas.push(`Valores repetidos (refuerzan su tema): ${a.repetidos.map((x) => `${x.n} cartas de valor ${x.rango}`).join(", ")}.`);
    if (a.dilek) lineas.push("Salió el 9 de kupa, la dilek kartı: según la tradición, el deseo tiene buen camino (sin prometerlo como seguro).");
  }
  return {
    usuario:
      `Mira este iskambil falı para la persona.\n\n${lineas.join("\n")}\n\n` +
      `Estructura: un encuadre breve (el ambiente del fal, el palo que domina), ## Carta por carta (cada posición con su carta, su sentido tradicional y lo que dice para esta persona), ` +
      `## Lo que cuentan juntas (la historia que forman, los palos y los valores repetidos), ` +
      (pregunta ? "## Tu deseo (respuesta clara: sí, todavía no o depende de qué, según las cartas), " : "") +
      `## Lo que las cartas anuncian (de 3 a 5 predicciones concretas, cada una en un párrafo corto que empieza con el área en negrita —**Amor**, **Dinero y noticias**, **Trabajo**, **Familia y amistades**, **Caminos y cambios**—; usa solo las áreas que las cartas sostengan, nombra la carta de donde sale cada una y dale un plazo amplio; sin cifras de dinero ni promesas de salud), ` +
      `## Consejo para los próximos días. ` +
      `Extensión: ${corta ? "450 a 650" : "650 a 900"} palabras.`,
    sistemaExtra: TRADICION_ISKAMBIL,
    opciones: { idioma, effort: "low", maxTokens: corta ? 2400 : 3200 },
  };
}
