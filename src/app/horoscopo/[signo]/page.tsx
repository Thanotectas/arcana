import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SIGNOS, signoPorId } from "@/lib/zodiaco";
import { horoscopoDelDia, fechaHoy } from "@/lib/horoscopo";
import { Markdown } from "@/components/Markdown";
import { getUsuarioOpcional } from "@/lib/dal";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { LOCALE_INTL, type Idioma } from "@/lib/i18n/idiomas";

export async function generateStaticParams() {
  return SIGNOS.map((s) => ({ signo: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ signo: string }> }): Promise<Metadata> {
  const { signo } = await params;
  const s = signoPorId(signo);
  const t = await getT();
  return { title: s ? plantilla(t.horoscopo.tituloSigno, { signo: s.nombre }) : t.nav.horoscopo };
}

async function Contenido({ signoId, idioma, noDisponible }: { signoId: string; idioma: Idioma; noDisponible: string }) {
  const s = signoPorId(signoId)!;
  const texto = await horoscopoDelDia(s, idioma).catch((e: unknown) => {
    console.error("[horoscopo]", e);
    return null;
  });
  if (!texto) return <p className="text-texto-suave">{noDisponible}</p>;
  return <Markdown texto={texto} />;
}

export default async function PaginaSigno({ params }: { params: Promise<{ signo: string }> }) {
  const { signo } = await params;
  const s = signoPorId(signo);
  if (!s) notFound();
  const [usuario, t, idioma] = await Promise.all([getUsuarioOpcional(), getT(), getIdioma()]);
  const fecha = new Date(fechaHoy() + "T12:00:00Z").toLocaleDateString(LOCALE_INTL[idioma], { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="text-center">
        <p className="text-6xl">{s.simbolo}</p>
        <h1 className="font-display text-4xl font-semibold">{s.nombre}</h1>
        <p className="text-texto-suave">
          {fecha} · {t.horoscopo.elementos[s.elemento]} · {t.horoscopo.regente} {s.regente}
        </p>
      </header>
      <section className="tarjeta p-6 sm:p-8">
        <Suspense fallback={<p className="animate-pulse text-texto-suave">{t.horoscopo.leyendo}</p>}>
          <Contenido signoId={s.id} idioma={idioma} noDisponible={t.horoscopo.noDisponible} />
        </Suspense>
      </section>
      <section className="tarjeta p-6 text-center">
        <h2 className="font-display text-2xl">{t.horoscopo.masProfundo}</h2>
        <p className="mt-1 text-sm text-texto-suave">{t.horoscopo.cartaRevela}</p>
        <Link href={usuario ? "/carta-astral" : "/registro"} className="boton boton-primario mt-4">
          {usuario ? t.horoscopo.calcularCarta : t.horoscopo.crearCuenta}
        </Link>
      </section>
      <nav className="flex flex-wrap justify-center gap-2 text-sm">
        {SIGNOS.map((o) => (
          <Link key={o.id} href={`/horoscopo/${o.id}`} className={`rounded-full px-3 py-1 ${o.id === s.id ? "bg-oro/20 text-oro-suave" : "text-texto-suave hover:text-texto"}`}>
            {o.simbolo} {o.nombre}
          </Link>
        ))}
      </nav>
    </div>
  );
}
