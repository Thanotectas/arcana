import "server-only";
import type { OpcionesTexto } from "../ia";
import type { TipoLectura } from "../creditos";
import { TIRADAS, resumenTirada, type CartaTirada, type TipoTirada } from "../tarot/tiradas";
import { calcularCarta, resumenCarta, type DatosNacimiento } from "../astro/carta";
import { SIGNIFICADO_NUMERO, type PerfilNumerologico } from "../numerologia";
import { signoPorId } from "../zodiaco";

export interface LecturaParaPrompt {
  tipo: TipoLectura;
  entrada: unknown;
  resultado: unknown;
}

export interface Prompt {
  usuario: string;
  opciones: OpcionesTexto;
}

type Objeto = Record<string, unknown>;

/** Reconstruye el mensaje para el modelo a partir de una lectura guardada. */
export function construirPrompt(l: LecturaParaPrompt): Prompt {
  const entrada = (l.entrada ?? {}) as Objeto;
  const resultado = (l.resultado ?? {}) as Objeto;

  if (l.tipo in TIRADAS) {
    const tipo = l.tipo as TipoTirada;
    const cartas = (resultado.cartas ?? []) as CartaTirada[];
    const pregunta = String(entrada.pregunta ?? "");
    const extension =
      tipo === "tarot_carta"
        ? " Sé breve: máximo 250 palabras."
        : tipo === "tarot_tres"
          ? " Extensión: 400 a 550 palabras."
          : " Extensión: 800 a 1100 palabras.";
    return {
      usuario:
        `Interpreta esta tirada de tarot para la persona.\n\n${resumenTirada(tipo, cartas, pregunta)}\n\n` +
        `Estructura: un breve encuadre, luego una sección por posición (## nombre de la posición — carta), y un cierre con síntesis y un consejo práctico.` +
        extension,
      opciones: { effort: tipo === "tarot_celta" ? "medium" : "low", maxTokens: tipo === "tarot_celta" ? 3500 : 1500 },
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
      opciones: { effort: "medium", maxTokens: 5000 },
    };
  }

  if (l.tipo === "numerologia") {
    const perfil = resultado as unknown as PerfilNumerologico;
    const describir = (n: number) => `${n} (${SIGNIFICADO_NUMERO[n]?.titulo ?? ""}: ${SIGNIFICADO_NUMERO[n]?.resumen ?? ""})`;
    return {
      usuario:
        `Interpreta este perfil numerológico pitagórico.\n\nNombre: ${String(entrada.nombre ?? "")}\nFecha de nacimiento: ${String(entrada.fecha ?? "")}\n` +
        `Camino de vida: ${describir(perfil.caminoDeVida)}\nNúmero de expresión: ${describir(perfil.expresion)}\n` +
        `Impulso del alma: ${describir(perfil.almaOImpulso)}\nPersonalidad: ${describir(perfil.personalidad)}\n` +
        `Número de cumpleaños: ${describir(perfil.cumpleanos)}\nAño personal actual: ${perfil.anioPersonal}\n\n` +
        `Estructura: una sección por número (## Camino de vida N, etc.), cómo interactúan entre sí, y un cierre con el tema del año personal. Extensión: 600 a 800 palabras.`,
      opciones: { effort: "low", maxTokens: 2500 },
    };
  }

  // Compatibilidad
  const a = signoPorId(String(resultado.signoA));
  const b = signoPorId(String(resultado.signoB));
  if (!a || !b) throw new Error("Lectura de compatibilidad incompleta.");
  const nombreA = String(entrada.nombreA ?? "Persona A");
  const nombreB = String(entrada.nombreB ?? "Persona B");
  return {
    usuario:
      `Analiza la compatibilidad astrológica entre ${nombreA} (${a.nombre}, ${a.elemento}, ${a.modalidad}, regente ${a.regente}) y ${nombreB} (${b.nombre}, ${b.elemento}, ${b.modalidad}, regente ${b.regente}). ` +
      `Afinidad calculada por elementos y modalidades: ${Number(resultado.puntaje)}/100.\n\n` +
      `Estructura: ## Lo que los une, ## Dónde chocan, ## En el amor, ## En la amistad y el trabajo, ## Consejo para que funcione. Usa los nombres. Extensión: 500 a 650 palabras.`,
    opciones: { effort: "low", maxTokens: 2200 },
  };
}
