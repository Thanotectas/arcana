import Link from "next/link";
import type { Metadata } from "next";
import { FormularioEntrar } from "@/components/FormularioAuth";
import { accionEntrar } from "@/lib/auth/acciones";
import { Aviso } from "@/components/Aviso";
import { BotonGoogle } from "@/components/BotonGoogle";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.entrarTitulo };
}

export default async function PaginaEntrar({ searchParams }: { searchParams: Promise<{ volver?: string; error?: string }> }) {
  const [{ volver, error }, t] = await Promise.all([searchParams, getT()]);
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display mb-6 text-4xl font-semibold">{t.auth.entrarTitulo}</h1>
      {error === "google" && <div className="mb-4"><Aviso>{t.auth.errores.google}</Aviso></div>}
      {error === "enlace" && <div className="mb-4"><Aviso>{t.auth.enlaceInvalido}</Aviso></div>}
      <div className="tarjeta p-6">
        <BotonGoogle volver={volver} />
        <div className="my-5 flex items-center gap-3 text-xs text-texto-suave">
          <span className="h-px flex-1 bg-borde" />{t.auth.oConCorreo}<span className="h-px flex-1 bg-borde" />
        </div>
        <FormularioEntrar accion={accionEntrar} volver={volver} />
      </div>
      <p className="mt-4 text-center text-sm text-texto-suave">
        {t.auth.sinCuenta} <Link href="/registro" className="text-oro-suave hover:underline">{t.comun.crearCuenta}</Link>
      </p>
    </div>
  );
}
