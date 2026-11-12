import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aplicarInvitacionPendiente } from "@/lib/invitaciones";
import { registrarOrigenPendiente } from "@/lib/origen";
import { rutaInterna } from "@/lib/seguridad";

/** Intercambia el código de confirmación/recuperación por una sesión. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const destino = rutaInterna(searchParams.get("siguiente"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await aplicarInvitacionPendiente();
      // Cuenta nueva (correo confirmado o Google): queda por dónde llegó.
      if (data.user) await registrarOrigenPendiente(data.user.id);
      const url = new URL(destino, origin);
      // Cuenta recién creada: /inicio manda el evento de registro del píxel (si la persona lo aceptó).
      if (data.user?.created_at && Date.now() - Date.parse(data.user.created_at) < 30 * 60_000 && url.pathname === "/inicio") url.searchParams.set("nueva", "1");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.redirect(`${origin}/entrar?error=enlace`);
}
