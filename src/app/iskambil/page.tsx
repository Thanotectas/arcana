import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { plantilla } from "@/lib/i18n/formato";
import { TEXTOS_ISKAMBIL } from "@/lib/iskambil/textos";
import { RitualIskambil } from "@/components/iskambil/RitualIskambil";
import { CartaIskambil } from "@/components/iskambil/CartaIskambil";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const textos = TEXTOS_ISKAMBIL[idioma];
  return { alternates: alternativas("/iskambil", idioma), title: textos.titulo, description: textos.intro };
}

const MUESTRA = ["kupa-a", "karo-q", "sinek-10", "maca-7"];

export default async function PaginaIskambil() {
  await requerirUsuario();
  const [perfil, t, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const textos = TEXTOS_ISKAMBIL[idioma];
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PortadaProducto clave="iskambil" />
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{textos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{textos.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {textos.intro} {plantilla(t.comun.cuesta, { n: COSTOS.iskambil, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>

      <details className="tarjeta p-5">
        <summary className="cursor-pointer font-display text-xl">{textos.comoSeLee}</summary>
        <div className="mx-auto mt-4 flex max-w-sm justify-center gap-3" aria-hidden>
          {MUESTRA.map((id) => (
            <div key={id} className="w-16">
              <CartaIskambil id={id} alt="" />
            </div>
          ))}
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {textos.claves.map((c) => (
            <div key={c.nombre} className="rounded-xl border border-borde p-3 text-sm">
              <dt className="font-semibold text-oro-suave">{c.nombre}</dt>
              <dd className="mt-1 text-texto-suave">{c.texto}</dd>
            </div>
          ))}
        </dl>
      </details>

      <RitualIskambil textos={textos} />
    </div>
  );
}
