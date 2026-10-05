"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { paquetePorId, OFERTA_FUNDADORES } from "../creditos";
import { estadoOfertaFundadores } from "./fundadores";
import { nuevaReferencia, pagosConfigurados } from "./bold";
import { crearCheckout, pagosInternacionalesConfigurados } from "./lemon";
import { getSupabaseAdmin } from "../supabase/admin";

/** Crea la orden pendiente y lleva a la página que abre el checkout de Bold. */
export async function accionComprar(formData: FormData) {
  const idPaquete = String(formData.get("paquete") ?? "");
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

  const { error } = await supabase.from("ordenes").insert({
    usuario_id: user.id,
    paquete: paquete.id,
    creditos: paquete.creditos,
    monto_centavos: paquete.precioCOP * 100,
    moneda: "COP",
    referencia,
    estado: "pendiente",
  });
  if (error) {
    console.error("[pagos] no se pudo crear la orden", error);
    redirect("/creditos?error=orden");
  }

  redirect(`/creditos/pagar?ref=${encodeURIComponent(referencia)}`);
}

/**
 * Compra internacional (fuera de Colombia): orden en USD creada por el
 * servidor y checkout alojado de Lemon Squeezy. El webhook acredita.
 */
export async function accionComprarInternacional(formData: FormData) {
  const idPaquete = String(formData.get("paquete") ?? "");
  const paquete = paquetePorId(idPaquete);
  if (!paquete) redirect("/creditos?moneda=usd&error=paquete");
  if (!pagosInternacionalesConfigurados()) redirect("/creditos?moneda=usd&error=config");
  if (idPaquete === OFERTA_FUNDADORES.id && !(await estadoOfertaFundadores()).activa) redirect("/creditos?moneda=usd&error=oferta");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/entrar?volver=/creditos");

  const referencia = nuevaReferencia(user.id);
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("ordenes").insert({
    usuario_id: user.id,
    paquete: paquete.id,
    creditos: paquete.creditos,
    monto_centavos: paquete.precioUSDCentavos,
    moneda: "USD",
    referencia,
    estado: "pendiente",
  });
  if (error) {
    console.error("[pagos] no se pudo crear la orden internacional", error);
    redirect("/creditos?moneda=usd&error=orden");
  }

  const { data: perfil } = await supabase.from("perfiles").select("nombre").eq("id", user.id).maybeSingle();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
  const url = await crearCheckout({ paquete: idPaquete, referencia, email: user.email, nombre: perfil?.nombre, urlRetorno: `${base}/creditos/retorno?ref=${encodeURIComponent(referencia)}` });
  if (!url) {
    await admin.from("ordenes").update({ estado: "error" }).eq("referencia", referencia);
    redirect("/creditos?moneda=usd&error=checkout");
  }
  redirect(url);
}
