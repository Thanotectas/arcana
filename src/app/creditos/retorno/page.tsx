import Link from "next/link";
import type { Metadata } from "next";
import { requerirUsuario, getOrdenPorReferencia } from "@/lib/dal";
import { consultarVenta, estadoOrden } from "@/lib/pagos/bold";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { Aviso } from "@/components/Aviso";

export const metadata: Metadata = { title: "Resultado del pago" };

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
  const params = await searchParams;
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

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <h1 className="font-display text-4xl font-semibold">Resultado del pago</h1>
      {!orden ? (
        <Aviso>No encontramos la orden. Si el pago se descontó, escríbenos con la referencia.</Aviso>
      ) : orden.estado === "aprobada" ? (
        <Aviso tipo="exito">Pago aprobado. Se acreditaron {orden.creditos} créditos a tu cuenta.</Aviso>
      ) : orden.estado === "pendiente" ? (
        <Aviso tipo="info">Tu pago está en proceso. Los créditos se acreditarán automáticamente cuando el banco confirme. Puedes revisar en unos minutos en Mi cuenta.</Aviso>
      ) : (
        <Aviso>El pago no fue aprobado ({orden.estado}). No se realizó ningún cargo. Puedes intentarlo de nuevo.</Aviso>
      )}
      <p className="text-xs text-texto-suave">Referencia: {ref}</p>
      <div className="flex justify-center gap-3">
        <Link href="/inicio" className="boton boton-primario">Ir al inicio</Link>
        <Link href="/creditos" className="boton boton-secundario">Ver paquetes</Link>
      </div>
    </div>
  );
}
