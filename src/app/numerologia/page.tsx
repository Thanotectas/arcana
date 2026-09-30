import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { NumerologiaInteractiva } from "@/components/NumerologiaInteractiva";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.numerologia };
}

export default async function PaginaNumerologia() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.numerologia.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.numerologia.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.numerologia.intro} {plantilla(t.comun.cuesta, { n: COSTOS.numerologia, unidad: t.comun.credito })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <NumerologiaInteractiva nombreInicial={perfil?.nombre ?? ""} fechaInicial={perfil?.fecha_nacimiento ?? ""} />
      </div>
    </div>
  );
}
