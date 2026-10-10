import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NOMBRE_TIPO, fechaLargaEs, lunesDe, sumarDias, type PublicacionProgramada } from "@/lib/redes/calendario";
import { urlImagenPublicacion } from "@/lib/redes/publicar";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { instagramConfigurado } from "@/lib/redes/instagram";
import { diagnosticoFacebook, facebookConfigurado } from "@/lib/redes/facebook";
import { TarjetaPublicacion, type PublicacionVista } from "@/components/admin/TarjetaPublicacion";
import { FormularioGenerar } from "@/components/admin/FormularioGenerar";
import { VistaReel } from "@/components/admin/VistaReel";

// Generar una semana (Sibila) o el reel de la carta del día puede tardar medio minuto o más.
export const maxDuration = 300;

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
  const [{ data: cartaDia }, diagnostico] = await Promise.all([
    getSupabaseAdmin().from("publicaciones_redes").select("red, fecha, estado, detalle, referencia").gte("fecha", sumarDias(hoy, -6)).order("fecha", { ascending: false }).limit(20),
    diagnosticoFacebook().catch((e) => ({ pagina: null, fuenteToken: null, esTokenDePagina: false, error: e instanceof Error ? e.message : String(e) }) as Awaited<ReturnType<typeof diagnosticoFacebook>>),
  ]);
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

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Carta del día en video</h2>
        <p className="text-sm text-texto-suave">
          Cada mañana la carta del día sale como reel de 10 segundos en Instagram y como video en Facebook, con la invitación a una tirada de tres cartas. Si el video falla, se publica la imagen de siempre.
        </p>
        <VistaReel />

        <h3 className="pt-4 font-semibold">Últimos 7 días</h3>
        {cartaDia?.length ? (
          <ul className="space-y-1 text-sm">
            {cartaDia.map((p) => (
              <li key={`${p.red}-${p.fecha}`} className="flex flex-wrap gap-x-3">
                <span className="w-24 text-texto-suave">{p.fecha}</span>
                <span className="w-24">{p.red === "instagram" ? "Instagram" : "Facebook"}</span>
                <span className={p.estado === "publicada" ? "text-exito" : p.estado === "error" ? "text-peligro" : "text-oro-suave"}>{p.estado}</span>
                {p.detalle && <span className="basis-full pl-[12.5rem] text-xs text-peligro">{p.detalle}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-texto-suave">Aún no hay publicaciones registradas.</p>
        )}

        <h3 className="pt-4 font-semibold">Diagnóstico de Facebook</h3>
        <div className="space-y-1 text-sm">
          <p>Página configurada: {diagnostico.pagina ?? <span className="text-peligro">falta FB_PAGE_ID</span>}{diagnostico.nombrePagina ? ` · ${diagnostico.nombrePagina}` : ""}</p>
          <p>Token usado: {diagnostico.fuenteToken ?? <span className="text-peligro">ninguno</span>}{diagnostico.identidad ? ` · pertenece a «${diagnostico.identidad.name ?? diagnostico.identidad.id}»` : ""}</p>
          {diagnostico.error ? (
            <p className="text-peligro">{diagnostico.error}</p>
          ) : diagnostico.esTokenDePagina ? (
            <p className="text-exito">El token es el de la página: Arcana puede publicar en ella.</p>
          ) : (
            <p className="text-peligro">El token no es el de la página (es de un usuario o de otra página). Para publicar como «Mi Arcana» hace falta el token de acceso de la página en FB_PAGE_TOKEN, con el permiso pages_manage_posts.</p>
          )}
        </div>
      </section>

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
