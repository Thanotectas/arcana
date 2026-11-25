"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";

/** Descargar el grimorio en PDF (impresión del navegador) y compartir el sello de cierre. */
export function AccionesGrimorio({ curso, conSello }: { curso: string; conSello: boolean }) {
  const [estado, setEstado] = useState("");
  const compartir = async () => {
    setEstado("…");
    try {
      const r = await fetch(`/api/escuela/sello?curso=${curso}`);
      if (!r.ok) throw new Error();
      const archivo = new File([await r.blob()], "mi-sello-arcana.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], text: "Cerré mi ciclo con Sibila ✦ miarcana.com/escuela" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(archivo);
        a.download = archivo.name;
        a.click();
      }
      setEstado("");
    } catch {
      setEstado("No se pudo preparar el sello. Intenta de nuevo.");
    }
  };
  return (
    <div className="no-imprimir flex flex-wrap items-center justify-center gap-3">
      <button type="button" onClick={() => window.print()} className="boton boton-secundario inline-flex items-center gap-2">
        <Download className="h-4 w-4" aria-hidden /> Descargar mi grimorio (PDF)
      </button>
      {conSello && (
        <button type="button" onClick={compartir} className="boton boton-primario inline-flex items-center gap-2">
          <Share2 className="h-4 w-4" aria-hidden /> {estado === "…" ? "Preparando…" : "Compartir mi sello"}
        </button>
      )}
      {estado && estado !== "…" && <p className="w-full text-center text-sm text-red-300">{estado}</p>}
    </div>
  );
}
