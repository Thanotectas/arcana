import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";

/**
 * Programa de Embajadores de Arcana (migración 0026). Los valores viven en la
 * base de datos (función registrar_comision_orden y canjes); aquí se repiten
 * para mostrarlos en pantalla. Si se cambian, cambiarlos en los dos lugares.
 */
export const EMBAJADORES = {
  comisionPct: 20,
  mesesVentana: 12,
  diasEspera: 7,
  /** Pesos de saldo por cada crédito al canjear. */
  pesosPorCredito: 1500,
  retiroMinimo: 20000,
} as const;

export const METODOS_PAGO = ["nequi", "daviplata", "banco", "paypal"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export interface ResumenEmbajador {
  esEmbajador: boolean;
  desde: string | null;
  invitados: number;
  invitadosPagaron: number;
  ganadoTotal: number;
  pendiente: number;
  disponible: number;
  canjeado: number;
  retirado: number;
  enProceso: number;
}

export const getResumenEmbajador = cache(async (): Promise<ResumenEmbajador> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("resumen_embajador");
  const f = Array.isArray(data) ? data[0] : undefined;
  return {
    esEmbajador: Boolean(f?.es_embajador),
    desde: f?.desde ?? null,
    invitados: f?.invitados ?? 0,
    invitadosPagaron: f?.invitados_pagaron ?? 0,
    ganadoTotal: f?.ganado_total ?? 0,
    pendiente: f?.pendiente ?? 0,
    disponible: f?.disponible ?? 0,
    canjeado: f?.canjeado ?? 0,
    retirado: f?.retirado ?? 0,
    enProceso: f?.en_proceso ?? 0,
  };
});

export async function getComisionesRecientes() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("comisiones_recientes");
  return data ?? [];
}

export async function getDatosPago() {
  const supabase = await createClient();
  const { data } = await supabase.from("embajadores").select("metodo_pago, datos_pago, titular").maybeSingle();
  return data;
}

export async function getRetirosPropios() {
  const supabase = await createClient();
  const { data } = await supabase.from("retiros_embajador").select("id, tipo, monto_cop, creditos, estado, creado_en").order("creado_en", { ascending: false }).limit(10);
  return data ?? [];
}
