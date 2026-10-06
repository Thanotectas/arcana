import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NOMBRE_TIPO, fechaLargaEs, lunesDe, sumarDias, type PublicacionProgramada } from "@/lib/redes/calendario";
import { urlImagenPublicacion } from "@/lib/redes/publicar";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { instagramConfigurado } from "@/lib/redes/instagram";
import { facebookConfigurado } from "@/lib/redes/facebook";
import { TarjetaPublicacion, type PublicacionVista } from "@/components/admin/TarjetaPublicacion";
import { FormularioGenerar } from "@/components/admin/FormularioGenerar";

// Generar una semana pide los textos a Sibila: puede tardar medio minuto.
export const maxDuration = 120;

export const metadata: Metadata = { title: "Agente de redes", robots: { index: false, follow: false } };

function vista(p: PublicacionProgramada): PublicacionVista {
  return {
    id: p.id,
    fecha: p.fecha,
    fechaTexto: fechaLargaEs(p.fecha),
    tipoNombre: NOMBRE_TIPO[p.tipo],
    etiqueta: p.etiqueta,
    titulo: p.titulo,
    extracto: p.extracto,
    texto: p.texto,
    redes: p.redes,
    estado: p.estado,
    detalle: p.detalle,
    resultados: p.resultados,
    imagen: urlImagenPublicacion(p),
  };
}

/** Panel del agente de redes: borradores por aprobar, programadas e historial. Solo administración. */
export default async function PaginaAdminRedes() {
  await requerirAdmin();
  const hoy = fechaBogota();
  const desde = sumarDias(hoy, -14);
  const { data } = await getSupabaseAdmin()
    .from("publicaciones_programadas")
    .select("*")
    .gte("fecha", desde)
    .neq("estado", "descartada")
    .order("fecha")
    .limit(60);
  const todas = (data ?? []) as PublicacionProgramada[];
  const porAprobar = todas.filter((p) => p.estado === "borrador" && p.fecha >= hoy);
  const programadas = todas.filter((p) => (p.estado === "aprobada" || p.estado === "publicando") && p.fecha >= sumarDias(hoy, -2));
  const historial = todas.filter((p) => !porAprobar.includes(p) && !programadas.includes(p)).reverse();
  const lunes = lunesDe(hoy);
  const semanaActualCompleta = todas.some((p) => p.semana === lunes);
  const proximaLista = todas.some((p) => p.semana === sumarDias(lunes, 7));

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Agente de redes</h1>
        <p className="mt-2 text-texto-suave">
          Sibila escribe cada semana una publicación por día; aquí apruebas, editas o descartas. Lo aprobado sale a mediodía (hora de Bogotá) en{" "}
          {instagramConfigurado() ? "Instagram" : <span className="text-peligro">Instagram (sin configurar)</span>} y{" "}
          {facebookConfigurado() ? "Facebook" : <span className="text-peligro">Facebook (sin configurar)</span>}. La carta del día sigue saliendo sola a las 7:00.
        </p>
        <div className="mt-4">
          <FormularioGenerar semanaActual={!semanaActualCompleta} proxima={!proximaLista} />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Por aprobar <span className="text-base text-texto-suave">({porAprobar.length})</span></h2>
        {porAprobar.length ? porAprobar.map((p) => <TarjetaPublicacion key={p.id} p={vista(p)} />) : <p className="text-sm text-texto-suave">No hay borradores pendientes. Los de la próxima semana se generan solos el viernes.</p>}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Programadas <span className="text-base text-texto-suave">({programadas.length})</span></h2>
        {programadas.length ? programadas.map((p) => <TarjetaPublicacion key={p.id} p={vista(p)} />) : <p className="text-sm text-texto-suave">Nada programado todavía.</p>}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Últimos 14 días</h2>
        {historial.length ? historial.map((p) => <TarjetaPublicacion key={p.id} p={vista(p)} />) : <p className="text-sm text-texto-suave">Aún no se ha publicado nada desde el agente.</p>}
      </section>
    </div>
  );
}
