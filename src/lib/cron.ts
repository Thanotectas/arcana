import "server-only";
import { timingSafeEqual } from "crypto";

/**
 * Utilidades de los cron. El plan Hobby de Vercel admite dos cron jobs por
 * proyecto y solo diarios, así que vercel.json registra dos orquestadores
 * (/api/cron/manana y /api/cron/tarde) que llaman en paralelo a las rutas de
 * siempre. Cada ruta conserva su propio límite de tiempo y puede ejecutarse
 * a mano con el mismo secreto.
 */
export function cronAutorizado(request: Request): Response | null {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return Response.json({ error: "sin_cron_secret" }, { status: 503 });
  const recibido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) return Response.json({ error: "no_autorizado" }, { status: 401 });
  return null;
}

export interface ResultadoRuta {
  ruta: string;
  estado: number;
  cuerpo: unknown;
}

function origen(request: Request) {
  const sitio = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (sitio) return sitio;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/** Llama a varias rutas de cron del propio sitio, en paralelo, con el secreto. */
export async function ejecutarRutas(request: Request, rutas: string[]): Promise<ResultadoRuta[]> {
  const base = origen(request);
  const cabeceras = { Authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` };
  return Promise.all(
    rutas.map(async (ruta): Promise<ResultadoRuta> => {
      try {
        const res = await fetch(`${base}${ruta}`, { headers: cabeceras, cache: "no-store", signal: AbortSignal.timeout(290_000) });
        const cuerpo: unknown = await res.json().catch(() => null);
        return { ruta, estado: res.status, cuerpo };
      } catch (e) {
        return { ruta, estado: 0, cuerpo: { error: e instanceof Error ? e.message : String(e) } };
      }
    }),
  );
}

export function respuestaOrquestador(resultados: ResultadoRuta[]) {
  const fallo = resultados.some((r) => r.estado < 200 || r.estado >= 300);
  return Response.json({ resultados }, { status: fallo ? 502 : 200 });
}
