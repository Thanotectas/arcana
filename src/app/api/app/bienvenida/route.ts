import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPlataforma } from "@/lib/plataforma";
import { CREDITOS_PROBADOR, MOTIVO_PROBADOR } from "@/lib/marca/play";

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
  // App de Google Play: los créditos de prueba son solo para quien se invitó y se agregó en Play Console
  // (si la app sale al público, el resto recibe el crédito de bienvenida normal). Una sola vez.
  if (plataforma === "android") {
    const [{ count }, { data: invitacion }] = await Promise.all([
      admin.from("movimientos_creditos").select("id", { count: "exact", head: true }).eq("usuario_id", user.id).eq("motivo", MOTIVO_PROBADOR),
      admin.from("probadores_invitaciones").select("agregado_en").eq("usuario_id", user.id).maybeSingle(),
    ]);
    if (!count && invitacion?.agregado_en) {
      const { error: errorPrueba } = await admin.rpc("devolver_creditos", { p_usuario: user.id, p_cantidad: CREDITOS_PROBADOR, p_motivo: MOTIVO_PROBADOR, p_referencia: "app-android" });
      if (errorPrueba) {
        console.error("[app] no se sumaron los créditos de prueba", errorPrueba.message);
        return Response.json({ error: "credito" }, { status: 500 });
      }
      await admin.from("app_instalaciones").upsert({ usuario_id: user.id, plataforma }, { onConflict: "usuario_id", ignoreDuplicates: true });
      return Response.json({ ok: true, premio: true, creditos: CREDITOS_PROBADOR, probador: true });
    }
  }
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
  return Response.json({ ok: true, premio: true, creditos: 1 });
}
