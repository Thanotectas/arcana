import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { audioPuente, claveValida, latido, siguienteLectura, sincronizarChat } from "@/lib/en-vivo";

// Escribir la lectura y narrarla toma unos segundos.
export const maxDuration = 60;

/**
 * Lo que pide el escenario de «Sibila en vivo» (OBS): ?modo=lectura trae el
 * chat nuevo y devuelve la siguiente lectura (o «espera» si no hay consultas);
 * ?modo=puente&i=N devuelve una frase de Sibila entre lecturas. Protegido con
 * la clave del escenario (?clave=), que se ve en /admin/en-vivo. Cada pedido
 * marca el latido del escenario (la página /vivo recibe fotos solo si late).
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  if (!claveValida(q.get("clave"))) return NextResponse.json({ error: "clave" }, { status: 401 });
  const admin = getSupabaseAdmin();
  await latido(admin).catch(() => null);
  if (q.get("modo") === "puente") {
    return NextResponse.json({ clase: "puente", ...(await audioPuente(Number(q.get("i") ?? 0) || 0)) }, { headers: { "Cache-Control": "no-store" } });
  }
  let chat: Awaited<ReturnType<typeof sincronizarChat>> | null = null;
  try {
    chat = await sincronizarChat(admin);
  } catch (e) {
    console.error("[en vivo] chat:", e instanceof Error ? e.message : e);
  }
  const lectura = await siguienteLectura(admin);
  return NextResponse.json(lectura ? { clase: "lectura", ...lectura, chat } : { clase: "espera", chat }, { headers: { "Cache-Control": "no-store" } });
}
