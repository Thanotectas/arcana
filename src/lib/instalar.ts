"use client";

import { useSyncExternalStore } from "react";

/**
 * Instalar Arcana como app desde el navegador. Chrome (Android y computador) avisa una sola vez con
 * «beforeinstallprompt»: se guarda aquí para que cualquier botón de la página pueda usarlo.
 * En iPhone no existe: se explica con pasos (Compartir → Agregar a inicio).
 */
interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let guardado: EventoInstalar | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    guardado = e as EventoInstalar;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    guardado = null;
    avisar();
  });
}

/** true cuando el navegador ofrece instalar con un botón. */
export function usePuedeInstalar() {
  return useSyncExternalStore(
    (f) => {
      oyentes.add(f);
      return () => oyentes.delete(f);
    },
    () => guardado !== null,
    () => false,
  );
}

/** Abre el cuadro de instalación del navegador. Devuelve true si la persona aceptó. */
export async function pedirInstalacion() {
  if (!guardado) return false;
  const evento = guardado;
  await evento.prompt().catch(() => null);
  const eleccion = await evento.userChoice?.catch(() => null);
  guardado = null;
  avisar();
  return eleccion?.outcome === "accepted";
}

export function estaInstalada() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export type Dispositivo = "android" | "iphone" | "computador";
export function dispositivo(): Dispositivo {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  return "computador";
}

/** El navegador de adentro de una red (Instagram, Facebook, TikTok) no deja instalar: hay que abrir el navegador. */
export function navegadorDeRed(): string | null {
  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return "TikTok";
  return null;
}

/** En iPhone solo Safari instala. */
export function iphoneSinSafari() {
  return dispositivo() === "iphone" && /CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
}
