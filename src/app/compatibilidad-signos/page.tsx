import Link from "next/link";
import type { Metadata } from "next";
import { SIGNOS, compatibilidadSignos } from "@/lib/zodiaco";
import { slugPareja } from "@/lib/seo/compatibilidad";
import { Migas, CtaLectura } from "@/components/seo/BloquesSeo";

export const metadata: Metadata = {
  title: "Compatibilidad de signos del zodiaco en el amor",
  description:
    "Tabla de compatibilidad entre los 12 signos del zodiaco: el porcentaje de cada pareja, cómo son en el amor y sus retos. Aries, Tauro, Géminis, Cáncer, Leo, Virgo, Libra, Escorpio, Sagitario, Capricornio, Acuario y Piscis.",
  alternates: { canonical: "/compatibilidad-signos" },
};

function color(p: number) {
  if (p >= 85) return "bg-oro/30 text-texto";
  if (p >= 70) return "bg-oro/15";
  if (p >= 55) return "bg-violeta/15";
  return "bg-borde/40 text-texto-suave";
}

export default function PaginaCompatibilidadSignos() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Compatibilidad de signos", href: "/compatibilidad-signos" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Astrología del amor</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Compatibilidad de signos</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">
          Busca tu signo en la fila y el de la otra persona en la columna. Toca el porcentaje para leer cómo es la pareja en
          el amor, qué la une y cuáles son sus retos.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr>
              <th />
              {SIGNOS.map((s) => (
                <th key={s.id} className="px-1 font-normal text-texto-suave" title={s.nombre}>{s.simbolo}<br />{s.nombre.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIGNOS.map((a) => (
              <tr key={a.id}>
                <th className="whitespace-nowrap pr-2 text-right font-normal">{a.simbolo} {a.nombre}</th>
                {SIGNOS.map((b) => {
                  const p = compatibilidadSignos(a, b);
                  return (
                    <td key={b.id} className={`rounded ${color(p)}`}>
                      <Link href={`/compatibilidad-signos/${slugPareja(a, b)}`} className="block px-1.5 py-1.5 hover:underline" title={`${a.nombre} y ${b.nombre}`}>{p}</Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SIGNOS.map((a) => (
          <div key={a.id} className="tarjeta p-5">
            <h2 className="font-display text-xl">{a.simbolo} Compatibilidad de {a.nombre}</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 text-sm">
              {SIGNOS.map((b) => (
                <li key={b.id}>
                  <Link href={`/compatibilidad-signos/${slugPareja(a, b)}`} className="text-texto-suave hover:text-oro-suave">
                    con {b.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <CtaLectura
        titulo="¿Quieres saber cómo es tu relación de verdad?"
        texto="La sinastría compara las dos cartas astrales completas: no solo el Sol, también la Luna, Venus, Marte y el ascendente."
        boton="Hacer nuestra sinastría"
      />
    </div>
  );
}
