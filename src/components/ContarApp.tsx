"use client";

import { useEffect } from "react";
import { estaInstalada } from "@/lib/instalar";

const ABIERTA = "arcana_app_abierta";
const INSTALADA = "arcana_app_instalada";

function enviar(evento: "instalada" | "abierta") {
  const cuerpo = JSON.stringify({ evento });
  const ok = navigator.sendBeacon?.("/api/app/evento", new Blob([cuerpo], { type: "application/json" }));
  if (!ok) void fetch("/api/app/evento", { method: "POST", body: cuerpo, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
}

/**
 * Mide las instalaciones de Arcana sin datos personales: cuando el navegador avisa que se instaló y la primera vez
 * que este dispositivo la abre desde el ícono. El navegador solo recuerda que ya lo contó.
 */
export function ContarApp() {
  useEffect(() => {
    try {
      if (estaInstalada() && !localStorage.getItem(ABIERTA)) {
        localStorage.setItem(ABIERTA, "1");
        enviar("abierta");
      }
    } catch {
      /* sin almacenamiento: no se cuenta */
    }
    const alInstalar = () => {
      try {
        if (localStorage.getItem(INSTALADA)) return;
        localStorage.setItem(INSTALADA, "1");
      } catch {
        return;
      }
      enviar("instalada");
    };
    window.addEventListener("appinstalled", alInstalar);
    return () => window.removeEventListener("appinstalled", alInstalar);
  }, []);
  return null;
}
