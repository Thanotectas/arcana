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
import { BotonMetricas } from "@/components/admin/BotonMetricas";
import { BotonesAutomaticas } from "@/components/admin/BotonesAutomaticas";
import { interacciones, promediosPorTipo, type MetricaRed } from "@/lib/redes/metricas";
import { estadoSuscripcion, metaConfigurado } from "@/lib/redes/meta";
import { cuentaTiktok, tiktokConfigurado } from "@/lib/redes/tiktok";
import { BotonDesconectarTiktok, BotonEstadosTiktok, PublicarTiktok, type FuenteTiktok } from "@/components/admin/PublicarTiktok";
import { Aviso } from "@/components/Aviso";

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
export default async function PaginaAdminRedes({ searchParams }: { searchParams: Promise<{ tiktok?: string; motivo?: string }> }) {
  await requerirAdmin();
  const avisoTiktok = await searchParams;
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
  const [{ data: cartaDia }, diagnostico, { data: ultimasInteracciones }, suscripcion, { data: metricasData }] = await Promise.all([
    getSupabaseAdmin().from("publicaciones_redes").select("red, tipo, fecha, estado, detalle, referencia").gte("fecha", sumarDias(hoy, -7)).order("fecha", { ascending: false }).order("tipo").limit(40),
    diagnosticoFacebook(),
    getSupabaseAdmin().from("interacciones_redes").select("id, red, tipo, remitente, texto, respuesta, estado, humano, detalle, creado_en").order("creado_en", { ascending: false }).limit(40),
    metaConfigurado() ? estadoSuscripcion() : Promise.resolve(null),
    getSupabaseAdmin().from("metricas_redes").select("*").gte("fecha", sumarDias(hoy, -14)).order("fecha", { ascending: false }).limit(80),
  ]);
  const [tiktok, { data: enviosTiktok }] = await Promise.all([
    tiktokConfigurado() ? cuentaTiktok(getSupabaseAdmin()) : Promise.resolve(null),
    getSupabaseAdmin().from("publicaciones_tiktok").select("id, modo, titulo, privacidad, estado, post_id, detalle, creado_en").order("creado_en", { ascending: false }).limit(10),
  ]);
  const fuentesTiktok: FuenteTiktok[] = [
    { valor: "carta", etiqueta: "Carta del día de hoy" },
    ...todas
      .filter((p) => (p.estado === "publicada" || p.estado === "aprobada") && p.fecha >= sumarDias(hoy, -3) && p.fecha <= hoy)
      .reverse()
      .map((p) => ({ valor: `pub:${p.id}`, etiqueta: `${fechaLargaEs(p.fecha)} · ${p.etiqueta}: ${p.titulo}`.slice(0, 90) })),
  ];
  const ESTADO_TIKTOK: Record<string, string> = { enviando: "Enviando", procesando: "TikTok lo está procesando", en_borradores: "En tus borradores de TikTok", publicada: "Publicado", error: "Error" };
  const metricas = (metricasData ?? []) as MetricaRed[];
  const porTipo = promediosPorTipo(metricas);
  const cifra = (n: number | null) => (n === null ? "—" : n.toLocaleString("es-CO"));
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

        <h3 className="pt-4 font-semibold">Automáticas</h3>
        <p className="text-sm text-texto-suave">
          Cada mañana sale también la <strong>historia</strong> de la carta del día (Instagram y Facebook) y te llega el <strong>kit de TikTok</strong> con los videos de ayer y el texto para pegar. Los lunes sale el <strong>carrusel «Tu signo esta semana»</strong>, escrito por Sibila. Si algo ya salió, el botón no lo repite.
        </p>
        <BotonesAutomaticas />

        <h3 className="pt-4 font-semibold">Últimos 7 días</h3>
        {cartaDia?.length ? (
          <ul className="space-y-1 text-sm">
            {cartaDia.map((p) => (
              <li key={`${p.red}-${p.tipo}-${p.fecha}`} className="flex flex-wrap gap-x-3">
                <span className="w-24 text-texto-suave">{p.fecha}</span>
                <span className="w-24">{p.red === "instagram" ? "Instagram" : p.red === "facebook" ? "Facebook" : "Correo"}</span>
                <span className="w-36 text-texto-suave">{({ carta_dia: "Carta del día", historia: "Historia", carrusel: "Carrusel", kit_tiktok: "Kit TikTok" } as Record<string, string>)[p.tipo] ?? p.tipo}</span>
                <span className={p.estado === "publicada" ? "text-exito" : p.estado === "error" ? "text-peligro" : "text-oro-suave"}>{p.estado}</span>
                {p.tipo === "carrusel" && p.estado === "publicada" && p.red === "instagram" ? (
                  <a href={`/api/redes/carrusel?semana=${p.fecha}&n=0`} target="_blank" rel="noreferrer" className="text-xs text-violeta-suave underline">ver láminas</a>
                ) : null}
                {p.detalle && <span className="basis-full text-xs text-peligro">{p.detalle}</span>}
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
          {diagnostico.tokenDeUsuario && <p className="text-xs text-oro-suave">{`${diagnostico.fuenteToken} es un token de usuario: funciona, pero vence. Cámbialo por el token de la página (en el Explorador: 1337589612768238?fields=name,access_token).`}</p>}
        </div>
      </section>

      <section id="tiktok" className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">TikTok</h2>
        {avisoTiktok.tiktok === "conectada" && <Aviso tipo="exito">TikTok quedó conectado.</Aviso>}
        {avisoTiktok.tiktok === "error" && <Aviso>{`No se pudo conectar TikTok: ${avisoTiktok.motivo ?? "error desconocido"}`}</Aviso>}
        {!tiktokConfigurado() ? (
          <p className="text-sm text-texto-suave">
            Falta configurar la app de TikTok: agrega <code>TIKTOK_CLIENT_KEY</code> y <code>TIKTOK_CLIENT_SECRET</code> en Vercel (developers.tiktok.com → tu app → Credentials).
          </p>
        ) : !tiktok ? (
          <div className="space-y-2">
            <p className="text-sm text-texto-suave">Conecta la cuenta de TikTok de Arcana para enviar los videos desde aquí. Entra con la cuenta de la marca cuando TikTok lo pida.</p>
            <a href="/api/tiktok/conectar" className="boton boton-primario">Conectar TikTok</a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {tiktok.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tiktok.avatar} alt="" className="h-10 w-10 rounded-full border border-borde" />
              )}
              <p className="text-sm">
                Conectado: <strong>{tiktok.nombre ?? "cuenta de TikTok"}</strong>
                {tiktok.usuario && <span className="text-texto-suave"> @{tiktok.usuario}</span>}
                {tiktok.refresh_expira_en && <span className="block text-xs text-texto-suave">{`El permiso vence el ${new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date(tiktok.refresh_expira_en))}; antes de esa fecha, vuelve a conectar.`}</span>}
              </p>
              <BotonDesconectarTiktok />
            </div>
            <p className="text-sm text-texto-suave">
              Mientras TikTok no apruebe la app, lo que se publique directo queda en privado (Solo yo): usa «Enviar a mis borradores» y termina de publicarlo en la app con un sonido en tendencia.
            </p>
            <PublicarTiktok fuentes={fuentesTiktok} directo={(tiktok.scopes ?? "").split(",").includes("video.publish")} />
            {(enviosTiktok ?? []).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">Envíos recientes</h3>
                  <BotonEstadosTiktok />
                </div>
                <ul className="divide-y divide-borde text-sm">
                  {(enviosTiktok ?? []).map((e) => (
                    <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 py-2">
                      <span className="w-28 text-texto-suave">{hora(e.creado_en)}</span>
                      <span className="w-24">{e.modo === "borrador" ? "Borrador" : "Directo"}</span>
                      <span className={e.estado === "error" ? "text-peligro" : e.estado === "publicada" ? "text-exito" : ""}>{ESTADO_TIKTOK[e.estado] ?? e.estado}</span>
                      {e.privacidad && <span className="text-texto-suave">· {e.privacidad}</span>}
                      {e.estado === "error" && e.detalle && <span className="basis-full text-xs text-peligro">{e.detalle}</span>}
                      {e.titulo && <span className="basis-full truncate text-xs text-texto-suave">{e.titulo}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Sibila en comentarios y mensajes</h2>
        <p className="text-sm text-texto-suave">
          Cuando alguien comenta una publicación (por ejemplo su signo) o escribe por mensaje directo en Instagram o Facebook, Sibila responde con una línea personal y la invitación a la carta del día. Si piden hablar con una persona, llega un correo. Topes: 200 comentarios y 150 mensajes al día.
        </p>
        {!metaConfigurado() ? (
          <p className="text-sm text-peligro">Falta META_PAGE_TOKEN (o FB_PAGE_TOKEN) en Vercel.</p>
        ) : suscripcion?.error ? (
          <p className="text-sm text-peligro">
            {suscripcion.pagina ? `Página «${suscripcion.pagina.nombre ?? suscripcion.pagina.id}» encontrada, pero no` : "No"} se pudo leer la suscripción: {suscripcion.error}
          </p>
        ) : suscripcion?.suscrita ? (
          <p className="text-sm text-exito">
            Página conectada{suscripcion.pagina?.nombre ? ` («${suscripcion.pagina.nombre}»` : ""}{suscripcion.pagina?.nombre ? (suscripcion.pagina.instagram ? ", con Instagram vinculado)" : ", sin Instagram vinculado)") : ""}: avisos de comentarios y mensajes activos{process.env.REDES_RESPUESTAS === "0" ? " (respuestas apagadas con REDES_RESPUESTAS=0)" : ""}.
          </p>
        ) : (
          <p className="text-sm text-oro-suave">
            {suscripcion?.campos.length
              ? `Suscrita en parte: ${suscripcion.campos.includes("feed") ? "comentarios ✓" : "comentarios ✗"} · ${suscripcion.campos.includes("messages") ? "mensajes ✓" : "mensajes ✗"}.`
              : "La página aún no está suscrita a los avisos."}
          </p>
        )}
        {suscripcion?.tokenDeUsuario && <p className="text-xs text-oro-suave">META_PAGE_TOKEN es un token de usuario: funciona, pero vence. Cámbialo por el token de la página.</p>}
        {metaConfigurado() && <ConexionMeta suscrita={Boolean(suscripcion?.suscrita)} />}
        <h3 className="pt-3 font-semibold">Últimas interacciones</h3>
        {ultimasInteracciones?.length ? (
          <ul className="space-y-2 text-sm">
            {ultimasInteracciones.map((i) => (
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

      <section className="tarjeta space-y-4 p-5">
        <h2 className="font-display text-2xl font-semibold">Rendimiento (últimos 14 días)</h2>
        <p className="text-sm text-texto-suave">
          Cifras de Meta de cada publicación, actualizadas cada mediodía. Interacciones = me gusta + comentarios + guardados + compartidos. Las vistas, el alcance y los guardados de Instagram necesitan el permiso instagram_manage_insights en el token.
        </p>
        <BotonMetricas />
        {porTipo.length > 0 && (
          <div>
            <h3 className="font-semibold">Qué funciona mejor</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {porTipo.map((t, i) => (
                <li key={t.tipo} className="flex flex-wrap gap-x-3">
                  <span className="w-6 text-texto-suave">{i + 1}.</span>
                  <span className="min-w-48 font-medium">{t.tipo}</span>
                  <span className="text-oro-suave">{t.interacciones} interacciones por publicación</span>
                  <span className="text-texto-suave">{t.vistas !== null ? `${cifra(t.vistas)} vistas en promedio · ` : ""}{t.publicaciones} publicaciones</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {metricas.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-texto-suave">
                <tr>
                  <th className="py-2 pr-3 font-normal">Fecha</th>
                  <th className="py-2 pr-3 font-normal">Publicación</th>
                  <th className="py-2 pr-3 font-normal">Red</th>
                  <th className="py-2 pr-3 text-right font-normal">Vistas</th>
                  <th className="py-2 pr-3 text-right font-normal">Me gusta</th>
                  <th className="py-2 pr-3 text-right font-normal">Coment.</th>
                  <th className="py-2 pr-3 text-right font-normal">Guard.</th>
                  <th className="py-2 pr-3 text-right font-normal">Compart.</th>
                  <th className="py-2 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody>
                {metricas.map((m) => (
                  <tr key={m.id} className="border-t border-borde" title={m.detalle ?? undefined}>
                    <td className="py-2 pr-3 text-texto-suave">{m.fecha.slice(5)}</td>
                    <td className="py-2 pr-3">{m.tipo}{m.formato ? <span className="text-texto-suave"> · {m.formato}</span> : null}</td>
                    <td className="py-2 pr-3">{m.red === "instagram" ? "IG" : "FB"}</td>
                    <td className="py-2 pr-3 text-right">{cifra(m.vistas)}</td>
                    <td className="py-2 pr-3 text-right">{cifra(m.me_gusta)}</td>
                    <td className="py-2 pr-3 text-right">{cifra(m.comentarios)}</td>
                    <td className="py-2 pr-3 text-right">{cifra(m.guardados)}</td>
                    <td className="py-2 pr-3 text-right">{cifra(m.compartidos)}</td>
                    <td className="py-2 text-right font-semibold text-oro-suave">{interacciones(m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-texto-suave">Aún no hay cifras. Pulsa «Actualizar cifras ahora» o espera al mediodía.</p>
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
