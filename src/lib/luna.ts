/**
 * Fase lunar aproximada (sin efemérides): error menor a un día, suficiente
 * para un indicador en el panel. Puede usarse en el navegador.
 */
const SINODICO = 29.530588853;
const LUNA_NUEVA_REF = Date.UTC(2000, 0, 6, 18, 14); // 6 ene 2000 18:14 UTC

export interface FaseLunar {
  /** 0 = nueva, 0.5 = llena, hacia 1 vuelve a nueva. */
  fraccion: number;
  /** Índice 0-7 sobre las ocho fases clásicas. */
  indice: number;
  /** Porcentaje iluminado 0-100. */
  iluminacion: number;
}

export function faseLunar(fecha = new Date()): FaseLunar {
  const dias = (fecha.getTime() - LUNA_NUEVA_REF) / 86400000;
  const fraccion = ((dias % SINODICO) + SINODICO) % SINODICO / SINODICO;
  const indice = Math.round(fraccion * 8) % 8;
  const iluminacion = Math.round((1 - Math.cos(fraccion * 2 * Math.PI)) * 50);
  return { fraccion, indice, iluminacion };
}
