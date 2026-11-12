"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLAVE_MEDICION } from "@/lib/marca/medicion";

type Datos = Record<string, string | number>;
type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[]; push: unknown; loaded: boolean; version: string };
type Ventana = Window & { fbq?: Fbq; _fbq?: Fbq; ArcanaMedir?: (evento: string, datos?: Datos) => void; __arcanaEventos?: [string, Datos | undefined][] };

const leer = () => {
  try {
    return localStorage.getItem(CLAVE_MEDICION);
  } catch {
    return null;
  }
};
const guardar = (v: "si" | "no") => {
  try {
    localStorage.setItem(CLAVE_MEDICION, v);
  } catch {
    /* sin almacenamiento: se vuelve a preguntar */
  }
};

/**
 * Píxel de Meta con aviso previo (Ley 1581 y equivalentes): no carga nada hasta
 * que la persona acepta. Sin eventos automáticos (autoConfig apagado): solo las
 * visitas y los eventos que la app manda con medir().
 */
export function MedicionAnuncios({ pixelId, textos }: { pixelId: string; textos: { aviso: string; aceptar: string; rechazar: string; mas: string } }) {
  const [aviso, setAviso] = useState(false);
  const activo = useRef(false);
  const pendientes = useRef<[string, Datos | undefined][]>([]);
  const ruta = usePathname();
  const primeraRuta = useRef(true);

  function cargar() {
    if (activo.current) return;
    activo.current = true;
    const w = window as Ventana;
    if (!w.fbq) {
      const n = function (...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue.push(args);
      } as Fbq;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      w.fbq = n;
      w._fbq = n;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(s);
    }
    w.fbq!("set", "autoConfig", false, pixelId);
    w.fbq!("init", pixelId);
    w.fbq!("track", "PageView");
    for (const [evento, datos] of pendientes.current.splice(0)) w.fbq!("track", evento, datos ?? {});
  }

  useEffect(() => {
    const w = window as Ventana;
    w.ArcanaMedir = (evento, datos) => {
      if (activo.current) w.fbq?.("track", evento, datos ?? {});
      else if (leer() !== "no") pendientes.current.push([evento, datos]);
    };
    // Eventos que alguna página pidió antes de que este componente montara.
    for (const [evento, datos] of (w.__arcanaEventos ?? []).splice(0)) w.ArcanaMedir(evento, datos);
    const eleccion = leer();
    if (eleccion === "si") cargar();
    // localStorage solo existe en el navegador: el aviso se decide después de montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (eleccion !== "no") setAviso(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navegación dentro de la app (sin recargar): una visita por página.
  useEffect(() => {
    if (primeraRuta.current) {
      primeraRuta.current = false;
      return;
    }
    if (activo.current) (window as Ventana).fbq?.("track", "PageView");
  }, [ruta]);

  if (!aviso) return null;
  const elegir = (v: "si" | "no") => {
    guardar(v);
    setAviso(false);
    if (v === "si") cargar();
    else pendientes.current.length = 0;
  };
  return (
    <div role="dialog" aria-label="Medición de anuncios" className="fixed inset-x-3 bottom-3 z-[70] mx-auto flex max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-borde bg-[#140d24]/95 p-4 text-sm text-texto shadow-2xl backdrop-blur">
      <p className="min-w-[16rem] flex-1">
        {textos.aviso}{" "}
        <Link href="/privacidad" className="text-oro-suave underline">
          {textos.mas}
        </Link>
      </p>
      <div className="ml-auto flex gap-2">
        <button type="button" onClick={() => elegir("no")} className="boton boton-fantasma text-sm">
          {textos.rechazar}
        </button>
        <button type="button" onClick={() => elegir("si")} className="boton boton-primario text-sm">
          {textos.aceptar}
        </button>
      </div>
    </div>
  );
}
