"use client";

import { useActionState, useState } from "react";
import { Send, Upload } from "lucide-react";
import { accionPrepararReel, accionPublicarReel, type EstadoPrepararReel, type EstadoReelMeta } from "@/lib/redes/acciones-meta";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";
import { prepararSubida } from "./subir-video";
import type { FuenteTiktok } from "./PublicarTiktok";

/** Publicar en Instagram (reel) y Facebook (video) un reel del panel o un MP4 propio. */
export function PublicarReelMeta({ fuentes }: { fuentes: FuenteTiktok[] }) {
  const [fuente, setFuente] = useState("subida");
  const [subiendo, setSubiendo] = useState(false);
  const [preparado, preparar] = useActionState<EstadoPrepararReel, FormData>(async (prev, fd) => {
    const error = await prepararSubida(fd, setSubiendo);
    if (error) return { error };
    return accionPrepararReel(prev, fd);
  }, {});

  return (
    <div className="space-y-4">
      <form action={preparar} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-texto-suave">Video</span>
          <select name="fuente" value={fuente} onChange={(e) => setFuente(e.target.value)} className="campo min-w-64">
            <option value="subida">Subir un video propio (MP4)</option>
            {fuentes.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.etiqueta}
              </option>
            ))}
          </select>
        </label>
        {fuente === "subida" && <input type="file" name="archivo" accept="video/mp4" required className="text-sm" />}
        <BotonEnviar className="boton boton-secundario" cargando={subiendo ? "Subiendo el video…" : "Preparando…"}>
          <Upload className="h-4 w-4" aria-hidden /> Preparar
        </BotonEnviar>
      </form>
      {preparado.error && <Aviso>{preparado.error}</Aviso>}
      {preparado.video && <FormularioReel key={preparado.video} video={preparado.video} texto={preparado.texto ?? ""} />}
    </div>
  );
}

function FormularioReel({ video, texto }: { video: string; texto: string }) {
  const [estado, enviar] = useActionState<EstadoReelMeta, FormData>(accionPublicarReel, {});
  return (
    <form action={enviar} className="grid gap-4 rounded-2xl border border-borde p-4 sm:grid-cols-[220px_1fr]">
      <input type="hidden" name="video" value={video} />
      <video src={video} controls playsInline className="w-full max-w-[220px] rounded-xl border border-borde" />
      <div className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span className="text-texto-suave">Texto (el mismo para las dos redes)</span>
          <textarea name="texto" defaultValue={texto} maxLength={2200} rows={9} required className="campo w-full text-sm" />
        </label>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="redes" value="instagram" defaultChecked /> Instagram (reel)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="redes" value="facebook" defaultChecked /> Facebook (video)
          </label>
        </div>
        {estado.error && <Aviso>{estado.error}</Aviso>}
        {estado.resultados?.map((r) => (
          <Aviso key={r.red} tipo={r.ok ? "exito" : "error"}>{`${r.red}: ${r.detalle}`}</Aviso>
        ))}
        <BotonEnviar className="boton boton-primario" cargando="Publicando… (Instagram tarda uno o dos minutos)">
          <Send className="h-4 w-4" aria-hidden /> Publicar
        </BotonEnviar>
      </div>
    </form>
  );
}
