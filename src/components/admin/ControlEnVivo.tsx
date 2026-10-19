"use client";

import { useActionState, useState } from "react";
import { Copy, Send, Trash2 } from "lucide-react";
import { accionPreguntaManual, accionVaciarCola, type EstadoEnVivo } from "@/lib/en-vivo-acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Dirección del escenario para pegar en OBS, con botón de copiar. */
export function DireccionEscenario({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <input readOnly value={url} className="campo min-w-0 flex-1 font-mono text-xs" onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="boton boton-secundario text-sm"
        onClick={() => {
          navigator.clipboard.writeText(url).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          });
        }}
      >
        <Copy className="h-4 w-4" aria-hidden /> {copiado ? "Copiada" : "Copiar"}
      </button>
      <a href={url} target="_blank" rel="noreferrer" className="boton boton-fantasma text-sm">
        Abrir escenario
      </a>
    </div>
  );
}

/** Agregar una consulta a mano (pasa primero) — sirve para probar sin directo o leerle a alguien en particular. */
export function PreguntaManual() {
  const [estado, enviar] = useActionState<EstadoEnVivo, FormData>(accionPreguntaManual, {});
  return (
    <form action={enviar} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <input name="autor" placeholder="Nombre" maxLength={40} required className="campo" />
        <select name="tipo" className="campo" defaultValue="tarot">
          <option value="tarot">Tarot</option>
          <option value="aura">Aura</option>
          <option value="numerologia">Numerología</option>
          <option value="horoscopo">Horóscopo</option>
        </select>
      </div>
      <input name="texto" placeholder="Ej: Soy Leo, ¿qué viene en el amor? (numerología: con fecha 12/08/1990)" maxLength={300} required className="campo w-full" />
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar className="boton boton-secundario text-sm" cargando="Agregando…">
        <Send className="h-4 w-4" aria-hidden /> Agregar a la fila
      </BotonEnviar>
    </form>
  );
}

export function VaciarCola() {
  const [estado, enviar] = useActionState<EstadoEnVivo, FormData>(() => accionVaciarCola(), {});
  return (
    <form action={enviar} className="space-y-2">
      <BotonEnviar className="boton boton-fantasma text-sm" cargando="Vaciando…">
        <Trash2 className="h-4 w-4" aria-hidden /> Vaciar la fila
      </BotonEnviar>
      {estado.mensaje && <Aviso tipo="info">{estado.mensaje}</Aviso>}
    </form>
  );
}
