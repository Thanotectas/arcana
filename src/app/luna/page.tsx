import type { Metadata } from "next";
import Link from "next/link";
import { getT, getIdioma } from "@/lib/i18n/servidor";
import { getPerfil } from "@/lib/dal";
import { plantilla } from "@/lib/i18n/formato";
import { LOCALE_INTL } from "@/lib/i18n/idiomas";
import { faseLunar } from "@/lib/luna";
import { solYLuna } from "@/lib/astro/efemerides";
import { proximasLunaciones, type FaseClave } from "@/lib/astro/lunaciones";
import { signoPorLongitud, signoPorId, imagenSigno } from "@/lib/zodiaco";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.luna.titulo, description: t.luna.intro };
}

const ICONO_FASE: Record<FaseClave, string> = { nueva: "🌑", creciente: "🌓", llena: "🌕", menguante: "🌗" };

/** Calendario lunar: fase de hoy, próximas lunaciones con su signo y el ritual de cada fase. Gratis y público. */
export default async function PaginaLuna() {
  const [t, idioma, perfil] = await Promise.all([getT(), getIdioma(), getPerfil()]);
  const zona = perfil?.zona_horaria ?? "America/Bogota";
  const ahora = new Date();
  const hoy = faseLunar(ahora);
  const signoHoy = signoPorLongitud(solYLuna(ahora).luna);
  const lunaciones = proximasLunaciones(ahora, 8);
  const proxima = lunaciones[0];
  const fases = t.luna.fases as Record<FaseClave, { nombre: string; lema: string; ritual: string }>;
  const elementos = t.luna.elementos as Record<string, string>;
  const fecha = (iso: string) => new Date(iso).toLocaleString(LOCALE_INTL[idioma], { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: zona });

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.luna.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.luna.titulo}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-texto-suave">{t.luna.intro}</p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta flex items-center gap-6 p-6">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#1a1433] shadow-[0_0_40px_rgba(241,217,154,0.25)]" aria-hidden>
            <div className="absolute inset-0 rounded-full bg-[#f1d99a]" style={{ clipPath: hoy.fraccion <= 0.5 ? `inset(0 0 0 ${100 - hoy.iluminacion}%)` : `inset(0 ${100 - hoy.iluminacion}% 0 0)` }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.luna.hoyTitulo}</p>
            <p className="font-display text-3xl text-oro-suave">{t.inicio.fasesLuna[hoy.indice]}</p>
            <p className="text-sm text-texto-suave">{plantilla(t.luna.iluminada, { n: hoy.iluminacion })}</p>
            <p className="mt-1 flex items-center gap-2 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
              <img src={imagenSigno(signoHoy.id)} alt="" width={28} height={28} className="moneda-signo" />
              {plantilla(t.luna.lunaEn, { signo: signoHoy.nombre })} · {elementos[signoHoy.elemento]}
            </p>
          </div>
        </div>
        {proxima && (
          <div className="tarjeta border-oro/40 bg-oro/5 p-6">
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.luna.proximaTitulo}</p>
            <p className="font-display text-3xl text-oro-suave">{ICONO_FASE[proxima.fase]} {fases[proxima.fase].nombre} {t.luna.en} {signoPorId(proxima.signo)?.nombre}</p>
            <p className="text-sm text-texto-suave">{fecha(proxima.fechaUtc)}</p>
            <p className="mt-3 text-sm italic text-oro-suave">“{fases[proxima.fase].lema}”</p>
            <p className="mt-2 text-sm text-texto-suave">{fases[proxima.fase].ritual}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-3xl">{t.luna.calendarioTitulo}</h2>
        <p className="text-sm text-texto-suave">{plantilla(t.luna.nota, { zona })}</p>
        <ul className="mt-4 divide-y divide-borde overflow-hidden rounded-2xl border border-borde">
          {lunaciones.map((l) => {
            const s = signoPorId(l.signo);
            return (
              <li key={l.fechaUtc} className="flex flex-wrap items-center gap-4 bg-superficie/40 px-5 py-3">
                <span className="text-2xl" aria-hidden>{ICONO_FASE[l.fase]}</span>
                <span className="min-w-40 font-medium">{fases[l.fase].nombre}</span>
                <span className="flex items-center gap-2 text-sm text-texto-suave">
                  {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
                  {s && <img src={imagenSigno(s.id)} alt="" width={24} height={24} className="moneda-signo" />}
                  {t.luna.en} {s?.nombre} · {s && elementos[s.elemento]}
                </span>
                <span className="ml-auto text-sm text-texto-suave">{fecha(l.fechaUtc)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-3xl">{t.luna.ritualTitulo}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["nueva", "creciente", "llena", "menguante"] as FaseClave[]).map((f) => (
            <article key={f} className="tarjeta p-5">
              <p className="font-display text-2xl">{ICONO_FASE[f]} {fases[f].nombre}</p>
              <p className="mt-1 text-sm italic text-oro-suave">“{fases[f].lema}”</p>
              <p className="mt-2 text-sm text-texto-suave">{fases[f].ritual}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tarjeta p-6 text-center">
        <h2 className="font-display text-2xl">{t.luna.ctaTitulo}</h2>
        <p className="mt-1 text-sm text-texto-suave">{t.luna.ctaTexto}</p>
        <Link href={perfil ? "/hoy" : "/registro"} className="boton boton-primario mt-4">{perfil ? t.nav.hoy : t.comun.crearCuenta}</Link>
      </section>
    </div>
  );
}
