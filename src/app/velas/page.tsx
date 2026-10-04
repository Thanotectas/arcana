import type { Metadata } from "next";
import { getPerfil, getUsuarioOpcional } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT, getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { LOCALE_INTL } from "@/lib/i18n/idiomas";
import { proximasLunaciones, type FaseClave } from "@/lib/astro/lunaciones";
import { GuiaVelas } from "@/components/GuiaVelas";
import { FormularioVelas } from "@/components/FormularioVelas";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.velas.titulo, description: t.velas.intro };
}

/** Guía pública de rituales de velas y, con sesión, la lectura de los restos. */
export default async function PaginaVelas() {
  const [usuario, perfil, t, idioma] = await Promise.all([getUsuarioOpcional(), getPerfil(), getT(), getIdioma()]);
  const zona = perfil?.zona_horaria ?? "America/Bogota";
  const lunaciones = proximasLunaciones(new Date(), 8);
  const proximas = {} as Record<FaseClave, string>;
  for (const fase of ["nueva", "creciente", "llena", "menguante"] as FaseClave[]) {
    const l = lunaciones.find((x) => x.fase === fase);
    proximas[fase] = l ? new Date(l.fechaUtc).toLocaleDateString(LOCALE_INTL[idioma], { day: "numeric", month: "long", timeZone: zona }) : "";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.velas.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.velas.titulo}</h1>
        <p className="mt-2 text-texto-suave">{t.velas.intro}</p>
      </div>

      <section className="tarjeta p-6">
        <h2 className="font-display mb-4 text-3xl">{t.velas.guiaTitulo}</h2>
        <GuiaVelas proximas={proximas} />
      </section>

      <section className="tarjeta p-6" id="lectura">
        <h2 className="font-display text-3xl">{t.velas.lecturaTitulo}</h2>
        <p className="mt-2 text-texto-suave">
          {t.velas.lecturaIntro} {plantilla(t.comun.cuesta, { n: COSTOS.velas, unidad: t.comun.creditos })}{" "}
          {usuario ? (perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })) : null}
        </p>
        <div className="mt-5">
          {usuario ? (
            <FormularioVelas />
          ) : (
            <div className="rounded-2xl border border-oro/40 bg-oro/5 p-5 text-center">
              <p className="text-sm text-texto-suave">{t.velas.necesitaCuenta}</p>
              <Link href="/registro" className="boton boton-primario mt-3">{t.comun.crearCuenta}</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
