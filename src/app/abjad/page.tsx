import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { BannerPromo } from "@/components/BannerPromo";
import { promoActiva } from "@/lib/promo";
import { comprasVisibles } from "@/lib/plataforma";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS, COSTO_NOMBRE_COMPLETO } from "@/lib/creditos";
import { TEXTOS_COMPLETA } from "@/lib/abjad/completa";
import { Check, Sparkles } from "lucide-react";
import { accionAbjad } from "@/lib/abjad/acciones";
import { LETRAS_ABJAD, ELEMENTO_LETRA } from "@/lib/abjad/calculo";
import { TEXTOS_ABJAD } from "@/lib/abjad/textos";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CamposAbjad } from "@/components/abjad/CamposAbjad";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = TEXTOS_ABJAD[await getIdioma()];
  return { openGraph: { images: [{ url: "/og/abjad.jpg", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", images: ["/og/abjad.jpg"] },  title: t.titulo, description: t.descripcionMeta };
}

export default async function PaginaAbjad() {
  await requerirUsuario();
  const [perfil, comun, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const t = TEXTOS_ABJAD[idioma];
  const c = TEXTOS_COMPLETA[idioma];
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PortadaProducto clave="abjad" />
      {promoActiva() && (await comprasVisibles()) && <BannerPromo />}
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.intro} {perfil?.ilimitado ? comun.comun.tuCuentaIlimitada : plantilla(comun.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div id="completa" className="tarjeta fondo-arabesco scroll-mt-24 space-y-5 border-oro/50 p-6 shadow-[0_0_40px_rgba(217,180,90,0.12)]">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl text-oro-suave">
            <Sparkles className="h-5 w-5 shrink-0" aria-hidden /> {c.titulo}
          </p>
          <p className="mt-1 text-sm text-texto-suave">{c.texto}</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {c.incluye.map((x) => (
              <li key={x} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden /> {x}
              </li>
            ))}
          </ul>
        </div>
        <FormularioLectura accion={accionAbjad} textoBoton={plantilla(c.boton, { n: COSTO_NOMBRE_COMPLETO })} textoCargando={c.cargando}>
          <input type="hidden" name="completa" value="1" />
          <CamposAbjad nombreInicial={perfil?.nombre ?? ""} otro={{ etiqueta: c.otro, ayuda: c.otroAyuda }} />
          <p className="text-xs text-texto-suave">{t.marco}</p>
        </FormularioLectura>
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
