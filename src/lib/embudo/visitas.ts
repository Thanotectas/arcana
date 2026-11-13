/**
 * Primera visita de cada navegador, para el comienzo del embudo (migración 0050).
 * Funciones puras: las usa la ruta /api/visita y se pueden probar sin servidor.
 *
 * No se guarda nada que identifique a la persona: ni IP, ni identificador, ni el
 * navegador. Solo el origen (la misma cookie de «Por dónde llegan»), el país que
 * da Vercel, la página de entrada, si fue desde el celular y la plataforma.
 */
import { detalleOrigen, leerOrigen } from "@/lib/origen/comun";

export interface DatosVisita {
  origen: string;
  origen_detalle: string | null;
  pais: string | null;
  ruta: string;
  dispositivo: "movil" | "escritorio";
  plataforma: "web" | "android" | "pwa";
}

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor|curl|wget|python|node-fetch|axios/i;

export function esBot(agente: string | null) {
  return !agente || BOTS.test(agente);
}

/** La página de entrada, sin parámetros ni nada raro; "/" si no es válida. */
export function rutaLimpia(valor: unknown): string {
  if (typeof valor !== "string" || !valor.startsWith("/") || valor.startsWith("//")) return "/";
  const sinParametros = valor.split(/[?#]/)[0];
  return /^\/[\w\-./]{0,119}$/.test(sinParametros) ? sinParametros.replace(/\/+$/, "") || "/" : "/";
}

export function paisValido(valor: string | null): string | null {
  return valor && /^[A-Z]{2}$/.test(valor) ? valor : null;
}

export function datosVisita(entrada: {
  ruta: unknown;
  cookieOrigen: string | undefined;
  cookiePlataforma: string | undefined;
  pais: string | null;
  agente: string | null;
}): DatosVisita {
  const origen = leerOrigen(entrada.cookieOrigen);
  const p = entrada.cookiePlataforma;
  return {
    origen: origen?.fuente ?? "desconocido",
    origen_detalle: origen ? detalleOrigen(origen) : null,
    pais: paisValido(entrada.pais),
    ruta: rutaLimpia(entrada.ruta),
    dispositivo: /Mobi|Android|iPhone|iPad/i.test(entrada.agente ?? "") ? "movil" : "escritorio",
    plataforma: p === "android" || p === "pwa" ? p : "web",
  };
}
