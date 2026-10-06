import Link from "next/link";
import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { FormularioTabaco } from "@/components/FormularioTabaco";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.tabaco.titulo, description: t.tabaco.intro };
}

export default async function PaginaTabaco() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const senales = t.tabaco.senales as readonly { nombre: string; texto: string }[];
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.tabaco.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.tabaco.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.tabaco.intro} {plantilla(t.comun.cuesta, { n: COSTOS.tabaco, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
        <p className="mt-1 text-sm"><Link href="/rituales#tabaco" className="text-oro-suave underline">{t.rituales.verGuia}</Link></p>
      </div>

      <details className="tarjeta p-5">
        <summary className="cursor-pointer font-display text-xl">{t.tabaco.queSeLee}</summary>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {senales.map((s) => (
            <div key={s.nombre} className="rounded-xl border border-borde p-3 text-sm">
              <dt className="font-semibold text-oro-suave">{s.nombre}</dt>
              <dd className="mt-1 text-texto-suave">{s.texto}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-texto-suave">{t.tabaco.consejo}</p>
      </details>

      <div className="tarjeta p-6">
        <FormularioTabaco />
      </div>
    </div>
  );
}
