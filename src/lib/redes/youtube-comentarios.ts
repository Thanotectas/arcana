import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { atenderInteraccion } from "./sibila-redes";
import { comentariosSinResponder, permisoComentariosYoutube, turnoComentariosYoutube, youtubeConectado } from "./youtube";

/** Respuestas por revisión: cada una gasta 50 unidades del cupo diario de YouTube (10.000, compartido con las subidas). */
const MAXIMO_POR_REVISION = 15;

/**
 * Sibila responde los comentarios de YouTube. YouTube no avisa por webhook: se consulta la API (1 unidad) como mucho
 * cada `minutos`, desde los avisos de Meta (que llegan a menudo) y desde los orquestadores del día. Cada comentario
 * pasa por atenderInteraccion, igual que Instagram y Facebook: mismo tono, abjad y Yıldızname con tabla fija, topes.
 */
export async function revisarComentariosYoutube(admin: SupabaseClient<Database>, minutos = 20, maximo = MAXIMO_POR_REVISION) {
  if (process.env.YOUTUBE_COMENTARIOS === "0") return { omitido: "apagado" };
  if (!(await youtubeConectado(admin))) return { omitido: "sin_canal" };
  if (!(await permisoComentariosYoutube(admin))) return { omitido: "falta_permiso: vuelve a conectar YouTube en /admin/redes" };
  if (!(await turnoComentariosYoutube(admin, minutos))) return { omitido: "revisado_hace_poco" };
  const comentarios = await comentariosSinResponder(admin);
  // Los que ya pasaron por aquí (respondidos, omitidos o con error) no se repiten.
  const { data: vistos } = comentarios.length
    ? await admin.from("interacciones_redes").select("id_meta").in("id_meta", comentarios.map((c) => c.id))
    : { data: [] };
  const yaVistos = new Set((vistos ?? []).map((v) => v.id_meta));
  const resultados: Record<string, string> = {};
  for (const c of comentarios.filter((c) => !yaVistos.has(c.id)).slice(0, maximo)) {
    try {
      resultados[c.id] = await atenderInteraccion(admin, { red: "youtube", tipo: "comentario", idMeta: c.id, remitenteId: c.autorId, remitente: c.autor, objetoId: c.videoId, texto: c.texto });
    } catch (e) {
      resultados[c.id] = `error: ${e instanceof Error ? e.message : String(e)}`.slice(0, 200);
    }
  }
  return { encontrados: comentarios.length, atendidos: resultados };
}
