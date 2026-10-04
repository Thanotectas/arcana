import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { FormularioAura } from "@/components/FormularioAura";
import { Aura } from "@/components/Aura";
import { COLORES_AURA, TONO_AURA } from "@/lib/aura";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.aura.titulo, description: t.aura.intro };
}

export default async function PaginaAura() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const colores = t.aura.colores as Record<string, { nombre: string; rasgos: string }>;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_200px]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.aura.seccion}</p>
          <h1 className="font-display text-4xl font-semibold">{t.aura.titulo}</h1>
          <p className="mt-2 text-texto-suave">
            {t.aura.intro} {plantilla(t.comun.cuesta, { n: COSTOS.aura, unidad: t.comun.creditos })}{" "}
            {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
          </p>
        </div>
        <Aura principal="violeta" secundario="dorado" tamano={200} />
      </div>

      <details className="tarjeta p-5">
        <summary className="cursor-pointer font-display text-xl">{t.aura.queColores}</summary>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {COLORES_AURA.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: TONO_AURA[c] }} />
              <span><strong className="text-texto">{colores[c]?.nombre}</strong> <span className="text-texto-suave">· {colores[c]?.rasgos}</span></span>
            </li>
          ))}
        </ul>
        {!perfil?.fecha_nacimiento && <p className="mt-4 text-xs text-texto-suave">{t.aura.sinFecha}</p>}
      </details>

      <div className="tarjeta p-6">
        <FormularioAura nombreInicial={perfil?.nombre ?? ""} />
      </div>
    </div>
  );
}
