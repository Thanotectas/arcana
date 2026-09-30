import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, Star, Hash, Heart, Coins } from "lucide-react";
import { getLecturas, getPerfil, cartasDelDiaHoy, requerirUsuario } from "@/lib/dal";
import { COSTOS, NOMBRES_LECTURA, CARTAS_DIA_GRATIS } from "@/lib/creditos";

export const metadata: Metadata = { title: "Inicio" };

export default async function PaginaInicio() {
  await requerirUsuario();
  const [perfil, lecturas, cartasHoy] = await Promise.all([getPerfil(), getLecturas(6), cartasDelDiaHoy()]);
  const cartaDisponible = cartasHoy < CARTAS_DIA_GRATIS;

  const accesos = [
    { href: "/tarot?tirada=tarot_carta", icono: Sparkles, titulo: "Carta del día", nota: cartaDisponible ? "Gratis hoy" : "Ya la usaste hoy", costo: 0 },
    { href: "/tarot", icono: Sparkles, titulo: "Tirada de tarot", nota: "Tres cartas o Cruz Celta", costo: COSTOS.tarot_tres },
    { href: "/carta-astral", icono: Star, titulo: "Carta astral", nota: "Planetas, casas y aspectos", costo: COSTOS.carta_astral },
    { href: "/numerologia", icono: Hash, titulo: "Numerología", nota: "Tu perfil numérico", costo: COSTOS.numerologia },
    { href: "/compatibilidad", icono: Heart, titulo: "Compatibilidad", nota: "Dos signos frente a frente", costo: COSTOS.compatibilidad },
  ];

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Bienvenida</p>
          <h1 className="font-display text-4xl font-semibold">Hola, {perfil?.nombre ?? "viajero"}</h1>
        </div>
        <Link href="/creditos" className="tarjeta flex items-center gap-3 px-5 py-3">
          <Coins className="h-6 w-6 text-oro" aria-hidden />
          <div>
            <p className="text-2xl font-semibold text-oro-suave">{perfil?.creditos ?? 0}</p>
            <p className="text-xs text-texto-suave">créditos · comprar más</p>
          </div>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accesos.map((a) => (
          <Link key={a.href + a.titulo} href={a.href} className="tarjeta p-5 transition hover:border-oro/40">
            <div className="flex items-start justify-between">
              <a.icono className="h-6 w-6 text-oro" aria-hidden />
              <span className="rounded-full bg-violeta/15 px-2 py-0.5 text-xs text-violeta-suave">
                {a.costo === 0 ? "Gratis" : `${a.costo} crédito${a.costo > 1 ? "s" : ""}`}
              </span>
            </div>
            <h2 className="font-display mt-3 text-2xl font-semibold">{a.titulo}</h2>
            <p className="text-sm text-texto-suave">{a.nota}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold">Tus últimas lecturas</h2>
          <Link href="/lecturas" className="text-sm text-violeta-suave hover:underline">Ver todas</Link>
        </div>
        {lecturas.length === 0 ? (
          <p className="tarjeta p-6 text-texto-suave">Todavía no tienes lecturas. Empieza con tu carta del día.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {lecturas.map((l) => (
              <li key={l.id}>
                <Link href={`/lecturas/${l.id}`} className="tarjeta block p-4 transition hover:border-oro/40">
                  <p className="text-xs uppercase tracking-widest text-violeta-suave">{NOMBRES_LECTURA[l.tipo]}</p>
                  <p className="mt-1 font-medium">{l.titulo}</p>
                  <p className="text-xs text-texto-suave">{new Date(l.creado_en).toLocaleString("es-CO")}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
