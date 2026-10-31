"use client";

import { useState } from "react";

/** Botones para compartir el resultado del test (WhatsApp, Facebook, copiar e imagen para historias). */
export function CompartirTest({ url, texto, imagen }: { url: string; texto: string; imagen: string }) {
  const [copiado, setCopiado] = useState(false);
  const mensaje = `${texto} ${url}`;

  async function compartirNativo() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "¿Qué carta del tarot eres?", text: texto, url });
        return;
      } catch {
        /* cancelado: seguimos con copiar */
      }
    }
    await copiar();
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <a href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer" className="boton boton-primario">
        Compartir por WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="boton boton-secundario">
        Facebook
      </a>
      <a href={imagen} download className="boton boton-secundario">
        Imagen para historias
      </a>
      <button type="button" onClick={compartirNativo} className="boton boton-secundario">
        {copiado ? "¡Enlace copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
