import "server-only";
import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export const COOKIE_INVITACION = "invitacion";
export const BONO_INVITADO = 2;
export const BONO_INVITADOR = 2;

/** Guarda el código de invitación 30 días para aplicarlo tras el registro. */
export async function guardarInvitacion(codigo: string) {
  const jar = await cookies();
  jar.set(COOKIE_INVITACION, codigo.toUpperCase(), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
}

export async function codigoInvitacionPendiente(): Promise<string | null> {
  const jar = await cookies();
  const v = jar.get(COOKIE_INVITACION)?.value;
  return v && /^[A-Z0-9]{4,12}$/.test(v) ? v : null;
}

/**
 * Aplica la invitación pendiente al usuario autenticado (una sola vez) y
 * borra la cookie. Devuelve true si se acreditaron los créditos.
 */
export async function aplicarInvitacionPendiente(): Promise<boolean> {
  const codigo = await codigoInvitacionPendiente();
  if (!codigo) return false;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("aplicar_invitacion", { p_codigo: codigo });
  if (error) console.error("[invitaciones]", error);
  try {
    const jar = await cookies();
    jar.delete(COOKIE_INVITACION);
  } catch {
    /* fuera de una acción o ruta: la cookie se limpia en la siguiente */
  }
  return Boolean(data);
}

export async function nombreInvitador(codigo: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("nombre_invitador", { p_codigo: codigo });
  return (data as string | null) ?? null;
}

export function enlaceInvitacion(base: string, codigo: string) {
  return `${base}/r/${codigo}`;
}
