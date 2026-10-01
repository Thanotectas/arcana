import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { DiarioSuenos } from "@/components/DiarioSuenos";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.suenos };
}

export default async function PaginaSuenos() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.suenos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.suenos.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.suenos.intro} {plantilla(t.comun.cuesta, { n: COSTOS.suenos, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <DiarioSuenos />
      </div>
      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl">{t.suenos.consejosTitulo}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-texto-suave">
          {(t.suenos.consejos as unknown as string[]).map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
