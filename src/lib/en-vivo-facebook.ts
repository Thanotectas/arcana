import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { metaConfigurado, paginaMeta } from "@/lib/redes/meta";
import { detectarSigno } from "@/lib/redes/sibila-redes";
import { pareceConsulta, tipoDeMensaje } from "@/lib/en-vivo";

/**
 * Comentarios del directo de Facebook en la página "Mi Arcana": el mismo
 * directo que va a YouTube se transmite también a Facebook (OBS con
 * «Multiple RTMP Outputs»), y las consultas que la gente escribe allí entran
 * en la misma fila que el chat de YouTube, con origen «facebook». Usa el
 * token de la página de Meta (pages_read_engagement; para ver el nombre de
 * quien comenta, pages_read_user_content). Necesita la migración 0041.
 */
type Admin = SupabaseClient<Database>;
const API = "https://graph.facebook.com/v25.0";

interface Comentario {
  id: string;
  message?: string;
  created_time?: string;
  from?: { id?: string; name?: string };
}

async function graph<T>(ruta: string, token: string): Promise<T> {
  const res = await fetch(`${API}/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const datos = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) throw new Error(`Facebook: ${datos.error?.message ?? res.status}${datos.error?.code ? ` (código ${datos.error.code})` : ""}`);
  return datos;
}

export interface EstadoFacebook {
  configurado: boolean;
  directo: boolean;
  nuevas: number;
  detalle?: string;
}

/** Busca el directo de la página (cada 30 s como mucho) y encola los comentarios nuevos que parecen consulta. */
export async function sincronizarFacebook(admin: Admin): Promise<EstadoFacebook> {
  if (!metaConfigurado()) return { configurado: false, directo: false, nuevas: 0 };
  const { data: estado, error: errorEstado } = await admin.from("en_vivo_estado").select("*").eq("id", 1).maybeSingle();
  // Sin la migración 0041 no existen las columnas de Facebook: no se intenta.
  if (errorEstado || (estado && !("fb_live_id" in estado))) return { configurado: true, directo: false, nuevas: 0, detalle: "Falta la migración 0041" };
  const ahora = Date.now();
  const pagina = await paginaMeta();
  let directo = estado?.fb_live_id ?? null;
  const guardar = (cambios: Partial<Database["public"]["Tables"]["en_vivo_estado"]["Row"]>) =>
    admin.from("en_vivo_estado").upsert({ id: 1, ...cambios, actualizado_en: new Date().toISOString() }, { onConflict: "id" });

  if (!directo) {
    if (estado?.fb_buscado_en && ahora - Date.parse(estado.fb_buscado_en) < 30_000) return { configurado: true, directo: false, nuevas: 0 };
    try {
      const r = await graph<{ data?: { id: string; status?: string }[] }>(`${pagina.id}/live_videos?broadcast_status=${encodeURIComponent('["LIVE"]')}&fields=id,status&limit=1`, pagina.token);
      directo = r.data?.[0]?.id ?? null;
      await guardar({ fb_live_id: directo, fb_desde: null, fb_buscado_en: new Date().toISOString(), fb_detalle: null });
    } catch (e) {
      const detalle = e instanceof Error ? e.message : String(e);
      await guardar({ fb_buscado_en: new Date().toISOString(), fb_detalle: detalle.slice(0, 300) });
      return { configurado: true, directo: false, nuevas: 0, detalle };
    }
    if (!directo) return { configurado: true, directo: false, nuevas: 0 };
  }

  let comentarios: Comentario[];
  try {
    const r = await graph<{ data?: Comentario[] }>(`${directo}/comments?order=reverse_chronological&filter=stream&live_filter=no_filter&fields=id,message,created_time,from{id,name}&limit=50`, pagina.token);
    comentarios = r.data ?? [];
  } catch (e) {
    // El directo terminó o ya no existe: se vuelve a buscar.
    const detalle = e instanceof Error ? e.message : String(e);
    await guardar({ fb_live_id: null, fb_desde: null, fb_detalle: detalle.slice(0, 300) });
    return { configurado: true, directo: false, nuevas: 0, detalle };
  }

  const desde = estado?.fb_desde ? Date.parse(estado.fb_desde) : 0;
  const nuevos = comentarios.filter((c) => c.created_time && Date.parse(c.created_time) > desde && c.from?.id !== pagina.id);
  if (!nuevos.length) return { configurado: true, directo: true, nuevas: 0 };
  const masReciente = nuevos.reduce((m, c) => Math.max(m, Date.parse(c.created_time!)), desde);

  // Igual que en YouTube: los mensajes de una misma persona se juntan en una sola consulta.
  const porAutor = new Map<string, { id: string; textos: string[] }>();
  for (const c of [...nuevos].reverse()) {
    const texto = (c.message ?? "").trim();
    if (!pareceConsulta(texto)) continue;
    const autor = (c.from?.name ?? "Alguien en Facebook").slice(0, 60);
    const grupo = porAutor.get(autor);
    if (grupo) grupo.textos.push(texto);
    else porAutor.set(autor, { id: c.id, textos: [texto] });
  }
  const filas = [];
  for (const [autor, g] of porAutor) {
    const texto = g.textos.join(" · ").slice(0, 300);
    const tipo = tipoDeMensaje(texto);
    if (tipo) filas.push({ mensaje_id: `fb:${g.id}`, origen: "facebook" as const, tipo, autor, texto, signo: detectarSigno(texto)?.id ?? null });
  }
  let nuevas = 0;
  if (filas.length) {
    const { data, error } = await admin.from("en_vivo_preguntas").upsert(filas, { onConflict: "mensaje_id", ignoreDuplicates: true }).select("id");
    if (error) console.error("[en vivo] facebook:", error.message);
    nuevas = data?.length ?? 0;
  }
  await guardar({ fb_desde: new Date(masReciente).toISOString(), fb_detalle: null });
  return { configurado: true, directo: true, nuevas };
}
