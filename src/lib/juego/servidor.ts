import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  MAX_INTENTOS,
  MAX_INTENTOS_MAESTRO,
  PUNTOS_MAESTRO,
  RACHA_PREMIO,
  cartaDelJuego,
  cartaMaestra,
  cartaPorId,
  diaAnterior,
  esComodin,
  fechaBogota,
  inicioSemana,
  numeroDeJuego,
  premiosCompletados,
  puntosDePartida,
  sumarDias,
} from "./carta-escondida";

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
  /** Retos maestros superados. */
  maestros: number;
  /** Intentos del reto maestro de hoy, si lo jugó. */
  maestroHoy: string[] | null;
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
  const [{ data }, { data: premios }, { data: maestro }] = await Promise.all([
    admin.from("juego_partidas").select("fecha, carta, intentos, gano").eq("usuario_id", usuarioId).order("fecha", { ascending: true }).limit(2000),
    admin.from("movimientos_creditos").select("cantidad").eq("usuario_id", usuarioId).eq("motivo", MOTIVO_RACHA),
    // Si la tabla del reto maestro todavía no existe (migración 0056 sin aplicar), queda en null y no pasa nada.
    admin.from("juego_maestro").select("fecha, intentos, gano").eq("usuario_id", usuarioId).limit(2000),
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
    maestros: (maestro ?? []).filter((m) => m.gano).length,
    maestroHoy: (maestro ?? []).find((m) => m.fecha === hoy)?.intentos ?? null,
  };
}

export interface PremioNuevo {
  id: string;
  nombre: string;
  creditos: number;
}

/**
 * Paga los premios del álbum que se acaban de completar (un palo, El Camino del Loco, todo el tarot).
 * La fila en juego_premios va primero (su llave impide pagar dos veces); si el crédito no entra, se borra.
 */
async function pagarPremiosAlbum(usuarioId: string, album: string[]): Promise<PremioNuevo[]> {
  const completos = premiosCompletados(new Set(album));
  if (!completos.length) return [];
  const admin = getSupabaseAdmin();
  const { data: ya, error } = await admin.from("juego_premios").select("premio").eq("usuario_id", usuarioId);
  if (error) return [];
  const cobrados = new Set((ya ?? []).map((p) => p.premio));
  const nuevos: PremioNuevo[] = [];
  for (const p of completos.filter((x) => !cobrados.has(x.id))) {
    const { data: fila } = await admin
      .from("juego_premios")
      .upsert({ usuario_id: usuarioId, premio: p.id, creditos: p.creditos }, { onConflict: "usuario_id,premio", ignoreDuplicates: true })
      .select("premio")
      .maybeSingle();
    if (!fila) continue;
    const { error: e } = await admin.rpc("devolver_creditos", { p_usuario: usuarioId, p_cantidad: p.creditos, p_motivo: MOTIVO_RACHA, p_referencia: `album:${p.id}` });
    if (e) {
      console.error("[juego] no se pagó el premio del álbum", p.id, e.message);
      await admin.from("juego_premios").delete().eq("usuario_id", usuarioId).eq("premio", p.id);
    } else nuevos.push({ id: p.id, nombre: p.nombre, creditos: p.creditos });
  }
  return nuevos;
}

export type ResultadoRegistro =
  | { ok: true; racha: number; premio: boolean; premiosAlbum: PremioNuevo[]; progreso: ProgresoCuenta }
  | { ok: false; error: "fecha" | "intentos" | "guardar" };

/**
 * Guarda la partida de hoy después de comprobarla (la carta se recalcula aquí, no se cree al navegador) y,
 * si con ella la racha llega a 7, 14, 21…, regala 1 crédito una sola vez.
 * Solo se acepta la partida del día: la racha no se puede rellenar hacia atrás.
 */
export async function registrarPartida(usuarioId: string, fecha: string, intentos: unknown, comodin?: unknown): Promise<ResultadoRegistro> {
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
  // El comodín va aparte: si la columna aún no existe, la partida queda guardada igual.
  if (esComodin(comodin)) {
    await admin.from("juego_partidas").update({ comodin }).eq("usuario_id", usuarioId).eq("fecha", hoy).is("comodin", null);
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
  const premiosAlbum = gano ? await pagarPremiosAlbum(usuarioId, progreso.album) : [];
  if (premiosAlbum.length) progreso = { ...progreso, creditosGanados: progreso.creditosGanados + premiosAlbum.reduce((s, p) => s + p.creditos, 0) };
  return { ok: true, racha: progreso.racha, premio, premiosAlbum, progreso };
}

/** Guarda el reto maestro de hoy: solo si encontró la carta del día y la partida maestra está completa. */
export async function registrarMaestro(usuarioId: string, fecha: string, intentos: unknown): Promise<{ ok: true; gano: boolean } | { ok: false; error: string }> {
  const hoy = fechaBogota();
  if (fecha !== hoy) return { ok: false, error: "fecha" };
  if (!Array.isArray(intentos) || intentos.length < 1 || intentos.length > MAX_INTENTOS_MAESTRO) return { ok: false, error: "intentos" };
  const ids = intentos.map(String);
  if (new Set(ids).size !== ids.length || ids.some((id) => !cartaPorId(id))) return { ok: false, error: "intentos" };
  const escondida = cartaMaestra(numeroDeJuego(hoy));
  const acierto = ids.indexOf(escondida.id);
  const gano = acierto >= 0;
  if (gano ? acierto !== ids.length - 1 : ids.length !== MAX_INTENTOS_MAESTRO) return { ok: false, error: "intentos" };
  const admin = getSupabaseAdmin();
  const { data: delDia } = await admin.from("juego_partidas").select("gano").eq("usuario_id", usuarioId).eq("fecha", hoy).maybeSingle();
  if (!delDia?.gano) return { ok: false, error: "bloqueado" };
  const { error } = await admin
    .from("juego_maestro")
    .upsert({ usuario_id: usuarioId, fecha: hoy, carta: escondida.id, intentos: ids, gano }, { onConflict: "usuario_id,fecha", ignoreDuplicates: true });
  if (error) {
    console.error("[juego] no se guardó el reto maestro", error.message);
    return { ok: false, error: "guardar" };
  }
  return { ok: true, gano };
}

// ───────────────────────── Ranking semanal ─────────────────────────

export interface FilaRanking {
  puesto: number;
  apodo: string;
  puntos: number;
  dias: number;
  yo: boolean;
}

export interface Ranking {
  desde: string;
  hasta: string;
  top: FilaRanking[];
  /** Tu fila (aunque no estés en el top). Sin apodo, «apodo» viene vacío y el puesto es el que tendrías. */
  yo: FilaRanking | null;
  apodo: string | null;
  campeon: { apodo: string; puntos: number } | null;
}

async function puntosDeSemana(desde: string, hasta: string) {
  const admin = getSupabaseAdmin();
  type Fila = { usuario_id: string; intentos: string[]; gano: boolean; comodin: string | null };
  const conComodin = await admin.from("juego_partidas").select("usuario_id, intentos, gano, comodin").gte("fecha", desde).lte("fecha", hasta).limit(50_000);
  let filas: Fila[] = conComodin.data ?? [];
  if (conComodin.error) {
    // Sin la columna «comodin» (migración 0056 pendiente) se cuenta igual, sin descuento.
    const sinComodin = await admin.from("juego_partidas").select("usuario_id, intentos, gano").gte("fecha", desde).lte("fecha", hasta).limit(50_000);
    filas = (sinComodin.data ?? []).map((f) => ({ ...f, comodin: null }));
  }
  const { data: maestros } = await admin.from("juego_maestro").select("usuario_id, gano").gte("fecha", desde).lte("fecha", hasta).eq("gano", true).limit(50_000);
  const puntos = new Map<string, { puntos: number; dias: number }>();
  for (const f of filas) {
    const x = puntos.get(f.usuario_id) ?? { puntos: 0, dias: 0 };
    x.puntos += puntosDePartida(f.gano, f.intentos.length, Boolean(f.comodin));
    x.dias += 1;
    puntos.set(f.usuario_id, x);
  }
  for (const m of maestros ?? []) {
    const x = puntos.get(m.usuario_id);
    if (x) x.puntos += PUNTOS_MAESTRO;
  }
  return puntos;
}

function ordenar(puntos: Map<string, { puntos: number; dias: number }>) {
  return [...puntos.entries()].sort((a, b) => b[1].puntos - a[1].puntos || b[1].dias - a[1].dias);
}

/** La tabla de la semana (lunes a domingo, hora de Bogotá). Solo aparece quien eligió apodo. */
export async function rankingSemanal(usuarioId: string | null): Promise<Ranking> {
  const hoy = fechaBogota();
  const desde = inicioSemana(hoy);
  const hasta = sumarDias(desde, 6);
  const admin = getSupabaseAdmin();
  const [puntos, anteriores, { data: jugadores }] = await Promise.all([
    puntosDeSemana(desde, hoy),
    puntosDeSemana(sumarDias(desde, -7), sumarDias(desde, -1)),
    admin.from("juego_jugadores").select("usuario_id, apodo").limit(50_000),
  ]);
  const apodos = new Map((jugadores ?? []).map((j) => [j.usuario_id, j.apodo]));
  const conApodo = ordenar(puntos).filter(([id]) => apodos.has(id));
  const tabla: FilaRanking[] = conApodo.map(([id, x], i) => ({ puesto: i + 1, apodo: apodos.get(id) ?? "", puntos: x.puntos, dias: x.dias, yo: id === usuarioId }));
  let yo: FilaRanking | null = tabla.find((f) => f.yo) ?? null;
  const mio = usuarioId ? puntos.get(usuarioId) : undefined;
  if (!yo && usuarioId && mio) {
    // Sin apodo: el puesto que tendría si apareciera.
    const puesto = conApodo.filter(([, x]) => x.puntos > mio.puntos || (x.puntos === mio.puntos && x.dias > mio.dias)).length + 1;
    yo = { puesto, apodo: "", puntos: mio.puntos, dias: mio.dias, yo: true };
  }
  const [primero] = ordenar(anteriores).filter(([id]) => apodos.has(id));
  return {
    desde,
    hasta,
    top: tabla.slice(0, 10),
    yo,
    apodo: usuarioId ? (apodos.get(usuarioId) ?? null) : null,
    campeon: primero ? { apodo: apodos.get(primero[0]) ?? "", puntos: primero[1].puntos } : null,
  };
}

const PALABRAS_VETADAS = ["puta", "puto", "mierda", "verga", "pene", "sexo", "marica", "gonorrea", "malparid", "hijueputa", "hp", "culo", "idiota", "estupid", "nazi", "admin", "arcana", "sibila", "soporte"];

export type ResultadoApodo = { ok: true; apodo: string } | { ok: false; error: "formato" | "vetado" | "ocupado" | "guardar" };

/** Guarda o cambia el apodo del ranking (3 a 20 letras, números, espacios, punto, guion). */
export async function guardarApodo(usuarioId: string, crudo: unknown): Promise<ResultadoApodo> {
  const apodo = String(crudo ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
  if (apodo.length < 3 || apodo.length > 20 || !/^[\p{L}\p{N} ._-]+$/u.test(apodo)) return { ok: false, error: "formato" };
  const plano = apodo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (PALABRAS_VETADAS.some((p) => plano.includes(p)) || plano === "") return { ok: false, error: "vetado" };
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("juego_jugadores").upsert({ usuario_id: usuarioId, apodo, actualizado_en: new Date().toISOString() }, { onConflict: "usuario_id" });
  if (error) return { ok: false, error: error.code === "23505" ? "ocupado" : "guardar" };
  return { ok: true, apodo };
}
