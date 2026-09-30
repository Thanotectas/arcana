import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { requerirUsuario, getOrdenPorReferencia, getPerfil } from "@/lib/dal";
import { paquetePorId, formatoCOP } from "@/lib/creditos";
import { BOLD_SCRIPT_URL, boldEnv, firmaIntegridad } from "@/lib/pagos/bold";
import { CheckoutBold } from "@/components/CheckoutBold";
import { Aviso } from "@/components/Aviso";

export const metadata: Metadata = { title: "Pagar" };

/** Resumen de la orden y botón de pagos de Bold (firma calculada en el servidor). */
export default async function PaginaPagar({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const user = await requerirUsuario();
  const { ref } = await searchParams;
  const orden = ref ? await getOrdenPorReferencia(ref) : null;

  if (!orden || orden.estado !== "pendiente") {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <Aviso>{orden ? "Esta orden ya fue procesada." : "No encontramos la orden."}</Aviso>
        <Link href="/creditos" className="boton boton-secundario">Volver a los paquetes</Link>
      </div>
    );
  }

  const paquete = paquetePorId(orden.paquete);
  const perfil = await getPerfil();
  const montoPesos = Number(orden.monto_centavos) / 100;
  const h = await headers();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Pago</p>
        <h1 className="font-display text-4xl font-semibold">Paquete {paquete?.nombre ?? orden.paquete}</h1>
        <p className="mt-2 text-texto-suave">
          {orden.creditos} créditos por <strong className="text-oro-suave">{formatoCOP(montoPesos)}</strong>
        </p>
      </div>

      <div className="tarjeta space-y-4 p-6">
        <CheckoutBold
          scriptUrl={BOLD_SCRIPT_URL}
          apiKey={boldEnv().apiKey}
          orderId={orden.referencia}
          montoPesos={montoPesos}
          moneda={orden.moneda}
          firma={firmaIntegridad(orden.referencia, montoPesos, orden.moneda)}
          descripcion={`Arcana: ${orden.creditos} créditos (${paquete?.nombre ?? orden.paquete})`}
          redirectUrl={`${base}/creditos/retorno?ref=${encodeURIComponent(orden.referencia)}`}
          email={user.email ?? undefined}
          nombre={perfil?.nombre ?? undefined}
        />
        <p className="text-xs text-texto-suave">
          Pagos procesados por Bold: tarjetas, PSE, Nequi y más. Los créditos se acreditan automáticamente al aprobarse el pago.
        </p>
      </div>

      <p className="text-xs text-texto-suave">Referencia: {orden.referencia}</p>
      <Link href="/creditos" className="text-sm text-texto-suave underline">Cancelar y volver</Link>
    </div>
  );
}
