import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aplicarInvitacionPendiente } from "@/lib/invitaciones";
import { rutaInterna } from "@/lib/seguridad";

/** Intercambia el código de confirmación/recuperación por una sesión. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const destino = rutaInterna(searchParams.get("siguiente"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await aplicarInvitacionPendiente();
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }
  return NextResponse.redirect(`${origin}/entrar?error=enlace`);
}
