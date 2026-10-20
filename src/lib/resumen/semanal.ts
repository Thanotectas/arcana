import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { escaparHtml, sitio } from "@/lib/correo";
import { NOMBRES_LECTURA, OFERTA_FUNDADORES, formatoCOP, type TipoLectura } from "@/lib/creditos";
import { estadoOfertaFundadores } from "@/lib/pagos/fundadores";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { fechaLargaEs, sumarDias } from "@/lib/redes/calendario";
import { interacciones, promediosPorTipo, type PromedioTipo } from "@/lib/redes/metricas";

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
  /** Por dónde llegan: origen (red) de las cuentas nuevas y de quienes pagaron en la semana. */
  origenes: { cuentas: { origen: string; n: number }[]; sinOrigen: number; pagos: { origen: string; n: number; cop: number; usdCentavos: number }[] };
  alertas: string[];
}

export const NOMBRE_ORIGEN: Record<string, string> = { youtube: "YouTube", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", whatsapp: "WhatsApp", google: "Google", bing: "Bing", x: "X", pinterest: "Pinterest", desconocido: "Sin origen conocido" };
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

  const { data: ordenes, error: errorOrdenes } = await admin
    .from("ordenes")
    .select("usuario_id, paquete, monto_centavos, moneda, creado_en")
    .eq("estado", "aprobada")
    .eq("es_prueba", false)
    .gte("creado_en", iso(desdeAnterior))
    .lt("creado_en", iso(hasta))
    .limit(5000);
  if (errorOrdenes) throw new Error(`ordenes: ${errorOrdenes.message}`);
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
  if (resumen.cuentas.sinCreditos >= 10) a.push(`${resumen.cuentas.sinCreditos} cuentas están sin créditos: candidatas a un correo con el paquete de 1 crédito.`);
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
