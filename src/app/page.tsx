import Link from "next/link";
import { Sparkles, Star, Hash, Heart, Moon, Hand, Hexagon } from "lucide-react";
import { PAQUETES, formatoCOP } from "@/lib/creditos";
import { getUsuarioOpcional, getContadorLecturas } from "@/lib/dal";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { CartasFlotantes } from "@/components/CartasFlotantes";

export default async function Portada() {
  const [usuario, t, contador] = await Promise.all([getUsuarioOpcional(), getT(), getContadorLecturas().catch(() => 0)]);
  const MODULOS = [
    { icono: Sparkles, ...t.portada.modulos.tarot, href: "/tarot" },
    { icono: Star, ...t.portada.modulos.astral, href: "/carta-astral" },
    { icono: Hand, ...t.portada.modulos.quiromancia, href: "/quiromancia" },
    { icono: Hash, ...t.portada.modulos.numerologia, href: "/numerologia" },
    { icono: Hexagon, ...t.portada.modulos.iching, href: "/iching" },
    { icono: Heart, ...t.portada.modulos.compatibilidad, href: "/compatibilidad" },
    { icono: Moon, ...t.portada.modulos.horoscopo, href: "/horoscopo" },
  ];

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden pt-8 text-center sm:pt-16">
        <CartasFlotantes />
        <div className="relative aparecer">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.portada.lema}</p>
          <h1 className="font-display mx-auto max-w-3xl text-5xl font-semibold leading-tight text-texto sm:text-6xl">
            {t.portada.titulo1} <span className="brillo-oro text-oro-suave">{t.portada.titulo2}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-texto-suave">{t.portada.intro}</p>
          {contador >= 50 && (
            <p className="mt-4 inline-block rounded-full border border-exito/40 bg-exito/10 px-4 py-1 text-sm text-exito">
              ✦ {plantilla(t.persuasion.contadorSemana, { n: contador.toLocaleString("es-CO") })}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={usuario ? "/tarot" : "/registro"} className="boton boton-primario">
              {usuario ? t.portada.ctaTarot : t.portada.ctaRegistro}
            </Link>
            <Link href="/horoscopo" className="boton boton-secundario">{t.portada.ctaHoroscopo}</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m, i) => (
          <Link key={m.href} href={m.href} className="tarjeta tarjeta-modulo aparecer group p-6" style={{ animationDelay: `${i * 70}ms` }}>
            <m.icono className="mb-4 h-7 w-7 text-oro transition group-hover:scale-110" aria-hidden />
            <h2 className="font-display text-2xl font-semibold text-texto">{m.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-texto-suave">{m.texto}</p>
            <span className="mt-4 inline-block text-sm text-violeta-suave transition group-hover:translate-x-1">{t.portada.explorar} →</span>
          </Link>
        ))}
      </section>

      <section className="tarjeta p-8 text-center">
        <h2 className="font-display text-3xl font-semibold text-oro-suave">{t.portada.comoFunciona}</h2>
        <div className="mt-8 grid gap-8 text-left sm:grid-cols-3">
          {t.portada.pasos.map((p, i) => (
            <div key={i}>
              <div className="font-display mb-2 text-4xl text-violeta-suave">{i + 1}</div>
              <h3 className="text-lg font-semibold text-texto">{p.titulo}</h3>
              <p className="mt-1 text-sm text-texto-suave">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-center text-3xl font-semibold text-oro-suave">{t.portada.paquetesTitulo}</h2>
        <p className="mt-2 text-center text-texto-suave">{t.portada.paquetesIntro}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PAQUETES.map((p) => {
            const textos = t.creditos.paquetes[p.id as keyof typeof t.creditos.paquetes];
            return (
              <div key={p.id} className={`tarjeta tarjeta-modulo p-6 ${p.destacado ? "border-oro/50" : ""}`}>
                {p.destacado && <span className="text-xs uppercase tracking-widest text-oro">{t.portada.masElegido}</span>}
                <h3 className="font-display mt-1 text-2xl font-semibold">{textos?.nombre ?? p.nombre}</h3>
                <p className="mt-2 text-3xl font-semibold text-oro-suave">{formatoCOP(p.precioCOP)}</p>
                <p className="text-sm text-texto-suave">{plantilla(t.portada.nCreditos, { n: p.creditos })}</p>
                <p className="mt-3 text-sm text-texto-suave">{textos?.descripcion ?? p.descripcion}</p>
                <Link href="/creditos" className="boton boton-secundario mt-5 w-full">{t.portada.comprar}</Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
