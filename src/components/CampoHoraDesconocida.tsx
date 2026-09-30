"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/cliente";

/**
 * Hora de nacimiento con casilla "no la conozco".
 * `valorInicial`: "HH:MM" para precargar; `null` marca la hora como desconocida.
 */
export function CampoHora({ valorInicial }: { valorInicial?: string | null }) {
  const { t } = useT();
  const [desconocida, setDesconocida] = useState(valorInicial === null);
  return (
    <div>
      <label className="etiqueta" htmlFor="hora">{t.astral.hora}</label>
      <input id="hora" name="hora" type="time" className="campo" disabled={desconocida} required={!desconocida} defaultValue={valorInicial ?? "12:00"} />
      <label className="mt-2 flex items-center gap-2 text-sm text-texto-suave">
        <input type="checkbox" name="hora_desconocida" checked={desconocida} onChange={(e) => setDesconocida(e.target.checked)} />
        {t.astral.horaDesconocida}
      </label>
    </div>
  );
}
