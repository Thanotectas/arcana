import "server-only";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getIdioma } from "@/lib/i18n/servidor";

export type EventoCompra = "vio_paquetes" | "vio_invitacion" | "toco_comprar";

/**
 * Registra un paso del embudo de compra (tabla eventos_compra): quién ve los paquetes, quién ve la invitación al
 * quedarse sin créditos y quién toca «comprar». Nunca falla hacia afuera: si no se puede guardar, se sigue igual.
 */
export async function registrarEventoCompra(evento: EventoCompra, datos: { paquete?: string; via?: string } = {}) {
  try {
    const [supabase, h, idioma] = await Promise.all([createClient(), headers(), getIdioma()]);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await getSupabaseAdmin()
      .from("eventos_compra")
      .insert({ evento, usuario_id: user?.id ?? null, paquete: datos.paquete ?? null, via: datos.via ?? null, pais: h.get("x-vercel-ip-country"), idioma });
  } catch (e) {
    console.error("[eventos compra]", evento, e instanceof Error ? e.message : e);
  }
}
