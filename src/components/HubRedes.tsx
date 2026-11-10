"use client";

import { useState } from "react";
import { ChevronRight, Copy, Share2, Sparkles } from "lucide-react";
import { IconoRed } from "./IconoRed";
import type { IconoCanal } from "@/lib/marca/redes";

export interface CanalVista {
  id: string;
  href: string;
  externo: boolean;
  nombre: string;
  detalle: string;
  icono: IconoCanal;
  color: string;
  principal?: boolean;
}

function Icono({ icono, className }: { icono: IconoCanal; className: string }) {
  if (icono === "carta") return <Sparkles className={className} aria-hidden />;
  if (icono === "mensaje") return <IconoRed id="instagram" className={className} />;
  return <IconoRed id={icono} className={className} />;
}

/** Lista de canales del hub: cada clic se registra (canal, origen y dispositivo; nada personal) y sigue al destino. */
export function HubRedes({ canales, codigo, enlace, textos }: { canales: CanalVista[]; codigo: string; enlace: string; textos: { compartir: string; copiar: string; copiado: string; titulo: string; intro: string } }) {
  const [copiado, setCopiado] = useState(false);
  const movil = typeof navigator !== "undefined" && (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && matchMedia("(pointer: coarse)").matches));

  function registrar(id: string) {
    const cuerpo = JSON.stringify({ red: id, origen: codigo, dispositivo: movil ? "movil" : "escritorio" });
    try {
      if (navigator.sendBeacon?.("/api/redes/clic", new Blob([cuerpo], { type: "application/json" }))) return;
    } catch {
      /* sigue con fetch */
    }
    fetch("/api/redes/clic", { method: "POST", headers: { "content-type": "application/json" }, body: cuerpo, keepalive: true }).catch(() => {});
  }

  async function compartir() {
    try {
      await navigator.share({ title: textos.titulo, text: textos.intro, url: enlace });
    } catch {
      /* cancelado */
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <>
      <ul className="space-y-3">
        {canales.map((c) => (
          <li key={c.id}>
            <a
              href={c.href}
              {...(c.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => registrar(c.id)}
              onAuxClick={() => registrar(c.id)}
              className={`tarjeta tarjeta-modulo flex items-center gap-4 p-4 ${c.principal ? "border-oro/60 bg-oro/10" : ""}`}
            >
              <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl text-white" style={{ background: c.color }}>
                <Icono icono={c.icono} className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-semibold leading-tight">{c.nombre}</span>
                <span className="block truncate text-sm text-texto-suave">{c.detalle}</span>
              </span>
              <ChevronRight className="h-5 w-5 flex-none text-texto-suave" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-center gap-2">
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button type="button" onClick={compartir} className="boton boton-fantasma text-sm">
            <Share2 className="h-4 w-4" aria-hidden /> {textos.compartir}
          </button>
        )}
        <button type="button" onClick={copiar} className="boton boton-fantasma text-sm">
          <Copy className="h-4 w-4" aria-hidden /> {copiado ? textos.copiado : textos.copiar}
        </button>
      </div>
    </>
  );
}
