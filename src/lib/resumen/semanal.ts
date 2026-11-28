import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { escaparHtml, sitio } from "@/lib/correo";
import { NOMBRES_LECTURA, OFERTA_FUNDADORES, formatoCOP, type TipoLectura } from "@/lib/creditos";
import { estadoOfertaFundadores } from "@/lib/pagos/fundadores";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { fechaLargaEs, sumarDias } from "@/lib/redes/calendario";
import { interacciones, promediosPorTipo, type PromedioTipo } from "@/lib/redes/metricas";
import { tasasDelDia } from "@/lib/monedas";
import { esAdmin } from "@/lib/admin";

/** Lo que cuesta mantener Arcana al mes (pesos): la meta mínima de ingresos. */
export const META_MENSUAL_COP = 500_000;
/** Orígenes que vienen de redes (enlaces cortos, utm o Referer). */
const ORIGENES_REDES = ["ig", "instagram", "facebook", "fb", "youtube", "yt", "tiktok", "tt", "whatsapp", "wa", "telegram", "tg"];

/**
 * Estado del negocio: métricas de los últimos siete días comparadas con los
 * siete anteriores. Lo calcula el servidor con service role; lo muestra
 * /admin/resumen y lo envía por correo el cron de los lunes.
 */
export interface Comparado {
  actual: number;
  anterior: number;
}

export interface ResumenSemanal {
  desde: string; // AAAA-MM-DD (incluido)
  hasta: string; // AAAA-MM-DD (excluido)
  generadoEn: string;
  cuentas: { total: number; nuevas: Comparado; activas: Comparado; sinCreditos: number; circulo: number; recibenCorreos: number };
  lecturas: { total: Comparado; errores: number; porTipo: { tipo: string; nombre: string; n: number }[]; preguntas: number; asistente: number };
  ventas: {
    ordenes: Comparado;
    cop: Comparado; // pesos
    usdCentavos: Comparado;
    porPaquete: { paquete: string; n: number }[];
    fundadores: { activa: boolean; vendidos: number; restantes: number; diasRestantes: number };
  };
  correos: { enviados: number; errores: number; porTipo: { tipo: string; n: number }[] };
  redes: {
    cartaDia: { publicadas: number; errores: number };
    agente: { publicadas: number; errores: number; borradores: number };
    /** Cifras de Meta de lo publicado en la semana (si el cron de métricas ya corrió). */
    rendimiento: { porTipo: PromedioTipo[]; mejor: { tipo: string; red: string; fecha: string; vistas: number | null; interacciones: number } | null; interaccionesTotal: number; vistasTotal: number };
    sibila: { respondidas: number; humano: number; visitantes: number };
  };
  /**
   * Embudo de la semana: de las cuentas nuevas, cuántas hicieron su primera lectura y
   * cuántas gastaron los créditos de regalo; de todas las personas, cuántas abrieron
   * una orden (intentaron pagar) y cuántas pagaron.
   */
  embudo: { nuevas: number; conLectura: number; sinCreditos: number; vieronInvitacion: number; vieronPaquetes: number; tocaronComprar: number; intentaron: number; pagaron: number; noCompletadas: number; huevo: number };
  /**
   * De las redes a la web: comentarios y mensajes que respondió Sibila (los árabes aparte), personas que pidieron la
   * lectura por la palabra clave, visitas que llegaron desde redes, y cuentas y pagos de esas personas.
   */
  redesWeb: { comentarios: number; comentariosArabe: number; mensajes: { instagram: number; facebook: number }; palabraClave: number; visitas: { origen: string; n: number }[]; cuentas: number; pagos: number };
  /** Ingresos del mes en curso contra la meta (los dólares, en pesos a la tasa del día). */
  mes: { cop: number; usdCentavos: number; totalCop: number; meta: number; diasTranscurridos: number; diasMes: number };
  /** Por dónde llegan: origen (red) de las cuentas nuevas y de quienes pagaron en la semana. */
  origenes: { cuentas: { origen: string; n: number }[]; sinOrigen: number; pagos: { origen: string; n: number; cop: number; usdCentavos: number }[] };
  alertas: string[];
}

export const NOMBRE_ORIGEN: Record<string, string> = { ig: "Instagram", fb: "Facebook", yt: "YouTube", tt: "TikTok", wa: "WhatsApp", tg: "Telegram", "meta-ads": "Anuncios de Meta", "tiktok-ads": "Anuncios de TikTok", "google-ads": "Anuncios de Google", youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", whatsapp: "WhatsApp", telegram: "Telegram", google: "Google", bing: "Bing", x: "X", pinterest: "Pinterest", desconocido: "Sin origen conocido" };
export const nombreOrigen = (o: string) => NOMBRE_ORIGEN[o] ?? o.charAt(0).toUpperCase() + o.slice(1);

const DIA = 86_400_000;

function iso(fecha: string) {
  // Medianoche de Bogotá (UTC-5) de esa fecha.
  return `${fecha}T05:00:00.000Z`;
}

async function contar(consulta: PromiseLike<{ count: number | null; error: { message: string } | null }>, nombre: string) {
  const { count, error } = await consulta;
  if (error) throw new Error(`${nombre}: ${error.message}`);
  return count ?? 0;
}

export async function calcularResumen(admin: SupabaseClient<Database>, hoy = fechaBogota()): Promise<ResumenSemanal> {
  const hasta = hoy;
  const desde = sumarDias(hoy, -7);
  const desdeAnterior = sumarDias(hoy, -14);
  const ahora = new Date().toISOString();

  const [total, nuevas, nuevasAntes, sinCreditos, circulo, recibenCorreos] = await Promise.all([
    contar(admin.from("perfiles").select("id", { count: "exact", head: true }), "perfiles"),
    contar(admin.from("perfiles").select("id", { count: "exact", head: true }).gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)), "nuevas"),
    contar(admin.from("perfiles").select("id", { count: "exact", head: true }).gte("creado_en", iso(desdeAnterior)).lt("creado_en", iso(desde)), "nuevas anteriores"),
    contar(admin.from("perfiles").select("id", { count: "exact", head: true }).eq("creditos", 0).eq("ilimitado", false), "sin créditos"),
    contar(admin.from("perfiles").select("id", { count: "exact", head: true }).gt("circulo_hasta", ahora), "círculo"),
    contar(admin.from("perfiles").select("id", { count: "exact", head: true }).eq("recibe_correos", true), "reciben correos"),
  ]);

  // Lecturas de las dos semanas (volúmenes pequeños: se agrupan en memoria).
  const { data: lecturas, error: errorLecturas } = await admin
    .from("lecturas")
    .select("usuario_id, tipo, estado, creado_en")
    .gte("creado_en", iso(desdeAnterior))
    .lt("creado_en", iso(hasta))
    .limit(5000);
  if (errorLecturas) throw new Error(`lecturas: ${errorLecturas.message}`);
  const deSemana = (lecturas ?? []).filter((l) => l.creado_en >= iso(desde));
  const deAntes = (lecturas ?? []).filter((l) => l.creado_en < iso(desde));
  const porTipoMapa = new Map<string, number>();
  for (const l of deSemana) if (l.estado === "lista") porTipoMapa.set(l.tipo, (porTipoMapa.get(l.tipo) ?? 0) + 1);
  const porTipo = [...porTipoMapa.entries()]
    .map(([tipo, n]) => ({ tipo, nombre: NOMBRES_LECTURA[tipo as TipoLectura] ?? tipo, n }))
    .sort((a, b) => b.n - a.n);

  const { data: cartas } = await admin.from("cartas_dia").select("usuario_id").gte("fecha", desde).lt("fecha", hasta).limit(5000);
  const { data: cartasAntes } = await admin.from("cartas_dia").select("usuario_id").gte("fecha", desdeAnterior).lt("fecha", desde).limit(5000);
  const activas = new Set([...deSemana.map((l) => l.usuario_id), ...(cartas ?? []).map((c) => c.usuario_id)]).size;
  const activasAntes = new Set([...deAntes.map((l) => l.usuario_id), ...(cartasAntes ?? []).map((c) => c.usuario_id)]).size;

  const [preguntas, asistente] = await Promise.all([
    contar(admin.from("preguntas_lectura").select("id", { count: "exact", head: true }).gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)), "preguntas"),
    contar(admin.from("mensajes_asistente").select("id", { count: "exact", head: true }).eq("rol", "persona").gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)), "asistente"),
  ]);

  // Las cuentas de administración compran para probar los pagos: sus órdenes no cuentan como ventas.
  const idsAdmin = new Set<string>();
  for (let pagina = 1; pagina <= 10; pagina++) {
    const { data } = await admin.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    for (const u of data?.users ?? []) if (esAdmin(u.email)) idsAdmin.add(u.id);
    if ((data?.users.length ?? 0) < 1000) break;
  }
  const deCliente = <T extends { usuario_id: string }>(lista: T[] | null) => (lista ?? []).filter((o) => !idsAdmin.has(o.usuario_id));

  const { data: ordenesTodas, error: errorOrdenes } = await admin
    .from("ordenes")
    .select("usuario_id, paquete, monto_centavos, moneda, creado_en")
    .eq("estado", "aprobada")
    .eq("es_prueba", false)
    .gte("creado_en", iso(desdeAnterior))
    .lt("creado_en", iso(hasta))
    .limit(5000);
  if (errorOrdenes) throw new Error(`ordenes: ${errorOrdenes.message}`);
  const ordenes = deCliente(ordenesTodas);
  const ventasSemana = (ordenes ?? []).filter((o) => o.creado_en >= iso(desde));
  const ventasAntes = (ordenes ?? []).filter((o) => o.creado_en < iso(desde));
  const sumaCop = (lista: typeof ventasSemana) => Math.round(lista.filter((o) => o.moneda === "COP").reduce((s, o) => s + o.monto_centavos, 0) / 100);
  const sumaUsd = (lista: typeof ventasSemana) => lista.filter((o) => o.moneda === "USD").reduce((s, o) => s + o.monto_centavos, 0);
  const porPaqueteMapa = new Map<string, number>();
  for (const o of ventasSemana) porPaqueteMapa.set(o.paquete, (porPaqueteMapa.get(o.paquete) ?? 0) + 1);
  const fundadores = await estadoOfertaFundadores();
  const diasRestantes = Math.max(0, Math.ceil((fundadores.hasta.getTime() - Date.now()) / DIA));

  const { data: correos } = await admin.from("correos").select("tipo, estado").gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)).limit(5000);
  const correosPorTipo = new Map<string, number>();
  let correosErrores = 0;
  for (const c of correos ?? []) {
    if (c.estado === "error") correosErrores++;
    else correosPorTipo.set(c.tipo, (correosPorTipo.get(c.tipo) ?? 0) + 1);
  }

  const { data: cartaDia } = await admin.from("publicaciones_redes").select("estado").eq("tipo", "carta_dia").gte("fecha", desde).lt("fecha", hasta).limit(100);
  const { data: agente } = await admin.from("publicaciones_programadas").select("estado, fecha").gte("fecha", desde).limit(100);
  const cuenta = (lista: { estado: string }[] | null, estado: string) => (lista ?? []).filter((x) => x.estado === estado).length;
  // Las tablas de métricas e interacciones pueden no existir aún (migraciones 0027 y 0028): se ignoran sus errores.
  const { data: metricas } = await admin.from("metricas_redes").select("*").gte("fecha", desde).lt("fecha", hasta).limit(200);
  const { data: interaccionesSibila } = await admin.from("interacciones_redes").select("estado, humano").gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)).limit(5000);
  const { count: visitantes } = await admin.from("chat_visitas").select("id", { count: "exact", head: true }).gte("creado_en", iso(desde)).lt("creado_en", iso(hasta));
  const mejor = [...(metricas ?? [])].sort((a, b) => interacciones(b) - interacciones(a) || (b.vistas ?? 0) - (a.vistas ?? 0))[0];
  const borradores = (agente ?? []).filter((p) => p.estado === "borrador" && p.fecha >= hoy).length;

  // Embudo: cuentas nuevas de la semana → primera lectura → sin créditos de regalo; órdenes abiertas → pagadas.
  const { data: nuevasPerfiles } = await admin.from("perfiles").select("id, creditos, ilimitado").gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)).limit(5000);
  const idsNuevas = new Set((nuevasPerfiles ?? []).map((p) => p.id));
  const { data: todasOrdenesCrudas } = await admin.from("ordenes").select("usuario_id, estado").eq("es_prueba", false).gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)).limit(5000);
  const todasOrdenes = deCliente(todasOrdenesCrudas);
  // Eventos del embudo de compra (migración 0085), personas distintas y sin las cuentas de administración.
  const { data: eventosCompra } = await admin.from("eventos_compra").select("usuario_id, evento").gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)).limit(20000);
  const personas = (evento: string) => new Set(deCliente((eventosCompra ?? []).filter((e) => e.evento === evento && e.usuario_id) as { usuario_id: string }[]).map((e) => e.usuario_id)).size;
  const embudo: ResumenSemanal["embudo"] = {
    vieronInvitacion: personas("vio_invitacion"),
    vieronPaquetes: personas("vio_paquetes"),
    tocaronComprar: personas("toco_comprar"),
    nuevas: idsNuevas.size,
    conLectura: new Set(deSemana.filter((l) => l.estado === "lista" && idsNuevas.has(l.usuario_id)).map((l) => l.usuario_id)).size,
    sinCreditos: (nuevasPerfiles ?? []).filter((p) => p.creditos === 0 && !p.ilimitado).length,
    intentaron: new Set((todasOrdenes ?? []).map((o) => o.usuario_id)).size,
    pagaron: new Set((todasOrdenes ?? []).filter((o) => o.estado === "aprobada").map((o) => o.usuario_id)).size,
    noCompletadas: (todasOrdenes ?? []).filter((o) => o.estado !== "aprobada").length,
    huevo: deSemana.filter((l) => l.estado === "lista" && l.tipo === "huevo").length,
  };

  // Por dónde llegan (migración 0036): origen de las cuentas nuevas y, para los
  // pagos, el origen del perfil de quien compró. Si la columna no existe aún, se omite.
  const origenes: ResumenSemanal["origenes"] = { cuentas: [], sinOrigen: 0, pagos: [] };
  try {
    const { data: nuevasFilas, error: errorOrigen } = await admin.from("perfiles").select("origen").gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)).limit(5000);
    if (errorOrigen) throw new Error(errorOrigen.message);
    const cuentasMapa = new Map<string, number>();
    for (const p of nuevasFilas ?? []) {
      if (p.origen) cuentasMapa.set(p.origen, (cuentasMapa.get(p.origen) ?? 0) + 1);
      else origenes.sinOrigen++;
    }
    origenes.cuentas = [...cuentasMapa.entries()].map(([origen, n]) => ({ origen, n })).sort((a, b) => b.n - a.n);
    const compradores = [...new Set(ventasSemana.map((o) => o.usuario_id))];
    const { data: perfilesCompradores } = compradores.length ? await admin.from("perfiles").select("id, origen").in("id", compradores) : { data: [] };
    const origenDe = new Map((perfilesCompradores ?? []).map((p) => [p.id, p.origen ?? "desconocido"]));
    const pagosMapa = new Map<string, { n: number; cop: number; usdCentavos: number }>();
    for (const o of ventasSemana) {
      const k = origenDe.get(o.usuario_id) ?? "desconocido";
      const acum = pagosMapa.get(k) ?? { n: 0, cop: 0, usdCentavos: 0 };
      acum.n++;
      if (o.moneda === "COP") acum.cop += Math.round(o.monto_centavos / 100);
      else acum.usdCentavos += o.monto_centavos;
      pagosMapa.set(k, acum);
    }
    origenes.pagos = [...pagosMapa.entries()].map(([origen, v]) => ({ origen, ...v })).sort((a, b) => b.n - a.n);
  } catch (e) {
    console.error("[resumen] origenes:", e instanceof Error ? e.message : e);
  }

  // De las redes a la web.
  const { data: interRedes } = await admin.from("interacciones_redes").select("red, tipo, texto, estado, detalle").gte("creado_en", iso(desde)).lt("creado_en", iso(hasta)).limit(10000);
  const { data: visitasRedes } = await admin.from("visitas").select("origen").gte("fecha", desde).lt("fecha", hasta).in("origen", ORIGENES_REDES).limit(20000);
  const visitasMapa = new Map<string, number>();
  for (const v of visitasRedes ?? []) visitasMapa.set(v.origen ?? "?", (visitasMapa.get(v.origen ?? "?") ?? 0) + 1);
  const respondidas = (interRedes ?? []).filter((i) => i.estado === "respondida");
  const redesWeb: ResumenSemanal["redesWeb"] = {
    comentarios: respondidas.filter((i) => i.tipo === "comentario").length,
    comentariosArabe: respondidas.filter((i) => i.tipo === "comentario" && /[\u0600-\u06FF]/.test(i.texto)).length,
    mensajes: { instagram: respondidas.filter((i) => i.tipo === "mensaje" && i.red === "instagram").length, facebook: respondidas.filter((i) => i.tipo === "mensaje" && i.red === "facebook").length },
    palabraClave: (interRedes ?? []).filter((i) => i.detalle?.startsWith("palabra clave")).length,
    visitas: [...visitasMapa.entries()].map(([origen, n]) => ({ origen, n })).sort((a, b) => b.n - a.n),
    cuentas: origenes.cuentas.filter((c) => ORIGENES_REDES.includes(c.origen)).reduce((s, c) => s + c.n, 0),
    pagos: origenes.pagos.filter((p) => ORIGENES_REDES.includes(p.origen)).reduce((s, p) => s + p.n, 0),
  };

  // El mes en curso contra la meta.
  const inicioMes = `${hoy.slice(0, 7)}-01`;
  const { data: ventasMesCrudas } = await admin.from("ordenes").select("usuario_id, monto_centavos, moneda").eq("estado", "aprobada").eq("es_prueba", false).gte("creado_en", iso(inicioMes)).limit(5000);
  const ventasMes = deCliente(ventasMesCrudas);
  const copMes = Math.round((ventasMes ?? []).filter((o) => o.moneda === "COP").reduce((s, o) => s + o.monto_centavos, 0) / 100);
  const usdMes = (ventasMes ?? []).filter((o) => o.moneda === "USD").reduce((s, o) => s + o.monto_centavos, 0);
  const porUsd = (await tasasDelDia().catch(() => null))?.porUSD?.COP ?? 4000;
  const [anio, mesNum] = hoy.split("-").map(Number);
  const mes: ResumenSemanal["mes"] = { cop: copMes, usdCentavos: usdMes, totalCop: Math.round(copMes + (usdMes / 100) * porUsd), meta: META_MENSUAL_COP, diasTranscurridos: Number(hoy.slice(8, 10)), diasMes: new Date(anio, mesNum, 0).getDate() };

  const resumen: ResumenSemanal = {
    desde,
    hasta,
    generadoEn: ahora,
    cuentas: { total, nuevas: { actual: nuevas, anterior: nuevasAntes }, activas: { actual: activas, anterior: activasAntes }, sinCreditos, circulo, recibenCorreos },
    lecturas: {
      total: { actual: deSemana.filter((l) => l.estado === "lista").length, anterior: deAntes.filter((l) => l.estado === "lista").length },
      errores: deSemana.filter((l) => l.estado === "error").length,
      porTipo,
      preguntas,
      asistente,
    },
    ventas: {
      ordenes: { actual: ventasSemana.length, anterior: ventasAntes.length },
      cop: { actual: sumaCop(ventasSemana), anterior: sumaCop(ventasAntes) },
      usdCentavos: { actual: sumaUsd(ventasSemana), anterior: sumaUsd(ventasAntes) },
      porPaquete: [...porPaqueteMapa.entries()].map(([paquete, n]) => ({ paquete, n })).sort((a, b) => b.n - a.n),
      fundadores: { activa: fundadores.activa, vendidos: fundadores.vendidos, restantes: fundadores.restantes, diasRestantes },
    },
    correos: { enviados: [...correosPorTipo.values()].reduce((s, n) => s + n, 0), errores: correosErrores, porTipo: [...correosPorTipo.entries()].map(([tipo, n]) => ({ tipo, n })) },
    redes: {
      cartaDia: { publicadas: cuenta(cartaDia, "publicada"), errores: cuenta(cartaDia, "error") },
      agente: { publicadas: cuenta(agente?.filter((p) => p.fecha < hasta) ?? null, "publicada"), errores: cuenta(agente, "error"), borradores },
      rendimiento: {
        porTipo: promediosPorTipo(metricas ?? []),
        mejor: mejor ? { tipo: mejor.tipo, red: mejor.red, fecha: mejor.fecha, vistas: mejor.vistas, interacciones: interacciones(mejor) } : null,
        interaccionesTotal: (metricas ?? []).reduce((s, m) => s + interacciones(m), 0),
        vistasTotal: (metricas ?? []).reduce((s, m) => s + (m.vistas ?? 0), 0),
      },
      sibila: { respondidas: cuenta(interaccionesSibila, "respondida"), humano: (interaccionesSibila ?? []).filter((i) => i.humano).length, visitantes: visitantes ?? 0 },
    },
    embudo,
    redesWeb,
    mes,
    origenes,
    alertas: [],
  };

  const a = resumen.alertas;
  if (resumen.ventas.ordenes.actual === 0) a.push("Sin ventas esta semana.");
  if (resumen.lecturas.errores) a.push(`${resumen.lecturas.errores} lecturas terminaron en error.`);
  if (resumen.redes.cartaDia.errores) a.push(`La carta del día falló ${resumen.redes.cartaDia.errores} veces en redes.`);
  if (resumen.redes.agente.errores) a.push(`${resumen.redes.agente.errores} publicaciones del agente fallaron.`);
  if (resumen.redes.agente.borradores) a.push(`${resumen.redes.agente.borradores} borradores del agente esperan aprobación.`);
  if (resumen.correos.errores) a.push(`${resumen.correos.errores} correos no se pudieron enviar.`);
  if (fundadores.activa && diasRestantes <= 7) a.push(`La oferta de fundadores termina en ${diasRestantes} días (${fundadores.restantes} cupos).`);
  if (resumen.embudo.noCompletadas > 0 && resumen.embudo.pagaron === 0) a.push(`${resumen.embudo.intentaron} personas intentaron pagar y nadie completó el pago: revisar la pasarela (Bold) y el precio.`);
  else if (resumen.embudo.noCompletadas >= 3) a.push(`${resumen.embudo.noCompletadas} pagos quedaron sin completar esta semana.`);
  if (redesWeb.comentarios >= 50 && redesWeb.mensajes.instagram === 0) a.push(`Sibila respondió ${redesWeb.comentarios} comentarios y ningún mensaje directo de Instagram: los mensajes de Instagram no están llegando (ver /admin/redes).`);
  const ritmo = mes.diasTranscurridos ? (mes.totalCop / mes.diasTranscurridos) * mes.diasMes : 0;
  if (ritmo < mes.meta) a.push(`Al ritmo actual el mes cerraría en ${formatoCOP(Math.round(ritmo))}, por debajo de la meta de ${formatoCOP(mes.meta)}.`);
  if (resumen.cuentas.sinCreditos >= 10) a.push(`${resumen.cuentas.sinCreditos} cuentas están sin créditos (quienes tienen el correo confirmado reciben una sola vez el código VUELVE, y en la página ven la compra en un toque).`);
  return resumen;
}

// ---------------------------------------------------------------------------
// Correo
// ---------------------------------------------------------------------------
function variacion(c: Comparado) {
  if (c.anterior === 0) return c.actual === 0 ? "igual" : "nuevo";
  const p = Math.round(((c.actual - c.anterior) / c.anterior) * 100);
  return p === 0 ? "igual" : `${p > 0 ? "+" : ""}${p} %`;
}

function usd(centavos: number) {
  return `US$ ${(centavos / 100).toFixed(2)}`;
}

/** Embudo de compra: cada paso con su porcentaje sobre el anterior, para ver dónde se cae la venta. */
function filasEmbudo(r: ResumenSemanal): [string, string, string?][] {
  const e = r.embudo;
  const pct = (n: number, de: number) => (de ? `${Math.round((n / de) * 100)} % del paso anterior` : undefined);
  return [
    ["1. Crearon cuenta", String(e.nuevas)],
    ["2. Hicieron su primera lectura", String(e.conLectura), pct(e.conLectura, e.nuevas)],
    ["3. Gastaron los créditos de regalo", String(e.sinCreditos), pct(e.sinCreditos, e.conLectura)],
    ["4. Vieron la invitación sin créditos", `${e.vieronInvitacion} personas`],
    ["5. Abrieron la página de paquetes", `${e.vieronPaquetes} personas`],
    ["6. Tocaron «comprar»", `${e.tocaronComprar} personas`, pct(e.tocaronComprar, e.vieronPaquetes)],
    ["7. Abrieron el pago", `${e.intentaron} personas`, "se creó la orden"],
    ["8. Pagaron", `${e.pagaron} personas`, pct(e.pagaron, e.intentaron)],
    ["Pagos sin completar", String(e.noCompletadas), e.noCompletadas ? "pendientes, rechazados o con error" : undefined],
    ["Lecturas de limpia con huevo", String(e.huevo), "el producto estrella"],
  ];
}

function filasMes(r: ResumenSemanal): [string, string, string?][] {
  const m = r.mes;
  const ritmo = m.diasTranscurridos ? Math.round((m.totalCop / m.diasTranscurridos) * m.diasMes) : 0;
  return [
    ["Ingresos del mes", formatoCOP(m.totalCop), `${Math.round((m.totalCop / m.meta) * 100)} % de la meta de ${formatoCOP(m.meta)}`],
    ["  en pesos", formatoCOP(m.cop)],
    ["  en dólares", usd(m.usdCentavos), "convertidos a la tasa del día"],
    ["Al ritmo actual", formatoCOP(ritmo), `día ${m.diasTranscurridos} de ${m.diasMes}`],
  ];
}

/** Comentario → mensaje → visita → cuenta → pago, desde las redes. */
function filasRedesWeb(r: ResumenSemanal): [string, string, string?][] {
  const w = r.redesWeb;
  const visitas = w.visitas.reduce((s, v) => s + v.n, 0);
  return [
    ["1. Comentarios respondidos por Sibila", String(w.comentarios), `${w.comentariosArabe} en árabe`],
    ["2. Mensajes directos respondidos", String(w.mensajes.instagram + w.mensajes.facebook), `Instagram ${w.mensajes.instagram} · Messenger ${w.mensajes.facebook}`],
    ["   Pidieron la lectura con la palabra clave", String(w.palabraClave), "recibieron el enlace directo por mensaje"],
    ["3. Visitas a la web desde redes", String(visitas), w.visitas.map((v) => `${nombreOrigen(v.origen)} ${v.n}`).join(" · ") || undefined],
    ["4. Cuentas nuevas desde redes", String(w.cuentas), visitas ? `${Math.round((w.cuentas / visitas) * 100)} % de las visitas` : undefined],
    ["5. Pagos de personas que llegaron por redes", String(w.pagos)],
  ];
}

/** Cuentas nuevas y pagos de la semana por red de origen (enlaces cortos /yt /ig /tt /fb /wa, utm o Referer). */
function filasOrigenes(r: ResumenSemanal): [string, string, string?][] {
  const redes = [...new Set([...r.origenes.cuentas.map((c) => c.origen), ...r.origenes.pagos.map((p) => p.origen)])].filter((o) => o !== "desconocido");
  if (!redes.length && !r.origenes.sinOrigen && !r.origenes.pagos.length) return [["Sin datos todavía", "—", "se mide desde el 20 de octubre"]];
  const pagoDe = (o: string) => r.origenes.pagos.find((p) => p.origen === o);
  const detallePago = (p?: { n: number; cop: number; usdCentavos: number }) =>
    p ? `${p.n} pago${p.n === 1 ? "" : "s"}${p.cop ? ` · ${formatoCOP(p.cop)}` : ""}${p.usdCentavos ? ` · ${usd(p.usdCentavos)}` : ""}` : "sin pagos";
  const filas: [string, string, string?][] = redes.map((o) => [nombreOrigen(o), `${r.origenes.cuentas.find((c) => c.origen === o)?.n ?? 0} cuentas`, detallePago(pagoDe(o))]);
  const desconocido = pagoDe("desconocido");
  filas.push(["Sin origen conocido", `${r.origenes.sinOrigen} cuentas`, desconocido ? detallePago(desconocido) : "entraron directo o antes de medir"]);
  return filas;
}

/** Filas (etiqueta, valor, comparación) de cada bloque del resumen. */
export function filasResumen(r: ResumenSemanal): { titulo: string; filas: [string, string, string?][] }[] {
  return [
    {
      titulo: "Cuentas",
      filas: [
        ["Registros nuevos", String(r.cuentas.nuevas.actual), `${variacion(r.cuentas.nuevas)} · antes ${r.cuentas.nuevas.anterior}`],
        ["Personas activas", String(r.cuentas.activas.actual), `${variacion(r.cuentas.activas)} · antes ${r.cuentas.activas.anterior}`],
        ["Cuentas en total", String(r.cuentas.total)],
        ["Círculo activo", String(r.cuentas.circulo)],
        ["Sin créditos", String(r.cuentas.sinCreditos)],
        ["Reciben correos", String(r.cuentas.recibenCorreos)],
      ],
    },
    {
      titulo: "Ventas",
      filas: [
        ["Órdenes aprobadas", String(r.ventas.ordenes.actual), `${variacion(r.ventas.ordenes)} · antes ${r.ventas.ordenes.anterior}`],
        ["Ingresos en pesos", formatoCOP(r.ventas.cop.actual), `${variacion(r.ventas.cop)} · antes ${formatoCOP(r.ventas.cop.anterior)}`],
        ["Ingresos en dólares", usd(r.ventas.usdCentavos.actual), `antes ${usd(r.ventas.usdCentavos.anterior)}`],
        ...r.ventas.porPaquete.map((p): [string, string] => [`  ${p.paquete}`, String(p.n)]),
        ["Fundadores", r.ventas.fundadores.activa ? `${r.ventas.fundadores.vendidos} de ${OFERTA_FUNDADORES.cupo} vendidos` : "terminada", r.ventas.fundadores.activa ? `${r.ventas.fundadores.diasRestantes} días restantes` : undefined],
      ],
    },
    {
      titulo: "Meta del mes",
      filas: filasMes(r),
    },
    {
      titulo: "De las redes a la web",
      filas: filasRedesWeb(r),
    },
    {
      titulo: "Embudo de la semana",
      filas: filasEmbudo(r),
    },
    {
      titulo: "Por dónde llegan",
      filas: filasOrigenes(r),
    },
    {
      titulo: "Lecturas",
      filas: [
        ["Lecturas terminadas", String(r.lecturas.total.actual), `${variacion(r.lecturas.total)} · antes ${r.lecturas.total.anterior}`],
        ...r.lecturas.porTipo.slice(0, 8).map((t): [string, string] => [`  ${t.nombre}`, String(t.n)]),
        ["Preguntas sobre lecturas", String(r.lecturas.preguntas)],
        ["Mensajes a Sibila", String(r.lecturas.asistente)],
        ["Con error", String(r.lecturas.errores)],
      ],
    },
    {
      titulo: "Correos y redes",
      filas: [
        ["Correos enviados", String(r.correos.enviados), r.correos.porTipo.map((t) => `${t.tipo} ${t.n}`).join(" · ") || undefined],
        ["Correos con error", String(r.correos.errores)],
        ["Carta del día en redes", `${r.redes.cartaDia.publicadas} publicadas`, r.redes.cartaDia.errores ? `${r.redes.cartaDia.errores} errores` : undefined],
        ["Agente de redes", `${r.redes.agente.publicadas} publicadas`, `${r.redes.agente.borradores} por aprobar${r.redes.agente.errores ? ` · ${r.redes.agente.errores} errores` : ""}`],
        ["Sibila respondió en redes", String(r.redes.sibila.respondidas), r.redes.sibila.humano ? `${r.redes.sibila.humano} pidieron una persona` : undefined],
        ["Preguntas en el chat de la página", String(r.redes.sibila.visitantes), "visitantes sin cuenta"],
      ],
    },
    {
      titulo: "Rendimiento en redes",
      filas: r.redes.rendimiento.porTipo.length
        ? [
            ["Vistas de la semana", r.redes.rendimiento.vistasTotal ? String(r.redes.rendimiento.vistasTotal) : "—", "Instagram, si hay permiso de estadísticas"],
            ["Interacciones de la semana", String(r.redes.rendimiento.interaccionesTotal), "me gusta, comentarios, guardados y compartidos"],
            ...(r.redes.rendimiento.mejor
              ? [["Mejor publicación", r.redes.rendimiento.mejor.tipo, `${r.redes.rendimiento.mejor.red} · ${r.redes.rendimiento.mejor.fecha} · ${r.redes.rendimiento.mejor.interacciones} interacciones${r.redes.rendimiento.mejor.vistas !== null ? ` · ${r.redes.rendimiento.mejor.vistas} vistas` : ""}`] as [string, string, string]]
              : []),
            ...r.redes.rendimiento.porTipo.map((t): [string, string, string] => [`  ${t.tipo}`, `${t.interacciones} por publicación`, `${t.publicaciones} publicaciones${t.vistas !== null ? ` · ${t.vistas} vistas en promedio` : ""}`]),
          ]
        : [["Sin cifras todavía", "—", "el cron de métricas corre a mediodía"]],
    },
  ];
}

export function correoResumen(r: ResumenSemanal): { asunto: string; html: string; texto: string } {
  const minuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const periodo = `${minuscula(fechaLargaEs(r.desde))} al ${minuscula(fechaLargaEs(sumarDias(r.hasta, -1)))}`;
  const asunto = `Arcana esta semana: ${r.ventas.ordenes.actual} ventas, ${r.cuentas.nuevas.actual} registros, ${r.lecturas.total.actual} lecturas`;
  const bloques = filasResumen(r);
  const url = `${sitio()}/admin/resumen`;
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px;max-width:620px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">Estado del negocio</p>
<h1 style="font-size:24px;color:#f1d99a;margin:0 0 4px">Arcana, del ${escaparHtml(periodo)}</h1>
<p style="margin:0 0 20px;color:#a89fc0;font-size:14px">Comparado con los siete días anteriores.</p>
${r.alertas.length ? `<div style="background:#2a1620;border:1px solid #ff7b7b55;border-radius:12px;padding:12px 16px;margin:0 0 20px;color:#ffb3b3;font-size:14px">${r.alertas.map((a) => `• ${escaparHtml(a)}`).join("<br>")}</div>` : ""}
${bloques
  .map(
    (b) => `<h2 style="font-size:16px;color:#f1d99a;margin:18px 0 6px;letter-spacing:1px">${escaparHtml(b.titulo)}</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px">${b.filas
      .map(([k, v, c]) => `<tr><td style="padding:6px 0;border-bottom:1px solid #ffffff14;color:${k.startsWith("  ") ? "#a89fc0" : "#ece6f7"};white-space:pre">${escaparHtml(k)}</td><td style="padding:6px 0;border-bottom:1px solid #ffffff14;text-align:right;color:#f1d99a;font-weight:bold">${escaparHtml(v)}</td><td style="padding:6px 0 6px 12px;border-bottom:1px solid #ffffff14;text-align:right;color:#a89fc0;font-size:12px">${escaparHtml(c ?? "")}</td></tr>`)
      .join("")}</table>`,
  )
  .join("")}
<p style="margin:24px 0 0"><a href="${url}" style="display:inline-block;background:#d9b45a;color:#0b0716;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Ver en la app</a></p>
</div>`;
  const texto = [
    `Arcana, del ${periodo}`,
    ...(r.alertas.length ? ["", "Alertas:", ...r.alertas.map((a) => `- ${a}`)] : []),
    ...bloques.flatMap((b) => ["", b.titulo.toUpperCase(), ...b.filas.map(([k, v, c]) => `${k.trim()}: ${v}${c ? ` (${c})` : ""}`)]),
    "",
    url,
  ].join("\n");
  return { asunto, html, texto };
}
