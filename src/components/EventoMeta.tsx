"use client";

import { useEffect } from "react";
import { medir } from "@/lib/marca/medicion";

/**
 * Manda un evento del píxel una sola vez por `clave` (una compra o un registro
 * no se cuentan dos veces si la persona recarga la página). Sin píxel o sin
 * consentimiento no hace nada.
 */
export function EventoMeta({ evento, clave, datos }: { evento: string; clave: string; datos?: Record<string, string | number> }) {
  useEffect(() => {
    const k = `arcana_evento_${clave}`;
    try {
      if (localStorage.getItem(k)) return;
      localStorage.setItem(k, "1");
    } catch {
      /* sin almacenamiento: se manda igual */
    }
    medir(evento, datos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evento, clave]);
  return null;
}
