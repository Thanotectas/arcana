import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionAbjad } from "@/lib/abjad/acciones";
import { LETRAS_ABJAD, ELEMENTO_LETRA } from "@/lib/abjad/calculo";
import { TEXTOS_ABJAD } from "@/lib/abjad/textos";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CamposAbjad } from "@/components/abjad/CamposAbjad";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = TEXTOS_ABJAD[await getIdioma()];
  return { title: t.titulo, description: t.descripcionMeta };
}

export default async function PaginaAbjad() {
  await requerirUsuario();
  const [perfil, comun, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const t = TEXTOS_ABJAD[idioma];
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PortadaProducto clave="abjad" />
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.intro} {perfil?.ilimitado ? comun.comun.tuCuentaIlimitada : plantilla(comun.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionAbjad} textoBoton={plantilla(t.calcular, { n: COSTOS.abjad })} textoCargando={t.calculando}>
          <CamposAbjad nombreInicial={perfil?.nombre ?? ""} />
          <p className="text-xs text-texto-suave">{t.marco}</p>
        </FormularioLectura>
      </div>
      <details className="tarjeta p-6">
        <summary className="cursor-pointer font-display text-xl text-oro-suave">{t.comoTitulo}</summary>
        <div className="mt-4 space-y-4 text-sm text-texto-suave">
          <p>{t.comoTexto}</p>
          <ol dir="rtl" className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
            {LETRAS_ABJAD.map((l) => (
              <li key={l.letra} className="flex flex-col items-center rounded-lg border border-borde bg-superficie-2/60 py-1.5">
                <span lang="ar" className="font-display text-2xl leading-none text-texto">{l.letra}</span>
                <span className="text-xs font-semibold text-oro-suave">{l.valor}</span>
                <span className="text-[0.6rem] text-texto-suave">{t.elemento[ELEMENTO_LETRA[l.letra]]}</span>
              </li>
            ))}
          </ol>
          <p>{t.transcripcionTexto}</p>
        </div>
      </details>
    </div>
  );
}
