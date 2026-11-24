import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionYildizname } from "@/lib/yildizname/acciones";
import { TEXTOS_YILDIZNAME } from "@/lib/yildizname/textos";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CamposAbjad } from "@/components/abjad/CamposAbjad";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const t = TEXTOS_YILDIZNAME[idioma];
  return { title: t.titulo, description: t.descripcionMeta, alternates: alternativas("/yildizname", idioma), openGraph: { images: [{ url: "/og/yildizname.jpg", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", images: ["/og/yildizname.jpg"] } };
}

export default async function PaginaYildizname() {
  await requerirUsuario();
  const [perfil, comun, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const t = TEXTOS_YILDIZNAME[idioma];
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PortadaProducto clave="yildizname" />
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.intro} {perfil?.ilimitado ? comun.comun.tuCuentaIlimitada : plantilla(comun.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionYildizname} textoBoton={plantilla(t.calcular, { n: COSTOS.yildizname })} textoCargando={t.calculando}>
          <CamposAbjad nombreInicial={perfil?.nombre ?? ""} madre={{ etiqueta: t.madre, ayuda: t.madreAyuda }} />
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
