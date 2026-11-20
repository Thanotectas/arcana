import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { MAX_INTENTOS, RACHA_PREMIO, cartaDelJuego, cartaPorId, diaAnterior, fechaBogota, numeroDeJuego } from "./carta-escondida";

/** Motivo en el libro de créditos para el regalo de la racha. */
export const MOTIVO_RACHA = "regalo:juego";

export interface ProgresoCuenta {
  racha: number;
  mejorRacha: number;
  jugadas: number;
  ganadas: number;
  /** Ids de las cartas descubiertas (ganadas). */
  album: string[];
  /** Intentos de hoy, si ya jugó. */
  hoy: string[] | null;
  /** Créditos ganados con el juego. */
  creditosGanados: number;
}

/** Días seguidos jugados que terminan en `hasta` (0 si ese día no jugó). */
function rachaHasta(fechas: ReadonlySet<string>, hasta: string) {
  let n = 0;
  for (let d = hasta; fechas.has(d); d = diaAnterior(d)) n++;
  return n;
}

function mejorRacha(fechasOrdenadas: string[]) {
  let mejor = 0;
  let actual = 0;
  let anterior: string | null = null;
  for (const f of fechasOrdenadas) {
    actual = anterior && diaAnterior(f) === anterior ? actual + 1 : 1;
    mejor = Math.max(mejor, actual);
    anterior = f;
  }
  return mejor;
}

export async function progresoDeCuenta(usuarioId: string): Promise<ProgresoCuenta> {
  const admin = getSupabaseAdmin();
  const hoy = fechaBogota();
  const [{ data }, { data: premios }] = await Promise.all([
    admin.from("juego_partidas").select("fecha, carta, intentos, gano").eq("usuario_id", usuarioId).order("fecha", { ascending: true }).limit(2000),
    admin.from("movimientos_creditos").select("cantidad").eq("usuario_id", usuarioId).eq("motivo", MOTIVO_RACHA),
  ]);
  const filas = data ?? [];
  const fechas = new Set(filas.map((f) => f.fecha));
  const racha = rachaHasta(fechas, fechas.has(hoy) ? hoy : diaAnterior(hoy));
  return {
    racha,
    mejorRacha: mejorRacha(filas.map((f) => f.fecha)),
    jugadas: filas.length,
    ganadas: filas.filter((f) => f.gano).length,
    album: [...new Set(filas.filter((f) => f.gano).map((f) => f.carta))],
    hoy: filas.find((f) => f.fecha === hoy)?.intentos ?? null,
    creditosGanados: (premios ?? []).reduce((s, p) => s + p.cantidad, 0),
  };
}

export type ResultadoRegistro =
  | { ok: true; racha: number; premio: boolean; progreso: ProgresoCuenta }
  | { ok: false; error: "fecha" | "intentos" | "guardar" };

/**
 * Guarda la partida de hoy después de comprobarla (la carta se recalcula aquí, no se cree al navegador) y,
 * si con ella la racha llega a 7, 14, 21…, regala 1 crédito una sola vez.
 * Solo se acepta la partida del día: la racha no se puede rellenar hacia atrás.
 */
export async function registrarPartida(usuarioId: string, fecha: string, intentos: unknown): Promise<ResultadoRegistro> {
  const hoy = fechaBogota();
  if (fecha !== hoy) return { ok: false, error: "fecha" };
  if (!Array.isArray(intentos) || intentos.length < 1 || intentos.length > MAX_INTENTOS) return { ok: false, error: "intentos" };
  const ids = intentos.map(String);
  if (new Set(ids).size !== ids.length || ids.some((id) => !cartaPorId(id))) return { ok: false, error: "intentos" };
  const numero = numeroDeJuego(hoy);
  const escondida = cartaDelJuego(numero);
  const acierto = ids.indexOf(escondida.id);
  const gano = acierto >= 0;
  // La partida tiene que estar terminada: o acertó en el último intento, o gastó los seis.
  if (gano ? acierto !== ids.length - 1 : ids.length !== MAX_INTENTOS) return { ok: false, error: "intentos" };

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("juego_partidas")
    .upsert({ usuario_id: usuarioId, fecha: hoy, numero, carta: escondida.id, intentos: ids, gano }, { onConflict: "usuario_id,fecha", ignoreDuplicates: true });
  if (error) {
    console.error("[juego] no se guardó la partida", error.message);
    return { ok: false, error: "guardar" };
  }

  let progreso = await progresoDeCuenta(usuarioId);
  let premio = false;
  if (progreso.racha > 0 && progreso.racha % RACHA_PREMIO === 0) {
    // Se marca primero (solo pasa una vez) y luego se suma el crédito; si la suma falla, se desmarca.
    const { data: marcada } = await admin
      .from("juego_partidas")
      .update({ premiada: true })
      .eq("usuario_id", usuarioId)
      .eq("fecha", hoy)
      .eq("premiada", false)
      .select("fecha")
      .maybeSingle();
    if (marcada) {
      const { error: errorCredito } = await admin.rpc("devolver_creditos", { p_usuario: usuarioId, p_cantidad: 1, p_motivo: MOTIVO_RACHA, p_referencia: `racha:${hoy}` });
      if (errorCredito) {
        console.error("[juego] no se sumó el crédito de la racha", errorCredito.message);
        await admin.from("juego_partidas").update({ premiada: false }).eq("usuario_id", usuarioId).eq("fecha", hoy);
      } else {
        premio = true;
        progreso = { ...progreso, creditosGanados: progreso.creditosGanados + 1 };
      }
    }
  }
  return { ok: true, racha: progreso.racha, premio, progreso };
}
