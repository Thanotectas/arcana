import { createClient } from "@/lib/supabase/server";
import { progresoDeCuenta, registrarPartida } from "@/lib/juego/servidor";

/** El progreso del juego guardado en la cuenta (401 sin sesión: el juego sigue en el navegador). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });
  return Response.json(await progresoDeCuenta(user.id), { headers: { "Cache-Control": "no-store" } });
}

/** Guarda la partida terminada de hoy y, si completa una racha de 7, regala el crédito. */
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
  const r = await registrarPartida(user.id, String(cuerpo.fecha ?? ""), cuerpo.intentos);
  return Response.json(r, { status: r.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
}
