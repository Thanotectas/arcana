import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { requerirUsuario, getOrdenPorReferencia, getPerfil } from "@/lib/dal";
import { paquetePorId, formatoCOP } from "@/lib/creditos";
import { BOLD_SCRIPT_URL, boldEnv, firmaIntegridad } from "@/lib/pagos/bold";
import { CheckoutBold } from "@/components/CheckoutBold";
import { Aviso } from "@/components/Aviso";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.creditos.pagar.seccion };
}

/** Resumen de la orden y botón de pagos de Bold (firma calculada en el servidor). */
export default async function PaginaPagar({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const user = await requerirUsuario();
  const [{ ref }, t] = await Promise.all([searchParams, getT()]);
  const orden = ref ? await getOrdenPorReferencia(ref) : null;

  if (!orden || orden.estado !== "pendiente") {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <Aviso>{orden ? t.creditos.pagar.yaProcesada : t.creditos.pagar.noEncontrada}</Aviso>
        <Link href="/creditos" className="boton boton-secundario">{t.creditos.pagar.volverPaquetes}</Link>
      </div>
    );
  }

  const paquete = paquetePorId(orden.paquete);
  const nombrePaquete = (t.creditos.paquetes as Record<string, { nombre: string }>)[orden.paquete]?.nombre ?? paquete?.nombre ?? orden.paquete;
  const perfil = await getPerfil();
  const montoPesos = Number(orden.monto_centavos) / 100;
  const h = await headers();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.creditos.pagar.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{plantilla(t.creditos.pagar.paquete, { nombre: nombrePaquete })}</h1>
        <p className="mt-2 text-texto-suave">
          {plantilla(t.creditos.pagar.resumen, { n: orden.creditos })} <strong className="text-oro-suave">{formatoCOP(montoPesos)}</strong>
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
          descripcion={plantilla(t.creditos.pagar.descripcion, { n: orden.creditos, paquete: nombrePaquete })}
          redirectUrl={`${base}/creditos/retorno?ref=${encodeURIComponent(orden.referencia)}`}
          email={user.email ?? undefined}
          nombre={perfil?.nombre ?? undefined}
        />
        <p className="text-xs text-texto-suave">{t.creditos.procesados}</p>
      </div>

      <p className="text-xs text-texto-suave">{t.creditos.retorno.referencia}: {orden.referencia}</p>
      <Link href="/creditos" className="text-sm text-texto-suave underline">{t.creditos.pagar.cancelar}</Link>
    </div>
  );
}
