import Link from "next/link";
import type { Metadata } from "next";
import { SIGNOS, imagenSigno } from "@/lib/zodiaco";
import { TEXTO_SIGNO } from "@/lib/seo/signos";
import { Migas, CtaLectura } from "@/components/seo/BloquesSeo";

export const metadata: Metadata = {
  title: "Los 12 signos del zodiaco: fechas, personalidad y compatibilidad",
  description:
    "Los 12 signos del zodiaco con sus fechas, elemento y planeta regente. Cómo es cada signo en el amor y en el trabajo, su piedra, su carta del tarot y con quién es compatible.",
  alternates: { canonical: "/signos-zodiacales" },
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export default function PaginaSignosZodiacales() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Signos del zodiaco", href: "/signos-zodiacales" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Astrología</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Los 12 signos del zodiaco</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">
          Cada signo tiene un elemento (fuego, tierra, aire o agua), una modalidad y un planeta regente. Toca el tuyo para
          conocer su personalidad, cómo ama, su piedra, su carta del tarot y con quién es más compatible.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SIGNOS.map((s) => (
          <Link key={s.id} href={`/signos-zodiacales/${s.id}`} className="tarjeta flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-oro/40">
            {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática */}
            <img src={imagenSigno(s.id)} alt="" width={64} height={64} className="moneda-signo" />
            <div>
              <h2 className="font-display text-2xl">{s.nombre}</h2>
              <p className="text-xs text-texto-suave">
                {s.inicio[1]} {MESES[s.inicio[0] - 1]} – {s.fin[1]} {MESES[s.fin[0] - 1]} · {s.elemento} · {s.regente}
              </p>
              <p className="mt-1 text-sm italic text-oro-suave">{TEXTO_SIGNO[s.id].lema}</p>
            </div>
          </Link>
        ))}
      </div>
      <CtaLectura
        titulo="¿Y tu ascendente? ¿Y tu Luna?"
        texto="Tu carta astral muestra los 10 planetas y las 12 casas en el momento exacto en que naciste. Sibila te la interpreta completa."
        boton="Calcular mi carta astral gratis"
      />
    </div>
  );
}
