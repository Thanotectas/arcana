import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { redirect } from "next/navigation";
import { alternativas, rutaIdioma } from "@/lib/i18n/rutas";
import { getIdioma } from "@/lib/i18n/servidor";
import { NUMEROS_ANGELICALES, contenidoNumeros, normalizarNumero } from "@/lib/numeros-angelicales";
import { TEXTOS_NUMEROS } from "@/lib/numeros-angelicales/textos";
import { CtaNumeros, MigasNumeros, TarjetaNumero } from "./bloques";

const RUTA = "/numeros-angelicales";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const t = TEXTOS_NUMEROS[idioma];
  return {
    title: t.metaTituloIndice,
    description: t.metaDescripcionIndice,
    alternates: alternativas(RUTA, idioma),
    openGraph: { title: t.metaTituloIndice, description: t.metaDescripcionIndice, type: "website" },
  };
}

/** Guía pública de los números angelicales: qué son, cómo leerlos y la rejilla de los más vistos. */
export default async function PaginaNumerosAngelicales({ searchParams }: { searchParams: Promise<{ n?: string | string[] }> }) {
  const [idioma, { n }] = await Promise.all([getIdioma(), searchParams]);
  const base = rutaIdioma(RUTA, idioma);
  // El buscador es un formulario GET (funciona sin JavaScript): ?n=1111 → /numeros-angelicales/1111.
  const escrito = typeof n === "string" ? n : undefined;
  const numero = escrito !== undefined ? normalizarNumero(escrito) : null;
  if (numero) redirect(`${base}/${numero}`);
  const error = escrito !== undefined && !numero;

  const t = TEXTOS_NUMEROS[idioma];
  const contenido = await contenidoNumeros(idioma);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PortadaProducto clave="numeros-angelicales" />
      <MigasNumeros items={[{ nombre: t.inicio, href: rutaIdioma("/", idioma) }, { nombre: t.nombreSeccion, href: base }]} />

      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.seccion}</p>
        <h1 className="font-display text-4xl font-semibold [font-variant-numeric:lining-nums] sm:text-5xl">{t.tituloIndice}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">{t.intro}</p>
      </header>

      <section className="tarjeta mx-auto max-w-xl p-6" aria-labelledby="buscador-numero">
        <h2 id="buscador-numero" className="font-display text-2xl text-center">{t.buscador.titulo}</h2>
        <form method="get" action={base} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="n" className="etiqueta">{t.buscador.etiqueta}</label>
            <input
              id="n"
              name="n"
              className="campo text-center text-lg tracking-widest"
              inputMode="numeric"
              autoComplete="off"
              maxLength={12}
              required
              dir="ltr"
              placeholder={t.buscador.placeholder}
              defaultValue={error ? escrito : undefined}
              aria-invalid={error || undefined}
              aria-describedby={error ? "error-numero" : undefined}
            />
          </div>
          <button type="submit" className="boton boton-primario">{t.buscador.boton}</button>
        </form>
        {error && <p id="error-numero" className="mt-2 text-sm text-peligro">{t.buscador.error}</p>}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta space-y-3 p-6">
          <h2 className="font-display text-2xl">{t.queSon.titulo}</h2>
          {t.queSon.parrafos.map((p) => (
            <p key={p.slice(0, 24)} className="text-sm leading-relaxed text-texto-suave">{p}</p>
          ))}
        </div>
        <div className="tarjeta p-6">
          <h2 className="font-display text-2xl">{t.comoLeer.titulo}</h2>
          <ol className="mt-3 space-y-3">
            {t.comoLeer.pasos.map((paso, i) => (
              <li key={paso.titulo} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-oro/40 text-sm text-oro-suave">{i + 1}</span>
                <p className="text-sm text-texto-suave"><span className="font-semibold text-texto">{paso.titulo}.</span> {paso.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-center font-display text-3xl">{t.gridTitulo}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {NUMEROS_ANGELICALES.map((num) => (
            <TarjetaNumero key={num} numero={num} lema={contenido[num].lema} href={`${base}/${num}`} />
          ))}
        </div>
      </section>

      <CtaNumeros t={t.cta} />

      <p className="text-center text-xs text-texto-suave">{t.aviso}</p>
    </div>
  );
}
