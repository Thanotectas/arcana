"use client";

import { useState } from "react";
import { Copy, QrCode } from "lucide-react";
import { enlaceHub, REF_HUB } from "@/lib/marca/redes";

const SUGERIDOS = ["instagram-bio", "tiktok-bio", "youtube-descripcion", "facebook-bio", "telegram-bio", "canal-whatsapp", "correo-pie", "video-qr", "directo-pantalla", "volante"];

/** Enlaces del hub con código de origen, para pegar en cada sitio; el QR imprimible abre en /redes/qr. */
export function EnlacesHub() {
  const [codigo, setCodigo] = useState("instagram-bio");
  const [copiado, setCopiado] = useState(false);
  const valido = REF_HUB.test(codigo);
  const enlace = enlaceHub(valido ? codigo : "");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin portapapeles */
    }
  }

  return (
    <div className="space-y-3">
      <label className="grid gap-1 text-sm font-semibold">
        Código de origen
        <input value={codigo} onChange={(e) => setCodigo(e.target.value.trim().toLowerCase())} maxLength={40} className="rounded-lg border border-borde bg-transparent px-3 py-2 font-normal" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {SUGERIDOS.map((s) => (
          <button key={s} type="button" onClick={() => setCodigo(s)} className={`rounded-full border px-2.5 py-1 text-xs ${s === codigo ? "border-oro text-oro-suave" : "border-borde text-texto-suave hover:text-texto"}`}>
            {s}
          </button>
        ))}
      </div>
      {!valido ? (
        <p className="text-sm text-peligro">Minúsculas, números y guiones, de 2 a 40 caracteres. Escríbelo «red-lugar»: la parte antes del primer guion queda como origen de la visita.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <code className="rounded-md bg-white/5 px-2 py-1 text-oro-suave">{enlace}</code>
          <button type="button" onClick={copiar} className="boton boton-fantasma text-xs">
            <Copy className="h-3.5 w-3.5" aria-hidden /> {copiado ? "Copiado" : "Copiar"}
          </button>
          <a href={`/redes/qr?ref=${encodeURIComponent(codigo)}`} target="_blank" rel="noopener" className="boton boton-fantasma text-xs">
            <QrCode className="h-3.5 w-3.5" aria-hidden /> Tarjeta con QR
          </a>
        </div>
      )}
    </div>
  );
}
