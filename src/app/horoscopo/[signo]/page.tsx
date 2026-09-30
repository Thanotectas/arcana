import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SIGNOS, signoPorId } from "@/lib/zodiaco";
import { horoscopoDelDia, fechaHoy } from "@/lib/horoscopo";
import { Markdown } from "@/components/Markdown";
import { getUsuarioOpcional } from "@/lib/dal";

export async function generateStaticParams() {
  return SIGNOS.map((s) => ({ signo: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ signo: string }> }): Promise<Metadata> {
  const { signo } = await params;
  const s = signoPorId(signo);
  return { title: s ? `Horóscopo de ${s.nombre} hoy` : "Horóscopo" };
}

async function Contenido({ signoId }: { signoId: string }) {
  const s = signoPorId(signoId)!;
  const texto = await horoscopoDelDia(s).catch((e: unknown) => {
    console.error("[horoscopo]", e);
    return null;
  });
  if (!texto) {
    return <p className="text-texto-suave">El horóscopo de hoy aún no está disponible. Vuelve en unos minutos.</p>;
  }
  return <Markdown texto={texto} />;
}

export default async function PaginaSigno({ params }: { params: Promise<{ signo: string }> }) {
  const { signo } = await params;
  const s = signoPorId(signo);
  if (!s) notFound();
  const usuario = await getUsuarioOpcional();
  const fecha = new Date(fechaHoy() + "T12:00:00Z").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="text-center">
        <p className="text-6xl">{s.simbolo}</p>
        <h1 className="font-display text-4xl font-semibold">{s.nombre}</h1>
        <p className="text-texto-suave">
          {fecha} · {s.elemento} · regente {s.regente}
        </p>
      </header>
      <section className="tarjeta p-6 sm:p-8">
        <Suspense fallback={<p className="animate-pulse text-texto-suave">Leyendo el cielo de hoy…</p>}>
          <Contenido signoId={s.id} />
        </Suspense>
      </section>
      <section className="tarjeta p-6 text-center">
        <h2 className="font-display text-2xl">¿Quieres ir más profundo?</h2>
        <p className="mt-1 text-sm text-texto-suave">Tu carta astral completa revela mucho más que el signo solar.</p>
        <Link href={usuario ? "/carta-astral" : "/registro"} className="boton boton-primario mt-4">
          {usuario ? "Calcular mi carta astral" : "Crear cuenta gratis"}
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
