"use client";

import { useState } from "react";

export function CampoHora() {
  const [desconocida, setDesconocida] = useState(false);
  return (
    <div>
      <label className="etiqueta" htmlFor="hora">Hora de nacimiento</label>
      <input id="hora" name="hora" type="time" className="campo" disabled={desconocida} required={!desconocida} defaultValue="12:00" />
      <label className="mt-2 flex items-center gap-2 text-sm text-texto-suave">
        <input type="checkbox" name="hora_desconocida" checked={desconocida} onChange={(e) => setDesconocida(e.target.checked)} />
        No conozco la hora (se usará mediodía; sin Ascendente ni casas)
      </label>
    </div>
  );
}
