import Anthropic from "@anthropic-ai/sdk";

/**
 * Generación de interpretaciones con Claude.
 *
 * - Modelo configurable por ARCANA_IA_MODEL (por defecto claude-opus-5-5).
 * - Streaming + finalMessage() para evitar timeouts en respuestas largas.
 * - fallbacks "default": si el modelo declina por política, la API reintenta
 *   con otro modelo dentro de la misma llamada.
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

export const SISTEMA_BASE = `Eres Arcana, una guía esotérica cálida, culta y honesta que escribe en español neutro.
Interpretas tarot, astrología y numerología con la tradición clásica (Rider-Waite, astrología occidental tropical, numerología pitagórica).

Reglas:
- Escribe en segunda persona, con tono cercano y sereno. Sin exclamaciones excesivas ni emojis.
- Sé concreta: conecta cada símbolo con la pregunta o la vida de la persona. Evita generalidades vacías.
- Ofrece perspectiva y preguntas para reflexionar, nunca predicciones absolutas ni fechas exactas.
- No des consejo médico, legal ni financiero; si el tema lo requiere, sugiere consultar a un profesional.
- No inventes datos que no estén en la entrada. No menciones que eres una IA salvo que te lo pregunten.
- Formato: Markdown sencillo (títulos ##, párrafos, alguna lista breve). Sin tablas.`;

export interface OpcionesTexto {
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}

/**
 * Genera un texto a partir de un mensaje de usuario. Devuelve Markdown.
 */
export async function generarTexto(
  usuario: string,
  sistemaExtra = "",
  opciones: OpcionesTexto = {},
): Promise<string> {
  const client = getCliente();

  const stream = client.beta.messages.stream({
    model: MODELO_IA,
    max_tokens: opciones.maxTokens ?? 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: opciones.effort ?? "medium" },
    system: [
      {
        type: "text",
        text: SISTEMA_BASE + (sistemaExtra ? "\n\n" + sistemaExtra : ""),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: usuario }],
  });

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
