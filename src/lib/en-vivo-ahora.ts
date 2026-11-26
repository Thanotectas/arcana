import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { estadoDirecto } from "@/lib/marca/directo";

/**
 * «Estoy en vivo ahora»: el directo que el presentador prende a mano desde /admin/en-vivo, a cualquier hora,
 * sin depender del horario fijo (PROXIMO_DIRECTO / DIRECTO_TIKTOK). Dura hasta que lo apaga; si se le olvida,
 * se apaga solo a las 8 horas. Sin la migración 0082, nunca está prendido.
 */
export const DURACION_MAXIMA_VIVO = 8 * 3_600_000;
export type PlataformaVivo = "tiktok" | "youtube";

export function vivoVigente(estado: { vivo_desde?: string | null } | null, ahora = Date.now()): boolean {
  const desde = estado?.vivo_desde ? Date.parse(estado.vivo_desde) : NaN;
  return Number.isFinite(desde) && ahora - desde < DURACION_MAXIMA_VIVO;
}

/** El directo puesto a mano, si está prendido: desde cuándo y en qué plataforma. */
export async function vivoAhora(): Promise<{ desde: string; en: PlataformaVivo } | null> {
  const { data, error } = await getSupabaseAdmin().from("en_vivo_estado").select("vivo_desde, vivo_en").eq("id", 1).maybeSingle();
  if (error || !data || !vivoVigente(data)) return null;
  return { desde: data.vivo_desde as string, en: data.vivo_en === "youtube" ? "youtube" : "tiktok" };
}

/** Como `estadoDirecto()`, pero el directo puesto a mano manda: si está prendido, es «en-vivo». */
export async function estadoDirectoActual(): Promise<"proximo" | "en-vivo" | null> {
  const manual = await vivoAhora().catch(() => null);
  return manual ? "en-vivo" : estadoDirecto();
}
