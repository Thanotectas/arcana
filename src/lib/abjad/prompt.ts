import type { Prompt } from "@/lib/lecturas/prompts";
import type { Idioma } from "@/lib/i18n/idiomas";
import { datoDeUsuario } from "@/lib/seguridad";
import { LETRAS_ABJAD, type Elemento, type PersonaAbjad, type ResultadoAbjad } from "./calculo";

const NOMBRE_ELEMENTO: Record<Elemento, string> = { fuego: "fuego", aire: "aire", agua: "agua", tierra: "tierra" };
const NOMBRE_LETRA = Object.fromEntries(LETRAS_ABJAD.map((l) => [l.letra, l.nombre]));

/** La tradición, para el sistema: qué es el abjad y qué no se hace en esta lectura. */
export const TRADICION_ABJAD =
  "El ḥisāb al-jummal (cálculo abjad; en turco «ebced hesabı») da a cada una de las 28 letras árabes un valor siguiendo el antiguo orden semítico del alfabeto (abjad hawwaz ḥuṭṭī kalaman saʿfaṣ qarashat thakhadh ḍaẓagh): unidades del alif a la ṭāʾ, decenas de la yāʾ a la ṣād, centenas de la qāf a la ẓāʾ y mil para la ghayn. Aquí se usan los valores orientales (mashriqíes); el uso magrebí cambia el valor de algunas letras (ص ض س ظ غ ش), dilo si sale el tema. " +
  "Durante siglos sirvió para numerar, para fechar con cronogramas (taʾrīj; en otomano «tarih düşürmek») en poesía, lápidas e inscripciones, y en la cultura popular para «leer» los nombres; en el África occidental y en Turquía sigue presente en la vida cotidiana. La agrupación de las letras en fuego, aire, agua y tierra viene de la ciencia de las letras (ʿilm al-ḥurūf) y tiene variantes entre escuelas. " +
  "Presenta todo como patrimonio cultural y como espejo para reflexionar sobre uno mismo: no es una ciencia, no predice ni decide nada. PROHIBIDO en esta lectura: cuadrados mágicos (wafq), talismanes, amuletos, conjuros, sihr o cualquier práctica mágica; fórmulas de protección, remedios o recitaciones prescritas; cálculos de compatibilidad, de daño o de enfermedad; afirmaciones religiosas, dictámenes o fatwas, y relacionar el número con nombres divinos, versículos o el destino; cualquier tono de miedo, maldición o mal augurio. " +
  "Si un valor o un elemento parece «difícil», preséntalo como un rasgo con sus dos caras. Si el nombre vino en letras latinas, recuerda que la grafía árabe es una transcripción y que otra grafía daría otro valor. Hay personas que ven estas prácticas con reservas religiosas: no tomes partido ni discutas; habla de tradición, no de fe.";

function describirPersona(p: PersonaAbjad, etiqueta: string) {
  const letras = p.letras.map((l) => `${l.escrita}${l.escrita !== l.base ? ` (cuenta como ${l.base})` : ""} ${NOMBRE_LETRA[l.base]} = ${l.valor}, ${NOMBRE_ELEMENTO[l.elemento]}`).join("; ");
  const reparto = (Object.keys(p.elementos) as Elemento[]).map((e) => `${NOMBRE_ELEMENTO[e]} ${p.elementos[e]}`).join(", ");
  return (
    `${etiqueta}: ${datoDeUsuario(p.nombre, 80) || "(sin nombre latino)"}\n` +
    `Grafía árabe usada: ${p.escritura}${p.transcrita ? " (transcrita automáticamente desde letras latinas)" : ""}\n` +
    `Letras: ${letras}\n` +
    `Valor abjad total: ${p.total}\nReducción: ${p.reduccion.join(" → ")} (raíz ${p.raiz})\n` +
    `Elementos de las letras: ${reparto}; dominante: ${p.dominantes.map((e) => NOMBRE_ELEMENTO[e]).join(" y ") || "ninguno"}`
  );
}

export function resumenAbjad(r: ResultadoAbjad) {
  return (
    describirPersona(r.persona, "Nombre de la persona") +
    (r.madre ? `\n\n${describirPersona(r.madre, "Nombre de la madre")}` : "") +
    (r.conMadre ? `\n\nNombre + nombre de la madre: ${r.conMadre.total} (reducción ${r.conMadre.reduccion.join(" → ")}, raíz ${r.conMadre.raiz})` : "")
  );
}

export function promptAbjad(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  void entrada;
  const r = resultado as unknown as ResultadoAbjad;
  if (!r?.persona?.letras) return { usuario: "Explica en dos frases que no se pudo leer este cálculo abjad y que la persona puede intentarlo de nuevo.", opciones: { idioma, effort: "low", maxTokens: 300 } };
  const conMadre = Boolean(r.madre && r.conMadre);
  return {
    usuario:
      `Interpreta el valor abjad (ḥisāb al-jummal, «ebced») del nombre de esta persona, como tradición cultural y para que se conozca mejor.\n\n${resumenAbjad(r)}\n\n` +
      `Estructura: ## Tu nombre en letras árabes (la grafía usada, letra por letra con su valor; si fue transcrita desde letras latinas, dilo con naturalidad y recuerda que puede corregirla), ` +
      `## El número de tu nombre (el total: cómo se compone de unidades, decenas, centenas o millares y qué letras pesan más; qué evoca en la tradición numérica, sin presentarlo como verdad), ` +
      `## Tu raíz (la reducción paso a paso y el carácter de ese número: sus luces y lo que pide cuidar), ` +
      `## Los elementos de tus letras (el reparto entre fuego, aire, agua y tierra, el dominante y el que falta o escasea, como temperamento y no como destino), ` +
      (conMadre ? `## Con el nombre de tu madre (el valor del nombre de la madre y la suma de ambos, como un lazo de origen; con ternura y sin juicios), ` : "") +
      `## Para reflexionar (tres o cuatro preguntas concretas que la persona pueda hacerse esta semana, apoyadas en lo anterior), ## Síntesis (un párrafo breve y cálido). ` +
      `Habla de la tradición con precisión y respeto, sin magia, sin talismanes, sin protecciones ni remedios, sin afirmaciones religiosas y sin predicciones. ` +
      `Usa el nombre de la persona. Extensión: 650 a 850 palabras.`,
    sistemaExtra: TRADICION_ABJAD,
    opciones: { idioma, effort: "low", maxTokens: 3000 },
  };
}
