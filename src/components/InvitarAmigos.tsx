"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";

/** Enlace de invitación con envío por WhatsApp, copia y compartir nativo. */
export function InvitarAmigos({ enlace }: { enlace: string }) {
  const { t } = useT();
  const [copiado, setCopiado] = useState(false);
  const mensaje = plantilla(t.invitar.mensaje, { enlace });
  const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin portapapeles */
    }
  }

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ text: mensaje, url: enlace });
      } catch {
        /* cancelado */
      }
    } else {
      copiar();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="etiqueta">{t.invitar.tuEnlace}</p>
        <div className="flex gap-2">
          <input readOnly value={enlace} className="campo font-mono text-sm" onFocus={(e) => e.currentTarget.select()} />
          <button type="button" onClick={copiar} className="boton boton-secundario shrink-0 px-3" aria-label={t.invitar.copiar}>
            {copiado ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          </button>
        </div>
        {copiado && <p className="mt-1 text-xs text-exito">{t.invitar.copiado}</p>}
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={urlWhatsApp} target="_blank" rel="noopener noreferrer" className="boton boton-whatsapp">
          <MessageCircle className="h-4 w-4" aria-hidden />
          {t.invitar.whatsapp}
        </a>
        <button type="button" onClick={compartir} className="boton boton-secundario">
          <Share2 className="h-4 w-4" aria-hidden />
          {t.invitar.otros}
        </button>
      </div>
    </div>
  );
}
