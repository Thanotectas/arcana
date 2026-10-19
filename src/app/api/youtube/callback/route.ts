import { NextResponse, type NextRequest } from "next/server";
import { requerirAdmin } from "@/lib/admin";
import { sitio } from "@/lib/correo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { conectarYoutube } from "@/lib/redes/youtube";

/** Vuelta de Google tras autorizar: canjea el código y guarda el canal. */
export async function GET(request: NextRequest) {
  await requerirAdmin();
  const q = request.nextUrl.searchParams;
  const volver = (params: Record<string, string>) => {
    const res = NextResponse.redirect(`${sitio()}/admin/redes?${new URLSearchParams(params)}#youtube`);
    res.cookies.delete({ name: "youtube_estado", path: "/api/youtube" });
    return res;
  };
  if (q.get("error")) return volver({ youtube: "error", motivo: (q.get("error_description") || q.get("error") || "").slice(0, 200) });
  const codigo = q.get("code");
  const estado = q.get("state");
  if (!codigo || !estado || estado !== request.cookies.get("youtube_estado")?.value) {
    return volver({ youtube: "error", motivo: "La autorización expiró o no coincide; vuelve a intentarlo." });
  }
  try {
    await conectarYoutube(getSupabaseAdmin(), codigo);
    return volver({ youtube: "conectada" });
  } catch (e) {
    console.error("[youtube callback]", e instanceof Error ? e.message : e);
    return volver({ youtube: "error", motivo: (e instanceof Error ? e.message : "No se pudo conectar.").slice(0, 200) });
  }
}
