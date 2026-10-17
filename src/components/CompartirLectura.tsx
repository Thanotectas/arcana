"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle, ImageDown, FileDown, Loader2, Smartphone } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";

/**
 * Compartir una lectura: en la historia (imagen 9:16 con el enlace de
 * invitación; en el celular abre el menú de compartir con Instagram,
 * Facebook y WhatsApp), como imagen de publicación, PDF, WhatsApp o enlace.
 * En escritorio las imágenes se descargan.
 */
export function CompartirLectura({ titulo, id, lista }: { titulo: string; id: string; lista: boolean }) {
  const { t } = useT();
  const [copiado, setCopiado] = useState(false);
  const [generando, setGenerando] = useState<"publicacion" | "historia" | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);

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

  const abrirWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${titulo} · ${window.location.href}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  async function imagen(formato: "publicacion" | "historia") {
    setGenerando(formato);
    try {
      const res = await fetch(`/api/lecturas/${id}/tarjeta${formato === "historia" ? "?formato=historia" : ""}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const archivo = new File([blob], `arcana-${id.slice(0, 8)}${formato === "historia" ? "-historia" : ""}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: titulo });
          return;
        } catch {
          /* cancelado: cae a la descarga */
        }
      }
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(blob);
      enlace.download = archivo.name;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    } finally {
      setGenerando(null);
    }
  }

  async function pdf() {
    setGenerandoPdf(true);
    try {
      const res = await fetch(`/api/lecturas/${id}/pdf`);
      if (!res.ok) return;
      const blob = await res.blob();
      const archivo = new File([blob], `arcana-${id.slice(0, 8)}.pdf`, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: titulo });
          return;
        } catch {
          /* cancelado: cae a la descarga */
        }
      }
      const enlace = document.createElement("a");
      enlace.href = URL.createObjectURL(blob);
      enlace.download = archivo.name;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
    } finally {
      setGenerandoPdf(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {lista && (
        <button type="button" onClick={() => imagen("historia")} disabled={generando !== null} className="boton boton-primario px-3 py-1.5 text-sm">
          {generando === "historia" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Smartphone className="h-4 w-4" aria-hidden />}
          {t.lecturas.detalle.historia}
        </button>
      )}
      {lista && (
        <button type="button" onClick={() => imagen("publicacion")} disabled={generando !== null} className="boton boton-secundario px-3 py-1.5 text-sm">
          {generando === "publicacion" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImageDown className="h-4 w-4" aria-hidden />}
          {t.lecturas.detalle.descargar}
        </button>
      )}
      {lista && (
        <button type="button" onClick={pdf} disabled={generandoPdf} className="boton boton-secundario px-3 py-1.5 text-sm">
          {generandoPdf ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileDown className="h-4 w-4" aria-hidden />}
          {generandoPdf ? t.lecturas.detalle.pdfGenerando : t.lecturas.detalle.pdf}
        </button>
      )}
      <button type="button" onClick={abrirWhatsApp} className="boton boton-whatsapp px-3 py-1.5 text-sm">
        <MessageCircle className="h-4 w-4" aria-hidden />
        {t.lecturas.detalle.whatsapp}
      </button>
      <button type="button" onClick={compartir} className="boton boton-secundario px-3 py-1.5 text-sm">
        {copiado ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
        {copiado ? t.lecturas.detalle.copiado : t.lecturas.detalle.compartir}
      </button>
    </div>
  );
}
