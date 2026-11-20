import { createClient } from "@/lib/supabase/server";
import { datosLiga } from "@/lib/juego/ligas";

/** Una liga y su tabla de la semana (se puede ver sin cuenta, para decidir si unirse). */
export async function GET(_: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const datos = await datosLiga((await params).codigo, user?.id ?? null);
  if (!datos) return Response.json({ error: "no_existe" }, { status: 404 });
  return Response.json({ ...datos, sesion: Boolean(user) }, { headers: { "Cache-Control": "no-store" } });
}
