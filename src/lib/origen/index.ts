import "server-only";
import { cookies, headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { COOKIE_ORIGEN, OPCIONES_COOKIE_ORIGEN, detalleOrigen, leerOrigen, serializarOrigen, type Origen } from "./comun";

export { ENLACES_CORTOS } from "./comun";

/** Origen guardado en la cookie (la primera red por la que entró la persona), si lo hay. */
export async function origenPendiente(): Promise<Origen | null> {
  return leerOrigen((await cookies()).get(COOKIE_ORIGEN)?.value);
}

/**
 * Deja el origen en el perfil de la persona recién registrada (solo si el
 * perfil es de hoy y aún no tiene origen: quien ya tenía cuenta y vuelve por
 * un enlace de YouTube no cambia de origen). Tolera que la migración 0036 no
 * esté aplicada.
 */
export async function registrarOrigenPendiente(usuarioId: string) {
  const origen = await origenPendiente();
  const desde = new Date(Date.now() - 86_400_000).toISOString();
  if (origen) {
    try {
      await getSupabaseAdmin()
        .from("perfiles")
        .update({ origen: origen.fuente, origen_detalle: detalleOrigen(origen) })
        .eq("id", usuarioId)
        .is("origen", null)
        .gte("creado_en", desde);
    } catch (e) {
      console.error("[origen]", e instanceof Error ? e.message : e);
    }
  }
  // País desde el que se creó la cuenta, para el embudo por país (migración 0050).
  const pais = (await headers()).get("x-vercel-ip-country");
  if (pais && /^[A-Z]{2}$/.test(pais)) {
    try {
      const { error } = await getSupabaseAdmin().from("perfiles").update({ pais }).eq("id", usuarioId).is("pais", null).gte("creado_en", desde);
      if (error) console.error("[origen] país:", error.message);
    } catch (e) {
      console.error("[origen] país:", e instanceof Error ? e.message : e);
    }
  }
}

/**
 * Enlace corto de una red (miarcana.com/yt/rituales → /rituales): guarda el
 * origen si la persona no traía uno y redirige dentro del sitio.
 */
export function redirigirConOrigen(request: NextRequest, fuente: string, ruta: string[] | undefined, medio = "enlace") {
  const url = request.nextUrl.clone();
  url.pathname = "/" + (ruta ?? []).map((p) => p.replace(/[^\w.-]/g, "")).filter(Boolean).join("/");
  url.search = "";
  const res = NextResponse.redirect(url);
  if (!request.cookies.get(COOKIE_ORIGEN)?.value) {
    res.cookies.set(COOKIE_ORIGEN, serializarOrigen({ fuente, medio }), { ...OPCIONES_COOKIE_ORIGEN, secure: process.env.NODE_ENV === "production" });
  }
  return res;
}
