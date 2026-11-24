import type { Prompt } from "@/lib/lecturas/prompts";
import type { Idioma } from "@/lib/i18n/idiomas";
import { SIGNOS } from "@/lib/zodiaco";
import { datoDeUsuario } from "@/lib/seguridad";
import { resumenAbjad } from "@/lib/abjad/prompt";
import type { ResultadoYildizname } from "./calculo";

/** La tradición, para el sistema: qué es el yıldızname y qué no se hace en esta lectura. */
export const TRADICION_YILDIZNAME =
  "El yıldızname («libro de las estrellas») es el nombre turco de los libros de adivinación astral de la tradición otomana, junto a los falname y los taliname; los había de autor conocido y anónimos, y circularon impresos, como la Risâle-i Yıldıznâme (Estambul, 1858). Combinaban los siete planetas clásicos, los doce signos y el cálculo ebced (hisab al-jummal) de las letras. " +
  "La versión que se practica hoy en Turquía suma el valor ebced del nombre de la persona y el de su madre, lo divide entre 12 y toma el resto, contando desde Aries (Hamel), como su signo o «yıldız»; el resto 0 es Piscis. Ese signo no es el signo solar del día de nacimiento: es la estrella del nombre. " +
  "Habla desde dentro de la tradición («los yıldızname dicen…», «cuenta la tradición…»), con su lenguaje de estrellas, planetas y días, y presenta lo que anuncia como tendencias, nunca como certezas. " +
  "PROHIBIDO en esta lectura: muskas, tılsım, amuletos, havas, conjuros, recetas de protección o de «abrir la suerte», recitaciones prescritas, versículos o nombres divinos, dictámenes religiosos o fatwas; cálculos de daño, de enfermedad o de muerte; compatibilidades; cualquier tono de miedo o mal augurio. " +
  "Hay quienes ven estas prácticas con reservas religiosas: no tomes partido ni discutas; habla de tradición y de cultura, no de fe. Si el nombre vino en letras latinas, recuerda que la grafía árabe es una transcripción y que otra grafía daría otro resultado.";

export function promptYildizname(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  void entrada;
  const r = resultado as unknown as ResultadoYildizname;
  const signo = SIGNOS.find((s) => s.id === r?.signo);
  if (!r?.abjad?.persona || !signo) return { usuario: "Explica en dos frases que no se pudo leer este yıldızname y que la persona puede intentarlo de nuevo.", opciones: { idioma, effort: "low", maxTokens: 300 } };
  const nombre = datoDeUsuario(r.abjad.persona.nombre, 80) || r.abjad.persona.escritura;
  return {
    usuario:
      `Lee el yıldızname de esta persona.\n\n${resumenAbjad(r.abjad)}\n\n` +
      `Cuenta del yıldızname: ${r.total} ÷ 12 = ${r.cociente}, resto ${r.resto}${r.resto === 0 ? " (cuenta como 12)" : ""} → signo número ${r.posicion} contando desde Aries: ${signo.nombre} (${signo.simbolo}).\n` +
      `Elemento: ${signo.elemento}. Planeta regente clásico: ${r.planeta}. Día de ese planeta: ${r.dia}. Rasgos clásicos del signo: ${signo.rasgos.join(", ")}.\n\n` +
      `Estructura: ## Tu estrella en el yıldızname (el cálculo en una o dos frases: tu nombre y el de tu madre en ebced, la división entre 12 y el signo que resulta; aclara en media frase que es la estrella de tu nombre y no tu signo solar), ` +
      `## El carácter de tu estrella (cómo describe la tradición a quien nace bajo esta estrella: sus luces y lo que debe cuidar, con detalle y sin generalidades), ` +
      `## Tu planeta y tu día (qué rige ese planeta en los yıldızname, por qué ese día de la semana le es favorable y para qué conviene usarlo), ` +
      `## Tu elemento (el temperamento: fuego, aire, agua o tierra, y cómo se nota en tu forma de amar y de trabajar), ` +
      `## Lo que tu estrella anuncia (tres tendencias concretas para los próximos meses: amor, trabajo y camino personal, con verbos de tendencia y plazos amplios), ` +
      `## El consejo de tu estrella (un párrafo breve y cálido). ` +
      `Usa el nombre de la persona (${nombre}). Extensión: 650 a 850 palabras.`,
    sistemaExtra: TRADICION_YILDIZNAME,
    opciones: { idioma, effort: "low", maxTokens: 3000 },
  };
}
