import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPlataforma } from "@/lib/plataforma";

const MOTIVO_APP = "regalo:app";

/**
 * Crédito de bienvenida: la primera vez que una cuenta abre Arcana instalada (app web o Google Play) se le
 * suma 1 crédito. La llave primaria de app_instalaciones hace que pase una sola vez por cuenta.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });
  const plataforma = await getPlataforma();
  if (plataforma === "web") return Response.json({ error: "no_instalada" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("app_instalaciones").insert({ usuario_id: user.id, plataforma });
  if (error) {
    if (error.code === "23505") return Response.json({ ok: true, premio: false });
    console.error("[app] no se guardó la instalación", error.message);
    return Response.json({ error: "guardar" }, { status: 500 });
  }
  const { error: errorCredito } = await admin.rpc("devolver_creditos", { p_usuario: user.id, p_cantidad: 1, p_motivo: MOTIVO_APP, p_referencia: plataforma });
  if (errorCredito) {
    console.error("[app] no se sumó el crédito de bienvenida", errorCredito.message);
    await admin.from("app_instalaciones").delete().eq("usuario_id", user.id);
    return Response.json({ error: "credito" }, { status: 500 });
  }
  return Response.json({ ok: true, premio: true });
}
