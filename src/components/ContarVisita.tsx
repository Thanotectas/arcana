"use client";

import { useEffect } from "react";

const MARCA = "arcana_visita_contada";

/**
 * Cuenta la primera visita de este navegador para el embudo (/admin/embudo).
 * El navegador solo recuerda que ya la contó: no hay cookie ni identificador, y
 * el servidor no guarda nada que identifique a la persona.
 */
export function ContarVisita() {
  useEffect(() => {
    try {
      if (localStorage.getItem(MARCA)) return;
      localStorage.setItem(MARCA, new Date().toISOString().slice(0, 10));
    } catch {
      return; // Sin almacenamiento (modo privado estricto): no se cuenta.
    }
    const cuerpo = JSON.stringify({ ruta: location.pathname });
    const enviado = navigator.sendBeacon?.("/api/visita", new Blob([cuerpo], { type: "application/json" }));
    if (!enviado) void fetch("/api/visita", { method: "POST", body: cuerpo, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
  }, []);
  return null;
}
