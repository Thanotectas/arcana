"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { IDIOMAS, NOMBRES_IDIOMA } from "@/lib/i18n/idiomas";
import { accionCambiarIdioma } from "@/lib/i18n/acciones";
import { useT } from "@/lib/i18n/cliente";

export function SelectorIdioma() {
  const { idioma, t } = useT();
  const [pendiente, iniciar] = useTransition();
  return (
    <label className="flex items-center gap-1 text-sm text-texto-suave" title={t.comun.idioma}>
      <Globe className="h-4 w-4" aria-hidden />
      <span className="sr-only">{t.comun.idioma}</span>
      <select
        className="cursor-pointer bg-transparent text-sm text-texto-suave outline-none hover:text-texto"
        value={idioma}
        disabled={pendiente}
        onChange={(e) => {
          const fd = new FormData();
          fd.set("idioma", e.target.value);
          iniciar(() => accionCambiarIdioma(fd));
        }}
      >
        {IDIOMAS.map((i) => (
          <option key={i} value={i} className="bg-superficie text-texto">
            {NOMBRES_IDIOMA[i]}
          </option>
        ))}
      </select>
    </label>
  );
}
