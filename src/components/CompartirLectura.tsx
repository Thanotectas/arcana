"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";

/** Comparte el enlace de la lectura (Web Share si existe; si no, copia). */
export function CompartirLectura({ titulo }: { titulo: string }) {
  const { t } = useT();
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        /* cancelado */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <button type="button" onClick={compartir} className="boton boton-secundario px-3 py-1.5 text-sm">
      {copiado ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
      {copiado ? t.lecturas.detalle.copiado : t.lecturas.detalle.compartir}
    </button>
  );
}
