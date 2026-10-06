import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { BONO_PRIMERA_COMPRA, COSTOS, OFERTA_FUNDADORES, PAQUETES, PAQUETE_CIRCULO, PAQUETE_PRUEBA, formatoCOP } from "@/lib/creditos";
import { estadoOfertaFundadores } from "@/lib/pagos/fundadores";
import { diccionario } from "@/lib/i18n/diccionarios";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { cartaDelDia, fechaBogota, frase, mazoDelDia } from "@/lib/redes/carta-dia";
import { fechaLargaEs } from "@/lib/redes/calendario";
import { MAZOS } from "@/lib/tarot/mazos";
import { enviarImagen, enviarTexto } from "./api";

/**
 * Sibila como agente de atención por WhatsApp: responde dudas sobre Arcana
 * (qué es, precios, cómo entrar, cómo pagar), manda la carta del día y pasa
 * con una persona cuando se lo piden. No hace lecturas por WhatsApp: las
 * lecturas viven en la app.
 */
const MARCA_CARTA = "«ENVIAR_CARTA»";
const MARCA_HUMANO = "«PASAR_A_PERSONA»";

/** Mensajes por número y día: frena abusos y gasto de IA. */
const MAXIMO_POR_DIA = 40;
/** Cuántos mensajes anteriores entran como contexto. */
const CONTEXTO = 16;

function usd(centavos: number) {
  return `US$ ${(centavos / 100).toFixed(2)}`;
}

/** Hechos del producto, calculados desde el código para que los precios nunca queden viejos. */
async function hechos() {
  const t = diccionario("es");
  const modulos = t.portada.modulos as Record<string, { titulo: string; texto: string }>;
  const lista = Object.values(modulos).map((m) => `- ${m.titulo}: ${m.texto}`).join("\n");
  const paquetes = [PAQUETE_PRUEBA, ...PAQUETES, PAQUETE_CIRCULO]
    .map((p) => `- ${p.nombre}: ${p.creditos} crédito${p.creditos === 1 ? "" : "s"} por ${formatoCOP(p.precioCOP)} (${usd(p.precioUSDCentavos)} fuera de Colombia)${p.id === "circulo" ? ", incluye 30 días de Círculo" : ""}`)
    .join("\n");
  const f = await estadoOfertaFundadores();
  const oferta = f.activa
    ? `Oferta de fundadores vigente: el Círculo Arcana a ${formatoCOP(OFERTA_FUNDADORES.precioCOP)} (${usd(OFERTA_FUNDADORES.precioUSDCentavos)}) en lugar de ${formatoCOP(PAQUETE_CIRCULO.precioCOP)}, solo ${OFERTA_FUNDADORES.cupo} cupos, quedan ${f.restantes}, hasta el ${fechaLargaEs(OFERTA_FUNDADORES.hasta.slice(0, 10))}. Se compra en ${sitio()}/creditos.`
    : "No hay oferta especial vigente.";
  const c = cartaDelDia(fechaBogota());
  return `HECHOS DE ARCANA (usa solo esto; si no sabes algo, dilo y ofrece pasar con una persona):
- Arcana es una app web y de Android (Google Play) en ${sitio()} donde Sibila, la guía, escribe lecturas personales: tarot (Rider-Waite, Marsella, Oráculo de los Ángeles y Tarot Arcana), carta astral con cálculo astronómico real, numerología, sueños, lectura de la mano por foto, chocolate, tabaco, velas, I Ching, calendario chino, aura, compatibilidad, sinastría y lecturas cruzadas. Idiomas: español, inglés y portugués.
- Gratis sin pagar: la carta del día (una por día), el horóscopo, el calendario lunar, las guías de rituales (${sitio()}/rituales) y las de velas. Al crear la cuenta se regalan 3 créditos.
- Las lecturas cuestan créditos: tirada de tres cartas ${COSTOS.tarot_tres}, Cruz Celta ${COSTOS.tarot_celta}, carta astral ${COSTOS.carta_astral}, numerología ${COSTOS.numerologia}, sueños ${COSTOS.suenos}, lectura de la mano ${COSTOS.quiromancia}, chocolate ${COSTOS.chocolate}, velas ${COSTOS.velas}, tabaco ${COSTOS.tabaco}, I Ching ${COSTOS.iching}, calendario chino ${COSTOS.chino}, aura ${COSTOS.aura}, compatibilidad ${COSTOS.compatibilidad}, sinastría ${COSTOS.sinastria}, cruce ${COSTOS.cruce}.
- Paquetes de créditos (se compran en ${sitio()}/creditos con la cuenta abierta):
${paquetes}
- La primera compra trae ${BONO_PRIMERA_COMPRA} créditos extra de regalo. El Círculo Arcana da 30 días con "tu cielo hoy" cada mañana y preguntas a Sibila sin cobro.
- ${oferta}
- Pago en Colombia con Bold: Nequi, PSE, tarjetas de crédito y débito. Fuera de Colombia con tarjeta en dólares. Los créditos se acreditan solos al aprobarse el pago; si no aparecen en unos minutos, que escriba aquí y una persona lo revisa.
- Cómo empezar: entrar a ${sitio()}, "Crear cuenta" con Google o correo, y ya puede sacar su carta del día gratis.
- Invitar amigos: cada cuenta tiene un enlace en ${sitio()}/invitar; quien llega por él recibe créditos extra y quien invita también cuando el invitado hace su primera lectura.
- Las lecturas son para reflexión y entretenimiento; no reemplazan consejo médico, legal, psicológico ni financiero.
- Carta del día de hoy para todos (${fechaLargaEs(fechaBogota())}): ${c.nombre} (${mazoDelDia(fechaBogota()) === "arcana" ? "Tarot Arcana" : MAZOS[mazoDelDia(fechaBogota())].nombre}). ${frase(c.significado, 200)}
- Lecturas de la app, módulo por módulo:
${lista}`;
}

const INSTRUCCIONES = `Estás atendiendo la línea de WhatsApp de Arcana. Responde como Sibila, cálida y breve.
Reglas de este canal:
- Mensajes cortos: máximo 5 líneas o 500 caracteres. Sin títulos, sin tablas, sin listas largas. Puedes usar *negrita* de WhatsApp y un emoji como mucho.
- Escribe en el idioma en que te escriben (español por defecto). Tutea.
- No hagas lecturas por WhatsApp (ni tarot, ni carta astral, ni interpretar sueños o fotos): explica con cariño que las lecturas se hacen en la app, di cuánto cuesta esa lectura y manda el enlace. La única excepción es la carta del día para todos.
- Si la persona pide su carta del día, o pregunta qué carta salió hoy, escribe exactamente ${MARCA_CARTA} al final de tu respuesta y la app enviará la imagen.
- Si pide hablar con una persona, tiene un problema de pago o de cuenta que no puedas resolver con los hechos, o se molesta, escribe exactamente ${MARCA_HUMANO} al final: avisaremos a una persona del equipo, y dile que le escribirán por este mismo chat.
- No inventes precios, funciones ni plazos. Si algo no está en los hechos, dilo.
- No pidas datos sensibles (contraseñas, números de tarjeta). Para la fecha de nacimiento o datos de la cuenta, remite a la app.`;

/** ¿Cuántos mensajes mandó este número hoy? */
async function mensajesHoy(admin: SupabaseClient<Database>, telefono: string) {
  const inicio = `${fechaBogota()}T05:00:00.000Z`;
  const { count } = await admin.from("mensajes_whatsapp").select("id", { count: "exact", head: true }).eq("telefono", telefono).eq("rol", "persona").gte("creado_en", inicio);
  return count ?? 0;
}

async function avisarHumano(telefono: string, nombre: string | null, ultimos: { rol: string; contenido: string }[]) {
  const [para] = correosAdmin();
  if (!para) return;
  const url = `${sitio()}/admin/whatsapp`;
  const hilo = ultimos.map((m) => `${m.rol === "persona" ? nombre ?? telefono : "Sibila"}: ${m.contenido}`).join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">WhatsApp</p>
<h1 style="font-size:22px;color:#f1d99a;margin:0 0 12px">${escaparHtml(nombre ?? telefono)} quiere hablar con una persona</h1>
<pre style="white-space:pre-wrap;font-family:inherit;color:#d9d2ea;line-height:1.5">${escaparHtml(hilo)}</pre>
<p style="margin:20px 0 0"><a href="${url}" style="display:inline-block;background:#d9b45a;color:#0b0716;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Responder desde el panel</a></p>
</div>`;
  await enviarCorreo({ para, asunto: `WhatsApp: ${nombre ?? telefono} pide hablar con alguien`, html, texto: `${nombre ?? telefono} pide hablar con alguien.\n\n${hilo}\n\n${url}`, etiqueta: "whatsapp_humano" });
}

/**
 * Atiende un mensaje de texto: lo guarda, pide la respuesta a Sibila con el
 * hilo reciente como contexto, la envía y la guarda. Devuelve qué hizo.
 */
export async function atender(admin: SupabaseClient<Database>, telefono: string, nombre: string | null, idMeta: string, texto: string): Promise<string> {
  // Guardar el entrante; si el id ya existe, Meta reintentó el aviso y no se responde dos veces.
  const { error } = await admin.from("mensajes_whatsapp").insert({ telefono, nombre, rol: "persona", contenido: texto.slice(0, 4000), id_meta: idMeta });
  if (error) {
    if (error.code === "23505") return "duplicado";
    throw new Error(`guardar: ${error.message}`);
  }

  if ((await mensajesHoy(admin, telefono)) > MAXIMO_POR_DIA) {
    await enviarTexto(telefono, "Por hoy ya conversamos bastante 🌙 Mañana sigo aquí. Si es urgente, escribe «persona» y alguien del equipo te contesta.");
    return "limite";
  }

  const { data: previos } = await admin
    .from("mensajes_whatsapp")
    .select("rol, contenido, humano")
    .eq("telefono", telefono)
    .order("creado_en", { ascending: false })
    .limit(CONTEXTO + 1);
  const hilo = (previos ?? []).reverse();
  const conversacion = hilo.slice(0, -1).map((m) => `${m.rol === "persona" ? "Persona" : "Sibila"}: «${m.contenido.replace(/»/g, "”")}»`).join("\n");
  const entrada = `${conversacion ? `Conversación reciente:\n${conversacion}\n\n` : ""}Nuevo mensaje de ${nombre ? `«${nombre}»` : "la persona"}: «${texto.replace(/»/g, "”")}»`;

  let respuesta = await generarTexto(entrada, `${INSTRUCCIONES}\n\n${await hechos()}`, { effort: "low", maxTokens: 500, nivel: "estandar", idioma: "es" });

  const mandaCarta = respuesta.includes(MARCA_CARTA);
  const pideHumano = respuesta.includes(MARCA_HUMANO);
  respuesta = respuesta.replace(MARCA_CARTA, "").replace(MARCA_HUMANO, "").replace(/^#+\s*/gm, "").trim();
  if (!respuesta) respuesta = "Aquí estoy 🌙 ¿En qué te ayudo con Arcana?";

  await enviarTexto(telefono, respuesta);
  await admin.from("mensajes_whatsapp").insert({ telefono, nombre, rol: "asistente", contenido: respuesta, humano: pideHumano });

  if (mandaCarta) {
    const fecha = fechaBogota();
    const c = cartaDelDia(fecha);
    const imagen = `${sitio()}/api/redes/carta-dia?fecha=${fecha}`;
    await enviarImagen(telefono, imagen, `${c.nombre} · carta del día. Saca la tuya gratis en ${sitio()}`).catch((e) => console.error("[whatsapp carta]", e));
  }
  if (pideHumano) {
    await admin.from("mensajes_whatsapp").update({ humano: true }).eq("id_meta", idMeta);
    await avisarHumano(telefono, nombre, [...hilo.map((m) => ({ rol: m.rol, contenido: m.contenido })), { rol: "asistente", contenido: respuesta }]).catch((e) => console.error("[whatsapp aviso]", e));
  }
  return pideHumano ? "humano" : mandaCarta ? "carta" : "respondido";
}
