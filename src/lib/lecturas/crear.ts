import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { getSupabaseAdmin } from "../supabase/admin";
import { COSTOS, type TipoLectura } from "../creditos";
import { getPerfil } from "../dal";
import { getIdioma } from "../i18n/servidor";
import type { Json } from "@/types/database";

/*
 * Creación y cobro de lecturas, compartidos por las acciones de cada producto (src/lib/lecturas/acciones.ts y los
 * productos con módulo propio). No es un archivo "use server": estas funciones nunca se exponen al cliente.
 */
export interface EstadoAccion {
  error?: string;
}

export async function usuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

/**
 * Cobra la lectura y la guarda en estado 'pendiente'. La interpretación la
 * escribe después /api/lecturas/[id]/generar mientras la persona la ve.
 * Solo el servidor crea lecturas (la tabla no admite inserts de usuarios).
 */
/** `costo`: tarifa propia de una variante (p. ej. la lectura completa del nombre); por defecto, la del tipo. */
export async function crearLectura(datos: { tipo: TipoLectura; titulo: string; entrada: unknown; resultado: unknown; costo?: number }) {
  const { supabase, user } = await usuarioActual();
  const perfil = await getPerfil();
  const idioma = await getIdioma();
  const entrada = { ...(datos.entrada as Record<string, unknown>), idioma };
  // Las cuentas ilimitadas pasan por el cobro (queda registro) sin pagar nada.
  const costoTarifa = datos.costo ?? COSTOS[datos.tipo];
  const costo = perfil?.ilimitado ? 0 : costoTarifa;
  const referencia = `${datos.tipo}-${Date.now()}`;

  if (costoTarifa > 0) {
    const { data: ok, error } = await supabase.rpc("consumir_creditos", {
      p_cantidad: costoTarifa,
      p_motivo: `lectura:${datos.tipo}`,
      p_referencia: referencia,
    });
    if (error) throw new Error("No se pudo procesar el cobro. Intenta de nuevo.");
    if (!ok) throw new Error("SIN_CREDITOS");
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("lecturas")
    .insert({
      usuario_id: user.id,
      tipo: datos.tipo,
      titulo: datos.titulo,
      entrada: entrada as Json,
      resultado: datos.resultado as Json,
      creditos_usados: costo,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (costo > 0) {
      await admin.rpc("devolver_creditos", { p_usuario: user.id, p_cantidad: costo, p_motivo: `reembolso:${datos.tipo}`, p_referencia: referencia });
    }
    throw new Error("No se pudo guardar la lectura. No se cobró nada.");
  }

  revalidatePath("/inicio");
  revalidatePath("/lecturas");
  return data.id as string;
}

export function manejarError(e: unknown): EstadoAccion {
  const msg = e instanceof Error ? e.message : "Ocurrió un error inesperado.";
  if (msg === "SIN_CREDITOS") {
    return { error: "SIN_CREDITOS" };
  }
  console.error("[lecturas]", e);
  return { error: msg };
}

