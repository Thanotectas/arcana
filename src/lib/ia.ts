import Anthropic from "@anthropic-ai/sdk";
import { IDIOMA_PARA_IA, IDIOMA_PREDETERMINADO, type Idioma } from "./i18n/idiomas";

/**
 * Generación de interpretaciones con Claude.
 *
 * - Modelo configurable por ARCANA_IA_MODEL (por defecto claude-opus-5-5).
 * - Streaming + finalMessage() para evitar timeouts en respuestas largas.
 * - fallbacks "default": si el modelo declina por política, la API reintenta
 *   con otro modelo dentro de la misma llamada.
 * - Admite imágenes (quiromancia) y el idioma de salida.
 */
let cliente: Anthropic | null = null;

function getCliente() {
  if (!cliente) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("[ia] Falta ANTHROPIC_API_KEY en el entorno.");
    }
    cliente = new Anthropic();
  }
  return cliente;
}

export const MODELO_IA = process.env.ARCANA_IA_MODEL ?? "claude-opus-5-5";

/** Parte estable del sistema (se cachea). No incluye el idioma. */
export const SISTEMA_BASE = `Eres Arcana, una guía esotérica cálida, culta y honesta.
Interpretas tarot, astrología, numerología y quiromancia con la tradición clásica (Rider-Waite y Marsella, astrología occidental tropical, numerología pitagórica, quiromancia occidental).

Reglas:
- Escribe en segunda persona, con tono cercano y sereno. Sin exclamaciones excesivas ni emojis.
- Sé concreta: conecta cada símbolo con la pregunta o la vida de la persona. Evita generalidades vacías.
- Ofrece perspectiva y preguntas para reflexionar, nunca predicciones absolutas ni fechas exactas.
- No des consejo médico, legal ni financiero; si el tema lo requiere, sugiere consultar a un profesional. En quiromancia nunca diagnostiques enfermedades ni anuncies la duración de la vida.
- No inventes datos que no estén en la entrada. No menciones que eres una IA salvo que te lo pregunten.
- Formato: Markdown sencillo (títulos ##, párrafos, alguna lista breve). Sin tablas.`;

export type ImagenEntrada = {
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  base64: string;
};

export interface OpcionesTexto {
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
  /** Idioma en que debe escribirse la respuesta. */
  idioma?: Idioma;
  /** Imágenes que acompañan al mensaje (por ejemplo, la palma de la mano). */
  imagenes?: ImagenEntrada[];
}

function instruccionIdioma(idioma: Idioma) {
  return `Escribe TODA la respuesta en ${IDIOMA_PARA_IA[idioma]}, incluidos los títulos. Si los nombres de cartas, signos o planetas llegan en español, tradúcelos al idioma de la respuesta con su nombre tradicional.`;
}

/**
 * Genera un texto a partir de un mensaje de usuario. Devuelve Markdown.
 * Si se pasa `alTexto`, recibe cada fragmento a medida que el modelo escribe.
 */
export async function generarTexto(
  usuario: string,
  sistemaExtra = "",
  opciones: OpcionesTexto = {},
  alTexto?: (fragmento: string) => void,
): Promise<string> {
  const client = getCliente();
  const idioma = opciones.idioma ?? IDIOMA_PREDETERMINADO;

  const contenido: Anthropic.Beta.BetaContentBlockParam[] = [
    ...(opciones.imagenes ?? []).map(
      (img): Anthropic.Beta.BetaImageBlockParam => ({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.base64 },
      }),
    ),
    { type: "text", text: usuario },
  ];

  const stream = client.beta.messages.stream({
    model: MODELO_IA,
    max_tokens: opciones.maxTokens ?? 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: opciones.effort ?? "medium" },
    system: [
      {
        type: "text",
        text: SISTEMA_BASE,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: instruccionIdioma(idioma) + (sistemaExtra ? "\n\n" + sistemaExtra : ""),
      },
    ],
    messages: [{ role: "user", content: contenido }],
  });

  if (alTexto) stream.on("text", (fragmento) => alTexto(fragmento));

  const mensaje = await stream.finalMessage();

  if (mensaje.stop_reason === "refusal") {
    throw new Error(
      "No fue posible generar esta lectura. Intenta reformular la pregunta.",
    );
  }

  return mensaje.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
