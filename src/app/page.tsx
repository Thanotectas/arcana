import Link from "next/link";
import { Sparkles, Star, Hash, Heart, Moon } from "lucide-react";
import { PAQUETES, formatoCOP } from "@/lib/creditos";
import { getUsuarioOpcional } from "@/lib/dal";

const MODULOS = [
  {
    icono: Sparkles,
    titulo: "Tarot",
    texto: "Carta del día gratis, tirada de tres cartas y Cruz Celta con interpretación escrita para tu pregunta.",
    href: "/tarot",
  },
  {
    icono: Star,
    titulo: "Carta astral",
    texto: "Cálculo astronómico real de planetas, casas y aspectos, con una lectura de tu esencia y tu camino.",
    href: "/carta-astral",
  },
  {
    icono: Hash,
    titulo: "Numerología",
    texto: "Camino de vida, expresión, impulso del alma y año personal a partir de tu nombre y fecha.",
    href: "/numerologia",
  },
  {
    icono: Heart,
    titulo: "Compatibilidad",
    texto: "Qué une y qué tensiona a dos personas según sus signos, en el amor, la amistad y el trabajo.",
    href: "/compatibilidad",
  },
  {
    icono: Moon,
    titulo: "Horóscopo diario",
    texto: "Cada mañana, un horóscopo nuevo para tu signo. Gratis y sin registro.",
    href: "/horoscopo",
  },
];

export default async function Portada() {
  const usuario = await getUsuarioOpcional();

  return (
    <div className="space-y-20">
      <section className="aparecer pt-8 text-center sm:pt-16">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-violeta-suave">Tarot · Astrología · Numerología</p>
        <h1 className="font-display mx-auto max-w-3xl text-5xl font-semibold leading-tight text-texto sm:text-6xl">
          Preguntas antiguas, <span className="text-oro-suave">respuestas para tu momento</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-texto-suave">
          Arcana interpreta tus cartas, tu cielo natal y tus números con la tradición clásica y una lectura escrita
          especialmente para ti. Empieza con una carta del día gratis.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={usuario ? "/tarot" : "/registro"} className="boton boton-primario">
            {usuario ? "Sacar mi carta del día" : "Crear cuenta y recibir 3 créditos"}
          </Link>
          <Link href="/horoscopo" className="boton boton-secundario">
            Ver horóscopo de hoy
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m) => (
          <Link key={m.href} href={m.href} className="tarjeta group p-6 transition hover:border-oro/40">
            <m.icono className="mb-4 h-7 w-7 text-oro" aria-hidden />
            <h2 className="font-display text-2xl font-semibold text-texto">{m.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-texto-suave">{m.texto}</p>
            <span className="mt-4 inline-block text-sm text-violeta-suave transition group-hover:translate-x-1">
              Explorar →
            </span>
          </Link>
        ))}
      </section>

      <section className="tarjeta p-8 text-center">
        <h2 className="font-display text-3xl font-semibold text-oro-suave">Cómo funciona</h2>
        <div className="mt-8 grid gap-8 text-left sm:grid-cols-3">
          {[
            ["1", "Crea tu cuenta", "Recibes 3 créditos de bienvenida y una carta del día gratis cada jornada."],
            ["2", "Elige tu consulta", "Tarot, carta astral, numerología o compatibilidad. Cada lectura cuesta entre 1 y 5 créditos."],
            ["3", "Lee y guarda", "Tu lectura queda en tu historial para volver a ella cuando quieras."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="font-display mb-2 text-4xl text-violeta-suave">{n}</div>
              <h3 className="text-lg font-semibold text-texto">{t}</h3>
              <p className="mt-1 text-sm text-texto-suave">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-center text-3xl font-semibold text-oro-suave">Paquetes de créditos</h2>
        <p className="mt-2 text-center text-texto-suave">Sin suscripción. Compras lo que usas.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PAQUETES.map((p) => (
            <div key={p.id} className={`tarjeta p-6 ${p.destacado ? "border-oro/50" : ""}`}>
              {p.destacado && <span className="text-xs uppercase tracking-widest text-oro">Más elegido</span>}
              <h3 className="font-display mt-1 text-2xl font-semibold">{p.nombre}</h3>
              <p className="mt-2 text-3xl font-semibold text-oro-suave">{formatoCOP(p.precioCOP)}</p>
              <p className="text-sm text-texto-suave">{p.creditos} créditos</p>
              <p className="mt-3 text-sm text-texto-suave">{p.descripcion}</p>
              <Link href="/creditos" className="boton boton-secundario mt-5 w-full">
                Comprar
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
