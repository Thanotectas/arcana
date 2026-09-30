"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2, Smartphone } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";

type Estado = "cargando" | "no_soportado" | "sin_configurar" | "ios_instalar" | "inactivo" | "activo" | "bloqueado" | "trabajando" | "error";

function claveAUint8(base64: string) {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const binario = atob((base64 + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  const salida = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) salida[i] = binario.charCodeAt(i);
  return salida;
}

function esIosSinInstalar() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalada = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !instalada;
}

/** Activa o desactiva el aviso push de "Tu cielo hoy" en este dispositivo. */
export function AvisoDiario({ clavePublica }: { clavePublica: string | null }) {
  const { t } = useT();
  const [estado, setEstado] = useState<Estado>("cargando");

  useEffect(() => {
    let activo = true;
    const detectar = async (): Promise<Estado> => {
      if (!clavePublica) return "sin_configurar";
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        return esIosSinInstalar() ? "ios_instalar" : "no_soportado";
      }
      if (Notification.permission === "denied") return "bloqueado";
      try {
        const registro = await navigator.serviceWorker.register("/sw.js");
        const suscripcion = await registro.pushManager.getSubscription();
        return suscripcion ? "activo" : "inactivo";
      } catch {
        return "error";
      }
    };
    detectar().then((e) => {
      if (activo) setEstado(e);
    });
    return () => {
      activo = false;
    };
  }, [clavePublica]);

  async function activar() {
    if (!clavePublica) return;
    setEstado("trabajando");
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "bloqueado" : "inactivo");
        return;
      }
      const registro = await navigator.serviceWorker.ready;
      const suscripcion =
        (await registro.pushManager.getSubscription()) ??
        (await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: claveAUint8(clavePublica) }));
      const res = await fetch("/api/push/suscripcion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(suscripcion.toJSON()) });
      if (!res.ok) throw new Error("guardar");
      setEstado("activo");
    } catch {
      setEstado("error");
    }
  }

  async function desactivar() {
    setEstado("trabajando");
    try {
      const registro = await navigator.serviceWorker.ready;
      const suscripcion = await registro.pushManager.getSubscription();
      if (suscripcion) {
        await fetch("/api/push/suscripcion", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: suscripcion.endpoint }) });
        await suscripcion.unsubscribe();
      }
      setEstado("inactivo");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "cargando" || estado === "sin_configurar") return null;

  const nota =
    estado === "no_soportado" ? t.push.noSoportado
    : estado === "ios_instalar" ? t.push.iosInstalar
    : estado === "bloqueado" ? t.push.bloqueado
    : estado === "error" ? t.push.error
    : estado === "activo" ? t.push.activo
    : t.push.texto;

  return (
    <div className="tarjeta flex flex-wrap items-center justify-between gap-3 border-violeta/30 p-4">
      <div className="flex items-start gap-3">
        {estado === "activo" ? <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-oro" aria-hidden />
          : estado === "ios_instalar" ? <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-violeta-suave" aria-hidden />
          : <Bell className="mt-0.5 h-5 w-5 shrink-0 text-violeta-suave" aria-hidden />}
        <div>
          <p className="font-medium">{t.push.titulo}</p>
          <p className="text-sm text-texto-suave">{nota}</p>
        </div>
      </div>
      {estado === "inactivo" && (
        <button type="button" onClick={activar} className="boton boton-primario px-4 py-1.5 text-sm">{t.push.activar}</button>
      )}
      {estado === "activo" && (
        <button type="button" onClick={desactivar} className="boton boton-fantasma px-3 py-1.5 text-sm"><BellOff className="h-4 w-4" aria-hidden /> {t.push.desactivar}</button>
      )}
      {estado === "trabajando" && <span className="flex items-center gap-2 text-sm text-texto-suave"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t.push.activando}</span>}
      {estado === "error" && (
        <button type="button" onClick={activar} className="boton boton-secundario px-4 py-1.5 text-sm">{t.push.reintentar}</button>
      )}
    </div>
  );
}
