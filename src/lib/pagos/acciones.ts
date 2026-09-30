"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "../supabase/server";
import { paquetePorId } from "../creditos";
import { nuevaReferencia, pagosConfigurados, urlCheckout } from "./wompi";

/** Crea la orden pendiente y redirige al Web Checkout de Wompi. */
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
  const montoCentavos = paquete.precioCOP * 100;

  const { error } = await supabase.from("ordenes").insert({
    usuario_id: user.id,
    paquete: paquete.id,
    creditos: paquete.creditos,
    monto_centavos: montoCentavos,
    moneda: "COP",
    referencia,
    estado: "pendiente",
  });
  if (error) {
    console.error("[pagos] no se pudo crear la orden", error);
    redirect("/creditos?error=orden");
  }

  const h = await headers();
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const { data: perfil } = await supabase.from("perfiles").select("nombre").eq("id", user.id).maybeSingle();

  redirect(
    urlCheckout({
      referencia,
      montoCentavos,
      moneda: "COP",
      redirectUrl: `${base}/creditos/retorno?ref=${encodeURIComponent(referencia)}`,
      email: user.email ?? undefined,
      nombre: (perfil?.nombre as string | undefined) ?? undefined,
    }),
  );
}
