import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/redes/reel";
import { cartaPorId, mensajeDelDia } from "@/lib/juego/carta-escondida";
import { paraLeer, sintetizar, vozConfigurada } from "@/lib/redes/voz";

export const maxDuration = 30;

/**
 * La voz de Sibila diciendo el mensaje de una carta (El Camino del Loco). Se genera una sola vez por carta (78 en
 * total) y queda guardada; después se sirve desde el almacenamiento público.
 */
export async function GET(request: NextRequest) {
  const carta = cartaPorId(request.nextUrl.searchParams.get("carta") ?? "");
  if (!carta) return new Response("Carta no válida", { status: 400 });
  const admin = getSupabaseAdmin();
  const ruta = `juego/voz/${carta.id}.mp3`;
  const publica = admin.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
  const existe = await admin.storage.from(BUCKET).list("juego/voz", { search: `${carta.id}.mp3`, limit: 1 }).catch(() => null);
  if (existe?.data?.some((f) => f.name === `${carta.id}.mp3`)) return Response.redirect(publica, 302);
  if (!vozConfigurada()) return new Response("Sin voz", { status: 503 });
  try {
    const texto = `Tu carta es ${carta.nombre}. ${mensajeDelDia(carta)} Y en el amor: ${carta.amor}`;
    const audio = await sintetizar(paraLeer(texto));
    await admin.storage.from(BUCKET).upload(ruta, audio, { contentType: "audio/mpeg", upsert: true, cacheControl: "31536000" });
    return new Response(new Uint8Array(audio), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
  } catch (e) {
    console.error("[juego voz]", e instanceof Error ? e.message : e);
    return new Response("No se pudo generar la voz", { status: 502 });
  }
}
