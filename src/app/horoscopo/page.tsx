import Link from "next/link";
import type { Metadata } from "next";
import { SIGNOS } from "@/lib/zodiaco";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.horoscopo.titulo, description: t.meta.descripcion };
}

export default async function PaginaHoroscopo() {
  const t = await getT();
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.horoscopo.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.horoscopo.titulo}</h1>
        <p className="mt-2 text-texto-suave">{t.horoscopo.eligeSigno}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SIGNOS.map((s, i) => (
          <Link
            key={s.id}
            href={`/horoscopo/${s.id}`}
            className="tarjeta aparecer group p-5 text-center transition hover:-translate-y-1 hover:border-oro/40"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="text-4xl transition group-hover:scale-110">{s.simbolo}</p>
            <p className="font-display mt-2 text-2xl">{s.nombre}</p>
            <p className="text-xs text-texto-suave">
              {s.inicio[1]}/{s.inicio[0]} – {s.fin[1]}/{s.fin[0]}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
