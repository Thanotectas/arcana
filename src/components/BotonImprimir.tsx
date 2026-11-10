"use client";

import { Printer } from "lucide-react";

export function BotonImprimir({ children = "Imprimir" }: { children?: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className="boton boton-fantasma text-sm">
      <Printer className="h-4 w-4" aria-hidden /> {children}
    </button>
  );
}
