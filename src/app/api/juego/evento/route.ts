import { createClient } from "@/lib/supabase/server";
import { EVENTOS_JUEGO, registrarEvento, type EventoJuego } from "@/lib/juego/lectura";

/** Eventos anónimos del juego para el panel /admin/juego (sin datos personales). */
export async function POST(request: Request) {
  let cuerpo: { evento?: unknown; visitante?: unknown; gano?: unknown; intentos?: unknown } = {};
  try {
    cuerpo = (await request.json()) as typeof cuerpo;
  } catch {
    /* sin cuerpo */
  }
  const evento = EVENTOS_JUEGO.find((e) => e === cuerpo.evento) as EventoJuego | undefined;
  const visitante = typeof cuerpo.visitante === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(cuerpo.visitante) ? cuerpo.visitante : null;
  if (!evento || !visitante) return Response.json({ ok: false }, { status: 400 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const intentos = Number(cuerpo.intentos);
  await registrarEvento({
    evento,
    visitante,
    usuarioId: user?.id ?? null,
    gano: typeof cuerpo.gano === "boolean" ? cuerpo.gano : null,
    intentos: Number.isInteger(intentos) && intentos >= 0 && intentos <= 10 ? intentos : null,
  });
  return Response.json({ ok: true });
}
