import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPlataforma } from "@/lib/plataforma";

/**
 * Guarda una opinión sobre la app (botón «Tu opinión»). Sin cuenta también se puede; como mucho 10 por persona al
 * día para que no se llene de basura.
 */
export async function POST(request: Request) {
  let cuerpo: { texto?: unknown; calificacion?: unknown; pagina?: unknown } = {};
  try {
    cuerpo = (await request.json()) as typeof cuerpo;
  } catch {
    /* sin cuerpo */
  }
  const texto = String(cuerpo.texto ?? "").trim().slice(0, 2000);
  const calificacion = Number(cuerpo.calificacion);
  if (texto.length < 3) return Response.json({ ok: false, error: "texto" }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = getSupabaseAdmin();
  if (user) {
    const { count } = await admin.from("app_opiniones").select("id", { count: "exact", head: true }).eq("usuario_id", user.id).gte("creado_en", new Date(Date.now() - 86_400_000).toISOString());
    if ((count ?? 0) >= 10) return Response.json({ ok: false, error: "limite" }, { status: 429 });
  }
  const { error } = await admin.from("app_opiniones").insert({
    usuario_id: user?.id ?? null,
    plataforma: await getPlataforma(),
    calificacion: Number.isInteger(calificacion) && calificacion >= 1 && calificacion <= 5 ? calificacion : null,
    texto,
    pagina: typeof cuerpo.pagina === "string" ? cuerpo.pagina.slice(0, 200) : null,
  });
  if (error) {
    console.error("[opinion]", error.message);
    return Response.json({ ok: false, error: "guardar" }, { status: 500 });
  }
  return Response.json({ ok: true });
}
