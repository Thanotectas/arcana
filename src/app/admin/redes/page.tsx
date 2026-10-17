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
import { ConexionMeta } from "@/components/admin/ConexionMeta";
import { estadoSuscripcion, metaConfigurado } from "@/lib/redes/meta";

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
  const [{ data: cartaDia }, diagnostico, { data: interacciones }, suscripcion] = await Promise.all([
    getSupabaseAdmin().from("publicaciones_redes").select("red, fecha, estado, detalle, referencia").gte("fecha", sumarDias(hoy, -6)).order("fecha", { ascending: false }).limit(20),
    diagnosticoFacebook(),
    getSupabaseAdmin().from("interacciones_redes").select("id, red, tipo, remitente, texto, respuesta, estado, humano, detalle, creado_en").order("creado_en", { ascending: false }).limit(40),
    metaConfigurado() ? estadoSuscripcion() : Promise.resolve(null),
  ]);
  const hora = (iso: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(iso));
  const lunes = lunesDe(hoy);
  const semanaActualCompleta = todas.some((p) => p.semana === lunes);
  const proximaLista = todas.some((p) => p.semana === sumarDias(lunes, 7));

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Agente de redes</h1>
        <p className="mt-2 text-texto-suave">
          Sibila escribe cada semana una publicación por día, cada una sobre una función de la app (lecturas, guías, signo, luna); aquí apruebas, editas o descartas. Lo aprobado sale a mediodía (hora de Bogotá) como reel en{" "}
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
          <p>Página: {diagnostico.pagina ? `${diagnostico.nombrePagina ?? ""} (id ${diagnostico.pagina})` : <span className="text-peligro">sin identificar</span>}</p>
          <p>Token usado: {diagnostico.fuenteToken ?? <span className="text-peligro">ninguno</span>}{diagnostico.origen === "cuentas_del_usuario" ? " · es de usuario; se usa el de la página que administra" : diagnostico.origen === "token_de_pagina" ? " · token de página" : ""}</p>
          {diagnostico.error ? (
            <p className="text-peligro">{diagnostico.error}</p>
          ) : (
            <p className="text-exito">Arcana puede publicar en la página (si el token tiene pages_manage_posts).</p>
          )}
          {diagnostico.avisoId && <p className="text-xs text-oro-suave">{diagnostico.avisoId}</p>}
        </div>
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Sibila en comentarios y mensajes</h2>
        <p className="text-sm text-texto-suave">
          Cuando alguien comenta una publicación (por ejemplo su signo) o escribe por mensaje directo en Instagram o Facebook, Sibila responde con una línea personal y la invitación a la carta del día. Si piden hablar con una persona, llega un correo. Topes: 200 comentarios y 150 mensajes al día.
        </p>
        {!metaConfigurado() ? (
          <p className="text-sm text-peligro">Falta META_PAGE_TOKEN (o FB_PAGE_TOKEN) en Vercel.</p>
        ) : suscripcion?.error ? (
          <p className="text-sm text-peligro">No se pudo leer la suscripción: {suscripcion.error}</p>
        ) : suscripcion?.suscrita ? (
          <p className="text-sm text-exito">
            Página conectada{suscripcion.pagina?.nombre ? ` («${suscripcion.pagina.nombre}»` : ""}{suscripcion.pagina?.nombre ? (suscripcion.pagina.instagram ? ", con Instagram vinculado)" : ", sin Instagram vinculado)") : ""}: avisos de comentarios y mensajes activos{process.env.REDES_RESPUESTAS === "0" ? " (respuestas apagadas con REDES_RESPUESTAS=0)" : ""}.
          </p>
        ) : (
          <p className="text-sm text-oro-suave">La página aún no está suscrita a los avisos{suscripcion?.campos.length ? ` (campos actuales: ${suscripcion.campos.join(", ")})` : ""}.</p>
        )}
        {metaConfigurado() && <ConexionMeta suscrita={Boolean(suscripcion?.suscrita)} />}
        <h3 className="pt-3 font-semibold">Últimas interacciones</h3>
        {interacciones?.length ? (
          <ul className="space-y-2 text-sm">
            {interacciones.map((i) => (
              <li key={i.id} className="rounded-xl border border-borde p-3">
                <p className="text-xs text-texto-suave">
                  {hora(i.creado_en)} · {i.red === "instagram" ? "Instagram" : "Facebook"} · {i.tipo}{i.remitente ? ` · ${i.remitente}` : ""} ·{" "}
                  <span className={i.estado === "respondida" ? "text-exito" : i.estado === "error" ? "text-peligro" : "text-oro-suave"}>{i.estado}</span>
                  {i.humano ? " · pide persona" : ""}
                </p>
                <p className="mt-1">{i.texto}</p>
                {i.respuesta && <p className="mt-1 text-violeta-suave">Sibila: {i.respuesta}</p>}
                {i.detalle && <p className="mt-1 text-xs text-texto-suave">{i.detalle}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-texto-suave">Aún no hay comentarios ni mensajes registrados.</p>
        )}
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
