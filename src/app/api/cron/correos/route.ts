import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { correoConfigurado, enviarCorreo, urlBaja } from "@/lib/correo";
import { correoCampana, type TipoCorreo } from "@/lib/correos/plantillas";
import { INVITACION_COMUNIDAD_HASTA, correoComunidad } from "@/lib/correos/comunidad";
import { REGALO_CREDITOS_HASTA, correoRegaloCreditos, idiomaCorreo } from "@/lib/correos/regalo-creditos";
import { esAdmin } from "@/lib/admin";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { esIdioma, IDIOMA_PREDETERMINADO } from "@/lib/i18n/idiomas";
import { estadoOfertaFundadores } from "@/lib/pagos/fundadores";
import { diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";
import { OFERTA_FUNDADORES, formatoCOP } from "@/lib/creditos";

export const maxDuration = 300;

const DIA = 86_400_000;
/** Un correo por persona cada 6 días como máximo, sea del tipo que sea. */
const DIAS_ENTRE_CORREOS = 6;
/** Cuentas con menos de 3 días no reciben campañas (acaban de llegar). */
const DIAS_MINIMOS_CUENTA = 3;
/** Repetición de cada tipo: activo cada 7 días; regreso_7 cada 30; regreso_30 cada 90. */
const REPETIR: Record<TipoCorreo, number> = { carta_activo: 7, regreso_7: 30, regreso_30: 90 };
const PRIORIDAD: Record<TipoCorreo, number> = { regreso_30: 0, regreso_7: 1, carta_activo: 2 };

interface Candidato {
  id: string;
  correo: string;
  nombre: string | null;
  idioma: string;
  tipo: TipoCorreo;
  dias: number;
}

/**
 * Cron diario (vercel.json, 14:00 UTC = 09:00 Bogotá): correos de Sibila.
 * - Activos (entraron o leyeron en la última semana): la carta del día, una vez por semana.
 * - Inactivos 7–29 días: "hace días no te vemos", una vez al mes.
 * - Inactivos 30+ días: "te extrañamos" con lo nuevo, una vez por trimestre.
 * Respeta `perfiles.recibe_correos`, el correo confirmado y un tope por corrida
 * (CORREOS_MAXIMO, 80 por defecto: el plan gratuito de Resend permite 100 al día).
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  if (!correoConfigurado()) return Response.json({ error: "sin_resend_api_key" }, { status: 503 });

  const admin = getSupabaseAdmin();
  const ahora = Date.now();
  const maximo = Math.max(1, Number(process.env.CORREOS_MAXIMO ?? 80) || 80);

  // 1. Perfiles que aceptan correos.
  const { data: perfiles, error } = await admin.from("perfiles").select("id, nombre, idioma, creado_en, recibe_correos, creditos, ilimitado, pais").eq("recibe_correos", true).limit(5000);
  if (error) return Response.json({ error: "perfiles", detalle: error.message }, { status: 500 });
  if (!perfiles?.length) return Response.json({ candidatos: 0, enviados: 0 });

  // 2. Cuentas de Auth: correo confirmado y último acceso.
  const usuarios = new Map<string, { correo: string; ultimoAcceso: number }>();
  for (let pagina = 1; pagina <= 20; pagina++) {
    const { data, error: e } = await admin.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    if (e) return Response.json({ error: "auth", detalle: e.message }, { status: 500 });
    for (const u of data.users) {
      if (!u.email || !u.email_confirmed_at) continue;
      usuarios.set(u.id, { correo: u.email, ultimoAcceso: u.last_sign_in_at ? Date.parse(u.last_sign_in_at) : 0 });
    }
    if (data.users.length < 1000) break;
  }

  // 3. Última lectura (60 días) y correos recientes (90 días) por persona.
  const [{ data: lecturas }, { data: correos }] = await Promise.all([
    admin.from("lecturas").select("usuario_id, creado_en").gte("creado_en", new Date(ahora - 60 * DIA).toISOString()).order("creado_en", { ascending: false }).limit(10000),
    admin.from("correos").select("usuario_id, tipo, creado_en").gte("creado_en", new Date(ahora - 90 * DIA).toISOString()).limit(10000),
  ]);
  const ultimaLectura = new Map<string, number>();
  for (const l of lecturas ?? []) if (!ultimaLectura.has(l.usuario_id)) ultimaLectura.set(l.usuario_id, Date.parse(l.creado_en));
  const enviadosPor = new Map<string, { tipo: string; en: number }[]>();
  for (const c of correos ?? []) {
    const lista = enviadosPor.get(c.usuario_id) ?? [];
    lista.push({ tipo: c.tipo, en: Date.parse(c.creado_en) });
    enviadosPor.set(c.usuario_id, lista);
  }

  // 4a. Invitación a la Comunidad (una vez por persona, hasta INVITACION_COMUNIDAD_HASTA): va primero, a quien no
  // recibió ningún correo en las últimas 20 horas. Esa persona no recibe además el correo de campaña del día.
  const fecha = fechaBogota();
  const invitar: { id: string; correo: string; nombre: string | null; idioma: string }[] = [];
  if (fecha <= INVITACION_COMUNIDAD_HASTA) {
    const { data: yaInvitados } = await admin.from("correos").select("usuario_id").eq("tipo", "comunidad");
    const invitados = new Set((yaInvitados ?? []).map((c) => c.usuario_id));
    for (const p of perfiles) {
      const u = usuarios.get(p.id);
      if (!u || invitados.has(p.id)) continue;
      if ((enviadosPor.get(p.id) ?? []).some((c) => ahora - c.en < 20 * 3_600_000)) continue;
      invitar.push({ id: p.id, correo: u.correo, nombre: p.nombre, idioma: p.idioma });
    }
  }
  // 4a'. Regalo de créditos (una vez por persona, hasta REGALO_CREDITOS_HASTA): quien se quedó sin créditos y nunca
  // compró recibe el código VUELVE. Va antes que la Comunidad: es lo que más ayuda a que la persona vuelva a leer.
  const regalar: { id: string; correo: string; nombre: string | null; idioma: string; pais: string | null }[] = [];
  if (fecha <= REGALO_CREDITOS_HASTA) {
    const [{ data: yaRegalo }, { data: compras }] = await Promise.all([
      admin.from("correos").select("usuario_id").eq("tipo", "regalo_creditos"),
      admin.from("ordenes").select("usuario_id").eq("estado", "aprobada").eq("es_prueba", false),
    ]);
    const excluir = new Set([...(yaRegalo ?? []), ...(compras ?? [])].map((c) => c.usuario_id));
    for (const p of perfiles) {
      const u = usuarios.get(p.id);
      if (!u || excluir.has(p.id) || p.ilimitado || p.creditos > 0 || esAdmin(u.correo)) continue;
      if ((enviadosPor.get(p.id) ?? []).some((c) => ahora - c.en < 20 * 3_600_000)) continue;
      regalar.push({ id: p.id, correo: u.correo, nombre: p.nombre, idioma: p.idioma, pais: p.pais });
    }
  }
  const loteRegalo = regalar.slice(0, maximo);
  const conRegalo = new Set(loteRegalo.map((c) => c.id));
  const loteComunidad = invitar.filter((c) => !conRegalo.has(c.id)).slice(0, Math.max(0, maximo - loteRegalo.length));
  const enComunidad = new Set([...loteComunidad.map((c) => c.id), ...conRegalo]);

  // 4b. Segmentación.
  const candidatos: Candidato[] = [];
  for (const p of perfiles) {
    const u = usuarios.get(p.id);
    if (!u || enComunidad.has(p.id)) continue;
    const creada = Date.parse(p.creado_en);
    if (ahora - creada < DIAS_MINIMOS_CUENTA * DIA) continue;
    const actividad = Math.max(u.ultimoAcceso, ultimaLectura.get(p.id) ?? 0, creada);
    const dias = (ahora - actividad) / DIA;
    const previos = enviadosPor.get(p.id) ?? [];
    if (previos.some((c) => ahora - c.en < DIAS_ENTRE_CORREOS * DIA)) continue;
    const tipo: TipoCorreo = dias >= 30 ? "regreso_30" : dias >= 7 ? "regreso_7" : "carta_activo";
    if (previos.some((c) => c.tipo === tipo && ahora - c.en < REPETIR[tipo] * DIA)) continue;
    candidatos.push({ id: p.id, correo: u.correo, nombre: p.nombre, idioma: p.idioma, tipo, dias: Math.round(dias) });
  }
  candidatos.sort((a, b) => PRIORIDAD[a.tipo] - PRIORIDAD[b.tipo] || b.dias - a.dias);
  const lote = candidatos.slice(0, Math.max(0, maximo - loteComunidad.length - loteRegalo.length));

  // 5. Regalo de créditos.
  let regalos = 0;
  for (const c of loteRegalo) {
    const idioma = idiomaCorreo(esIdioma(c.idioma) ? c.idioma : IDIOMA_PREDETERMINADO, c.pais);
    const baja = urlBaja(c.id);
    const correo = correoRegaloCreditos({ nombre: c.nombre, idioma, urlBaja: baja });
    const r = await enviarCorreo({ para: c.correo, asunto: correo.asunto, html: correo.html, texto: correo.texto, etiqueta: "regalo_creditos", cabeceras: { "List-Unsubscribe": `<${baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
    await admin.from("correos").insert({ usuario_id: c.id, tipo: "regalo_creditos", asunto: correo.asunto, estado: r.ok ? "enviado" : "error", id_proveedor: r.ok ? r.id : null, detalle: r.ok ? null : r.error });
    if (r.ok) regalos++;
    else {
      console.error("[cron correos] regalo de créditos fallido", c.id, r.error);
      if (/^(401|403|422|429)/.test(r.error)) break;
    }
    await new Promise((res) => setTimeout(res, 600));
  }

  // 5a. Invitaciones a la Comunidad.
  let invitados = 0;
  for (const c of loteComunidad) {
    const idioma = esIdioma(c.idioma) ? c.idioma : IDIOMA_PREDETERMINADO;
    const baja = urlBaja(c.id);
    const correo = correoComunidad({ nombre: c.nombre, idioma, fecha, urlBaja: baja });
    const r = await enviarCorreo({ para: c.correo, asunto: correo.asunto, html: correo.html, texto: correo.texto, etiqueta: "comunidad", cabeceras: { "List-Unsubscribe": `<${baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
    await admin.from("correos").insert({ usuario_id: c.id, tipo: "comunidad", asunto: correo.asunto, estado: r.ok ? "enviado" : "error", id_proveedor: r.ok ? r.id : null, detalle: r.ok ? null : r.error });
    if (r.ok) invitados++;
    else {
      console.error("[cron correos] invitación a la comunidad fallida", c.id, r.error);
      if (/^(401|403|422|429)/.test(r.error)) break;
    }
    await new Promise((res) => setTimeout(res, 600));
  }

  // 5b. Envío (en serie: Resend limita a 2 peticiones por segundo).
  const oferta = await estadoOfertaFundadores();
  const resumen: Record<TipoCorreo, number> = { carta_activo: 0, regreso_7: 0, regreso_30: 0 };
  let enviados = 0;
  let fallidos = 0;
  for (const c of lote) {
    const idioma = esIdioma(c.idioma) ? c.idioma : IDIOMA_PREDETERMINADO;
    const baja = urlBaja(c.id);
    const textoOferta = oferta.activa ? plantilla(diccionario(idioma).creditos.fundadores.correo, { precio: formatoCOP(OFERTA_FUNDADORES.precioCOP), n: oferta.restantes }) : undefined;
    const correo = correoCampana({ tipo: c.tipo, nombre: c.nombre, idioma, fecha, urlBaja: baja, oferta: textoOferta });
    const r = await enviarCorreo({
      para: c.correo,
      asunto: correo.asunto,
      html: correo.html,
      texto: correo.texto,
      etiqueta: c.tipo,
      cabeceras: { "List-Unsubscribe": `<${baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
    await admin.from("correos").insert({
      usuario_id: c.id,
      tipo: c.tipo,
      asunto: correo.asunto,
      estado: r.ok ? "enviado" : "error",
      id_proveedor: r.ok ? r.id : null,
      detalle: r.ok ? null : r.error,
    });
    if (r.ok) {
      enviados++;
      resumen[c.tipo]++;
    } else {
      fallidos++;
      console.error("[cron correos] envío fallido", c.id, r.error);
      // Si el proveedor rechaza (clave, dominio, cuota), no insistimos en esta corrida.
      if (/^(401|403|422|429)/.test(r.error)) break;
    }
    await new Promise((res) => setTimeout(res, 600));
  }

  return Response.json({ perfiles: perfiles.length, regalos, comunidad: invitados, candidatos: candidatos.length, enviados, fallidos, ...resumen });
}
