"use client";

import { useActionState, useState } from "react";
import { Clapperboard, Unplug, Upload } from "lucide-react";
import {
  accionDesconectarYoutube,
  accionPrepararYoutube,
  accionShortDelDia,
  accionSubirYoutube,
  type EstadoPrepararYoutube,
  type EstadoYoutube,
} from "@/lib/redes/acciones-youtube";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";
import { prepararSubida } from "./subir-video";
import type { FuenteTiktok } from "./PublicarTiktok";

const PRIVACIDAD = { public: "Público", unlisted: "No listado (solo con el enlace)", private: "Privado" } as const;

/** Subir a YouTube como Short un reel del panel o un MP4 propio. */
export function SubirYoutube({ fuentes, privacidad }: { fuentes: FuenteTiktok[]; privacidad: keyof typeof PRIVACIDAD }) {
  const [fuente, setFuente] = useState(fuentes[0]?.valor ?? "subida");
  const [subiendo, setSubiendo] = useState(false);
  const [preparado, preparar] = useActionState<EstadoPrepararYoutube, FormData>(async (prev, fd) => {
    const error = await prepararSubida(fd, setSubiendo);
    if (error) return { error };
    return accionPrepararYoutube(prev, fd);
  }, {});

  return (
    <div className="space-y-4">
      <form action={preparar} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-texto-suave">Video</span>
          <select name="fuente" value={fuente} onChange={(e) => setFuente(e.target.value)} className="campo min-w-64">
            {fuentes.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.etiqueta}
              </option>
            ))}
            <option value="subida">Subir un video propio (MP4)</option>
          </select>
        </label>
        {fuente === "subida" && <input type="file" name="archivo" accept="video/mp4" required className="text-sm" />}
        <BotonEnviar className="boton boton-secundario" cargando={subiendo ? "Subiendo el video…" : "Preparando…"}>
          <Upload className="h-4 w-4" aria-hidden /> Preparar para YouTube
        </BotonEnviar>
      </form>
      {preparado.error && <Aviso>{preparado.error}</Aviso>}
      {preparado.video && <FormularioYoutube key={preparado.video} video={preparado.video} titulo={preparado.titulo ?? ""} texto={preparado.texto ?? ""} privacidad={privacidad} />}
    </div>
  );
}

function FormularioYoutube({ video, titulo, texto, privacidad }: { video: string; titulo: string; texto: string; privacidad: keyof typeof PRIVACIDAD }) {
  const [estado, enviar] = useActionState<EstadoYoutube, FormData>(accionSubirYoutube, {});
  return (
    <form action={enviar} className="grid gap-4 rounded-2xl border border-borde p-4 sm:grid-cols-[220px_1fr]">
      <input type="hidden" name="video" value={video} />
      <video src={video} controls playsInline className="w-full max-w-[220px] rounded-xl border border-borde" />
      <div className="space-y-4">
        <label className="block space-y-1 text-sm">
          <span className="text-texto-suave">Título (máximo 100 caracteres)</span>
          <input name="titulo" defaultValue={titulo} maxLength={100} required className="campo w-full" />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-texto-suave">Descripción (se agrega #Shorts)</span>
          <textarea name="descripcion" defaultValue={texto} maxLength={4900} rows={6} className="campo w-full text-sm" />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-texto-suave">Privacidad</span>
          <select name="privacidad" defaultValue={privacidad} className="campo w-full">
            {Object.entries(PRIVACIDAD).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
        {estado.error && <Aviso>{estado.error}</Aviso>}
        {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
        <BotonEnviar className="boton boton-primario" cargando="Subiendo a YouTube…">
          <Clapperboard className="h-4 w-4" aria-hidden /> Subir a YouTube
        </BotonEnviar>
      </div>
    </form>
  );
}

export function BotonShortDelDia() {
  const [estado, enviar] = useActionState<EstadoYoutube, FormData>(() => accionShortDelDia(), {});
  return (
    <form action={enviar} className="space-y-2">
      <BotonEnviar className="boton boton-secundario text-sm" cargando="Subiendo el Short…">
        <Clapperboard className="h-4 w-4" aria-hidden /> Subir ya el Short de hoy
      </BotonEnviar>
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
    </form>
  );
}

export function BotonDesconectarYoutube() {
  const [estado, enviar] = useActionState<EstadoYoutube, FormData>(() => accionDesconectarYoutube(), {});
  return (
    <form action={enviar}>
      <BotonEnviar className="boton boton-fantasma text-sm" cargando="Desconectando…">
        <Unplug className="h-4 w-4" aria-hidden /> Desconectar
      </BotonEnviar>
      {estado.mensaje && <Aviso tipo="info">{estado.mensaje}</Aviso>}
    </form>
  );
}
