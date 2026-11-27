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

/** Elementos de la ciencia de las letras como temperamento en el amor y el trabajo (la misma clave que el juego de la inicial). */
const AMOR_ELEMENTO =
  "Claves de temperamento por elemento (las mismas que usa Arcana en el juego de la inicial): fuego, ama con intensidad y de frente, necesita admiración y entusiasmo compartido; aire, ama con palabras e ideas, necesita libertad y ser escuchado; agua, ama hondo y en silencio, necesita ternura y confianza; tierra, ama con hechos y para quedarse, necesita constancia y promesas cumplidas.";

function promptCompleto(r: ResultadoAbjad, idioma: Idioma): Prompt {
  const primera = r.persona.letras[0];
  const regente = primera ? `Letra inicial (la que «rige» el nombre en la lectura popular): ${primera.escrita} ${NOMBRE_LETRA[primera.base]} = ${primera.valor}, ${NOMBRE_ELEMENTO[primera.elemento]}` : "";
  const otro = r.otro ? `\n\n${describirPersona(r.otro, "Nombre de la otra persona")}` : "";
  const conMadre = Boolean(r.madre && r.conMadre);
  return {
    usuario:
      `Escribe la LECTURA COMPLETA del nombre de esta persona según el ḥisāb al-jummal y la ciencia de las letras, como tradición cultural y espejo para conocerse. Es la lectura premium de Arcana: profunda, cuidada, personal, que la persona quiera guardar y compartir.\n\n${resumenAbjad(r)}\n${regente}${otro}\n\n${AMOR_ELEMENTO}\n\n` +
      `Estructura: ## Tu nombre en letras árabes (letra por letra con su valor y su elemento; si fue transcrito desde letras latinas, dilo con naturalidad), ` +
      `## La letra que rige tu nombre (la inicial: su lugar en el orden abjad, su elemento y el carácter que la tradición popular le asocia), ` +
      `## El número de tu nombre (el total, cómo se compone y qué letras pesan más), ## Tu raíz (la reducción paso a paso, sus luces y lo que pide cuidar), ` +
      `## Tus elementos (el reparto, el dominante y el que escasea, como temperamento), ` +
      `## Cómo amas y qué necesitas (desde tus elementos dominantes y tu letra inicial: cómo das y recibes cariño, qué te hace sentir querido o querida, qué te apaga), ` +
      `## Tus dones en el trabajo y en tu camino (talentos y maneras de trabajar que sugieren tus letras, sin predecir éxitos ni dinero), ` +
      (conMadre ? `## Con el nombre de tu madre (el valor de ambos y su suma, como lazo de origen, con ternura), ` : "") +
      (r.otro ? `## Tus letras y las de ${r.otro.nombre || "esa persona"} (cómo se encuentran sus elementos y los tuyos: dónde fluyen, dónde se piden paciencia, qué puede aprender cada uno del otro. SIN puntaje, sin porcentaje, sin veredicto, sin decir si deben o no estar juntos ni si se casarán), ` : "") +
      `## Para esta etapa (cuatro preguntas o gestos concretos para la semana), ## Síntesis (un párrafo cálido que la persona quiera releer). ` +
      `Usa el nombre de la persona. Extensión: 1300 a 1700 palabras. Precisión y respeto por la tradición; nada de magia, talismanes, protecciones, remedios, afirmaciones religiosas ni predicciones.`,
    sistemaExtra:
      TRADICION_ABJAD +
      " EXCEPCIÓN de la lectura completa: se permite comparar los elementos de las letras con otro nombre como reflexión sobre temperamentos, nunca como cálculo de compatibilidad, puntaje o decisión.",
    opciones: { idioma, effort: "medium", maxTokens: 6000, nivel: "premium" },
  };
}

export function promptAbjad(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  const r = resultado as unknown as ResultadoAbjad;
  if (!r?.persona?.letras) return { usuario: "Explica en dos frases que no se pudo leer este cálculo abjad y que la persona puede intentarlo de nuevo.", opciones: { idioma, effort: "low", maxTokens: 300 } };
  if (entrada?.completa === true) return promptCompleto(r, idioma);
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
