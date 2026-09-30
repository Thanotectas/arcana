"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { paquetePorId } from "../creditos";
import { nuevaReferencia, pagosConfigurados } from "./bold";

/** Crea la orden pendiente y lleva a la página que abre el checkout de Bold. */
export async function accionComprar(formData: FormData) {
  const paquete = paquetePorId(String(formData.get("paquete") ?? ""));
  if (!paquete) redirect("/creditos?error=paquete");
  if (!pagosConfigurados()) redirect("/creditos?error=config");

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
