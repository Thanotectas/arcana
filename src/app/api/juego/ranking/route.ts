import { createClient } from "@/lib/supabase/server";
import { rankingSemanal } from "@/lib/juego/servidor";

/** La tabla de la semana: los 10 primeros con su apodo y, si hay sesión, tu puesto. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  try {
    return Response.json({ ...(await rankingSemanal(user?.id ?? null)), sesion: Boolean(user) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[juego] ranking", e);
    return Response.json({ error: "consulta" }, { status: 500 });
  }
}
