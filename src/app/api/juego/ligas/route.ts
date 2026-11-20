import { createClient } from "@/lib/supabase/server";
import { crearLiga, misLigas, salirDeLiga, unirseALiga } from "@/lib/juego/ligas";

async function usuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Mis ligas de amigos (401 sin sesión). */
export async function GET() {
  const user = await usuario();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });
  return Response.json({ ligas: await misLigas(user.id) }, { headers: { "Cache-Control": "no-store" } });
}

/** Crear una liga, unirse con un código o salirse: { accion: "crear" | "unirse" | "salir", nombre?, codigo? }. */
export async function POST(request: Request) {
  const user = await usuario();
  if (!user) return Response.json({ ok: false, error: "no_autenticado" }, { status: 401 });
  let cuerpo: { accion?: unknown; nombre?: unknown; codigo?: unknown } = {};
  try {
    cuerpo = (await request.json()) as typeof cuerpo;
  } catch {
    /* sin cuerpo */
  }
  if (cuerpo.accion === "crear") {
    const r = await crearLiga(user.id, cuerpo.nombre);
    return Response.json(r, { status: r.ok ? 200 : 400 });
  }
  if (cuerpo.accion === "unirse") {
    const r = await unirseALiga(user.id, cuerpo.codigo);
    return Response.json(r, { status: r.ok ? 200 : 400 });
  }
  if (cuerpo.accion === "salir") {
    await salirDeLiga(user.id, cuerpo.codigo);
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false, error: "accion" }, { status: 400 });
}
