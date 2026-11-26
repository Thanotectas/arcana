import "server-only";
import { createHash } from "node:crypto";
import { getCliente, registrarUso } from "@/lib/ia";

/**
 * Lee el chat de un LIVE de TikTok desde una captura de la pantalla (LIVE Studio no da los comentarios por API):
 * Claude mira la imagen y devuelve los comentarios de la gente, tal cual.
 */
const MODELO = process.env.ARCANA_IA_MODEL_PANTALLA ?? "claude-haiku-5-5";

const SISTEMA = `Lees capturas de pantalla del chat de un LIVE de TikTok (la ventana de TikTok LIVE Studio o el celular).
Devuelve SOLO un JSON, sin nada más: {"comentarios":[{"autor":"…","texto":"…"}]}
- Los comentarios escritos por personas que se ven en la imagen, de arriba abajo, con su nombre tal como aparece y el texto copiado tal cual (sin corregir ni traducir; los emojis puedes quitarlos).
- Ignora los avisos del sistema y de la plataforma: «se ha unido», «se unió», «envió», regalos, «le ha gustado», me gusta, «compartió», «siguió al anfitrión», rankings, objetivos, campañas, menús y botones.
- Ignora los comentarios del anfitrión (marcados como Anfitrión, Host o Creador).
- Si un comentario está cortado por el borde de la imagen, no lo incluyas.
- Si no hay chat visible, {"comentarios":[]}.`;

export interface ComentarioPantalla {
  autor: string;
  texto: string;
}

export async function leerChatDePantalla(imagenBase64: string, tipo: "image/jpeg" | "image/png" = "image/jpeg"): Promise<ComentarioPantalla[]> {
  const r = await getCliente().messages.create({
    model: MODELO,
    max_tokens: 1500,
    system: SISTEMA,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: tipo, data: imagenBase64 } },
          { type: "text", text: "Los comentarios de esta captura, en JSON." },
        ],
      },
    ],
  });
  await registrarUso("en vivo · leer el chat de la pantalla", r);
  const texto = r.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = /\{[\s\S]*\}/.exec(texto)?.[0];
  if (!json) return [];
  try {
    const datos = JSON.parse(json) as { comentarios?: { autor?: unknown; texto?: unknown }[] };
    return (datos.comentarios ?? [])
      .map((c) => ({ autor: String(c.autor ?? "").trim().slice(0, 60), texto: String(c.texto ?? "").trim().slice(0, 300) }))
      .filter((c) => c.autor && c.texto);
  } catch {
    return [];
  }
}

/** Clave del comentario para no encolarlo dos veces aunque la lectura de la imagen cambie un poco (mayúsculas, signos). */
export function claveComentario(c: ComentarioPantalla) {
  const limpio = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]/g, "");
  return createHash("sha1")
    .update(`${limpio(c.autor)}|${limpio(c.texto).slice(0, 60)}`)
    .digest("hex")
    .slice(0, 20);
}
