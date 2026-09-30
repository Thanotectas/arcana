import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { CompatibilidadInteractiva } from "@/components/CompatibilidadInteractiva";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.compatibilidad };
}

export default async function PaginaCompatibilidad() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.compatibilidad.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.compatibilidad.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.compatibilidad.intro} {plantilla(t.comun.cuesta, { n: COSTOS.compatibilidad, unidad: t.comun.credito })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <CompatibilidadInteractiva nombreInicial={perfil?.nombre ?? ""} />
      </div>
    </div>
  );
}
