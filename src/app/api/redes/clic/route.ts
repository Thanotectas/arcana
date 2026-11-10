import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { registrarClic, validarClic } from "@/lib/redes/hub";

/**
 * Un clic en el hub de redes (miarcana.com/redes) hacia un canal. Público y sin
 * datos personales: canal, código de origen y si fue desde el celular.
 */
export async function POST(request: Request) {
  const clic = validarClic(await request.json().catch(() => null));
  if (!clic) return Response.json({ error: "clic_no_valido" }, { status: 400 });
  try {
    await registrarClic(getSupabaseAdmin(), clic);
  } catch (e) {
    console.error("[hub de redes] clic sin guardar:", e instanceof Error ? e.message : e);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: true }, { status: 202 });
}
