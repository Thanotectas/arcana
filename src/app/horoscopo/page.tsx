import Link from "next/link";
import type { Metadata } from "next";
import { SIGNOS, imagenSigno } from "@/lib/zodiaco";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { fechaHoy } from "@/lib/horoscopo";
import { cieloDelSigno, instanteDelDia } from "@/lib/horoscopo/cielo";
import { DiscoLuna } from "@/components/CieloSigno";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.horoscopo.titulo, description: t.meta.descripcion };
}

export default async function PaginaHoroscopo() {
  const t = await getT();
  // Dónde están hoy el Sol (la temporada) y la Luna; el signo de referencia no importa.
  const cielo = cieloDelSigno(SIGNOS[0], instanteDelDia(fechaHoy()));
  const sol = SIGNOS.find((s) => s.id === cielo.planetas.find((p) => p.cuerpo === "sol")?.signo)!;
  const luna = SIGNOS.find((s) => s.id === cielo.planetas.find((p) => p.cuerpo === "luna")?.signo)!;
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.horoscopo.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.horoscopo.titulo}</h1>
        <p className="mt-2 text-texto-suave">{t.horoscopo.eligeSigno}</p>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-oro/30 bg-oro/5 px-4 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <DiscoLuna fraccion={cielo.fase.fraccion} className="h-6 w-6" />
            {plantilla(t.horoscopo.lunaEn, { signo: `${luna.simbolo}\uFE0E ${luna.nombre}` })} · {t.inicio.fasesLuna[cielo.fase.indice]}
          </span>
          <span className="text-oro-suave">{"☉\uFE0E"} {plantilla(t.horoscopo.temporada, { signo: sol.nombre })}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SIGNOS.map((s, i) => (
          <Link
            key={s.id}
            href={`/horoscopo/${s.id}`}
            className="tarjeta aparecer group p-5 text-center transition hover:-translate-y-1 hover:border-oro/40"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
            <img src={imagenSigno(s.id)} alt="" width={88} height={88} className="moneda-signo mx-auto transition group-hover:scale-110" />
            <p className="font-display mt-2 text-2xl">{s.nombre}</p>
            <p className="text-xs text-texto-suave">
              {s.inicio[1]}/{s.inicio[0]} – {s.fin[1]}/{s.fin[0]}
            </p>
            {(s.id === sol.id || s.id === luna.id) && (
              <p className="mt-2 flex flex-wrap justify-center gap-1 text-[0.65rem] uppercase tracking-wider">
                {s.id === sol.id && <span className="rounded-full bg-oro/20 px-2 py-0.5 text-oro-suave">{"☉\uFE0E"} {plantilla(t.horoscopo.temporada, { signo: s.nombre })}</span>}
                {s.id === luna.id && <span className="rounded-full bg-violeta/25 px-2 py-0.5 text-violeta-suave">{"☽\uFE0E"} {t.horoscopo.lunaHoy}</span>}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
