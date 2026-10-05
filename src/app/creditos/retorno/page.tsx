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

  if (orden && orden.estado === "pendiente" && orden.moneda === "COP") {
    const venta = await consultarVenta(orden.referencia);
    const montoPesos = Number(orden.monto_centavos) / 100;
    if (venta?.estado === "APPROVED" && venta.total === montoPesos) {
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
  // Lo acreditado de verdad (paquete + bono de primera compra), según los movimientos de la orden.
  let acreditados = orden?.creditos ?? 0;
  let bono = 0;
  if (orden?.estado === "aprobada") {
    const { data: movimientos } = await getSupabaseAdmin().from("movimientos_creditos").select("cantidad, motivo").eq("referencia", orden.referencia);
    if (movimientos?.length) {
      acreditados = movimientos.reduce((s, m) => s + m.cantidad, 0);
      bono = movimientos.filter((m) => m.motivo === "compra:bono-primera").reduce((s, m) => s + m.cantidad, 0);
    }
  }
  const nombrePaquete = orden ? ((t.creditos.paquetes as Record<string, { nombre: string }>)[orden.paquete]?.nombre ?? orden.paquete) : "";

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <h1 className="font-display text-4xl font-semibold">{t.creditos.retorno.titulo}</h1>
      {!orden ? (
        <Aviso>{t.creditos.retorno.noEncontrada}</Aviso>
      ) : orden.estado === "aprobada" ? (
        <Aviso tipo="exito">
          {bono > 0
            ? plantilla(t.creditos.retorno.aprobadaConBono, { total: acreditados, n: orden.creditos, paquete: nombrePaquete, bono })
            : plantilla(t.creditos.retorno.aprobada, { n: acreditados })}
        </Aviso>
      ) : orden.estado === "pendiente" ? (
        <Aviso tipo="info">{t.creditos.retorno.pendiente}</Aviso>
      ) : (
        <Aviso>{plantilla(t.creditos.retorno.rechazada, { estado: estados[orden.estado] ?? orden.estado })}</Aviso>
      )}
      <p className="text-xs text-texto-suave">{t.creditos.retorno.referencia}: {ref}</p>
      {orden?.estado === "aprobada" ? (
        <div className="flex flex-wrap justify-center gap-3">
          {orden.paquete === "circulo" ? (
            <Link href="/hoy" className="boton boton-primario">{t.crecimiento.retorno.hoy}</Link>
          ) : (
            <Link href="/carta-astral" className="boton boton-primario">{t.crecimiento.retorno.astral}</Link>
          )}
          <Link href="/tarot" className="boton boton-secundario">{t.crecimiento.retorno.tarot}</Link>
          <Link href="/invitar" className="boton boton-fantasma">{t.crecimiento.retorno.invitar}</Link>
        </div>
      ) : (
        <div className="flex justify-center gap-3">
          <Link href="/inicio" className="boton boton-primario">{t.creditos.retorno.irInicio}</Link>
          <Link href="/creditos" className="boton boton-secundario">{t.creditos.retorno.verPaquetes}</Link>
        </div>
      )}
    </div>
  );
}
