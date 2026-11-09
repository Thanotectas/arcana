"use server";

import { redirect } from "next/navigation";
import { getUsuario } from "@/lib/supabase/server";
import { abrirRegalo, regaloValido, regaloVencido } from "@/lib/correos/regalo";

/** Abre el regalo del correo «tu vaso de hoy» (botón en /regalo): solo la persona a quien se le envió y antes de que venza. */
export async function accionAbrirRegalo(formData: FormData) {
  const u = String(formData.get("u") ?? "");
  const v = Number(formData.get("v"));
  const t = String(formData.get("t") ?? "");
  const volver = `/regalo?u=${encodeURIComponent(u)}&v=${v}&t=${encodeURIComponent(t)}`;
  if (!regaloValido(u, v, t)) redirect("/regalo");
  const usuario = await getUsuario();
  if (!usuario) redirect(`/entrar?volver=${encodeURIComponent(volver)}`);
  if (usuario.id !== u || regaloVencido(v)) redirect(volver);
  const r = await abrirRegalo(u, v);
  redirect(`${volver}&${r === "error" ? "error=1" : "listo=1"}`);
}
