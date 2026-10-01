import type { Metadata } from "next";
import { requerirUsuario, getPerfil, horaDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { RuedaChina } from "@/components/RuedaChina";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.chino };
}

export default async function PaginaChino() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.chino.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.chino.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.chino.intro} {plantilla(t.comun.cuesta, { n: COSTOS.chino, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <RuedaChina nombreInicial={perfil?.nombre ?? ""} fechaInicial={perfil?.fecha_nacimiento ?? ""} horaInicial={horaDePerfil(perfil)} />
      </div>
    </div>
  );
}
