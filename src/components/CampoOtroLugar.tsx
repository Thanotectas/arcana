"use client";

import { useState } from "react";
import { CampoLugar } from "./CampoLugar";

/** Casilla "pasaré mi cumpleaños en otra ciudad" que despliega un segundo buscador de lugar. */
export function CampoOtroLugar({ etiqueta, etiquetaLugar }: { etiqueta: string; etiquetaLugar: string }) {
  const [activo, setActivo] = useState(false);
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 text-sm text-texto-suave">
        <input type="checkbox" name="otro_lugar" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="h-4 w-4 accent-[var(--oro)]" />
        {etiqueta}
      </label>
      {activo && <CampoLugar sufijo="_rs" etiquetaTexto={etiquetaLugar} />}
    </div>
  );
}
