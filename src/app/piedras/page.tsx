import type { Metadata } from "next";
import Link from "next/link";
import { Gem, FlameKindling } from "lucide-react";
import { getT } from "@/lib/i18n/servidor";
import { PIEDRAS, PIEDRA_DEL_SIGNO } from "@/lib/piedras";
import { INTENCIONES } from "@/lib/velas";
import { SIGNOS } from "@/lib/zodiaco";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.piedras.titulo, description: t.piedras.intro };
}

interface TextoPiedra {
  nombre: string;
  energia: string;
  uso: string;
}

/** Guía pública: simbología de las piedras, la de cada signo y cómo limpiarlas. */
export default async function PaginaPiedras() {
  const t = await getT();
  const g = t.piedras;
  const textos = g.piedras as Record<string, TextoPiedra>;
  const signos = g.nombresSignos as Record<string, string>;
  const intenciones = t.velas.intenciones as Record<string, { nombre: string }>;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{g.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{g.titulo}</h1>
        <p className="mt-2 max-w-2xl text-texto-suave">{g.intro}</p>
      </div>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-[0.25em] text-violeta-suave">{g.porIntencion}</h2>
        <div className="flex flex-wrap gap-2">
          {INTENCIONES.map((i) => {
            const de = PIEDRAS.filter((p) => (p.intenciones as readonly string[]).includes(i));
            if (!de.length) return null;
            return (
              <div key={i} className="rounded-2xl border border-borde px-3 py-2 text-sm">
                <span className="font-semibold text-oro-suave">{intenciones[i]?.nombre}:</span>{" "}
                {de.map((p, n) => (
                  <span key={p.id}>
                    <a href={`#${p.id}`} className="text-texto-suave underline-offset-2 hover:text-texto hover:underline">{textos[p.id].nombre}</a>
                    {n < de.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {PIEDRAS.map((p) => {
          const tx = textos[p.id];
          return (
            <article key={p.id} id={p.id} className="tarjeta scroll-mt-24 space-y-2 p-5">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 shrink-0 rounded-full border border-borde shadow-inner" style={{ background: `radial-gradient(circle at 35% 30%, #ffffff66, ${p.color} 55%)` }} aria-hidden />
                <div>
                  <h3 className="font-display text-2xl">{tx.nombre}</h3>
                  <p className="text-xs text-texto-suave">{p.intenciones.map((i) => intenciones[i]?.nombre).join(" · ")}</p>
                </div>
              </div>
              <p className="text-sm"><span className="font-semibold text-oro-suave">{g.energia}:</span> {tx.energia}</p>
              <p className="text-sm text-texto-suave"><span className="font-semibold text-oro-suave">{g.uso}:</span> {tx.uso}</p>
              {p.signos.length > 0 && (
                <p className="text-xs text-texto-suave">{g.signos}: {p.signos.map((s) => signos[s]).join(", ")}</p>
              )}
            </article>
          );
        })}
      </section>

      <section className="tarjeta p-6">
        <h2 className="font-display mb-4 text-3xl">{g.signoTitulo}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {SIGNOS.map((s) => {
            const id = PIEDRA_DEL_SIGNO[s.id];
            return (
              <a key={s.id} href={`#${id}`} className="rounded-xl border border-borde px-3 py-2 text-sm transition hover:border-oro/50">
                <span className="mr-1 text-oro">{s.simbolo}</span>
                <span className="font-semibold">{signos[s.id]}</span>
                <span className="block text-texto-suave">{textos[id].nombre}</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="tarjeta p-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-3xl">
          <Gem className="h-6 w-6 text-oro" aria-hidden />
          {g.limpiarTitulo}
        </h2>
        <ol className="space-y-3">
          {g.limpiarPasos.map((paso, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-oro-suave to-oro font-display text-base font-semibold text-noche">{i + 1}</span>
              <span className="pt-0.5">{paso}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-texto-suave">{g.aviso}</p>
        <Link href="/rituales#atraer" className="boton boton-primario mt-4">
          <FlameKindling className="h-4 w-4" aria-hidden />
          {g.cta}
        </Link>
      </section>
    </div>
  );
}
