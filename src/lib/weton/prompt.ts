import type { Prompt } from "@/lib/lecturas/prompts";
import type { Idioma } from "@/lib/i18n/idiomas";
import { datoDeUsuario } from "@/lib/seguridad";
import { jodohDeGuardado, wetonDeGuardado, ORDEN_JODOH, NOMBRE_JODOH, type ResultadoJodoh, type ResultadoWeton } from "./calculo";
import { TEXTOS_WETON } from "./textos";

type Objeto = Record<string, unknown>;

/** La tradición, para el sistema: qué es el Primbon y cómo hablar de él. */
const TRADICION_PRIMBON =
  "Primbon Jawa: el saber tradicional javanés que se transmite en los primbon, libros de consulta que reúnen cálculos de días, caracteres, " +
  "compatibilidad y fechas propicias. El weton es la combinación del día de la semana de 7 días (Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu; " +
  "en javanés antiguo Radite, Soma, Anggara, Buda, Respati, Sukra, Tumpak) y de la pasaran, la semana javanesa de 5 días (Legi, Pahing, Pon, Wage, Kliwon), " +
  "que se repite cada 35 días (un selapan); muchas familias celebran el wetonan de cada persona. Cada día y cada pasaran tiene un neptu " +
  "(Minggu 5, Senin 4, Selasa 3, Rabu 7, Kamis 8, Jumat 6, Sabtu 9; Legi 5, Pahing 9, Pon 7, Wage 4, Kliwon 8) y su suma, de 7 a 18, da el laku de la persona " +
  "(de 'Lebu katiup angin' a 'Lakuning paripurna'). El wuku es una de las 30 semanas del ciclo Pawukon de 210 días (de Sinta a Watugunung), compartido con Bali; " +
  "cada wuku tiene su carácter y, según la tradición, una deidad protectora: si no estás segura de un detalle concreto de un wuku, habla de él en términos generales. " +
  "En el día javanés la fecha cambia al ponerse el sol. Para el jodoh (pareja), la tradición suma el neptu de los dos y lo divide entre 8: " +
  "resto 1 Pegat, 2 Ratu, 3 Jodoh, 4 Topo, 5 Tinari, 6 Padu, 7 Sujanan, 0 Pesthi. " +
  "Habla del Primbon con respeto, como herencia cultural javanesa viva y como espejo para reflexionar, no como ciencia ni como destino fijo. " +
  "Reglas firmes: nada de miedo; nunca digas que una pareja está condenada, que no debe casarse o que algo malo le pasará; nunca recomiendes rituales, " +
  "ofrendas o 'remedios' de pago, ni consultar a un dukun o paranormal, ni menciones santet, pelet, guna-guna ni magia negra; nada de amuletos. " +
  "Si un resultado tradicional es difícil (Pegat, Padu, Sujanan, Topo), preséntalo como tendencia y conviértelo en consejos prácticos de comunicación, " +
  "confianza, dinero y familia. Mantén los términos javaneses (weton, neptu, pasaran, wuku, watak, laku, jodoh) tal cual y explícalos " +
  "la primera vez. Tono cálido y cercano.";

// Se recalcula desde la fecha guardada: el resultado es JSON y así siempre cuadra con las tablas.
const weton = (r: Objeto): ResultadoWeton => wetonDeGuardado(r) ?? (r as unknown as ResultadoWeton);
const jodoh = (r: Objeto): ResultadoJodoh => jodohDeGuardado(r) ?? (r as unknown as ResultadoJodoh);

function resumenWeton(r: ResultadoWeton, nombre: string): string {
  const t = TEXTOS_WETON.es;
  return (
    `Persona: ${nombre}\nFecha de nacimiento: ${r.fecha}${r.despuesAtardecer ? ` (nació después de la puesta del sol: cuenta como el día javanés del ${r.fechaJawa})` : ""}\n` +
    `Weton: ${r.weton} (${r.hari.jawa} ${r.pasaran.nombre})\n` +
    `Neptu: ${r.neptu} = ${r.hari.nombre} ${r.hari.neptu} + ${r.pasaran.nombre} ${r.pasaran.neptu}\n` +
    `Watak del día ${r.hari.nombre}: ${t.watakHari[r.hari.indice]}\n` +
    `Watak de la pasaran ${r.pasaran.nombre}: ${t.watakPasaran[r.pasaran.indice]}\n` +
    `Laku (por el neptu ${r.neptu}): ${r.laku}, ${t.laku7a18[r.neptu] ?? ""}\n` +
    `Wuku: ${r.wuku.nombre} (semana ${r.wuku.indice + 1} de 30 del Pawukon)`
  );
}

export function promptWeton(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  const r = weton(resultado);
  const nombre = datoDeUsuario(entrada.nombre, 80) || "la persona";
  return {
    usuario:
      `Interpreta el weton javanés de esta persona según el Primbon Jawa.\n\n${resumenWeton(r, nombre)}\n\n` +
      `Estructura: ## Tu weton (qué es el weton, cómo se forma el suyo y qué significa nacer en ${r.weton}), ` +
      `## Tu neptu y tu laku (el número ${r.neptu}, cómo se suma y la imagen de "${r.laku}", con ejemplos de la vida diaria), ` +
      `## Tu watak (el carácter del día y de la pasaran juntos: luces y puntos a cuidar, sin juicios), ` +
      `## Tu wuku ${r.wuku.nombre} (el carácter tradicional de este wuku en el Pawukon y lo que añade), ` +
      `## Amor y relaciones, ## Trabajo y sustento (cómo usar sus fortalezas en ambos), ` +
      `## Tu wetonan (cada 35 días vuelve su weton: un gesto sencillo para ese día, como dar gracias, compartir comida o hacer una pausa para reflexionar; nada de rituales de pago), ` +
      `## Síntesis. Usa el nombre de la persona. Extensión: 700 a 900 palabras.`,
    sistemaExtra: TRADICION_PRIMBON,
    opciones: { idioma, effort: "low", maxTokens: 3000 },
  };
}

export function promptWetonJodoh(entrada: Record<string, unknown>, resultado: Record<string, unknown>, idioma: Idioma): Prompt {
  const j = jodoh(resultado);
  const ea = (entrada.a ?? {}) as Objeto;
  const eb = (entrada.b ?? {}) as Objeto;
  const na = datoDeUsuario(ea.nombre, 80) || "Persona 1";
  const nb = datoDeUsuario(eb.nombre, 80) || "Persona 2";
  const ciclo = ORDEN_JODOH.map((c, i) => `${(i + 1) % 8} ${NOMBRE_JODOH[c]}`).join(", ");
  return {
    usuario:
      `Interpreta la compatibilidad de esta pareja por weton (weton jodoh) según el Primbon Jawa.\n\n` +
      `${resumenWeton(j.a, na)}\n\n${resumenWeton(j.b, nb)}\n\n` +
      `Suma de neptu: ${j.a.neptu} + ${j.b.neptu} = ${j.total}. ${j.total} entre 8 deja resto ${j.total % 8}: resultado ${j.nombre} (ciclo por resto: ${ciclo}).\n` +
      `Sentido tradicional de ${j.nombre}: ${TEXTOS_WETON.es.jodoh[j.clave]}\n\n` +
      `Estructura: ## Sus dos weton (quién es cada uno según su weton, neptu y watak, en un párrafo cada uno), ` +
      `## Cómo se encuentran (cómo se complementan sus días y pasaran, y dónde pueden chocar), ` +
      `## ${j.nombre}: lo que dice la tradición (explica el cálculo y el sentido del resultado como tendencia, nunca como sentencia), ` +
      `## Sus fortalezas como pareja, ## Lo que conviene cuidar (comunicación, confianza, dinero y familia, con consejos prácticos), ` +
      `## Un consejo para los dos (algo concreto para esta semana), ## Síntesis (recuerda que el Primbon es una tradición para reflexionar y que la relación la construyen ellos). ` +
      `Usa los nombres de las dos personas. Si el resultado es Pegat, Padu, Sujanan o Topo, no asustes: muestra la tendencia y cómo trabajarla juntos. Extensión: 800 a 1000 palabras.`,
    sistemaExtra: TRADICION_PRIMBON,
    opciones: { idioma, effort: "medium", maxTokens: 3400 },
  };
}
