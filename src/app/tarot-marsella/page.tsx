import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { plantilla } from "@/lib/i18n/formato";
import { TEXTOS_MARSELLA } from "@/lib/marsella/textos";
import { RitualMarsella } from "@/components/marsella/RitualMarsella";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const textos = TEXTOS_MARSELLA[idioma];
  return { openGraph: { images: [{ url: "/og/marsella.jpg", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", images: ["/og/marsella.jpg"] },  alternates: alternativas("/tarot-marsella", idioma), title: `${textos.titulo} · ${textos.seccion}`, description: textos.intro };
}

export default async function PaginaTarotMarsella() {
  await requerirUsuario();
  const [perfil, t, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const textos = TEXTOS_MARSELLA[idioma];
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PortadaProducto clave="marsella" />
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{textos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{textos.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {textos.intro} {plantilla(t.comun.cuesta, { n: COSTOS.marsella, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>

      <details className="tarjeta p-5">
        <summary className="cursor-pointer font-display text-xl">{textos.comoSeLee}</summary>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {textos.claves.map((c) => (
            <div key={c.nombre} className="rounded-xl border border-borde p-3 text-sm">
              <dt className="font-semibold text-oro-suave">{c.nombre}</dt>
              <dd className="mt-1 text-texto-suave">{c.texto}</dd>
            </div>
          ))}
        </dl>
      </details>

      <RitualMarsella textos={textos} />
    </div>
  );
}
