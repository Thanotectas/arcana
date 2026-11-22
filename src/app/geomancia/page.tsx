import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionGeomancia } from "@/lib/geomancia/acciones";
import { TEXTOS_GEOMANCIA } from "@/lib/geomancia/textos";
import { FormularioLectura } from "@/components/FormularioLectura";
import { TrazadoGeomancia } from "@/components/geomancia/TrazadoGeomancia";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = TEXTOS_GEOMANCIA[await getIdioma()];
  return { title: t.titulo, description: t.descripcionMeta };
}

export default async function PaginaGeomancia() {
  await requerirUsuario();
  const [perfil, comun, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const t = TEXTOS_GEOMANCIA[idioma];
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.intro} {perfil?.ilimitado ? comun.comun.tuCuentaIlimitada : plantilla(comun.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionGeomancia} textoBoton={plantilla(t.calcular, { n: COSTOS.geomancia })} textoCargando={t.calculando}>
          <div>
            <label className="etiqueta" htmlFor="pregunta">{t.pregunta}</label>
            <textarea id="pregunta" name="pregunta" className="campo min-h-20" placeholder={t.preguntaPlaceholder} required maxLength={300} />
            <p className="mt-1 text-xs text-texto-suave">{t.preguntaAyuda}</p>
          </div>
          <TrazadoGeomancia />
          <p className="text-xs text-texto-suave">{t.marco}</p>
        </FormularioLectura>
      </div>
      <details className="tarjeta p-6">
        <summary className="cursor-pointer font-display text-xl text-oro-suave">{t.comoTitulo}</summary>
        <p className="mt-4 text-sm text-texto-suave">{t.comoTexto}</p>
      </details>
    </div>
  );
}
