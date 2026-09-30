import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getMensajeDeHoy, cieloDeHoyDePerfil } from "@/lib/diario";
import { circuloActivo, type Perfil } from "@/lib/dal";
import { enviarPush, pushConfigurado, type CargaPush } from "@/lib/push";
import { extractoPlano } from "@/lib/lecturas/memoria";
import { diccionario } from "@/lib/i18n/diccionarios";
import { esIdioma, IDIOMA_PREDETERMINADO } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { signoPorId } from "@/lib/zodiaco";

// Escribe varios mensajes con el modelo: puede tardar minutos.
export const maxDuration = 300;

const CONCURRENCIA = 3;
const MAXIMO_MENSAJES = 60;

/**
 * Cron diario (vercel.json, 09:00 UTC = 04:00 Bogotá): pregenera "Tu cielo hoy"
 * para el Círculo y envía el aviso push a quien lo activó. Vercel manda
 * `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return Response.json({ error: "sin_cron_secret" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secreto}`) return Response.json({ error: "no_autorizado" }, { status: 401 });

  const admin = getSupabaseAdmin();
  const { data: filas, error } = await admin
    .from("perfiles")
    .select("*")
    .not("fecha_nacimiento", "is", null)
    .not("latitud", "is", null)
    .not("zona_horaria", "is", null)
    .limit(1000);
  if (error) return Response.json({ error: "perfiles", detalle: error.message }, { status: 500 });
  const perfiles = (filas ?? []) as Perfil[];
  const miembros = perfiles.filter((p) => circuloActivo(p)).slice(0, MAXIMO_MENSAJES);

  // 1. Mensajes del Círculo (los ya escritos hoy vuelven de la caché).
  const mensajes = new Map<string, string>();
  let escritos = 0;
  let fallidos = 0;
  const cola = [...miembros];
  await Promise.all(
    Array.from({ length: CONCURRENCIA }, async () => {
      for (let p = cola.shift(); p; p = cola.shift()) {
        try {
          const m = await getMensajeDeHoy(p, idiomaDe(p), admin);
          if (m?.contenido) {
            mensajes.set(p.id, m.contenido);
            if (m.recien) escritos++;
          }
        } catch (e) {
          fallidos++;
          console.error("[cron diario] mensaje fallido", p.id, e instanceof Error ? e.message : e);
        }
      }
    }),
  );

  // 2. Avisos push a quien los activó (miembros y no miembros: el cielo del día es para todos).
  let enviados = 0;
  let caducadas = 0;
  if (pushConfigurado() && perfiles.length) {
    const { data: suscripciones } = await admin
      .from("suscripciones_push")
      .select("id, usuario_id, endpoint, p256dh, auth")
      .in("usuario_id", perfiles.map((p) => p.id));
    const porUsuario = new Map(perfiles.map((p) => [p.id, p]));
    const borrar: number[] = [];
    for (const s of suscripciones ?? []) {
      const perfil = porUsuario.get(s.usuario_id);
      if (!perfil) continue;
      const carga = cargaPara(perfil, mensajes.get(perfil.id));
      if (!carga) continue;
      const r = await enviarPush(s, carga);
      if (r === "enviada") enviados++;
      if (r === "caducada") {
        caducadas++;
        borrar.push(s.id);
      }
    }
    if (borrar.length) await admin.from("suscripciones_push").delete().in("id", borrar);
  }

  return Response.json({ perfiles: perfiles.length, miembros: miembros.length, escritos, fallidos, enviados, caducadas });
}

function idiomaDe(perfil: Perfil) {
  return esIdioma(perfil.idioma) ? perfil.idioma : IDIOMA_PREDETERMINADO;
}

/** Texto del aviso: el título del mensaje y su línea "Hoy:", o el cielo del día si no hay mensaje. */
function cargaPara(perfil: Perfil, contenido: string | undefined): CargaPush | null {
  const idioma = idiomaDe(perfil);
  const t = diccionario(idioma);
  if (contenido) {
    const titulo = contenido.match(/^##\s*(.+)$/m)?.[1]?.replace(/[*_]/g, "").trim();
    const hoy = contenido.match(/^\**(Hoy|Today|Hoje):\**\s*(.+)$/m)?.[2]?.replace(/[*_]/g, "").trim();
    const cuerpo = [titulo, hoy ?? extractoPlano(contenido, 110)].filter(Boolean).join(" · ").slice(0, 160);
    return { titulo: t.pushDiario.titulo, cuerpo: cuerpo || t.pushDiario.cuerpoMiembro, url: "/hoy", tag: "arcana-hoy" };
  }
  const hoy = cieloDeHoyDePerfil(perfil);
  if (!hoy) return null;
  const signo = signoPorId(hoy.cielo.luna.signo)?.nombre ?? hoy.cielo.luna.signo;
  return { titulo: t.pushDiario.titulo, cuerpo: plantilla(t.pushDiario.cuerpo, { signo, n: hoy.cielo.transitos.length }), url: "/hoy", tag: "arcana-hoy" };
}
