"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { accionSalir } from "@/lib/auth/acciones";
import { IconoCatalogo } from "./IconoCatalogo";
import type { ItemCatalogoTexto } from "@/lib/catalogo";
import type { Idioma } from "@/lib/i18n/idiomas";
import { gruposPorNecesidad } from "@/lib/catalogo-filtros";

/** Cajón de navegación en pantallas pequeñas: accesos directos arriba, lecturas por lo que se quiere saber (grupos plegados) y la cuenta. */
export function MenuMovil({
  etiquetaAbrir,
  etiquetaCerrar,
  etiquetaLecturas,
  idioma,
  items,
  destacados,
  enlaces,
  salir,
}: {
  etiquetaAbrir: string;
  etiquetaCerrar: string;
  etiquetaLecturas: string;
  idioma: Idioma;
  items: ItemCatalogoTexto[];
  /** Accesos directos que van arriba (tu cielo hoy, horóscopo, explorar, El Arcano, en vivo). */
  destacados: { href: string; etiqueta: string }[];
  /** Enlaces extra al final (mi cuenta, invitar, créditos…). */
  enlaces: { href: string; etiqueta: string }[];
  /** Texto del botón de cerrar sesión; si no viene, no se muestra (sin sesión). */
  salir?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  // Al cambiar de página se cierra (ajuste de estado durante el render, sin efecto).
  const [rutaAbierta, setRutaAbierta] = useState(ruta);
  if (ruta !== rutaAbierta) {
    setRutaAbierta(ruta);
    setAbierto(false);
  }
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setAbierto(true)} aria-label={etiquetaAbrir} className="rounded-full border border-borde p-2 text-texto-suave transition hover:text-texto">
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      {/* El cajón va en un portal: el encabezado tiene backdrop-filter y encerraría un fixed. */}
      {abierto &&
        createPortal(
        <div className="fixed inset-0 z-40 bg-noche/95 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-borde px-4 py-3">
            <span className="font-display text-xl text-oro-suave">{etiquetaAbrir}</span>
            <button type="button" onClick={() => setAbierto(false)} aria-label={etiquetaCerrar} className="rounded-full border border-borde p-2 text-texto-suave">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="h-[calc(100vh-57px)] overflow-y-auto px-4 pb-10 pt-4">
            <ul className="grid grid-cols-2 gap-2">
              {destacados.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="tarjeta flex h-full items-center justify-center px-3 py-3 text-center font-display text-lg text-oro-suave transition hover:border-oro/60">
                    {e.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mb-2 mt-6 text-[11px] uppercase tracking-[0.25em] text-violeta-suave">{etiquetaLecturas}</p>
            <div className="space-y-2">
              {gruposPorNecesidad(items, idioma).map((g) => (
                <details key={g.id} className="group rounded-xl border border-borde">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 text-texto">
                    <span>{g.nombre} <span className="text-xs text-texto-suave">· {g.items.length}</span></span>
                    <ChevronDown className="h-4 w-4 text-texto-suave transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <ul className="space-y-1 px-1 pb-2">
                    {g.items.map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5">
                          <span className="text-oro"><IconoCatalogo clave={i.clave} className="h-5 w-5" /></span>
                          <span className="flex-1 text-texto">{i.nombre}</span>
                          <span className="text-xs text-texto-suave">{i.costoTexto}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
            {(enlaces.length > 0 || salir) && (
              <ul className="mt-8 flex flex-wrap gap-2 border-t border-borde pt-5">
                {enlaces.map((e) => (
                  <li key={e.href}>
                    <Link href={e.href} className="boton boton-secundario px-3 py-1.5 text-sm">{e.etiqueta}</Link>
                  </li>
                ))}
                {salir && (
                  <li>
                    <form action={accionSalir}>
                      <button type="submit" className="boton boton-fantasma px-3 py-1.5 text-sm">
                        <LogOut className="h-4 w-4" aria-hidden />
                        {salir}
                      </button>
                    </form>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>,
        document.body,
        )}
    </div>
  );
}
