"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { paquetePorId, OFERTA_FUNDADORES } from "../creditos";
import { estadoOfertaFundadores } from "./fundadores";
import { nuevaReferencia, pagosConfigurados } from "./bold";
import { crearCheckout } from "./lemon";
import { crearOrdenPaypal } from "./paypal";
import { proveedorInternacional } from "./internacional";
import { getIdioma } from "../i18n/servidor";
import { getSupabaseAdmin } from "../supabase/admin";
import { comprasVisibles } from "../plataforma";
import { cookies, headers } from "next/headers";
import { precioUSDPara } from "./paridad";
import { COOKIE_CODIGO, validarCodigo } from "./codigos";
import { origenPendiente } from "../origen";
import { registrarEventoCompra } from "../eventos-compra";
import { codigoPromo, promoActiva } from "../promo";

/** Código de oferta del formulario o de la cookie del enlace corto; si vale para el paquete, créditos extra. */
async function extrasPorCodigo(paquete: string) {
  const cookie = (await cookies()).get(COOKIE_CODIGO)?.value;
  return async (formData: FormData) => {
    const texto = String(formData.get("codigo") ?? "") || cookie || (promoActiva() ? codigoPromo(await getIdioma()) : "");
    if (!texto) return { codigo: null, extra: 0 };
    const r = await validarCodigo(getSupabaseAdmin(), texto, paquete);
    return r.valido ? { codigo: r.codigo, extra: r.creditosExtra } : { codigo: null, extra: 0 };
  };
}

/** Crea la orden pendiente y lleva a la página que abre el checkout de Bold. */
export async function accionComprar(formData: FormData) {
  // En la app de Google Play no se vende (Play exige su facturación).
  if (!(await comprasVisibles())) redirect("/creditos");
  const idPaquete = String(formData.get("paquete") ?? "");
  await registrarEventoCompra("toco_comprar", { paquete: idPaquete, via: String(formData.get("via") ?? "") || "pagina" });
  const paquete = paquetePorId(idPaquete);
  if (!paquete) redirect("/creditos?error=paquete");
  if (!pagosConfigurados()) redirect("/creditos?error=config");
  if (idPaquete === OFERTA_FUNDADORES.id && !(await estadoOfertaFundadores()).activa) redirect("/creditos?error=oferta");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?volver=/creditos");

  const referencia = nuevaReferencia(user.id);
  const { codigo, extra } = await (await extrasPorCodigo(paquete.id))(formData);
  const origen = (await origenPendiente())?.fuente;

  // La orden la crea el servidor (como la internacional): con un código válido
  // lleva créditos extra, y la política de la tabla solo admite las cantidades
  // exactas de cada paquete y sin código para inserts de la persona.
  const { error } = await getSupabaseAdmin().from("ordenes").insert({
    usuario_id: user.id,
    paquete: paquete.id,
    creditos: paquete.creditos + extra,
    monto_centavos: paquete.precioCOP * 100,
    moneda: "COP",
    referencia,
    estado: "pendiente",
    codigo,
    ...(origen ? { origen } : {}),
  });
  if (error) {
    console.error("[pagos] no se pudo crear la orden", error);
    redirect("/creditos?error=orden");
  }

  redirect(`/creditos/pagar?ref=${encodeURIComponent(referencia)}`);
}

/**
 * Compra internacional (fuera de Colombia): orden en USD creada por el
 * servidor y pago en PayPal (o el checkout de Lemon Squeezy si se reactiva).
 * Con PayPal acredita la ruta de retorno al capturar; el webhook es el respaldo.
 */
export async function accionComprarInternacional(formData: FormData) {
  if (!(await comprasVisibles())) redirect("/creditos");
  const idPaquete = String(formData.get("paquete") ?? "");
  await registrarEventoCompra("toco_comprar", { paquete: idPaquete, via: String(formData.get("via") ?? "") || "pagina" });
  const paquete = paquetePorId(idPaquete);
  if (!paquete) redirect("/creditos?moneda=usd&error=paquete");
  if (idPaquete === OFERTA_FUNDADORES.id && !(await estadoOfertaFundadores()).activa) redirect("/creditos?moneda=usd&error=oferta");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/entrar?volver=/creditos");
  const proveedor = proveedorInternacional(user.email);
  if (!proveedor) redirect("/creditos?moneda=usd&error=config");

  const referencia = nuevaReferencia(user.id);
  const admin = getSupabaseAdmin();
  const { codigo, extra } = await (await extrasPorCodigo(paquete.id))(formData);
  const origen = (await origenPendiente())?.fuente;
  // Precio ajustado al país de quien compra (India, Indonesia, África, Turquía…); el webhook valida este monto.
  const monto = precioUSDPara(paquete.precioUSDCentavos, (await headers()).get("x-vercel-ip-country"));
  const { error } = await admin.from("ordenes").insert({
    usuario_id: user.id,
    paquete: paquete.id,
    creditos: paquete.creditos + extra,
    monto_centavos: monto,
    moneda: "USD",
    referencia,
    estado: "pendiente",
    codigo,
    ...(origen ? { origen } : {}),
  });
  if (error) {
    console.error("[pagos] no se pudo crear la orden internacional", error);
    redirect("/creditos?moneda=usd&error=orden");
  }

  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");

  if (proveedor === "paypal") {
    const creditos = paquete.creditos + extra;
    const orden = await crearOrdenPaypal({
      referencia,
      montoCentavos: monto,
      descripcion: `Arcana · ${paquete.id === "circulo" || paquete.id === OFERTA_FUNDADORES.id ? "Círculo Arcana (30 días)" : `${creditos} créditos`}`,
      urlRetorno: `${base}/api/pagos/paypal/retorno?ref=${encodeURIComponent(referencia)}`,
      urlCancelar: `${base}/creditos?moneda=usd&error=cancelado`,
      idioma: await getIdioma(),
    });
    if (!orden) {
      await admin.from("ordenes").update({ estado: "error" }).eq("referencia", referencia);
      redirect("/creditos?moneda=usd&error=checkout");
    }
    // El id de PayPal queda en transaccion_id hasta la captura (que lo reemplaza por el id del cobro).
    await admin.from("ordenes").update({ transaccion_id: orden.id }).eq("referencia", referencia);
    redirect(orden.urlAprobar);
  }

  const { data: perfil } = await supabase.from("perfiles").select("nombre").eq("id", user.id).maybeSingle();
  const url = await crearCheckout({ paquete: idPaquete, referencia, email: user.email, nombre: perfil?.nombre, urlRetorno: `${base}/creditos/retorno?ref=${encodeURIComponent(referencia)}`, precioCentavos: monto !== paquete.precioUSDCentavos ? monto : undefined });
  if (!url) {
    await admin.from("ordenes").update({ estado: "error" }).eq("referencia", referencia);
    redirect("/creditos?moneda=usd&error=checkout");
  }
  redirect(url);
}

/**
 * Compra en un toque desde la invitación «se terminaron tus créditos»: el paquete Inicial (alcanza para casi
 * cualquier lectura, más el regalo de la primera compra), en dólares con PayPal fuera de Colombia y en pesos con
 * Bold en Colombia, sin pasar por la página de paquetes.
 */
export async function accionCompraRapida(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?volver=/creditos");
  const pais = (await headers()).get("x-vercel-ip-country") ?? "CO";
  const datos = new FormData();
  datos.set("paquete", "inicial");
  datos.set("via", "rapida");
  const codigo = formData.get("codigo");
  if (codigo) datos.set("codigo", String(codigo));
  if (pais !== "CO" && proveedorInternacional(user.email)) return accionComprarInternacional(datos);
  return accionComprar(datos);
}
