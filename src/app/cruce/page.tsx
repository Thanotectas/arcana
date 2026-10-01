import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { COSTOS } from "@/lib/creditos";
import { disponibilidadCruce } from "@/lib/cruce";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaLarga, plantilla } from "@/lib/i18n/formato";
import { CruceSelector } from "@/components/CruceSelector";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.cruce };
}

export default async function PaginaCruce() {
  await requerirUsuario();
  const [perfil, t, idioma, supabase] = await Promise.all([getPerfil(), getT(), getIdioma(), createClient()]);
  if (!perfil) return null;
  const disponibilidad = await disponibilidadCruce(supabase, perfil);
  const fechas = Object.fromEntries(disponibilidad.filter((d) => d.lecturaId && d.lecturaFecha).map((d) => [d.lecturaId!, fechaLarga(d.lecturaFecha!, idioma)]));
  const disponibles = disponibilidad.filter((d) => d.origen).length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.cruce.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.cruce.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.cruce.intro} {plantilla(t.comun.cuesta, { n: COSTOS.cruce, unidad: t.comun.creditos })}{" "}
          {perfil.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil.creditos })}
        </p>
      </div>
      <ul className="grid gap-2 text-sm text-texto-suave sm:grid-cols-3">
        {t.cruce.ejemplos.map((e) => (
          <li key={e} className="tarjeta px-4 py-3">✦ {e}</li>
        ))}
      </ul>
      <div className="tarjeta p-6">
        {disponibles < 2 && <p className="mb-4 text-sm text-texto-suave">{t.cruce.pocosDatos}</p>}
        <CruceSelector disponibilidad={disponibilidad} costo={COSTOS.cruce} fechas={fechas} />
      </div>
    </div>
  );
}
