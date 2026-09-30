import Link from "next/link";
import type { Metadata } from "next";
import { requerirUsuario, getOrdenPorReferencia } from "@/lib/dal";
import { consultarVenta, estadoOrden } from "@/lib/pagos/bold";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Aviso } from "@/components/Aviso";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.creditos.retorno.titulo };
}

/**
 * Página de retorno tras el checkout. El webhook es la fuente de verdad, pero
 * si aún no llegó consultamos la venta directamente en Bold y acreditamos.
 */
export default async function PaginaRetorno({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; "bold-order-id"?: string }>;
}) {
  await requerirUsuario();
  const [params, t] = await Promise.all([searchParams, getT()]);
  const ref = params.ref ?? params["bold-order-id"];
  let orden = ref ? await getOrdenPorReferencia(ref) : null;

  if (orden && orden.estado === "pendiente") {
    const venta = await consultarVenta(orden.referencia);
    const montoPesos = Number(orden.monto_centavos) / 100;
    if (venta?.estado === "APPROVED" && (venta.total === null || venta.total === montoPesos)) {
      await getSupabaseAdmin().rpc("acreditar_orden", {
        p_referencia: orden.referencia,
        p_transaccion_id: venta.transaccionId ?? orden.referencia,
        p_metodo_pago: venta.metodoPago,
      });
      orden = await getOrdenPorReferencia(orden.referencia);
    } else if (venta) {
      const estado = estadoOrden(venta.estado);
      if (estado) {
        await getSupabaseAdmin().from("ordenes").update({ estado, transaccion_id: venta.transaccionId }).eq("id", orden.id);
        orden = { ...orden, estado };
      }
    }
  }

  const estados = t.cuenta.estados as Record<string, string>;

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <h1 className="font-display text-4xl font-semibold">{t.creditos.retorno.titulo}</h1>
      {!orden ? (
        <Aviso>{t.creditos.retorno.noEncontrada}</Aviso>
      ) : orden.estado === "aprobada" ? (
        <Aviso tipo="exito">{plantilla(t.creditos.retorno.aprobada, { n: orden.creditos })}</Aviso>
      ) : orden.estado === "pendiente" ? (
        <Aviso tipo="info">{t.creditos.retorno.pendiente}</Aviso>
      ) : (
        <Aviso>{plantilla(t.creditos.retorno.rechazada, { estado: estados[orden.estado] ?? orden.estado })}</Aviso>
      )}
      <p className="text-xs text-texto-suave">{t.creditos.retorno.referencia}: {ref}</p>
      <div className="flex justify-center gap-3">
        <Link href="/inicio" className="boton boton-primario">{t.creditos.retorno.irInicio}</Link>
        <Link href="/creditos" className="boton boton-secundario">{t.creditos.retorno.verPaquetes}</Link>
      </div>
    </div>
  );
}
