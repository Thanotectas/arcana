import "server-only";
import { cache } from "react";
import { getSupabaseAdmin } from "../supabase/admin";
import { OFERTA_FUNDADORES } from "../creditos";

export interface EstadoFundadores {
  activa: boolean;
  vendidos: number;
  restantes: number;
  hasta: Date;
}

/**
 * Estado de la oferta de fundadores: vigente mientras no pase la fecha y
 * queden cupos (órdenes del Círculo aprobadas al precio de fundadores).
 */
export const estadoOfertaFundadores = cache(async (): Promise<EstadoFundadores> => {
  const hasta = new Date(OFERTA_FUNDADORES.hasta);
  if (Date.now() > hasta.getTime()) return { activa: false, vendidos: 0, restantes: 0, hasta };
  const { count } = await getSupabaseAdmin()
    .from("ordenes")
    .select("id", { count: "exact", head: true })
    .eq("paquete", "circulo")
    .eq("estado", "aprobada")
    .in("monto_centavos", [OFERTA_FUNDADORES.precioCOP * 100, OFERTA_FUNDADORES.precioUSDCentavos]);
  const vendidos = count ?? 0;
  const restantes = Math.max(0, OFERTA_FUNDADORES.cupo - vendidos);
  return { activa: restantes > 0, vendidos, restantes, hasta };
});
