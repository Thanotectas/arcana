import "server-only";
import { randomInt } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fechaBogota, inicioSemana, sumarDias } from "./carta-escondida";
import { PALABRAS_VETADAS, puntosDeSemana } from "./servidor";

/**
 * Ligas de amigos de «El Camino del Loco»: una liga privada con un código de 6 letras para invitar y su propio
 * ranking de la semana. Para entrar hace falta cuenta y apodo (en la tabla solo se ve el apodo).
 */
export const MAX_LIGAS_POR_PERSONA = 10;
export const MAX_MIEMBROS = 200;
const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I, que se confunden al dictarlo

export function normalizarCodigoLiga(texto: unknown) {
  return String(texto ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

export interface LigaResumen {
  codigo: string;
  nombre: string;
  miembros: number;
  creador: boolean;
}

export interface FilaLiga {
  puesto: number;
  apodo: string;
  puntos: number;
  dias: number;
  yo: boolean;
}

export type ErrorLiga = "sin_apodo" | "nombre" | "limite" | "no_existe" | "llena" | "guardar";

async function apodoDe(usuarioId: string) {
  const { data } = await getSupabaseAdmin().from("juego_jugadores").select("apodo").eq("usuario_id", usuarioId).maybeSingle();
  return data?.apodo ?? null;
}

export async function misLigas(usuarioId: string): Promise<LigaResumen[]> {
  const admin = getSupabaseAdmin();
  const { data: mias } = await admin.from("juego_liga_miembros").select("liga_id").eq("usuario_id", usuarioId).limit(MAX_LIGAS_POR_PERSONA * 3);
  const ids = (mias ?? []).map((m) => m.liga_id);
  if (!ids.length) return [];
  const [{ data: ligas }, { data: miembros }] = await Promise.all([
    admin.from("juego_ligas").select("id, codigo, nombre, creador").in("id", ids),
    admin.from("juego_liga_miembros").select("liga_id").in("liga_id", ids).limit(10_000),
  ]);
  return (ligas ?? []).map((l) => ({ codigo: l.codigo, nombre: l.nombre, miembros: (miembros ?? []).filter((m) => m.liga_id === l.id).length, creador: l.creador === usuarioId }));
}

export async function crearLiga(usuarioId: string, crudo: unknown): Promise<{ ok: true; codigo: string } | { ok: false; error: ErrorLiga }> {
  const nombre = String(crudo ?? "").replace(/\s+/g, " ").trim();
  if (nombre.length < 3 || nombre.length > 40) return { ok: false, error: "nombre" };
  const plano = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (PALABRAS_VETADAS.some((p) => p !== "arcana" && p !== "sibila" && plano.includes(p))) return { ok: false, error: "nombre" };
  if (!(await apodoDe(usuarioId))) return { ok: false, error: "sin_apodo" };
  const admin = getSupabaseAdmin();
  const { count } = await admin.from("juego_liga_miembros").select("liga_id", { count: "exact", head: true }).eq("usuario_id", usuarioId);
  if ((count ?? 0) >= MAX_LIGAS_POR_PERSONA) return { ok: false, error: "limite" };
  for (let intento = 0; intento < 5; intento++) {
    const codigo = Array.from({ length: 6 }, () => LETRAS[randomInt(LETRAS.length)]).join("");
    const { data: liga, error } = await admin.from("juego_ligas").insert({ codigo, nombre, creador: usuarioId }).select("id").maybeSingle();
    if (error?.code === "23505") continue;
    if (error || !liga) return { ok: false, error: "guardar" };
    await admin.from("juego_liga_miembros").insert({ liga_id: liga.id, usuario_id: usuarioId });
    return { ok: true, codigo };
  }
  return { ok: false, error: "guardar" };
}

export async function unirseALiga(usuarioId: string, crudo: unknown): Promise<{ ok: true; codigo: string } | { ok: false; error: ErrorLiga }> {
  const codigo = normalizarCodigoLiga(crudo);
  const admin = getSupabaseAdmin();
  const { data: liga } = await admin.from("juego_ligas").select("id").eq("codigo", codigo).maybeSingle();
  if (!liga) return { ok: false, error: "no_existe" };
  if (!(await apodoDe(usuarioId))) return { ok: false, error: "sin_apodo" };
  const [{ count: mias }, { count: miembros }] = await Promise.all([
    admin.from("juego_liga_miembros").select("liga_id", { count: "exact", head: true }).eq("usuario_id", usuarioId),
    admin.from("juego_liga_miembros").select("usuario_id", { count: "exact", head: true }).eq("liga_id", liga.id),
  ]);
  if ((mias ?? 0) >= MAX_LIGAS_POR_PERSONA) return { ok: false, error: "limite" };
  if ((miembros ?? 0) >= MAX_MIEMBROS) return { ok: false, error: "llena" };
  const { error } = await admin.from("juego_liga_miembros").upsert({ liga_id: liga.id, usuario_id: usuarioId }, { onConflict: "liga_id,usuario_id", ignoreDuplicates: true });
  return error ? { ok: false, error: "guardar" } : { ok: true, codigo };
}

export async function salirDeLiga(usuarioId: string, crudo: unknown) {
  const admin = getSupabaseAdmin();
  const { data: liga } = await admin.from("juego_ligas").select("id, creador").eq("codigo", normalizarCodigoLiga(crudo)).maybeSingle();
  if (!liga) return;
  await admin.from("juego_liga_miembros").delete().eq("liga_id", liga.id).eq("usuario_id", usuarioId);
  // Si se va la última persona, la liga se borra.
  const { count } = await admin.from("juego_liga_miembros").select("usuario_id", { count: "exact", head: true }).eq("liga_id", liga.id);
  if (!count) await admin.from("juego_ligas").delete().eq("id", liga.id);
}

export interface DatosLiga {
  codigo: string;
  nombre: string;
  miembros: number;
  soyMiembro: boolean;
  desde: string;
  hasta: string;
  tabla: FilaLiga[];
}

/** La liga con su tabla de la semana (todas las personas de la liga, aunque aún no tengan puntos). */
export async function datosLiga(crudo: unknown, usuarioId: string | null): Promise<DatosLiga | null> {
  const codigo = normalizarCodigoLiga(crudo);
  if (codigo.length !== 6) return null;
  const admin = getSupabaseAdmin();
  const { data: liga } = await admin.from("juego_ligas").select("id, codigo, nombre").eq("codigo", codigo).maybeSingle();
  if (!liga) return null;
  const hoy = fechaBogota();
  const desde = inicioSemana(hoy);
  const { data: miembros } = await admin.from("juego_liga_miembros").select("usuario_id").eq("liga_id", liga.id).limit(MAX_MIEMBROS);
  const ids = (miembros ?? []).map((m) => m.usuario_id);
  const [puntos, { data: apodos }] = await Promise.all([puntosDeSemana(desde, hoy), ids.length ? admin.from("juego_jugadores").select("usuario_id, apodo").in("usuario_id", ids) : Promise.resolve({ data: [] })]);
  const apodo = new Map((apodos ?? []).map((a) => [a.usuario_id, a.apodo]));
  const filas = ids
    .map((id) => ({ id, apodo: apodo.get(id) ?? "Jugador", puntos: puntos.get(id)?.puntos ?? 0, dias: puntos.get(id)?.dias ?? 0 }))
    .sort((a, b) => b.puntos - a.puntos || b.dias - a.dias || a.apodo.localeCompare(b.apodo));
  return {
    codigo: liga.codigo,
    nombre: liga.nombre,
    miembros: ids.length,
    soyMiembro: Boolean(usuarioId && ids.includes(usuarioId)),
    desde,
    hasta: sumarDias(desde, 6),
    tabla: filas.map((f, i) => ({ puesto: i + 1, apodo: f.apodo, puntos: f.puntos, dias: f.dias, yo: f.id === usuarioId })),
  };
}
