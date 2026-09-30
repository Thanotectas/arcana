import Link from "next/link";
import type { Metadata } from "next";
import { SIGNOS } from "@/lib/zodiaco";

export const metadata: Metadata = {
  title: "Horóscopo diario",
  description: "Horóscopo de hoy para los doce signos, renovado cada mañana.",
};

export default function PaginaHoroscopo() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Gratis, cada día</p>
        <h1 className="font-display text-4xl font-semibold">Horóscopo de hoy</h1>
        <p className="mt-2 text-texto-suave">Elige tu signo.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SIGNOS.map((s) => (
          <Link key={s.id} href={`/horoscopo/${s.id}`} className="tarjeta p-5 text-center transition hover:border-oro/40">
            <p className="text-4xl">{s.simbolo}</p>
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
