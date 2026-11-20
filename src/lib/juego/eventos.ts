"use client";

/**
 * Eventos del juego para el panel /admin/juego: un número al azar por navegador (no identifica a nadie) y
 * qué pasó (empezó, terminó, pidió comodín…). Si algo falla, el juego sigue igual.
 */
const CLAVE = "arcana-juego-visitante";

function visitante() {
  try {
    let id = localStorage.getItem(CLAVE);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CLAVE, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function contarEvento(evento: "inicio" | "fin" | "comodin" | "maestro" | "mensaje" | "oferta", datos: { gano?: boolean; intentos?: number } = {}) {
  const id = visitante();
  if (!id) return;
  void fetch("/api/juego/evento", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ evento, visitante: id, ...datos }), keepalive: true }).catch(() => null);
}
