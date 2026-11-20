import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { audioCierre, audioPuente, claveValida, despedida, enPausa, estadoCierre, latido, lecturaDeRelleno, siguienteLectura, sincronizarChat } from "@/lib/en-vivo";
import { sincronizarAvisoFacebook, sincronizarFacebook } from "@/lib/en-vivo-facebook";
import { ganadorDelJuego, juegoSiToca, terminarJuego } from "@/lib/en-vivo-juego";

// Escribir la lectura y narrarla toma unos segundos.
export const maxDuration = 60;

/**
 * Lo que pide el escenario de «Sibila en vivo» (OBS): ?modo=lectura trae el
 * chat nuevo (YouTube y Facebook) y devuelve la siguiente lectura (o «espera» si no hay consultas);
 * ?modo=puente&i=N devuelve una frase de Sibila entre lecturas; ?modo=relleno
 * hace lo mismo que lectura pero, si nadie espera, lee un segmento «para todos»;
 * ?modo=cierre&i=N devuelve una frase de después de la despedida. Protegido con
 * la clave del escenario (?clave=), que se ve en /admin/en-vivo. Cada pedido
 * marca el latido del escenario (la página /vivo recibe fotos solo si late).
 * Llegada la hora de cierre devuelve una vez la despedida de Sibila y luego
 * «fin» (sin leer más el chat) hasta que se cambie la hora en el panel. Con la pausa del
 * presentador puesta devuelve «pausa» (y ?modo=estado solo dice si hay pausa).
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  if (!claveValida(q.get("clave"))) return NextResponse.json({ error: "clave" }, { status: 401 });
  const admin = getSupabaseAdmin();
  await latido(admin).catch(() => null);
  if (q.get("modo") === "puente") {
    return NextResponse.json({ clase: "puente", ...(await audioPuente(admin, Number(q.get("i") ?? 0) || 0)) }, { headers: { "Cache-Control": "no-store" } });
  }
  if (q.get("modo") === "cierre") {
    return NextResponse.json({ clase: "puente", ...(await audioCierre(admin, Number(q.get("i") ?? 0) || 0)) }, { headers: { "Cache-Control": "no-store" } });
  }
  // «La carta escondida»: mientras Sibila da las pistas, el escenario pregunta si alguien ya la encontró
  // (?modo=juego-estado, que también lee el chat) y al final pide la revelación (?modo=juego-fin).
  if (q.get("modo") === "juego-estado") {
    await sincronizarChat(admin).catch(() => null);
    return NextResponse.json({ clase: "juego-estado", ganador: await ganadorDelJuego(admin).catch(() => null) }, { headers: { "Cache-Control": "no-store" } });
  }
  if (q.get("modo") === "juego-fin") {
    const fin = await terminarJuego(admin).catch(() => null);
    return NextResponse.json(fin ?? { clase: "espera" }, { headers: { "Cache-Control": "no-store" } });
  }
  // Pausa para el presentador: no se toma la siguiente consulta ni se habla (?modo=estado solo pregunta por la pausa).
  const pausa = await enPausa(admin).catch(() => false);
  if (q.get("modo") === "estado" || pausa) return NextResponse.json({ clase: pausa ? "pausa" : "ok" }, { headers: { "Cache-Control": "no-store" } });
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
    // Los comentarios de la publicación que anuncia el directo en la página también entran (cada 20 s).
    sincronizarAvisoFacebook(admin).catch((e: unknown) => {
      console.error("[en vivo] aviso de facebook:", e instanceof Error ? e.message : e);
      return null;
    }),
  ]);
  // El relleno solo corre con un directo al aire (OBS abierto sin transmitir no gasta lecturas).
  const alAire = Boolean(chat?.directo || facebook?.directo);
  // El juego empieza si se pidió desde el panel o, sin nadie en la fila, como relleno (cada 20 minutos como mucho).
  const juego = await juegoSiToca(admin, q.get("modo") === "relleno" && alAire).catch((e: unknown) => {
    console.error("[en vivo] juego:", e instanceof Error ? e.message : e);
    return null;
  });
  if (juego) return NextResponse.json(juego, { headers: { "Cache-Control": "no-store" } });
  const lectura = q.get("modo") === "relleno" && alAire ? await lecturaDeRelleno(admin) : await siguienteLectura(admin);
  return NextResponse.json(lectura ? { clase: "lectura", ...lectura, chat, facebook } : { clase: "espera", chat, facebook }, { headers: { "Cache-Control": "no-store" } });
}
