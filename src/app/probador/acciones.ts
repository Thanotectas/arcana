"use server";

import { redirect } from "next/navigation";
import { getUsuarioOpcional } from "@/lib/dal";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** La persona acepta ser probadora y deja el Gmail con que usa Google Play. */
export async function accionSerProbador(formData: FormData) {
  const usuario = await getUsuarioOpcional();
  if (!usuario) redirect("/entrar?volver=/probador");
  const gmail = String(formData.get("gmail") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@(gmail|googlemail)\.com$/.test(gmail)) redirect("/probador?error=gmail");
  if (formData.get("android") !== "on") redirect("/probador?error=android");
  const { error } = await getSupabaseAdmin()
    .from("probadores_invitaciones")
    .upsert({ usuario_id: usuario.id, gmail, acepto_en: new Date().toISOString() }, { onConflict: "usuario_id" });
  if (error) {
    console.error("[probador] no se guardó", error.message);
    redirect("/probador?error=guardar");
  }
  redirect("/probador?listo=1");
}
