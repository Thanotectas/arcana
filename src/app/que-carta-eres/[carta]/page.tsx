import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cartaPorId } from "@/lib/tarot/deck";
import { RESULTADOS } from "@/lib/seo/test-carta";
import { getPerfil } from "@/lib/dal";
import { sitio } from "@/lib/correo";
import { CompartirTest } from "@/components/seo/CompartirTest";
import { CtaLectura, Migas } from "@/components/seo/BloquesSeo";

export function generateStaticParams() {
  return Object.keys(RESULTADOS).map((carta) => ({ carta }));
}

type Busqueda = Promise<Record<string, string | string[] | undefined>>;

function limpiarCodigo(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  const limpio = (s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return limpio.length >= 4 ? limpio : null;
}

export async function generateMetadata({ params }: { params: Promise<{ carta: string }> }): Promise<Metadata> {
  const { carta } = await params;
  const c = cartaPorId(carta);
  const r = RESULTADOS[carta];
  if (!c || !r) return {};
  const titulo = `Soy ${c.nombre} ✨ ¿Qué carta del tarot eres tú?`;
  return {
    title: `${c.nombre}: resultado del test ¿Qué carta del tarot eres?`,
    description: `${r.esencia} ${r.descripcion}`,
    alternates: { canonical: `/que-carta-eres/${c.id}` },
    openGraph: { title: titulo, description: `${r.esencia} Haz el test en 1 minuto.`, images: [{ url: `/api/test-carta/${c.id}`, width: 1080, height: 1350 }] },
  };
}

export default async function ResultadoTest({ params, searchParams }: { params: Promise<{ carta: string }>; searchParams: Busqueda }) {
  const { carta } = await params;
  const c = cartaPorId(carta);
  const r = RESULTADOS[carta];
  if (!c || !r) notFound();
  const busqueda = await searchParams;
  const mia = busqueda.mia === "1";
  const invRecibido = limpiarCodigo(busqueda.inv);
  const perfil = await getPerfil().catch(() => null);
  // El enlace compartido lleva el código de quien comparte (si tiene cuenta) o el que trajo.
  const codigo = perfil?.codigo_invitacion ?? invRecibido;
  const urlCompartir = `${sitio()}/que-carta-eres/${c.id}${codigo ? `?inv=${codigo}` : ""}`;
  const urlTest = `/que-carta-eres${invRecibido ? `?inv=${invRecibido}` : ""}`;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "¿Qué carta del tarot eres?", href: "/que-carta-eres" }, { nombre: c.nombre, href: `/que-carta-eres/${c.id}` }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{mia ? "Tu carta es" : "A alguien le salió"}</p>
        <h1 className="font-display text-5xl font-semibold">{c.nombre}</h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- carta estática */}
        <img src={`/cartas/rider/${c.id}.webp`} alt={c.nombre} className="mx-auto mt-5 w-48 rounded-xl border-2 border-oro/60 shadow-2xl" />
        <p className="font-display mx-auto mt-5 max-w-lg text-2xl italic text-oro-suave">“{r.esencia}”</p>
      </header>

      {mia ? (
        <>
          <section className="tarjeta space-y-4 p-6">
            <p>{r.descripcion}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-oro/10 p-4">
                <p className="text-xs uppercase tracking-widest text-texto-suave">Tu don</p>
                <p className="mt-1">{r.don}</p>
              </div>
              <div className="rounded-2xl bg-violeta/10 p-4">
                <p className="text-xs uppercase tracking-widest text-texto-suave">Tu reto</p>
                <p className="mt-1">{r.reto}</p>
              </div>
            </div>
          </section>
          <section className="space-y-3 text-center">
            <h2 className="font-display text-2xl">Compártelo y descubre qué carta son tus amigas</h2>
            <CompartirTest url={urlCompartir} texto={`Me salió ${c.nombre} 🔮 "${r.esencia}" ¿Qué carta del tarot eres tú?`} imagen={`/api/test-carta/${c.id}?formato=historia`} />
            {perfil?.codigo_invitacion && <p className="text-xs text-texto-suave">Tu enlace lleva tu código: si alguien se registra con él, los dos reciben créditos de regalo.</p>}
          </section>
          <p className="text-center text-sm">
            <Link href={`/significado-tarot/${c.id}`} className="text-oro-suave hover:text-texto">Lee el significado completo de {c.nombre} →</Link>
            {"  ·  "}
            <Link href={urlTest} className="text-texto-suave hover:text-texto">Repetir el test</Link>
          </p>
          <CtaLectura
            titulo="Ahora pregúntale algo al tarot"
            texto="Tu carta habla de quién eres. Una tirada habla de lo que viene: amor, trabajo, esa decisión que te ronda. Sibila te la interpreta."
            href={perfil ? "/tarot" : invRecibido ? `/r/${invRecibido}` : "/registro"}
            boton="Hacer mi tirada gratis"
          />
        </>
      ) : (
        <section className="tarjeta space-y-4 p-6 text-center">
          <h2 className="font-display text-3xl">¿Y tú? ¿Qué carta eres?</h2>
          <p className="text-texto-suave">6 preguntas, 1 minuto. Descubre cuál de los 22 arcanos mayores refleja tu esencia.</p>
          <Link href={urlTest} className="boton boton-primario">Hacer el test gratis</Link>
        </section>
      )}
    </div>
  );
}
