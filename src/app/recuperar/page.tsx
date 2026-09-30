import type { Metadata } from "next";
import { FormularioRecuperar } from "@/components/FormularioAuth";
import { accionRecuperar } from "@/lib/auth/acciones";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.recuperarTitulo };
}

export default async function PaginaRecuperar() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display mb-6 text-4xl font-semibold">{t.auth.recuperarTitulo}</h1>
      <div className="tarjeta p-6">
        <FormularioRecuperar accion={accionRecuperar} />
      </div>
    </div>
  );
}
