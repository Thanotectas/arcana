import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { MAX_INTENTOS, fechaBogota } from "@/lib/juego/carta-escondida";

/**
 * Cómo le fue a todos hoy (solo cuentas, sin datos de nadie): cuántos jugaron, cuántos la encontraron y en qué intento.
 * Se guarda un minuto en la caché de Vercel.
 */
export async function GET() {
  const hoy = fechaBogota();
  const { data, error } = await getSupabaseAdmin().from("juego_partidas").select("gano, intentos").eq("fecha", hoy).limit(20_000);
  if (error) return Response.json({ error: "consulta" }, { status: 500 });
  const filas = data ?? [];
  const distribucion = Array.from({ length: MAX_INTENTOS }, () => 0);
  for (const f of filas) if (f.gano) distribucion[Math.min(MAX_INTENTOS, f.intentos.length) - 1]++;
  const ganadas = distribucion.reduce((s, n) => s + n, 0);
  return Response.json(
    { fecha: hoy, jugadores: filas.length, ganadas, distribucion },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}
