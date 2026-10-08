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
import { resumenSinastria, type ResultadoSinastria } from "../astro/sinastria";
import { resumenChocolate, TRADICION_CHOCOLATE, type EntradaChocolate } from "../chocolate";
import { resumenVelas, TRADICION_VELAS, type EntradaVelas } from "../velas";
import { resumenAura, TRADICION_AURA, type ResultadoAura } from "../aura";
import { resumenTabaco, TRADICION_TABACO, type EntradaTabaco } from "../tabaco";

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
  suenos: "Interpretación de sueños",
  chocolate: "Lectura del chocolate",
  sinastria: "Sinastría (compatibilidad entre dos cartas astrales)",
};

/**
 * Sección de predicciones que lleva cada lectura: la gente que consulta quiere
 * saber qué le espera, en concreto y por áreas de su vida.
 */
function anuncio(titulo = "## Lo que se anuncia") {
  return `${titulo} (de 3 a 5 predicciones concretas, cada una en un párrafo corto que empieza con el área en negrita —**Amor**, **Dinero y trabajo**, **Familia y amistades**, **Cambios y viajes**, **Tu energía**—; usa solo las áreas que tu lectura sostenga, nombra el símbolo de donde sale cada una y dale un plazo amplio)`;
}

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
          ? " Extensión: 500 a 650 palabras."
          : " Extensión: 800 a 1100 palabras.";
    return {
      usuario:
        `Interpreta esta tirada para la persona.\n\n${resumenTirada(tipo, cartas, pregunta, mazo)}\n\n` +
        (tipo === "tarot_carta"
          ? `Estructura: un breve encuadre, la carta y su mensaje, una predicción concreta para estos días (en amor, trabajo o lo que la carta toque, apoyada en la carta) y un consejo práctico.`
          : `Estructura: un breve encuadre, luego una sección por posición (## nombre de la posición — carta), ${anuncio()}${pregunta ? ", ## La respuesta a tu pregunta (directa: sí, no, todavía no o depende de qué, según las cartas)" : ""}, y un cierre con síntesis y un consejo práctico.`) +
        extension,
      sistemaExtra: MAZOS[mazo].tradicion,
      opciones: { idioma, effort: tipo === "tarot_celta" ? "medium" : "low", maxTokens: tipo === "tarot_celta" ? 4000 : tipo === "tarot_tres" ? 2200 : 1500, nivel: tipo === "tarot_celta" ? "premium" : "estandar" },
    };
  }

  if (l.tipo === "carta_astral") {
    const datos = entrada as unknown as DatosNacimiento;
    const carta = calcularCarta(datos);
    return {
      usuario:
        `Interpreta esta carta astral natal.\n\n${resumenCarta(carta)}\n\n` +
        `Estructura sugerida: ## Tu esencia (Sol, Luna y Ascendente como trío), ## Cómo piensas y te comunicas (Mercurio), ## Amor y valores (Venus), ## Energía y deseo (Marte), ## Expansión y límites (Júpiter y Saturno), ## Aspectos que marcan tu carta (los 3 o 4 más relevantes), ## Balance de elementos, ## Tu camino (Nodo Norte y Medio Cielo), ${anuncio("## Lo que tu carta anuncia")}, ## Síntesis.` +
        (datos.horaDesconocida ? " La hora es desconocida: no interpretes casas ni Ascendente, y menciona brevemente por qué." : "") +
        ` Extensión: 1300 a 1700 palabras.`,
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
        `Estructura: una sección por número (## Camino de vida N, etc.), cómo interactúan entre sí, ${anuncio("## Lo que trae tu año personal")} (apóyate sobre todo en el año personal), y un cierre. Extensión: 750 a 950 palabras.`,
      opciones: { idioma, effort: "low", maxTokens: 3000 },
    };
  }

  if (l.tipo === "quiromancia") {
    const e = entrada as unknown as EntradaQuiromancia;
    const imagen = await descargarPalma(e.foto);
    return {
      usuario:
        `Lee la palma de la mano de la foto adjunta.\n\n${resumenQuiromancia(e)}\n\n` +
        `Primero describe con honestidad lo que sí se distingue en la imagen (forma de la mano y dedos, líneas principales, montes visibles); si la foto no permite ver algo, dilo sin inventar. ` +
        `Estructura: ## Lo que veo en tu mano, ## Línea de la vida, ## Línea de la cabeza, ## Línea del corazón, ## Línea del destino (o su ausencia), ## Montes y forma de la mano, ${anuncio("## Lo que anuncia tu mano")} (en quiromancia: ramas, islas, cruces y bifurcaciones de las líneas hablan de amores, cambios de rumbo y etapas; nómbralos si se ven), ## Síntesis y consejo. ` +
        `Recuerda: nada de diagnósticos médicos ni de duración de la vida; la línea de la vida habla de vitalidad y cambios, no de años. Extensión: 850 a 1100 palabras.\n\n` +
        INSTRUCCION_ANEXO,
      opciones: { idioma, effort: "medium", maxTokens: 4200, imagenes: imagen ? [imagen] : [], nivel: "premium" },
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
        `${anuncio()} (sobre todo a partir del hexagrama resultante: hacia dónde va la situación si se sigue el consejo), ## Síntesis y consejo práctico. El I Ching responde: di con claridad hacia dónde se mueve la situación y luego el consejo de conducta. Extensión: ${r.mutantes.length ? "700 a 900" : "500 a 650"} palabras.`,
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
        `## Afinidades y choques (con quién fluyes y con quién chocas, en amor, amistad y trabajo), ## Tu año en curso (qué pide este ${r.anioActual.anio} a tu animal, con consejo concreto), ${anuncio(`## Lo que ${r.anioActual.anio} te anuncia`)}, ## Síntesis. ` +
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
        `${anuncio("## Lo que los dos sistemas anuncian")} (las predicciones en las que ambos coinciden pesan más: dilo), ## Síntesis cruzada y un consejo práctico. Nombra siempre de qué sistema sale cada idea. No repitas las lecturas anteriores: úsalas como base. Extensión: 800 a 1100 palabras.`,
      opciones: { idioma, effort: "medium", maxTokens: 4000, nivel: "premium" },
    };
  }

  if (l.tipo === "chocolate") {
    const e = entrada as unknown as EntradaChocolate;
    const imagen = await descargarPalma(e.foto);
    return {
      usuario:
        `Lee la taza de chocolate de la foto adjunta. Mira la imagen con calma y detalle antes de escribir.\n\n${resumenChocolate(e)}\n\n` +
        `Estructura: ## Lo que veo en tu taza (un recorrido descriptivo y concreto por la taza: cómo quedó la espuma y el poso, zonas densas y zonas limpias, y cada mancha o figura que sí se distingue, con su posición exacta: cerca del borde o del fondo, del lado del asa, enfrente, a la derecha o a la izquierda; su tamaño, su nitidez y a qué se parece; nombra al menos cinco elementos si la foto lo permite), ` +
        `## Figura por figura (cada figura con su sentido tradicional, por qué su posición importa y lo que puede decir para esta persona; una entrada por figura), ## Cómo se relacionan (qué historia cuentan juntas las figuras: de dónde viene, qué está pasando, hacia dónde va), ` +
        `## Lo que la taza responde (si hubo pregunta, la respuesta clara; si no, el mensaje del momento), ${anuncio("## Lo que la taza anuncia")}, ## Un consejo para los próximos días. ` +
        `Sé descriptiva y específica: la persona debe poder mirar su taza y reconocer cada cosa que nombras. Extensión: 800 a 1100 palabras.`,
      sistemaExtra: TRADICION_CHOCOLATE,
      opciones: { idioma, effort: "high", maxTokens: 4200, imagenes: imagen ? [imagen] : [], nivel: "premium" },
    };
  }

  if (l.tipo === "velas") {
    const e = entrada as unknown as EntradaVelas;
    const imagen = await descargarPalma(e.foto);
    return {
      usuario:
        `Interpreta los restos de esta vela ritual (foto adjunta).\n\n${resumenVelas(e)}\n\n` +
        `Estructura: ## Lo que veo en los restos (cera, hollín, mecha, figuras, con honestidad), ## Lo que dijo la llama (las señales que la persona observó, leídas una por una), ## Cómo avanza tu intención (síntesis del ritual: qué está fluyendo, qué resiste), ## Lo que la vela anuncia (si la intención se cumplirá, cuándo se empezará a notar, con plazo amplio, y qué la frena si algo la frena), ## Qué hacer ahora (un paso concreto para los próximos días y, si conviene, si repetir el ritual y con qué color o fase lunar). ` +
        `Extensión: 600 a 800 palabras.`,
      sistemaExtra: TRADICION_VELAS,
      opciones: { idioma, effort: "medium", maxTokens: 3000, imagenes: imagen ? [imagen] : [], nivel: "premium" },
    };
  }

  if (l.tipo === "aura") {
    const r = resultado as unknown as ResultadoAura;
    const nombre = datoDeUsuario(String(entrada.nombre ?? ""), 80) || "la persona";
    return {
      usuario:
        `Interpreta el aura de esta persona a partir de su test y su Sol natal.\n\n${resumenAura(r, nombre)}\n\n` +
        `Estructura: ## Tu color (el principal: cómo se ve y se siente tu energía hoy, con ejemplos de la vida diaria), ## El matiz (el secundario: cómo acompaña o equilibra al principal), ## Lo que te nutre y lo que te drena (ambientes, personas, hábitos, según tus colores), ## Lo que tienes apagado (los colores de puntaje bajo, como invitación, no como falta), ${anuncio("## Lo que tu aura atrae")} (qué personas, oportunidades y situaciones tiende a atraer tu energía en las próximas semanas), ## Cómo cuidar tu aura esta semana (tres gestos concretos: un color para vestir o rodearte, un lugar, una práctica breve), ## Síntesis en una frase que la persona pueda compartir. ` +
        `Usa el nombre de la persona. Extensión: 650 a 850 palabras.`,
      sistemaExtra: TRADICION_AURA,
      opciones: { idioma, effort: "medium", maxTokens: 3200 },
    };
  }

  if (l.tipo === "tabaco") {
    const e = entrada as unknown as EntradaTabaco;
    const imagen = await descargarPalma(e.foto);
    return {
      usuario:
        `Lee el tabaco de la foto adjunta. Mira la imagen con detalle antes de escribir.\n\n${resumenTabaco(e)}\n\n` +
        `Estructura: ## Lo que veo en tu tabaco (descripción concreta: color y forma de la ceniza, cómo va la quema, marcas de la capa, la punta, el humo si se ve; dónde está cada cosa), ## Señal por señal (cada una con su sentido tradicional y lo que puede decir para esta persona), ## Lo que el tabaco responde (si hubo pregunta, la respuesta; si no, el mensaje del momento), ${anuncio("## Lo que el tabaco anuncia")}, ## Un consejo para los próximos días. ` +
        `Extensión: 600 a 850 palabras.`,
      sistemaExtra: TRADICION_TABACO,
      opciones: { idioma, effort: "medium", maxTokens: 3400, imagenes: imagen ? [imagen] : [], nivel: "premium" },
    };
  }

  if (l.tipo === "sinastria") {
    const r = resultado as unknown as ResultadoSinastria;
    const nombreA = datoDeUsuario(r.a.nombre, 80) || "A";
    const nombreB = datoDeUsuario(r.b.nombre, 80) || "B";
    return {
      usuario:
        `Interpreta esta sinastría (compatibilidad entre dos cartas astrales completas).\n\n${resumenSinastria(r)}\n\n` +
        `Estructura: ## Quiénes son (el temperamento de cada uno en tres líneas: Sol, Luna y Ascendente si lo hay), ## Lo que los une (los aspectos armónicos más fuertes, nombrando los planetas y qué se siente en la vida real), ## Donde chocan (los aspectos tensos, sin dramatizar: qué fricción concreta y cómo se trabaja), ## En el amor y el deseo (Venus, Marte, Luna), ## En la convivencia y el tiempo (Saturno, Júpiter, estabilidad; solapamientos de casas si los hay), ## Lo que se anuncia para esta relación (si tiene futuro y de qué tipo: pasión que dura poco, compañía larga, amistad; qué etapa viene y qué la pondrá a prueba, con plazos amplios), ## Síntesis y un consejo para ${nombreA} y otro para ${nombreB}. ` +
        `Usa los nombres de las dos personas. El puntaje es orientativo: explícalo, no lo repitas como veredicto. Extensión: 900 a 1200 palabras.`,
      sistemaExtra:
        "Sinastría clásica: los contactos Sol-Luna, Luna-Luna y Venus-Marte pesan más; las conjunciones y trígonos unen, las cuadraturas tensan y las oposiciones atraen con fricción; Saturno da duración o frialdad según el aspecto. Habla de dinámicas y de lo que anuncian, con franqueza; aun así, ninguna sinastría condena ni garantiza una relación.",
      opciones: { idioma, effort: "medium", maxTokens: 5000, nivel: "premium" },
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
        `## Lo que puede estar anunciando (dos o tres anuncios concretos que la tradición asocia a sus símbolos, con plazo amplio), ## Lo que te está diciendo (la síntesis: un mensaje claro y una pregunta para llevar al día). Extensión: 700 a 950 palabras.`,
      sistemaExtra:
        "Interpretación de sueños: combina la lectura simbólica clásica (arquetipos junguianos, la tradición de los diccionarios de sueños, la mitología y los cuatro elementos) con el contexto de la persona. Habla de lo que la persona vive, teme o desea y, cuando la tradición le da a un símbolo sentido de anuncio (agua clara, dientes, boda, viaje, dinero, nacimiento), dilo como un anuncio probable y simbólico, nunca literal ni fatal. Nombra los símbolos concretos del relato, no generalidades. Si el sueño incluye violencia, muerte o pérdida, trátalo con calma: en los sueños suelen hablar de cambios y cierres, no de hechos. Si el relato sugiere angustia persistente, pesadillas repetidas o un trauma, sugiere con delicadeza hablar con un profesional de salud mental, sin diagnosticar. No inventes detalles que no estén en el relato.",
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
      `Estructura: ## Lo que los une, ## Dónde chocan, ## En el amor, ## En la amistad y el trabajo, ## Lo que se anuncia (si la relación tiene futuro, de qué tipo y qué etapa viene), ## Consejo para que funcione. Usa los nombres. Extensión: 600 a 750 palabras.`,
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
