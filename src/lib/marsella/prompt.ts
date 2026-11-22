import type { Prompt } from "@/lib/lecturas/prompts";
import type { Idioma } from "@/lib/i18n/idiomas";
import { datoDeUsuario } from "@/lib/seguridad";
import { arcanoMarsella, romanoMarsella, type ArcanoMarsella } from "./mazo";
import { POSICIONES_MARSELLA, leerResultadoMarsella } from "./tirada";

/** Tradición para el modelo: cartomancia francesa clásica con el Tarot de Marsella (sin la escuela de Jodorowsky). */
export const TRADICION_MARSELLA =
  "Tarot de Marsella en la cartomancia francesa clásica, «tirage en croix» con los 22 arcanos mayores leídos al derecho (no hay láminas invertidas). " +
  "Usa los nombres de Marsella: Le Bateleur, La Papesse, L'Impératrice, L'Empereur, Le Pape, L'Amoureux, Le Chariot, La Justice (VIII), L'Hermite, La Roue de Fortune, La Force (XI), Le Pendu, l'Arcane sans nom (XIII), Tempérance, Le Diable, La Maison Dieu (XVI), L'Étoile, La Lune, Le Soleil, Le Jugement, Le Monde y Le Mat (sin número). En francés, escríbelos tal cual; en otros idiomas, da el nombre tradicional y, la primera vez, el francés entre paréntesis. " +
  "La lectura de Marsella es simbólica y visual: apóyate en lo que se ve en cada lámina (gestos, objetos, hacia dónde miran las figuras, si una figura mira hacia otra lámina de la cruz y la «habla», lo que sube y lo que baja) y en el diálogo entre las láminas vecinas. " +
  "Sigue la cartomancia francesa tradicional: pour, contre, jugement (el árbitro), issue y synthèse. No uses la «tarología» de Alejandro Jodorowsky ni su vocabulario (ni psicomagia, ni su numerología, ni su lectura de colores, ni actos psicomágicos). " +
  "La carta de síntesis no se sacó: se calculó sumando los números de las cuatro láminas (Le Mat vale 0) y reduciendo la suma por sus cifras mientras pase de 22; 22 da Le Mat. Explica el cálculo en una frase. Si la síntesis coincide con una lámina ya salida, di que refuerza su mensaje. " +
  "Tono sereno y sin miedo: l'Arcane sans nom es transformación y renovación, nunca muerte física; La Maison Dieu es liberación, apertura o una revelación, nunca catástrofe; Le Diable es deseo, energía y ataduras que se pueden soltar; Le Pendu es una pausa fecunda. " +
  "No prometas dinero, ganancias ni curaciones; en temas de salud, sugiere consultar a un profesional. No propongas hechizos, rituales ni amarres. Habla de tendencias y consejos, con la libertad de la persona siempre por delante.";

function lineaArcano(a: ArcanoMarsella) {
  const numero = a.numero === 0 ? "sin número" : romanoMarsella(a.numero);
  const nombre = a.cartela ? a.nombre.fr : `${a.nombre.fr} (la lámina no lleva nombre)`;
  return `${nombre} [${numero}]. Sentido: ${a.sentido} En la lámina: ${a.imagen}`;
}

/** Mensaje para Sibila con la cruz completa. */
export function promptMarsella(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  const r = leerResultadoMarsella(resultado);
  const pregunta = datoDeUsuario(entrada.pregunta, 300);
  const lineas = ["Tarot de Marsella · tirage en croix (22 arcanos mayores)", `Pregunta de la persona: ${pregunta || "(sin pregunta específica)"}`, "Láminas:"];
  if (r) {
    for (const c of r.cartas) {
      const p = POSICIONES_MARSELLA[c.posicion];
      lineas.push(`- Posición ${c.posicion + 1} «${p.clave}» (${p.sentido}): ${lineaArcano(arcanoMarsella(c.id)!)}`);
    }
    const s = arcanoMarsella(r.sintesis.id)!;
    const numeros = r.cartas.map((c) => arcanoMarsella(c.id)!.numero).join(" + ");
    const calculo = `${numeros} = ${r.sintesis.suma}${r.sintesis.pasos.length > 1 ? ` → ${r.sintesis.pasos.slice(1).join(" → ")}` : ""}`;
    const repetida = r.cartas.some((c) => c.id === s.id) ? " Coincide con una lámina ya salida: refuerza su mensaje." : "";
    lineas.push(`- Posición 5 «synthese» (${POSICIONES_MARSELLA[4].sentido}): ${lineaArcano(s)} Cálculo: ${calculo}.${repetida}`);
  }
  return {
    usuario:
      `Interpreta este tirage en croix del Tarot de Marsella para la persona.\n\n${lineas.join("\n")}\n\n` +
      `Estructura: un encuadre breve (la pregunta y la primera impresión visual de la cruz), ` +
      `## A favor — (lámina), ## En contra — (lámina), ## El juicio — (lámina), ## La salida — (lámina), ` +
      `## La síntesis — (lámina) (el cálculo en una frase y lo que resume de toda la cruz), ` +
      `## Cómo se hablan las láminas (miradas, gestos y la historia que cuentan juntas), ` +
      (pregunta ? "## La respuesta a tu pregunta (directa: sí, no, todavía no o depende de qué, según la cruz), " : "") +
      `## Lo que la cruz anuncia (de 3 a 5 predicciones concretas, cada una en un párrafo corto que empieza con el área en negrita —**Amor**, **Trabajo y proyectos**, **Familia y amistades**, **Cambios y viajes**, **Tu energía**—; usa solo las áreas que las láminas sostengan, nombra la lámina de donde sale cada una y dale un plazo amplio; sin cifras de dinero ni promesas de salud), ` +
      `## Consejo de la cruz (un consejo práctico para los próximos días). ` +
      `Nombra las posiciones en el idioma de la respuesta (en francés: Pour, Contre, Le jugement, L'issue, La synthèse). Extensión: 700 a 950 palabras.`,
    sistemaExtra: TRADICION_MARSELLA,
    opciones: { idioma, effort: "low", maxTokens: 3400 },
  };
}
