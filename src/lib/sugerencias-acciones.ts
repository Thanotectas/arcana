"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUsuarioOpcional } from "@/lib/dal";
import { huellaDe } from "@/lib/chat-visitas";
import { esIdioma } from "@/lib/i18n/idiomas";

export interface EstadoSugerencia {
  codigo?: "ok" | "error";
}

/** «¿Tu práctica no está?»: guarda lo que la persona quiere que agreguemos (máximo 5 por hora por persona). */
export async function accionSugerirPractica(_prev: EstadoSugerencia, formData: FormData): Promise<EstadoSugerencia> {
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 1000);
  const correo = String(formData.get("correo") ?? "").trim().slice(0, 200) || null;
  const idioma = String(formData.get("idioma") ?? "es");
  if (texto.length < 3) return { codigo: "error" };
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return { codigo: "error" };
  const h = await headers();
  const huella = huellaDe(h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida");
  const admin = getSupabaseAdmin();
  const { count } = await admin.from("sugerencias_practicas").select("id", { count: "exact", head: true }).eq("huella", huella).gte("creado_en", new Date(Date.now() - 3_600_000).toISOString());
  if ((count ?? 0) >= 5) return { codigo: "ok" };
  const usuario = await getUsuarioOpcional().catch(() => null);
  const { error } = await admin.from("sugerencias_practicas").insert({ texto, correo, idioma: esIdioma(idioma) ? idioma : "es", usuario_id: usuario?.id ?? null, huella });
  return { codigo: error ? "error" : "ok" };
}
