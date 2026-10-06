"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { accionPublicacion, type EstadoAdminRedes } from "@/lib/redes/acciones";
import { Aviso } from "@/components/Aviso";

/** Botón de envío con nombre y valor: muestra el giro solo en el que se pulsó. */
function BotonAccion({ valor, className = "boton boton-secundario", children }: { valor: string; className?: string; children: React.ReactNode }) {
  const { pending, data } = useFormStatus();
  const activo = pending && data?.get("accion") === valor;
  return (
    <button type="submit" name="accion" value={valor} disabled={pending} className={className} aria-busy={activo}>
      {activo ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export interface PublicacionVista {
  id: string;
  fecha: string;
  fechaTexto: string;
  tipoNombre: string;
  etiqueta: string;
  titulo: string;
  extracto: string;
  texto: string;
  redes: string[];
  estado: string;
  detalle: string | null;
  resultados: Record<string, { id?: string; error?: string }>;
  imagen: string;
}

const ESTADO: Record<string, string> = {
  borrador: "Por aprobar",
  aprobada: "Programada",
  publicando: "Publicando…",
  publicada: "Publicada",
  error: "Con error",
  descartada: "Descartada",
};

/** Una publicación del agente: vista previa, textos editables y botones según su estado. */
export function TarjetaPublicacion({ p }: { p: PublicacionVista }) {
  const [estado, enviar] = useActionState<EstadoAdminRedes, FormData>(accionPublicacion, {});
  const editable = p.estado === "borrador" || p.estado === "aprobada" || p.estado === "error";
  const colorEstado = p.estado === "publicada" ? "text-exito" : p.estado === "error" ? "text-peligro" : p.estado === "aprobada" ? "text-oro-suave" : "text-violeta-suave";

  return (
    <article className="tarjeta overflow-hidden">
      <div className="grid gap-5 p-5 md:grid-cols-[260px_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- imagen generada por el servidor, sin optimizar */}
          <img src={p.imagen} alt="" width={1080} height={1350} className="w-full rounded-xl border border-borde" loading="lazy" />
          <p className="mt-2 text-xs text-texto-suave">
            {p.redes.map((r) => {
              const res = p.resultados[r];
              return (
                <span key={r} className="mr-2">
                  {r === "instagram" ? "Instagram" : "Facebook"}
                  {res?.id ? " ✓" : res?.error ? " ✗" : ""}
                </span>
              );
            })}
          </p>
        </div>
        <form action={enviar} className="space-y-3">
          <input type="hidden" name="id" value={p.id} />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-xl font-semibold">{p.fechaTexto}</h3>
            <span className={`text-xs uppercase tracking-[0.2em] ${colorEstado}`}>{ESTADO[p.estado] ?? p.estado}</span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-texto-suave">{p.tipoNombre} · {p.etiqueta}</p>
          {estado.error && <Aviso>{estado.error}</Aviso>}
          {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
          {p.detalle && <Aviso tipo={p.estado === "error" ? "error" : "info"}>{p.detalle}</Aviso>}
          <label className="block text-sm">
            <span className="text-texto-suave">Título de la imagen</span>
            <input name="titulo" defaultValue={p.titulo} maxLength={70} disabled={!editable} className="campo mt-1 w-full" />
          </label>
          <label className="block text-sm">
            <span className="text-texto-suave">Frase de la imagen</span>
            <input name="extracto" defaultValue={p.extracto} maxLength={200} disabled={!editable} className="campo mt-1 w-full" />
          </label>
          <label className="block text-sm">
            <span className="text-texto-suave">Pie de la publicación</span>
            <textarea name="texto" defaultValue={p.texto} rows={8} maxLength={2200} disabled={!editable} className="campo mt-1 w-full" />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            {["instagram", "facebook"].map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input type="checkbox" name={`red_${r}`} defaultChecked={p.redes.includes(r)} disabled={!editable} className="h-4 w-4 accent-[var(--oro)]" />
                {r === "instagram" ? "Instagram" : "Facebook"}
              </label>
            ))}
          </div>
          {editable && (
            <div className="flex flex-wrap gap-2 pt-1">
              {p.estado !== "aprobada" && <BotonAccion valor="aprobar" className="boton boton-primario">Aprobar</BotonAccion>}
              <BotonAccion valor="guardar">Guardar cambios</BotonAccion>
              {p.estado === "aprobada" && <BotonAccion valor="publicar">Publicar ahora</BotonAccion>}
              {p.estado === "aprobada" && <BotonAccion valor="borrador">Volver a borrador</BotonAccion>}
              {p.estado === "error" && <BotonAccion valor="publicar">Reintentar</BotonAccion>}
              <BotonAccion valor="descartar" className="boton boton-secundario text-peligro">Descartar</BotonAccion>
            </div>
          )}
        </form>
      </div>
    </article>
  );
}
