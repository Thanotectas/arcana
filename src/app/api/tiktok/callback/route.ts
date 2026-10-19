import { NextResponse, type NextRequest } from "next/server";
import { requerirAdmin } from "@/lib/admin";
import { sitio } from "@/lib/correo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { conectarTiktok } from "@/lib/redes/tiktok";

/** Vuelta de TikTok tras autorizar: canjea el código y guarda la cuenta. */
export async function GET(request: NextRequest) {
  await requerirAdmin();
  const q = request.nextUrl.searchParams;
  const volver = (params: Record<string, string>) => {
    const res = NextResponse.redirect(`${sitio()}/admin/redes?${new URLSearchParams(params)}#tiktok`);
    res.cookies.delete({ name: "tiktok_estado", path: "/api/tiktok" });
    return res;
  };
  if (q.get("error")) return volver({ tiktok: "error", motivo: (q.get("error_description") || q.get("error") || "").slice(0, 200) });
  const codigo = q.get("code");
  const estado = q.get("state");
  if (!codigo || !estado || estado !== request.cookies.get("tiktok_estado")?.value) {
    return volver({ tiktok: "error", motivo: "La autorización expiró o no coincide; vuelve a intentarlo." });
  }
  try {
    await conectarTiktok(getSupabaseAdmin(), codigo);
    return volver({ tiktok: "conectada" });
  } catch (e) {
    console.error("[tiktok callback]", e instanceof Error ? e.message : e);
    return volver({ tiktok: "error", motivo: (e instanceof Error ? e.message : "No se pudo conectar.").slice(0, 200) });
  }
}
