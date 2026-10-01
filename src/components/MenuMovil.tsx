"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { IconoCatalogo } from "./IconoCatalogo";
import { GRUPOS_CATALOGO, type GrupoCatalogo, type ItemCatalogoTexto } from "@/lib/catalogo";

/** Cajón de navegación en pantallas pequeñas: productos por grupo y enlaces de la cuenta. */
export function MenuMovil({
  etiquetaAbrir,
  etiquetaCerrar,
  grupos,
  items,
  enlaces,
}: {
  etiquetaAbrir: string;
  etiquetaCerrar: string;
  grupos: Record<GrupoCatalogo, string>;
  items: ItemCatalogoTexto[];
  /** Enlaces extra al final (mi cuenta, invitar, créditos…). */
  enlaces: { href: string; etiqueta: string }[];
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
            <div className="grid gap-6 sm:grid-cols-2">
              {GRUPOS_CATALOGO.map((g) => (
                <section key={g}>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-violeta-suave">{grupos[g]}</p>
                  <ul className="space-y-1">
                    {items.filter((i) => i.grupo === g).map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5">
                          <span className="text-oro"><IconoCatalogo clave={i.clave} className="h-5 w-5" /></span>
                          <span className="flex-1 text-texto">{i.nombre}</span>
                          <span className="text-xs text-texto-suave">{i.costoTexto}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            {enlaces.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2 border-t border-borde pt-5">
                {enlaces.map((e) => (
                  <li key={e.href}>
                    <Link href={e.href} className="boton boton-secundario px-3 py-1.5 text-sm">{e.etiqueta}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>,
        document.body,
        )}
    </div>
  );
}
