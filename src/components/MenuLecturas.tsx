"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { IconoCatalogo } from "./IconoCatalogo";
import { GRUPOS_CATALOGO, type GrupoCatalogo, type ItemCatalogoTexto } from "@/lib/catalogo";

/** Menú desplegable "Lecturas" del escritorio: todos los productos por grupo. */
export function MenuLecturas({ etiqueta, grupos, items }: { etiqueta: string; grupos: Record<GrupoCatalogo, string>; items: ItemCatalogoTexto[] }) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  // Al cambiar de página se cierra (ajuste de estado durante el render, sin efecto).
  const [rutaAbierta, setRutaAbierta] = useState(ruta);
  if (ruta !== rutaAbierta) {
    setRutaAbierta(ruta);
    setAbierto(false);
  }
  const caja = useRef<HTMLDivElement>(null);

  // Se cierra al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        className={`enlace-nav flex items-center gap-1 transition hover:text-texto ${abierto ? "text-texto" : ""}`}
      >
        {etiqueta} <ChevronDown className={`h-3.5 w-3.5 transition ${abierto ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {abierto && (
        <div className="absolute left-0 top-full z-30 mt-3 w-[min(880px,calc(100vw-2rem))] rounded-2xl border border-borde bg-superficie-2/95 p-5 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-5">
            {GRUPOS_CATALOGO.map((g) => (
              <div key={g}>
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-violeta-suave">{grupos[g]}</p>
                <ul className="space-y-0.5">
                  {items.filter((i) => i.grupo === g).map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} className="group flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
                        <span className="mt-0.5 text-oro"><IconoCatalogo clave={i.clave} /></span>
                        <span className="min-w-0">
                          <span className="block text-sm text-texto group-hover:text-oro-suave">{i.nombre}</span>
                          <span className="block text-[11px] text-texto-suave">{i.costoTexto}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
