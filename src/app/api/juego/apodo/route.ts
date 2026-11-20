import { createClient } from "@/lib/supabase/server";
import { guardarApodo } from "@/lib/juego/servidor";

/** Elige o cambia el apodo con el que se aparece en el ranking semanal. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "no_autenticado" }, { status: 401 });
  let cuerpo: { apodo?: unknown } = {};
  try {
    cuerpo = (await request.json()) as typeof cuerpo;
  } catch {
    /* sin cuerpo */
  }
  const r = await guardarApodo(user.id, cuerpo.apodo);
  return Response.json(r, { status: r.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
}
