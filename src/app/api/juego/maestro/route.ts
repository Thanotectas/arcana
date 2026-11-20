import { createClient } from "@/lib/supabase/server";
import { registrarMaestro } from "@/lib/juego/servidor";

/** Guarda el reto maestro de hoy (solo con cuenta y después de encontrar la carta del día). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });
  let cuerpo: { fecha?: unknown; intentos?: unknown } = {};
  try {
    cuerpo = (await request.json()) as typeof cuerpo;
  } catch {
    /* sin cuerpo */
  }
  const r = await registrarMaestro(user.id, String(cuerpo.fecha ?? ""), cuerpo.intentos);
  return Response.json(r, { status: r.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
}
