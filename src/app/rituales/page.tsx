import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, Wind, Hand, Hexagon, FlameKindling, Orbit } from "lucide-react";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.rituales.titulo, description: t.rituales.intro };
}

interface Guia {
  titulo: string;
  intro: string;
  pasos: readonly string[];
  senales: readonly { nombre: string; texto: string }[];
  consejo: string;
}

const GUIAS = [
  { id: "chocolate", href: "/chocolate", costo: COSTOS.chocolate, Icono: Coffee },
  { id: "tabaco", href: "/tabaco", costo: COSTOS.tabaco, Icono: Wind },
  { id: "mano", href: "/quiromancia", costo: COSTOS.quiromancia, Icono: Hand },
  { id: "iching", href: "/iching", costo: COSTOS.iching, Icono: Hexagon },
] as const;

/** Guía pública: cómo se hace cada ritual y qué se puede ver. */
export default async function PaginaRituales() {
  const t = await getT();
  const guias = t.rituales.guias as Record<string, Guia>;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.rituales.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.rituales.titulo}</h1>
        <p className="mt-2 max-w-2xl text-texto-suave">{t.rituales.intro}</p>
        <nav className="mt-4 flex flex-wrap gap-2">
          {GUIAS.map(({ id, Icono }) => (
            <a key={id} href={`#${id}`} className="flex items-center gap-2 rounded-full border border-borde px-3 py-1.5 text-sm text-texto-suave transition hover:border-oro/50 hover:text-texto">
              <Icono className="h-4 w-4 text-oro" aria-hidden />
              {guias[id].titulo}
            </a>
          ))}
        </nav>
      </div>

      {GUIAS.map(({ id, href, costo, Icono }) => {
        const g = guias[id];
        return (
          <section key={id} id={id} className="tarjeta scroll-mt-24 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-oro/10 p-3 text-oro"><Icono className="h-7 w-7" aria-hidden /></span>
              <div>
                <h2 className="font-display text-3xl">{g.titulo}</h2>
                <p className="mt-1 text-texto-suave">{g.intro}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.rituales.pasosTitulo}</h3>
                <ol className="space-y-3">
                  {g.pasos.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-oro-suave to-oro font-display text-base font-semibold text-noche">{i + 1}</span>
                      <span className="pt-0.5">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="mb-3 text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.rituales.veTitulo}</h3>
                <dl className="space-y-2">
                  {g.senales.map((s) => (
                    <div key={s.nombre} className="rounded-xl border border-borde bg-white/[0.02] px-3 py-2 text-sm">
                      <dt className="font-semibold text-oro-suave">{s.nombre}</dt>
                      <dd className="text-texto-suave">{s.texto}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <p className="mt-5 text-sm text-texto-suave">{g.consejo}</p>
            <Link href={href} className="boton boton-primario mt-4">
              {t.rituales.hacerLectura} · {plantilla(t.comun.cuesta, { n: costo, unidad: t.comun.creditos })}
            </Link>
          </section>
        );
      })}

      <section>
        <h2 className="font-display mb-3 text-2xl">{t.rituales.otras}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/velas" className="tarjeta tarjeta-modulo flex items-center gap-4 p-5">
            <FlameKindling className="h-7 w-7 shrink-0 text-oro" aria-hidden />
            <div>
              <p className="font-display text-xl">{t.portada.modulos.velas.titulo}</p>
              <p className="text-sm text-texto-suave">{t.portada.modulos.velas.texto}</p>
            </div>
          </Link>
          <Link href="/luna" className="tarjeta tarjeta-modulo flex items-center gap-4 p-5">
            <Orbit className="h-7 w-7 shrink-0 text-oro" aria-hidden />
            <div>
              <p className="font-display text-xl">{t.portada.modulos.luna.titulo}</p>
              <p className="text-sm text-texto-suave">{t.portada.modulos.luna.texto}</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
