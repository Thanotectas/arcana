"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/cliente";

/**
 * CAPTCHA de Cloudflare Turnstile (invisible o de un clic). El token viaja en
 * el campo oculto `captcha` y lo verifica Supabase Auth (que guarda la clave
 * secreta). Sin NEXT_PUBLIC_TURNSTILE_SITE_KEY el componente no dibuja nada.
 *
 * `reinicio`: cualquier valor que cambie cuando el envío falle, para pedir un
 * token nuevo (cada token sirve una sola vez).
 */
const CLAVE_SITIO = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const URL_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface ApiTurnstile {
  render: (contenedor: HTMLElement, opciones: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: ApiTurnstile;
  }
}

let cargando: Promise<ApiTurnstile> | null = null;
function cargarTurnstile() {
  if (typeof window === "undefined") return Promise.reject(new Error("sin ventana"));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!cargando) {
    cargando = new Promise<ApiTurnstile>((resolver, rechazar) => {
      const s = document.createElement("script");
      s.src = URL_SCRIPT;
      s.async = true;
      s.onload = () => (window.turnstile ? resolver(window.turnstile) : rechazar(new Error("turnstile no disponible")));
      s.onerror = () => rechazar(new Error("no se pudo cargar turnstile"));
      document.head.appendChild(s);
    });
  }
  return cargando;
}

export function Turnstile({ reinicio }: { reinicio?: unknown }) {
  const { idioma } = useT();
  const contenedor = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const widget = useRef<string | null>(null);

  useEffect(() => {
    if (!CLAVE_SITIO || !contenedor.current) return;
    let activo = true;
    const el = contenedor.current;
    cargarTurnstile()
      .then((api) => {
        if (!activo || widget.current) return;
        widget.current = api.render(el, {
          sitekey: CLAVE_SITIO,
          theme: "dark",
          size: "flexible",
          language: idioma,
          callback: (token: string) => {
            if (entrada.current) entrada.current.value = token;
          },
          "expired-callback": () => {
            if (entrada.current) entrada.current.value = "";
          },
          "error-callback": () => {
            if (entrada.current) entrada.current.value = "";
          },
        });
      })
      .catch((e: unknown) => console.warn("[turnstile]", e instanceof Error ? e.message : e));
    return () => {
      activo = false;
      if (widget.current && window.turnstile) {
        try {
          window.turnstile.remove(widget.current);
        } catch {}
        widget.current = null;
      }
    };
  }, [idioma]);

  // Tras un envío fallido el token ya se gastó: se pide otro.
  useEffect(() => {
    if (!reinicio || !widget.current || !window.turnstile) return;
    try {
      window.turnstile.reset(widget.current);
    } catch {}
    if (entrada.current) entrada.current.value = "";
  }, [reinicio]);

  if (!CLAVE_SITIO) return null;
  return (
    <div>
      <div ref={contenedor} className="min-h-[65px]" />
      <input ref={entrada} type="hidden" name="captcha" defaultValue="" />
    </div>
  );
}
