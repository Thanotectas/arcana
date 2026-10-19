"use client";

import { useActionState, useState } from "react";
import { RefreshCw, Send, Unplug, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  accionDesconectarTiktok,
  accionEnviarTiktok,
  accionEstadosTiktok,
  accionPrepararTiktok,
  accionSubidaTiktok,
  type EstadoEnvioTiktok,
  type EstadoPrepararTiktok,
} from "@/lib/redes/acciones-tiktok";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

const PRIVACIDAD: Record<string, string> = {
  PUBLIC_TO_EVERYONE: "Todo el mundo",
  MUTUAL_FOLLOW_FRIENDS: "Amigos (se siguen mutuamente)",
  FOLLOWER_OF_CREATOR: "Seguidores",
  SELF_ONLY: "Solo yo",
};

export interface FuenteTiktok {
  valor: string;
  etiqueta: string;
}

/**
 * Envío a TikTok desde el panel. Sigue las pautas de TikTok para publicar
 * por API: muestra la cuenta de destino, la privacidad se elige cada vez (sin
 * valor por defecto), comentarios, dúo y stitch vienen apagados y respetan lo
 * que la cuenta tenga desactivado, y está la divulgación de contenido
 * comercial con su declaración.
 */
export function PublicarTiktok({ fuentes, directo }: { fuentes: FuenteTiktok[]; directo: boolean }) {
  const [fuente, setFuente] = useState(fuentes[0]?.valor ?? "subida");
  const [subiendo, setSubiendo] = useState(false);
  const [preparado, preparar] = useActionState<EstadoPrepararTiktok, FormData>(async (prev, fd) => {
    if (fd.get("fuente") === "subida") {
      const archivo = fd.get("archivo");
      if (!(archivo instanceof File) || !archivo.size) return { error: "Elige un video MP4." };
      if (archivo.type !== "video/mp4") return { error: "El video debe ser MP4." };
      if (archivo.size > 50 * 1024 * 1024) return { error: "El video pesa más de 50 MB." };
      setSubiendo(true);
      try {
        const permiso = await accionSubidaTiktok();
        if (!permiso.ruta || !permiso.token) return { error: permiso.error ?? "No se pudo preparar la subida." };
        const { error } = await createClient().storage.from("redes").uploadToSignedUrl(permiso.ruta, permiso.token, archivo, { contentType: "video/mp4" });
        if (error) return { error: `Subida: ${error.message}` };
        fd.set("fuente", `subida:${permiso.ruta}`);
      } finally {
        setSubiendo(false);
      }
    }
    fd.delete("archivo");
    return accionPrepararTiktok(prev, fd);
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
          <Upload className="h-4 w-4" aria-hidden /> Preparar para TikTok
        </BotonEnviar>
      </form>
      {preparado.error && <Aviso>{preparado.error}</Aviso>}
      {preparado.video && preparado.creador && <FormularioTiktok key={preparado.video} video={preparado.video} texto={preparado.texto ?? ""} creador={preparado.creador} directo={directo} />}
    </div>
  );
}

/** Sin el permiso video.publish (app aprobada solo con borradores) queda únicamente «Enviar a mis borradores». */
function FormularioTiktok({ video, texto, creador, directo }: { video: string; texto: string; creador: NonNullable<EstadoPrepararTiktok["creador"]>; directo: boolean }) {
  const [estado, enviar] = useActionState<EstadoEnvioTiktok, FormData>(accionEnviarTiktok, {});
  const [privacidad, setPrivacidad] = useState("");
  const [divulgar, setDivulgar] = useState(false);
  const [tuMarca, setTuMarca] = useState(false);
  const [deMarca, setDeMarca] = useState(false);
  const faltaMarca = divulgar && !tuMarca && !deMarca;
  const interacciones = [
    { nombre: "comentarios", texto: "Permitir comentarios", apagado: creador.comment_disabled },
    { nombre: "duo", texto: "Permitir dúo", apagado: creador.duet_disabled },
    { nombre: "stitch", texto: "Permitir stitch", apagado: creador.stitch_disabled },
  ];

  return (
    <form action={enviar} className="space-y-4 rounded-2xl border border-borde p-4">
      <input type="hidden" name="video" value={video} />
      <div className="flex items-center gap-3">
        {creador.creator_avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creador.creator_avatar_url} alt="" className="h-10 w-10 rounded-full border border-borde" />
        )}
        <p className="text-sm">
          Se publica en <strong>{creador.creator_nickname ?? "tu cuenta"}</strong>
          {creador.creator_username && <span className="text-texto-suave"> @{creador.creator_username}</span>}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <video src={video} controls playsInline className="w-full max-w-[220px] rounded-xl border border-borde" />
        <div className="space-y-4">
          {directo && (
            <>
              <label className="block space-y-1 text-sm">
                <span className="text-texto-suave">Texto del video</span>
                <textarea name="titulo" defaultValue={texto} maxLength={2200} rows={7} className="campo w-full text-sm" />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="text-texto-suave">¿Quién puede ver este video?</span>
                <select name="privacidad" required value={privacidad} onChange={(e) => setPrivacidad(e.target.value)} className="campo w-full">
                  <option value="" disabled>
                    Elige una opción
                  </option>
                  {creador.privacy_level_options.map((p) => (
                    <option key={p} value={p} disabled={deMarca && p === "SELF_ONLY"}>
                      {PRIVACIDAD[p] ?? p}
                      {deMarca && p === "SELF_ONLY" ? " (no disponible para contenido de marca)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="space-y-1 text-sm">
                {interacciones.map((i) => (
                  <label key={i.nombre} className={`flex items-center gap-2 ${i.apagado ? "text-texto-suave" : ""}`}>
                    <input type="checkbox" name={i.nombre} disabled={i.apagado} />
                    {i.texto}
                    {i.apagado && <span className="text-xs">(desactivado en la configuración de tu cuenta)</span>}
                  </label>
                ))}
              </fieldset>

              <fieldset className="space-y-2 rounded-xl border border-borde p-3 text-sm">
                <label className="flex items-center gap-2 font-medium">
                  <input type="checkbox" name="divulgar" checked={divulgar} onChange={(e) => setDivulgar(e.target.checked)} />
                  Divulgar contenido comercial
                </label>
                <p className="text-xs text-texto-suave">Actívalo si el video promociona una marca, un producto o un servicio.</p>
                {divulgar && (
                  <div className="space-y-2 pl-6">
                    <label className="flex items-start gap-2">
                      <input type="checkbox" name="tu_marca" checked={tuMarca} onChange={(e) => setTuMarca(e.target.checked)} className="mt-1" />
                      <span>
                        Tu marca <span className="block text-xs text-texto-suave">Promocionas tu propio negocio. El video se etiquetará como «Contenido promocional».</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        name="de_marca"
                        checked={deMarca}
                        onChange={(e) => {
                          setDeMarca(e.target.checked);
                          if (e.target.checked && privacidad === "SELF_ONLY") setPrivacidad("");
                        }}
                        className="mt-1"
                      />
                      <span>
                        Contenido de marca <span className="block text-xs text-texto-suave">Promocionas a otra marca o a un tercero. El video se etiquetará como «Colaboración pagada».</span>
                      </span>
                    </label>
                    {faltaMarca && <p className="text-xs text-peligro">Elige al menos una opción para publicar.</p>}
                  </div>
                )}
              </fieldset>

              <p className="text-xs text-texto-suave">
                Al publicar, aceptas{" "}
                {deMarca && (
                  <>
                    la{" "}
                    <a href="https://www.tiktok.com/legal/page/global/bc-policy/es" target="_blank" rel="noreferrer" className="underline">
                      Política de contenido de marca
                    </a>{" "}
                    y{" "}
                  </>
                )}
                la{" "}
                <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/es" target="_blank" rel="noreferrer" className="underline">
                  Confirmación de uso de música
                </a>{" "}
                de TikTok.
                {creador.max_video_post_duration_sec ? ` Esta cuenta admite videos de hasta ${creador.max_video_post_duration_sec} segundos.` : ""}
              </p>
            </>
          )}

          {estado.error && <Aviso>{estado.error}</Aviso>}
          {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}

          <div className="flex flex-wrap gap-2">
            {directo && (
              <button type="submit" name="modo" value="directo" disabled={faltaMarca || !privacidad} className="boton boton-primario disabled:opacity-40">
                <Send className="h-4 w-4" aria-hidden /> Publicar en TikTok
              </button>
            )}
            <button type="submit" name="modo" value="borrador" formNoValidate className="boton boton-secundario">
              Enviar a mis borradores
            </button>
          </div>
          <p className="text-xs text-texto-suave">«Enviar a mis borradores» lo deja en la bandeja de la app de TikTok para que elijas allí el sonido, el texto y la privacidad.</p>
        </div>
      </div>
    </form>
  );
}

export function BotonEstadosTiktok() {
  const [estado, enviar] = useActionState<EstadoEnvioTiktok, FormData>(() => accionEstadosTiktok(), {});
  return (
    <form action={enviar} className="space-y-2">
      <BotonEnviar className="boton boton-fantasma text-sm" cargando="Consultando…">
        <RefreshCw className="h-4 w-4" aria-hidden /> Actualizar estado
      </BotonEnviar>
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="info">{estado.mensaje}</Aviso>}
    </form>
  );
}

export function BotonDesconectarTiktok() {
  const [estado, enviar] = useActionState<EstadoEnvioTiktok, FormData>(() => accionDesconectarTiktok(), {});
  return (
    <form action={enviar}>
      <BotonEnviar className="boton boton-fantasma text-sm" cargando="Desconectando…">
        <Unplug className="h-4 w-4" aria-hidden /> Desconectar
      </BotonEnviar>
      {estado.mensaje && <Aviso tipo="info">{estado.mensaje}</Aviso>}
    </form>
  );
}
