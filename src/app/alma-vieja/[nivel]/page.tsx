import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NIVELES_ALMA, RESULTADOS_ALMA, type NivelAlma } from "@/lib/seo/test-alma";
import { getPerfil } from "@/lib/dal";
import { sitio } from "@/lib/correo";
import { CompartirTest } from "@/components/seo/CompartirTest";
import { CtaLectura, Migas } from "@/components/seo/BloquesSeo";

export function generateStaticParams() {
  return NIVELES_ALMA.map((nivel) => ({ nivel }));
}

const esNivel = (v: string): v is NivelAlma => (NIVELES_ALMA as readonly string[]).includes(v);

function limpiarCodigo(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  const limpio = (s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return limpio.length >= 4 ? limpio : null;
}

export async function generateMetadata({ params }: { params: Promise<{ nivel: string }> }): Promise<Metadata> {
  const { nivel } = await params;
  if (!esNivel(nivel)) return {};
  const r = RESULTADOS_ALMA[nivel];
  return {
    title: `${r.nombre}: resultado del test ¿Eres alma vieja?`,
    description: `${r.esencia} ${r.descripcion}`,
    alternates: { canonical: `/alma-vieja/${nivel}` },
    openGraph: { title: `Soy ${r.nombre.toLowerCase()} ✨ ¿Y tú?`, description: `${r.esencia} Haz el test en 1 minuto.`, images: [{ url: `/api/test-alma/${nivel}`, width: 1080, height: 1350 }] },
  };
}

export default async function ResultadoAlmaVieja({ params, searchParams }: { params: Promise<{ nivel: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { nivel } = await params;
  if (!esNivel(nivel)) notFound();
  const r = RESULTADOS_ALMA[nivel];
  const busqueda = await searchParams;
  const mia = busqueda.mia === "1";
  const invRecibido = limpiarCodigo(busqueda.inv);
  const perfil = await getPerfil().catch(() => null);
  const codigo = perfil?.codigo_invitacion ?? invRecibido;
  const urlCompartir = `${sitio()}/alma-vieja/${nivel}${codigo ? `?inv=${codigo}` : ""}`;
  const urlTest = `/alma-vieja${invRecibido ? `?inv=${invRecibido}` : ""}`;
  const estrellas = "✦".repeat(r.estrellas) + "✧".repeat(5 - r.estrellas);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "¿Eres alma vieja?", href: "/alma-vieja" }, { nombre: r.nombre, href: `/alma-vieja/${nivel}` }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{mia ? "Tu alma es" : "A alguien le salió"}</p>
        <h1 className="font-display text-5xl font-semibold">{r.nombre}</h1>
        <p className="mt-4 text-4xl tracking-[0.3em] text-oro" aria-label={`${r.estrellas} de 5`}>{estrellas}</p>
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
            <h2 className="font-display text-2xl">Compártelo y descubre la edad del alma de tus amigas</h2>
            <CompartirTest url={urlCompartir} texto={`Me salió ${r.nombre.toLowerCase()} ✨ "${r.esencia}" ¿Y tu alma qué edad tiene?`} imagen={`/api/test-alma/${nivel}?formato=historia`} />
            {perfil?.codigo_invitacion && <p className="text-xs text-texto-suave">Tu enlace lleva tu código: si alguien se registra con él, los dos reciben créditos de regalo.</p>}
          </section>
          <p className="text-center text-sm">
            <Link href="/reencarnacion" className="text-oro-suave hover:text-texto">Qué dice tu Nodo Sur →</Link>
            {"  ·  "}
            <Link href="/rituales#vidas-pasadas" className="text-oro-suave hover:text-texto">Rituales de vidas pasadas</Link>
            {"  ·  "}
            <Link href={urlTest} className="text-texto-suave hover:text-texto">Repetir el test</Link>
          </p>
          <CtaLectura
            titulo="¿Quién fuiste en tus otras vidas?"
            texto="Tu Nodo Sur, tus números kármicos y tres cartas del tarot cuentan quién fuiste, qué trajiste contigo y hacia dónde va tu alma."
            href={perfil ? "/vidas-pasadas" : invRecibido ? `/r/${invRecibido}` : "/registro"}
            boton="Ver mis vidas pasadas"
          />
        </>
      ) : (
        <section className="tarjeta space-y-4 p-6 text-center">
          <h2 className="font-display text-3xl">¿Y tu alma? ¿Qué edad tiene?</h2>
          <p className="text-texto-suave">7 preguntas, 1 minuto. Descubre si eres alma nueva, joven, madura, vieja o ancestral.</p>
          <Link href={urlTest} className="boton boton-primario">Hacer el test gratis</Link>
        </section>
      )}
    </div>
  );
}
