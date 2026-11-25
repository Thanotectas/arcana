import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, Flame, Lock } from "lucide-react";
import { getUsuarioOpcional } from "@/lib/dal";
import { getIdioma } from "@/lib/i18n/servidor";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe, precioPara } from "@/lib/escuela/servidor";
import { BotonInscripcion } from "@/components/escuela/BotonInscripcion";
import { ListaEspera } from "@/components/ListaEspera";
import { TEXTOS_LISTA_ESPERA, CURSOS as CURSOS_ESPERA, type Curso as CursoEspera } from "@/lib/lista-espera/textos";

export async function generateMetadata({ params }: { params: Promise<{ curso: string }> }): Promise<Metadata> {
  const c = cursoPorSlug((await params).curso);
  return c ? { title: `${c.titulo} · ${c.subtitulo}`, description: c.descripcion } : {};
}

/** Presentación del curso: de qué trata, precio e inscripción; con inscripción, las lecciones y el avance. */
export default async function PaginaCurso({ params }: { params: Promise<{ curso: string }> }) {
  const curso = cursoPorSlug((await params).curso);
  if (!curso) notFound();
  const [usuario, idioma] = await Promise.all([getUsuarioOpcional(), getIdioma()]);
  const [avance, precio] = await Promise.all([avanceDe(curso, usuario), precioPara(curso, usuario)]);
  const fundador = precio < curso.costo;
  const dentro = avance.inscrito || avance.vistaPrevia;
  const hechas = avance.estados.filter((e) => e === "hecha").length;
  const enEspera = (CURSOS_ESPERA as readonly string[]).includes(curso.slug);

  return (
    <div className="mx-auto max-w-3xl space-y-10" lang="es">
      <p className="text-sm text-texto-suave">
        <Link href="/escuela" className="hover:text-texto">La Escuela de Sibila</Link> › {curso.titulo}
      </p>
      <header className="grid items-center gap-6 sm:grid-cols-[1fr_1.3fr]">
        {/* eslint-disable-next-line @next/next/no-img-element -- portada estática */}
        <img src={curso.portada} alt="" className="aspect-[4/5] w-full rounded-2xl border border-borde object-cover" />
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{curso.subtitulo}</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{curso.titulo}</h1>
          <p className="text-texto-suave">{curso.descripcion}</p>
          <ul className="space-y-1 text-sm">
            {curso.promesas.map((p) => (
              <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />{p}</li>
            ))}
          </ul>
          {avance.vistaPrevia && !curso.abierto && <p className="rounded-xl border border-violeta/40 p-3 text-xs text-violeta-suave">Vista previa: el curso aún no está abierto al público. Como administrador lo ves completo y puedes inscribirte gratis para probarlo.</p>}
        </div>
      </header>

      {!avance.inscrito && (curso.abierto || avance.vistaPrevia) && (
        <section className="tarjeta border-oro/40 bg-oro/5 p-6 text-center">
          <p className="font-display text-3xl">
            {avance.vistaPrevia && !curso.abierto ? "Gratis (vista previa)" : fundador ? <><s className="me-2 text-xl text-texto-suave">{curso.costo}</s>{precio} créditos</> : `${curso.costo} créditos`}
          </p>
          {fundador && !avance.vistaPrevia && <p className="text-sm text-oro-suave">Precio de fundadores: te anotaste en la lista de espera ✨</p>}
          <p className="mt-1 text-sm text-texto-suave">Incluye {curso.creditosIncluidos} créditos para las lecturas de Sibila de tus rituales.</p>
          <div className="mt-4"><BotonInscripcion curso={curso.slug} conSesion={Boolean(usuario)} texto="Inscribirme" /></div>
        </section>
      )}
      {!curso.abierto && !avance.vistaPrevia && enEspera && (
        <ListaEspera curso={curso.slug as CursoEspera} idioma={idioma} origen={`escuela/${curso.slug}`} textos={TEXTOS_LISTA_ESPERA[idioma]} correoInicial={usuario?.email ?? ""} />
      )}

      {dentro && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl">Tus lecciones</h2>
            <div className="flex gap-1" aria-label={`${hechas} de ${curso.lecciones.length} lecciones hechas`}>
              {curso.lecciones.map((l, i) => (
                <Flame key={l.numero} className={`h-5 w-5 ${avance.estados[i] === "hecha" ? "text-oro drop-shadow-[0_0_6px_rgba(241,217,154,.8)]" : "text-borde"}`} aria-hidden />
              ))}
            </div>
          </div>
          <ol className="space-y-3">
            {curso.lecciones.map((l, i) => {
              const e = avance.estados[i];
              const contenido = (
                <>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${e === "hecha" ? "border-oro bg-oro/15 text-oro" : "border-borde text-texto-suave"}`}>
                    {e === "hecha" ? <Check className="h-5 w-5" aria-hidden /> : e === "abierta" ? l.numero : e === "manana" ? <Clock className="h-4 w-4" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
                  </span>
                  <span className="flex-1">
                    <span className="font-display block text-xl">Día {l.numero} · {l.titulo}</span>
                    <span className="block text-sm text-texto-suave">{e === "manana" ? "Se abre mañana" : e === "cerrada" ? "Se abre cuando termines la anterior" : `${l.minutos} min · ${l.resumen}`}</span>
                  </span>
                </>
              );
              return (
                <li key={l.numero}>
                  {e === "abierta" || e === "hecha" ? (
                    <Link href={`/escuela/${curso.slug}/${l.numero}`} className="tarjeta flex items-center gap-4 p-4 transition hover:border-oro/40">{contenido}</Link>
                  ) : (
                    <div className="tarjeta flex items-center gap-4 p-4 opacity-60">{contenido}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {avance.carta && (
        <section className="tarjeta border-oro/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">Tu carta de cierre de ciclo</p>
          {avance.carta.split(/\n{2,}/).map((x, k) => (
            <p key={k} className="font-display mt-3 text-xl leading-relaxed">{x}</p>
          ))}
        </section>
      )}
    </div>
  );
}
