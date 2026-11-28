import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { metaConfigurado, paginaMeta } from "@/lib/redes/meta";
import { detectarSigno } from "@/lib/redes/sibila-redes";
import { pareceConsulta, tipoDeMensaje } from "@/lib/en-vivo";

/**
 * Comentarios del directo de Instagram (@miarcana.oficial): el mismo directo de OBS se transmite también a Instagram
 * (Instagram en el computador → «En vivo» → «Software de transmisión», con su URL y clave), y las consultas que la
 * gente escribe en el vivo entran a la misma fila que YouTube y Facebook, con origen «instagram». Usa el token de la
 * página (instagram_basic e instagram_manage_comments, que ya funcionan con la cuenta propia). Migración 0084.
 */
type Admin = SupabaseClient<Database>;
const API = "https://graph.facebook.com/v25.0";

interface ComentarioIg {
  id: string;
  text?: string;
  timestamp?: string;
  username?: string;
  from?: { id?: string; username?: string };
}

async function graph<T>(ruta: string, token: string): Promise<T> {
  const res = await fetch(`${API}/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const datos = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) throw new Error(`Instagram: ${datos.error?.message ?? res.status}${datos.error?.code ? ` (código ${datos.error.code})` : ""}`);
  return datos;
}

export interface EstadoInstagram {
  configurado: boolean;
  directo: boolean;
  nuevas: number;
  detalle?: string;
}

/** Busca el vivo de Instagram (cada 30 s como mucho) y encola los comentarios nuevos que parecen consulta. */
export async function sincronizarInstagram(admin: Admin): Promise<EstadoInstagram> {
  const igId = process.env.IG_USER_ID;
  if (!metaConfigurado() || !igId) return { configurado: false, directo: false, nuevas: 0 };
  const { data: estado, error: errorEstado } = await admin.from("en_vivo_estado").select("*").eq("id", 1).maybeSingle();
  if (errorEstado || (estado && !("ig_live_id" in estado))) return { configurado: true, directo: false, nuevas: 0, detalle: "Falta la migración 0084" };
  const ahora = Date.now();
  const pagina = await paginaMeta();
  let directo = estado?.ig_live_id ?? null;
  const guardar = (cambios: Partial<Database["public"]["Tables"]["en_vivo_estado"]["Row"]>) =>
    admin.from("en_vivo_estado").upsert({ id: 1, ...cambios, actualizado_en: new Date().toISOString() }, { onConflict: "id" });

  // El vivo guardado se vuelve a confirmar cada minuto: si terminó o empezó otro, se cambia (un vivo viejo
  // puede seguir respondiendo a /comments aunque ya no esté al aire).
  if (directo && (!estado?.ig_buscado_en || ahora - Date.parse(estado.ig_buscado_en) >= 60_000)) {
    try {
      const r = await graph<{ data?: { id: string }[] }>(`${igId}/live_media?fields=id&limit=1`, pagina.token);
      const actual = r.data?.[0]?.id ?? null;
      if (actual !== directo) {
        await guardar({ ig_live_id: actual, ig_desde: null, ig_buscado_en: new Date().toISOString(), ig_detalle: null });
        directo = actual;
        if (!directo) return { configurado: true, directo: false, nuevas: 0 };
      } else await guardar({ ig_buscado_en: new Date().toISOString() });
    } catch {
      // Si Meta no responde, se sigue con el vivo guardado.
    }
  }

  if (!directo) {
    if (estado?.ig_buscado_en && ahora - Date.parse(estado.ig_buscado_en) < 30_000) return { configurado: true, directo: false, nuevas: 0 };
    try {
      const r = await graph<{ data?: { id: string }[] }>(`${igId}/live_media?fields=id,media_type,timestamp&limit=1`, pagina.token);
      directo = r.data?.[0]?.id ?? null;
      await guardar({ ig_live_id: directo, ig_desde: null, ig_buscado_en: new Date().toISOString(), ig_detalle: null });
    } catch (e) {
      const detalle = e instanceof Error ? e.message : String(e);
      await guardar({ ig_buscado_en: new Date().toISOString(), ig_detalle: detalle.slice(0, 300) });
      return { configurado: true, directo: false, nuevas: 0, detalle };
    }
    if (!directo) return { configurado: true, directo: false, nuevas: 0 };
  }

  let comentarios: ComentarioIg[];
  try {
    const r = await graph<{ data?: ComentarioIg[] }>(`${directo}/comments?fields=id,text,timestamp,username,from&limit=50`, pagina.token);
    comentarios = r.data ?? [];
  } catch (e) {
    // El vivo terminó: se vuelve a buscar.
    const detalle = e instanceof Error ? e.message : String(e);
    await guardar({ ig_live_id: null, ig_desde: null, ig_detalle: detalle.slice(0, 300) });
    return { configurado: true, directo: false, nuevas: 0, detalle };
  }

  const desde = estado?.ig_desde ? Date.parse(estado.ig_desde) : 0;
  const nuevos = comentarios.filter((c) => c.timestamp && Date.parse(c.timestamp) > desde && c.from?.id !== igId);
  if (!nuevos.length) return { configurado: true, directo: true, nuevas: 0 };
  const masReciente = nuevos.reduce((m, c) => Math.max(m, Date.parse(c.timestamp!)), desde);

  // Igual que en YouTube y Facebook: los mensajes de una misma persona se juntan en una sola consulta.
  const porAutor = new Map<string, { id: string; textos: string[] }>();
  for (const c of [...nuevos].sort((a, b) => Date.parse(a.timestamp!) - Date.parse(b.timestamp!))) {
    const texto = (c.text ?? "").trim();
    if (!pareceConsulta(texto)) continue;
    const autor = (c.username ?? c.from?.username ?? "Alguien en Instagram").slice(0, 60);
    const grupo = porAutor.get(autor);
    if (grupo) grupo.textos.push(texto);
    else porAutor.set(autor, { id: c.id, textos: [texto] });
  }
  const filas = [];
  for (const [autor, g] of porAutor) {
    const texto = g.textos.join(" · ").slice(0, 300);
    const tipo = tipoDeMensaje(texto);
    if (tipo) filas.push({ mensaje_id: `ig:${g.id}`, origen: "instagram" as const, tipo, autor, texto, signo: detectarSigno(texto)?.id ?? null });
  }
  let nuevas = 0;
  if (filas.length) {
    const { data, error } = await admin.from("en_vivo_preguntas").upsert(filas, { onConflict: "mensaje_id", ignoreDuplicates: true }).select("id");
    if (error) console.error("[en vivo] instagram:", error.message);
    nuevas = data?.length ?? 0;
  }
  await guardar({ ig_desde: new Date(masReciente).toISOString(), ig_detalle: null });
  return { configurado: true, directo: true, nuevas };
}
