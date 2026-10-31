import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SIGNOS, imagenSigno, signoPorId } from "@/lib/zodiaco";
import { TEXTO_SIGNO } from "@/lib/seo/signos";
import { rankingDe, slugPareja } from "@/lib/seo/compatibilidad";
import { PIEDRA_DEL_SIGNO } from "@/lib/piedras";
import { cartaPorId } from "@/lib/tarot/deck";
import { diccionario } from "@/lib/i18n/diccionarios";
import { Migas, CtaLectura, Preguntas } from "@/components/seo/BloquesSeo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SIGNOS.map((s) => ({ signo: s.id }));
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechas = (s: NonNullable<ReturnType<typeof signoPorId>>) => `del ${s.inicio[1]} de ${MESES[s.inicio[0] - 1]} al ${s.fin[1]} de ${MESES[s.fin[0] - 1]}`;
const ELEMENTO = { fuego: "Fuego", tierra: "Tierra", aire: "Aire", agua: "Agua" } as const;
const MODALIDAD = { cardinal: "Cardinal", fijo: "Fijo", mutable: "Mutable" } as const;

export async function generateMetadata({ params }: { params: Promise<{ signo: string }> }): Promise<Metadata> {
  const { signo } = await params;
  const s = signoPorId(signo);
  if (!s) return {};
  const t = TEXTO_SIGNO[s.id];
  const titulo = `${s.nombre}: personalidad, amor, compatibilidad y fechas`;
  const descripcion = `Cómo es ${s.nombre} (${fechas(s)}): personalidad, en el amor y en el trabajo, su lado oscuro, su piedra, su carta del tarot y con qué signos es más compatible. ${t.lema}`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/signos-zodiacales/${s.id}` },
    openGraph: { title: titulo, description: descripcion, images: [{ url: imagenSigno(s.id) }], type: "article" },
  };
}

export default async function PaginaSignoZodiacal({ params }: { params: Promise<{ signo: string }> }) {
  const { signo } = await params;
  const s = signoPorId(signo);
  if (!s) notFound();
  const t = TEXTO_SIGNO[s.id];
  const { mejores, retos } = rankingDe(s);
  const piedraId = PIEDRA_DEL_SIGNO[s.id];
  const piedras = diccionario("es").piedras.piedras as Record<string, { nombre: string; energia: string; uso: string }>;
  const piedra = piedras[piedraId];
  const carta = cartaPorId(t.carta)!;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Signos del zodiaco", href: "/signos-zodiacales" }, { nombre: s.nombre, href: `/signos-zodiacales/${s.id}` }]} />
      <header className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática */}
        <img src={imagenSigno(s.id)} alt={`Signo ${s.nombre}`} width={128} height={128} className="moneda-signo mx-auto" />
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{s.simbolo} {s.nombre}: cómo es este signo</h1>
        <p className="mt-2 text-lg italic text-oro-suave">{t.lema}</p>
        <dl className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[["Fechas", fechas(s)], ["Elemento", ELEMENTO[s.elemento]], ["Modalidad", MODALIDAD[s.modalidad]], ["Regente", s.regente]].map(([k, v]) => (
            <div key={k} className="tarjeta p-2">
              <dt className="text-xs text-texto-suave">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl">Personalidad de {s.nombre}</h2>
        <p className="mt-2">{t.personalidad}</p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="tarjeta p-6">
          <h2 className="font-display text-2xl">💜 {s.nombre} en el amor</h2>
          <p className="mt-2">{t.amor}</p>
        </section>
        <section className="tarjeta p-6">
          <h2 className="font-display text-2xl">💼 En el trabajo</h2>
          <p className="mt-2">{t.trabajo}</p>
        </section>
      </div>
      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl">🌑 Su lado oscuro</h2>
        <p className="mt-2">{t.sombra}</p>
        <p className="mt-3 text-oro-suave">Consejo: {t.consejo}</p>
      </section>

      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl">Compatibilidad de {s.nombre}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-texto-suave">Mejores parejas</h3>
            <ul className="mt-1 space-y-1">
              {mejores.map((o) => (
                <li key={o.signo.id}><Link href={`/compatibilidad-signos/${slugPareja(s, o.signo)}`} className="text-oro-suave hover:text-texto">{o.signo.simbolo} {o.signo.nombre} · {o.porcentaje}%</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-widest text-texto-suave">Las más retadoras</h3>
            <ul className="mt-1 space-y-1">
              {retos.map((o) => (
                <li key={o.signo.id}><Link href={`/compatibilidad-signos/${slugPareja(s, o.signo)}`} className="text-oro-suave hover:text-texto">{o.signo.simbolo} {o.signo.nombre} · {o.porcentaje}%</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="tarjeta p-6">
          <h2 className="font-display text-2xl">💎 Piedra de {s.nombre}: {piedra.nombre}</h2>
          <p className="mt-2 text-sm">{piedra.energia}</p>
          <p className="mt-2 text-sm text-texto-suave">{piedra.uso}</p>
          <Link href="/piedras" className="mt-2 inline-block text-xs text-oro-suave hover:text-texto">Todas las piedras →</Link>
        </section>
        <Link href={`/significado-tarot/${carta.id}`} className="tarjeta flex gap-4 p-6 transition hover:border-oro/50">
          {/* eslint-disable-next-line @next/next/no-img-element -- carta estática */}
          <img src={`/cartas/rider/${carta.id}.webp`} alt={carta.nombre} className="w-20 rounded-lg border border-borde" />
          <div>
            <h2 className="font-display text-2xl">🃏 Su carta del tarot</h2>
            <p className="mt-1 text-oro-suave">{carta.nombre}</p>
            <p className="mt-1 text-sm text-texto-suave">{carta.palabrasClave.slice(0, 3).join(" · ")}</p>
          </div>
        </Link>
      </div>

      <section className="tarjeta p-6 text-center">
        <h2 className="font-display text-2xl">Horóscopo de {s.nombre} para hoy</h2>
        <Link href={`/horoscopo/${s.id}`} className="boton boton-secundario mt-3">Leer el horóscopo de hoy</Link>
      </section>

      <CtaLectura
        titulo={`Eres mucho más que ${s.nombre}`}
        texto="Tu signo solar es solo una parte. Tu carta astral muestra tu Luna, tu ascendente y los 10 planetas en el momento exacto en que naciste."
        boton="Calcular mi carta astral gratis"
      />

      <Preguntas
        items={[
          { p: `¿Qué fechas abarca ${s.nombre}?`, r: `${s.nombre} va ${fechas(s)} (las fechas exactas cambian un día según el año). Es un signo de ${ELEMENTO[s.elemento].toLowerCase()}, ${MODALIDAD[s.modalidad].toLowerCase()}, regido por ${s.regente}.` },
          { p: `¿Con qué signos es compatible ${s.nombre}?`, r: `Sus mejores parejas son ${mejores.map((o) => `${o.signo.nombre} (${o.porcentaje}%)`).join(", ")}. Las más retadoras: ${retos.map((o) => `${o.signo.nombre} (${o.porcentaje}%)`).join(" y ")}.` },
          { p: `¿Cuál es la piedra de ${s.nombre}?`, r: `${piedra.nombre}. ${piedra.energia}` },
          { p: `¿Cómo es ${s.nombre} en el amor?`, r: t.amor },
        ]}
      />

      <nav className="flex flex-wrap justify-center gap-2 text-sm">
        {SIGNOS.map((o) => (
          <Link key={o.id} href={`/signos-zodiacales/${o.id}`} className={`rounded-full px-3 py-1 ${o.id === s.id ? "bg-oro/20 text-oro-suave" : "text-texto-suave hover:text-texto"}`}>
            {o.simbolo} {o.nombre}
          </Link>
        ))}
      </nav>
    </article>
  );
}
