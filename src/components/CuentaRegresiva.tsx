"use client";

import { useSyncExternalStore } from "react";

function suscribir(cb: () => void) {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
}

/** "3 días y 4 h" hasta una fecha; se actualiza cada minuto. En el servidor muestra el valor inicial. */
export function CuentaRegresiva({ hasta, plantillaDias, plantillaHoras }: { hasta: string; plantillaDias: string; plantillaHoras: string }) {
  const ahora = useSyncExternalStore(suscribir, () => Math.floor(Date.now() / 60_000) * 60_000, () => Math.floor(Date.now() / 60_000) * 60_000);
  const restante = Math.max(0, new Date(hasta).getTime() - ahora);
  const dias = Math.floor(restante / 86_400_000);
  const horas = Math.floor((restante % 86_400_000) / 3_600_000);
  const texto = dias > 0 ? plantillaDias.replace("{d}", String(dias)).replace("{h}", String(horas)) : plantillaHoras.replace("{h}", String(Math.max(1, horas)));
  return <span>{texto}</span>;
}
