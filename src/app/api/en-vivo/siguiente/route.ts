import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { audioPuente, claveValida, despedida, estadoCierre, latido, siguienteLectura, sincronizarChat } from "@/lib/en-vivo";
import { sincronizarFacebook } from "@/lib/en-vivo-facebook";

// Escribir la lectura y narrarla toma unos segundos.
export const maxDuration = 60;

/**
 * Lo que pide el escenario de «Sibila en vivo» (OBS): ?modo=lectura trae el
 * chat nuevo (YouTube y Facebook) y devuelve la siguiente lectura (o «espera» si no hay consultas);
 * ?modo=puente&i=N devuelve una frase de Sibila entre lecturas. Protegido con
 * la clave del escenario (?clave=), que se ve en /admin/en-vivo. Cada pedido
 * marca el latido del escenario (la página /vivo recibe fotos solo si late).
 * Llegada la hora de cierre devuelve una vez la despedida de Sibila y luego
 * «fin» (sin leer más el chat) hasta que se cambie la hora en el panel.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  if (!claveValida(q.get("clave"))) return NextResponse.json({ error: "clave" }, { status: 401 });
  const admin = getSupabaseAdmin();
  await latido(admin).catch(() => null);
  if (q.get("modo") === "puente") {
    return NextResponse.json({ clase: "puente", ...(await audioPuente(admin, Number(q.get("i") ?? 0) || 0)) }, { headers: { "Cache-Control": "no-store" } });
  }
  const cierre = await estadoCierre(admin).catch(() => "abierto" as const);
  if (cierre === "despedirse") return NextResponse.json({ clase: "despedida", ...(await despedida(admin)) }, { headers: { "Cache-Control": "no-store" } });
  if (cierre === "terminado") return NextResponse.json({ clase: "fin" }, { headers: { "Cache-Control": "no-store" } });
  // El chat de YouTube y los comentarios del directo de Facebook entran a la misma fila.
  const [chat, facebook] = await Promise.all([
    sincronizarChat(admin).catch((e: unknown) => {
      console.error("[en vivo] chat:", e instanceof Error ? e.message : e);
      return null;
    }),
    sincronizarFacebook(admin).catch((e: unknown) => {
      console.error("[en vivo] facebook:", e instanceof Error ? e.message : e);
      return null;
    }),
  ]);
  const lectura = await siguienteLectura(admin);
  return NextResponse.json(lectura ? { clase: "lectura", ...lectura, chat, facebook } : { clase: "espera", chat, facebook }, { headers: { "Cache-Control": "no-store" } });
}
