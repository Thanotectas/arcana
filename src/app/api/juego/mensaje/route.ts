import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { esSigno, mensajeParaSigno, signoDeFecha } from "@/lib/juego/lectura";
import { esIdioma } from "@/lib/i18n/idiomas";

export const maxDuration = 60;

/**
 * El mensaje de Sibila para tu signo con la carta de hoy: /api/juego/mensaje?signo=aries.
 * Sin ?signo=, usa el de la fecha de nacimiento de la cuenta; si no hay, responde 400 y la página lo pregunta.
 */
export async function GET(request: NextRequest) {
  let signo = request.nextUrl.searchParams.get("signo");
  const pedido = request.nextUrl.searchParams.get("idioma");
  const idioma = esIdioma(pedido) ? pedido : "es";
  if (!esSigno(signo)) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase.from("perfiles").select("fecha_nacimiento").eq("id", user.id).maybeSingle();
      signo = signoDeFecha(perfil?.fecha_nacimiento)?.id ?? null;
    }
  }
  if (!esSigno(signo)) return Response.json({ error: "signo" }, { status: 400 });
  try {
    return Response.json(await mensajeParaSigno(signo, idioma), { headers: { "Cache-Control": "private, max-age=600" } });
  } catch {
    return Response.json({ error: "mensaje" }, { status: 500 });
  }
}
