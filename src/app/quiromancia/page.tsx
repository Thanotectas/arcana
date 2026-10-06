import Link from "next/link";
import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { FormularioQuiromancia } from "@/components/FormularioQuiromancia";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.quiromancia.titulo };
}

export default async function PaginaQuiromancia() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.quiromancia.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.quiromancia.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.quiromancia.intro}{" "}
          {plantilla(t.comun.cuesta, { n: COSTOS.quiromancia, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
        <p className="mt-1 text-sm"><Link href="/rituales#mano" className="text-oro-suave underline">{t.rituales.verGuia}</Link></p>
      </div>
      <div className="tarjeta p-6">
        <FormularioQuiromancia />
      </div>
    </div>
  );
}
