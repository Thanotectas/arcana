import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { sumarDias } from "@/lib/redes/calendario";
import {
  type ActividadEmbudo, type Agrupacion, type CuentaEmbudo, type FilaEmbudo, type OrdenEmbudo, type VisitaEmbudo, calcularEmbudo, diaBogota,
} from "./calculo";

type Admin = SupabaseClient<Database>;

export interface ResultadoEmbudo {
  dias: number;
  por: Agrupacion;
  desde: string; // AAAA-MM-DD (incluido)
  total: FilaEmbudo;
  filas: FilaEmbudo[];
  /** Primer día con visitas registradas (null si aún no hay ninguna). */
  primeraVisita: string | null;
  /** Falta aplicar la migración 0050 (no hay tabla de visitas ni país en los perfiles). */
  sinMigracion: boolean;
  /** Cuentas del periodo sin país (creadas antes de la 0050). */
  sinPais: number;
}

const PAGINA = 1000; // tope de filas por consulta en Supabase
const LOTE_IDS = 150; // ids por consulta con .in(), para no pasar el largo de la URL

async function todas<T>(consulta: (desde: number, hasta: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>, nombre: string): Promise<T[]> {
  const filas: T[] = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await consulta(desde, desde + PAGINA - 1);
    if (error) throw new Error(`${nombre}: ${error.message}`);
    filas.push(...(data ?? []));
    if (!data || data.length < PAGINA) return filas;
  }
}

async function porLotes<T>(ids: string[], consulta: (lote: string[]) => Promise<T[]>): Promise<T[]> {
  const resultado: T[] = [];
  for (let i = 0; i < ids.length; i += LOTE_IDS) resultado.push(...(await consulta(ids.slice(i, i + LOTE_IDS))));
  return resultado;
}

export async function calcularEmbudoAdmin(admin: Admin, dias: number, por: Agrupacion, hoy = fechaBogota()): Promise<ResultadoEmbudo> {
  const desde = sumarDias(hoy, -(dias - 1));
  const desdeIso = `${desde}T05:00:00.000Z`; // medianoche de Bogotá

  // Cuentas del periodo. Sin la 0050 no hay columna país: se reintenta sin ella.
  let sinMigracion = false;
  type Perfil = { id: string; creado_en: string; origen: string | null; pais?: string | null; ilimitado: boolean };
  let perfiles: Perfil[];
  try {
    perfiles = await todas<Perfil>((a, b) => admin.from("perfiles").select("id, creado_en, origen, pais, ilimitado").gte("creado_en", desdeIso).order("creado_en").range(a, b), "perfiles");
  } catch {
    sinMigracion = true;
    perfiles = await todas<Perfil>((a, b) => admin.from("perfiles").select("id, creado_en, origen, ilimitado").gte("creado_en", desdeIso).order("creado_en").range(a, b), "perfiles");
  }
  const cuentas: CuentaEmbudo[] = perfiles.filter((p) => !p.ilimitado).map((p) => ({ id: p.id, creado_en: p.creado_en, origen: p.origen, pais: p.pais ?? null }));
  const ids = cuentas.map((c) => c.id);

  // Lo que hicieron después (en cualquier momento hasta hoy).
  const lecturas = await porLotes(ids, (lote) =>
    todas<{ usuario_id: string; creado_en: string }>((a, b) => admin.from("lecturas").select("usuario_id, creado_en").eq("estado", "lista").in("usuario_id", lote).order("creado_en").range(a, b), "lecturas"));
  const cartas = await porLotes(ids, (lote) =>
    todas<{ usuario_id: string; fecha: string }>((a, b) => admin.from("cartas_dia").select("usuario_id, fecha").in("usuario_id", lote).order("fecha").range(a, b), "cartas del día"));
  const actividad: ActividadEmbudo[] = [
    ...lecturas.map((l) => ({ usuario_id: l.usuario_id, dia: diaBogota(l.creado_en) })),
    ...cartas.map((c) => ({ usuario_id: c.usuario_id, dia: c.fecha })),
  ];
  const ordenes = await porLotes(ids, (lote) =>
    todas<OrdenEmbudo>((a, b) => admin.from("ordenes").select("usuario_id, estado, paquete, moneda, monto_centavos").eq("es_prueba", false).in("usuario_id", lote).order("creado_en").range(a, b), "órdenes"));

  // Visitas nuevas del periodo (tabla de la 0050).
  let visitas: VisitaEmbudo[] = [];
  let primeraVisita: string | null = null;
  if (!sinMigracion) {
    try {
      visitas = await todas<VisitaEmbudo>((a, b) => admin.from("visitas").select("origen, pais").gte("fecha", desde).order("id").range(a, b), "visitas");
      const { data } = await admin.from("visitas").select("fecha").order("fecha").limit(1);
      primeraVisita = data?.[0]?.fecha ?? null;
    } catch {
      sinMigracion = true;
    }
  }

  const { total, filas } = calcularEmbudo({ cuentas, actividad, ordenes, visitas, por });
  return { dias, por, desde, total, filas, primeraVisita, sinMigracion, sinPais: cuentas.filter((c) => !c.pais).length };
}
