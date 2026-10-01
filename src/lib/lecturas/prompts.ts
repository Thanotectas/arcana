import { datoDeUsuario } from "../seguridad";
import "server-only";
import type { OpcionesTexto, ImagenEntrada } from "../ia";
import type { TipoLectura } from "../creditos";
import { TIRADAS, resumenTirada, type CartaTirada, type TipoTirada } from "../tarot/tiradas";
import { MAZOS, esMazo, type IdMazo } from "../tarot/mazos";
import { calcularCarta, resumenCarta, type DatosNacimiento } from "../astro/carta";
import { SIGNIFICADO_NUMERO, type PerfilNumerologico } from "../numerologia";
import { signoPorId } from "../zodiaco";
import { esIdioma, IDIOMA_PREDETERMINADO, type Idioma } from "../i18n/idiomas";
import { INSTRUCCION_ANEXO, resumenQuiromancia, type EntradaQuiromancia } from "../quiromancia";
import { getSupabaseAdmin } from "../supabase/admin";
import { resumenIChing, type ResultadoIChing } from "../iching";
import { resumenChino, type ResultadoChino } from "../chino";
import type { FuenteCruce } from "../cruce";
import type { EntradaSueno, ResultadoSueno } from "../suenos";

export interface LecturaParaPrompt {
  tipo: TipoLectura;
  entrada: unknown;
  resultado: unknown;
}

export interface Prompt {
  usuario: string;
  sistemaExtra?: string;
  opciones: OpcionesTexto;
}

type Objeto = Record<string, unknown>;

const NOMBRE_SISTEMA_CRUCE: Record<FuenteCruce["sistema"], string> = {
  carta_astral: "Carta astral (astrología occidental)",
  numerologia: "Numerología pitagórica",
  chino: "Calendario chino",
  tarot: "Tarot",
  iching: "I Ching",
  quiromancia: "Quiromancia",
};

function idiomaDe(entrada: Objeto): Idioma {
  return esIdioma(entrada.idioma) ? entrada.idioma : IDIOMA_PREDETERMINADO;
}

/** Reconstruye el mensaje para el modelo a partir de una lectura guardada. */
export async function construirPrompt(l: LecturaParaPrompt): Promise<Prompt> {
  const entrada = (l.entrada ?? {}) as Objeto;
  const resultado = (l.resultado ?? {}) as Objeto;
  const idioma = idiomaDe(entrada);

  if (l.tipo in TIRADAS) {
    const tipo = l.tipo as TipoTirada;
    const mazo: IdMazo = esMazo(entrada.mazo) ? entrada.mazo : "rider";
    const cartas = (resultado.cartas ?? []) as CartaTirada[];
    const pregunta = datoDeUsuario(entrada.pregunta, 300);
    const extension =
      tipo === "tarot_carta"
        ? " Sé breve: máximo 250 palabras."
        : tipo === "tarot_tres"
          ? " Extensión: 400 a 550 palabras."
          : " Extensión: 800 a 1100 palabras.";
    return {
      usuario:
        `Interpreta esta tirada para la persona.\n\n${resumenTirada(tipo, cartas, pregunta, mazo)}\n\n` +
        `Estructura: un breve encuadre, luego una sección por posición (## nombre de la posición — carta), y un cierre con síntesis y un consejo práctico.` +
        extension,
      sistemaExtra: MAZOS[mazo].tradicion,
      opciones: { idioma, effort: tipo === "tarot_celta" ? "medium" : "low", maxTokens: tipo === "tarot_celta" ? 3500 : 1500, nivel: tipo === "tarot_celta" ? "premium" : "estandar" },
    };
  }

  if (l.tipo === "carta_astral") {
    const datos = entrada as unknown as DatosNacimiento;
    const carta = calcularCarta(datos);
    return {
      usuario:
        `Interpreta esta carta astral natal.\n\n${resumenCarta(carta)}\n\n` +
        `Estructura sugerida: ## Tu esencia (Sol, Luna y Ascendente como trío), ## Cómo piensas y te comunicas (Mercurio), ## Amor y valores (Venus), ## Energía y deseo (Marte), ## Expansión y límites (Júpiter y Saturno), ## Aspectos que marcan tu carta (los 3 o 4 más relevantes), ## Balance de elementos, ## Tu camino (Nodo Norte y Medio Cielo), ## Síntesis.` +
        (datos.horaDesconocida ? " La hora es desconocida: no interpretes casas ni Ascendente, y menciona brevemente por qué." : "") +
        ` Extensión: 1100 a 1500 palabras.`,
      opciones: { idioma, effort: "medium", maxTokens: 5000, nivel: "premium" },
    };
  }

  if (l.tipo === "numerologia") {
    const perfil = resultado as unknown as PerfilNumerologico;
    const describir = (n: number) => `${n} (${SIGNIFICADO_NUMERO[n]?.titulo ?? ""}: ${SIGNIFICADO_NUMERO[n]?.resumen ?? ""})`;
    return {
      usuario:
        `Interpreta este perfil numerológico pitagórico.\n\nNombre: ${datoDeUsuario(entrada.nombre, 120)}\nFecha de nacimiento: ${String(entrada.fecha ?? "")}\n` +
        `Camino de vida: ${describir(perfil.caminoDeVida)}\nNúmero de expresión: ${describir(perfil.expresion)}\n` +
        `Impulso del alma: ${describir(perfil.almaOImpulso)}\nPersonalidad: ${describir(perfil.personalidad)}\n` +
        `Número de cumpleaños: ${describir(perfil.cumpleanos)}\nAño personal actual: ${perfil.anioPersonal}\n\n` +
        `Estructura: una sección por número (## Camino de vida N, etc.), cómo interactúan entre sí, y un cierre con el tema del año personal. Extensión: 600 a 800 palabras.`,
      opciones: { idioma, effort: "low", maxTokens: 2500 },
    };
  }

  if (l.tipo === "quiromancia") {
    const e = entrada as unknown as EntradaQuiromancia;
    const imagen = await descargarPalma(e.foto);
    return {
      usuario:
        `Lee la palma de la mano de la foto adjunta.\n\n${resumenQuiromancia(e)}\n\n` +
        `Primero describe con honestidad lo que sí se distingue en la imagen (forma de la mano y dedos, líneas principales, montes visibles); si la foto no permite ver algo, dilo sin inventar. ` +
        `Estructura: ## Lo que veo en tu mano, ## Línea de la vida, ## Línea de la cabeza, ## Línea del corazón, ## Línea del destino (o su ausencia), ## Montes y forma de la mano, ## Síntesis y consejo. ` +
        `Recuerda: nada de diagnósticos médicos ni de duración de la vida; la línea de la vida habla de vitalidad y cambios, no de años. Extensión: 700 a 950 palabras.\n\n` +
        INSTRUCCION_ANEXO,
      opciones: { idioma, effort: "medium", maxTokens: 3500, imagenes: imagen ? [imagen] : [], nivel: "premium" },
    };
  }

  if (l.tipo === "iching") {
    const r = resultado as unknown as ResultadoIChing;
    const pregunta = datoDeUsuario(entrada.pregunta, 300);
    return {
      usuario:
        `Interpreta esta consulta al I Ching.\n\n${resumenIChing(r, pregunta)}\n\n` +
        `Estructura: ## El hexagrama y tu pregunta (qué situación describe), ## El Juicio, ## La Imagen (el consejo de conducta), ` +
        (r.mutantes.length ? `## Las líneas mutantes (una por una, con su texto tradicional y qué te dice), ## Hacia dónde se mueve (el hexagrama resultante), ` : "") +
        `## Síntesis y consejo práctico. Habla del I Ching como un consejo de conducta, no como una predicción. Extensión: ${r.mutantes.length ? "700 a 900" : "500 a 650"} palabras.`,
      sistemaExtra:
        "Tradición del I Ching según la traducción de Richard Wilhelm: el hexagrama presente describe la situación; las líneas mutantes son el consejo concreto y tienen prioridad; el hexagrama resultante indica la tendencia si se sigue el consejo.",
      opciones: { idioma, effort: "medium", maxTokens: 3200 },
    };
  }

  if (l.tipo === "chino") {
    const r = resultado as unknown as ResultadoChino;
    return {
      usuario:
        `Interpreta este perfil del calendario chino (astrología china tradicional).\n\n${resumenChino(r, datoDeUsuario(entrada.nombre, 80) || "la persona")}\n\n` +
        `Estructura: ## Tu animal y tu elemento (carácter del animal y cómo lo matiza el elemento del año), ` +
        (r.animalHora ? `## Tu animal secreto (lo que la hora revela de tu mundo íntimo), ` : "") +
        `## Afinidades y choques (con quién fluyes y con quién chocas, en amor, amistad y trabajo), ## Tu año en curso (qué pide este ${r.anioActual.anio} a tu animal, con consejo concreto), ## Síntesis. ` +
        `Usa la tradición (cinco elementos, yin y yang, triángulos de afinidad) sin fatalismos. Extensión: 650 a 850 palabras.`,
      opciones: { idioma, effort: "low", maxTokens: 2800 },
    };
  }

  if (l.tipo === "cruce") {
    const fuentes = ((resultado.fuentes as FuenteCruce[] | undefined) ?? []).slice(0, 2);
    const pregunta = datoDeUsuario(entrada.pregunta, 300);
    const bloque = (f: FuenteCruce, n: number) =>
      `=== SISTEMA ${n}: ${NOMBRE_SISTEMA_CRUCE[f.sistema]} ===\n${f.resumen}` + (f.extracto ? `\nSíntesis de la lectura anterior de este sistema: ${f.extracto}` : "");
    return {
      usuario:
        `Lectura cruzada: combina dos sistemas distintos sobre la misma persona y busca lo que uno confirma, matiza o contradice del otro.\n\n` +
        fuentes.map(bloque).join("\n\n") + "\n\n" +
        (pregunta ? `Pregunta de la persona: ${pregunta}\n\n` : "") +
        `Estructura: ## Lo que los dos sistemas dicen a la vez (los acuerdos, con el símbolo concreto de cada lado), ## Donde se matizan (qué añade cada uno que el otro no ve), ## La tensión (si hay contradicción, explícala y qué significa vivirla), ` +
        (pregunta ? `## Respuesta a tu pregunta (desde los dos sistemas), ` : "") +
        `## Síntesis cruzada y un consejo práctico. Nombra siempre de qué sistema sale cada idea. No repitas las lecturas anteriores: úsalas como base. Extensión: 800 a 1100 palabras.`,
      opciones: { idioma, effort: "medium", maxTokens: 4000, nivel: "premium" },
    };
  }

  if (l.tipo === "suenos") {
    const e = entrada as unknown as EntradaSueno;
    const r = resultado as unknown as ResultadoSueno;
    const emociones: Record<string, string> = { paz: "paz", alegria: "alegría", miedo: "miedo", angustia: "angustia", tristeza: "tristeza", confusion: "confusión", nostalgia: "nostalgia", deseo: "deseo" };
    const diario = r.previos?.length
      ? "\n\nDIARIO DE SUEÑOS (sueños anteriores de la misma persona, del más reciente al más antiguo; búscales hilo si lo hay, sin repetir lo ya dicho):\n" +
        r.previos.map((p) => `- ${p.fecha} · ${datoDeUsuario(p.titulo, 100)}: ${datoDeUsuario(p.extracto, 240)}`).join("\n")
      : "";
    return {
      usuario:
        `Interpreta este sueño.\n\nEl sueño, contado por la persona: ${datoDeUsuario(e.texto, 2000)}\n` +
        (e.emocion ? `Cómo se sintió al despertar: ${emociones[e.emocion] ?? e.emocion}.\n` : "") +
        (e.recurrente ? "Es un sueño recurrente.\n" : "") +
        (e.fecha ? `Fecha del sueño: ${e.fecha}.\n` : "") +
        diario +
        `\n\nEstructura: ## Lo que tu sueño cuenta (el relato visto desde fuera, en dos o tres frases), ## Los símbolos (cada símbolo o escena relevante con su sentido tradicional y el sentido que puede tener para esta persona, como lista breve), ## La emoción del sueño (qué siente el sueño y qué parte de la vida despierta toca), ` +
        (r.previos?.length ? "## El hilo con tus sueños anteriores (solo si hay conexión real), " : "") +
        (e.recurrente ? "## Por qué vuelve (qué pide un sueño que se repite), " : "") +
        `## Lo que te está diciendo (la síntesis: un mensaje claro y una pregunta para llevar al día). Extensión: 600 a 850 palabras.`,
      sistemaExtra:
        "Interpretación de sueños: combina la lectura simbólica clásica (arquetipos junguianos, la tradición de los diccionarios de sueños, la mitología y los cuatro elementos) con el contexto de la persona. El sueño no predice: habla de lo que la persona vive, teme o desea. Nombra los símbolos concretos del relato, no generalidades. Si el sueño incluye violencia, muerte o pérdida, trátalo con calma: en los sueños suelen hablar de cambios y cierres, no de hechos. Si el relato sugiere angustia persistente, pesadillas repetidas o un trauma, sugiere con delicadeza hablar con un profesional de salud mental, sin diagnosticar. No inventes detalles que no estén en el relato.",
      opciones: { idioma, effort: "medium", maxTokens: 3200 },
    };
  }

  // Compatibilidad
  const a = signoPorId(String(resultado.signoA));
  const b = signoPorId(String(resultado.signoB));
  if (!a || !b) throw new Error("Lectura de compatibilidad incompleta.");
  const nombreA = datoDeUsuario(entrada.nombreA, 80) || "Persona A";
  const nombreB = datoDeUsuario(entrada.nombreB, 80) || "Persona B";
  return {
    usuario:
      `Analiza la compatibilidad astrológica entre ${nombreA} (${a.nombre}, ${a.elemento}, ${a.modalidad}, regente ${a.regente}) y ${nombreB} (${b.nombre}, ${b.elemento}, ${b.modalidad}, regente ${b.regente}). ` +
      `Afinidad calculada por elementos y modalidades: ${Number(resultado.puntaje)}/100.\n\n` +
      `Estructura: ## Lo que los une, ## Dónde chocan, ## En el amor, ## En la amistad y el trabajo, ## Consejo para que funcione. Usa los nombres. Extensión: 500 a 650 palabras.`,
    opciones: { idioma, effort: "low", maxTokens: 2200 },
  };
}

async function descargarPalma(ruta: string): Promise<ImagenEntrada | null> {
  if (!ruta) return null;
  const { data, error } = await getSupabaseAdmin().storage.from("palmas").download(ruta);
  if (error || !data) {
    console.error("[quiromancia] no se pudo descargar la foto", ruta, error);
    return null;
  }
  const tipo = data.type === "image/png" ? "image/png" : data.type === "image/webp" ? "image/webp" : "image/jpeg";
  const base64 = Buffer.from(await data.arrayBuffer()).toString("base64");
  return { mediaType: tipo, base64 };
}
