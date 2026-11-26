import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Clapperboard, ExternalLink, Flame, Moon, Sparkles } from "lucide-react";
import { getUsuarioOpcional } from "@/lib/dal";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe, lecturasDelCurso, NOTA_PRACTICA, NOTA_PROYECTO } from "@/lib/escuela/servidor";
import { conNombre, gradoDe, lunaHoy, NOMBRE_INTENCION, ruedaDeIntenciones, tuVela } from "@/lib/escuela/personal";
import { leccionesConLlave, textoPaso } from "@/lib/escuela/tipos";
import { Altar } from "@/components/escuela/Altar";
import { EscucharTexto } from "@/components/escuela/EscucharTexto";
import { ModoRitual } from "@/components/escuela/ModoRitual";
import { CartasSaber } from "@/components/escuela/CartasSaber";
import { ConstelacionTradiciones } from "@/components/escuela/ConstelacionTradiciones";
import { PolvoEstelar } from "@/components/escuela/PolvoEstelar";
import { RuedaIntenciones } from "@/components/escuela/RuedaIntenciones";
import { ProyectoRitual } from "@/components/escuela/ProyectoRitual";
import { ReflexionPractica } from "@/components/escuela/ReflexionPractica";
import { TestLeccion } from "@/components/escuela/TestLeccion";

export async function generateMetadata({ params }: { params: Promise<{ curso: string; leccion: string }> }): Promise<Metadata> {
  const { curso: slug, leccion } = await params;
  const l = cursoPorSlug(slug)?.lecciones.find((x) => x.numero === Number(leccion));
  return l ? { title: `Día ${l.numero} · ${l.titulo}`, robots: { index: false } } : {};
}

function Separador() {
  return (
    <div className="flex items-center justify-center gap-4 text-oro/70" aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-oro/60" />✦<span className="h-px w-16 bg-gradient-to-l from-transparent to-oro/60" />
    </div>
  );
}

/** Una lección: saludo personal, video, la tradición, el ritual guiado, la foto para Sibila y las preguntas. */
export default async function PaginaLeccion({ params }: { params: Promise<{ curso: string; leccion: string }> }) {
  const { curso: slug, leccion: num } = await params;
  const curso = cursoPorSlug(slug);
  const leccion = curso?.lecciones.find((x) => x.numero === Number(num));
  if (!curso || !leccion) notFound();
  const usuario = await getUsuarioOpcional();
  const avance = await avanceDe(curso, usuario);
  const i = curso.lecciones.indexOf(leccion);
  const estado = avance.estados[i];
  if (!usuario || !(avance.inscrito || avance.vistaPrevia) || (estado !== "abierta" && estado !== "hecha")) redirect(`/escuela/${curso.slug}`);
  if (avance.inscrito && !avance.perfil) redirect(`/escuela/${curso.slug}`);
  const previo = avance.progreso.get(leccion.numero);
  const ant = curso.lecciones[i - 1];
  const sig = curso.lecciones[i + 1];
  const siguiente = sig && (avance.estados[i + 1] === "abierta" || avance.estados[i + 1] === "hecha") ? `/escuela/${curso.slug}/${sig.numero}` : null;
  const perfil = avance.perfil;
  const zona = perfil?.zona ?? "America/Bogota";
  const luna = lunaHoy();
  const tiposEntrega = leccion.bloques.flatMap((b) => (b.tipo === "entrega" ? [b.lectura] : []));
  const lecturas = await lecturasDelCurso(usuario.id, avance.inscritoEn, tiposEntrega);
  const hayVela = leccion.bloques.some((b) => b.tipo === "ritual" && b.herramienta?.href === "/velas");
  const vela = hayVela && perfil?.intencionVela ? tuVela(perfil.intencionVela, zona) : null;
  const primerTexto = leccion.bloques.findIndex((b) => b.tipo === "texto");
  // El camino de iniciación: cuántas llaves tiene y a qué grado sube con la de hoy.
  const yaHecha = estado === "hecha";
  const gradoAntes = gradoDe(curso, avance.estados, perfil?.trato);
  const gradoDespues = gradoDe(curso, avance.estados.map((e, j) => (j === i ? "hecha" : e)), perfil?.trato);
  const gradoNuevo = !yaHecha && gradoDespues.nivel !== gradoAntes.nivel ? gradoDespues.conCirculo : null;
  const estadosAltar = avance.estados.filter((_, j) => !curso.lecciones[j].final);
  const totalNoches = leccionesConLlave(curso).length;
  // La práctica entre lunas de la lección anterior: al abrir esta, cuenta cómo le fue.
  const practicaAnterior = ant?.bloques.find((b) => b.tipo === "practica");
  const notasAnteriores = (ant && avance.progreso.get(ant.numero)?.notas) || {};
  const notasHoy = previo?.notas ?? {};

  return (
    <article className="mx-auto max-w-2xl space-y-12" lang="es">
      <PolvoEstelar />
      {/* Encabezado: la Luna del día, el título y Sibila que te saluda */}
      <header className="relative -mx-4 overflow-hidden px-6 pb-8 pt-12 text-center sm:mx-0 sm:rounded-3xl sm:border sm:border-borde">
        <div className="escuela-cielo absolute inset-0" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(139,108,246,.25),transparent_70%)]" aria-hidden />
        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">
            <Link href={`/escuela/${curso.slug}`} className="hover:text-texto">{curso.titulo}</Link>
          </p>
          <p className="text-6xl" aria-hidden>{leccion.luna}</p>
          <p className="text-sm uppercase tracking-[0.3em] text-oro-suave">{leccion.final ? "La noche del Círculo" : `Día ${leccion.numero} de ${totalNoches}`} · {leccion.minutos} min</p>
          <h1 className="escuela-brillo font-display text-4xl font-semibold leading-tight sm:text-5xl">{leccion.titulo}</h1>
          <div className="mx-auto flex max-w-lg items-start gap-3 pt-3 text-start">
            {/* eslint-disable-next-line @next/next/no-img-element -- retrato pequeño estático */}
            <img src="/cartas/arcana/la-sibila.webp" alt="" className="h-12 w-12 shrink-0 rounded-full border border-oro/50 object-cover object-top" />
            <p className="font-display text-xl italic leading-snug text-texto/90">«{conNombre(leccion.saludo, perfil?.nombre)}»</p>
          </div>
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-oro/40 bg-oro/10 px-4 py-1.5 text-sm text-oro-suave">
            <span aria-hidden>{leccion.llave.simbolo}</span>
            {leccion.final
              ? yaHecha
                ? `Ya tienes el ${leccion.llave.nombre}`
                : `Hoy presentas tu prueba y recibes el ${leccion.llave.nombre}`
              : yaHecha
                ? `Ya tienes la ${leccion.llave.nombre}`
                : `Hoy recibes la ${leccion.llave.nombre}`}
          </p>
          <div className="pt-4 opacity-80">
            <Altar estados={estadosAltar} tamano="chico" />
          </div>
        </div>
      </header>

      {ant && practicaAnterior?.tipo === "practica" && (
        <ReflexionPractica curso={curso.slug} leccion={ant.numero} titulo={practicaAnterior.titulo} pregunta={practicaAnterior.pregunta} inicial={notasAnteriores[NOTA_PRACTICA] ?? ""} />
      )}

      {leccion.bloques.map((b, k) => {
        if (b.tipo === "video")
          return b.src ? (
            <figure key={k} className="mx-auto w-full max-w-sm">
              <video controls playsInline preload="metadata" poster={b.poster} className="aspect-[9/16] w-full rounded-3xl border border-oro/30 bg-black shadow-[0_0_60px_rgba(139,108,246,.25)]">
                <source src={b.src} type="video/mp4" />
              </video>
              <figcaption className="mt-3 text-center font-display text-lg italic text-texto-suave">{b.titulo}</figcaption>
            </figure>
          ) : (
            <div key={k} className="tarjeta flex items-center gap-4 p-5 text-sm text-texto-suave">
              <Clapperboard className="h-6 w-6 shrink-0 text-oro" aria-hidden />
              <span><span className="font-display block text-lg text-texto">{b.titulo}</span>El video de Sibila de esta lección se está grabando.</span>
            </div>
          );
        if (b.tipo === "cita")
          return (
            <blockquote key={k} className="escuela-revelar relative mx-auto max-w-xl px-6 text-center">
              <span className="absolute -top-6 left-0 font-display text-7xl leading-none text-oro/30" aria-hidden>“</span>
              <p className="escuela-tinta font-display text-2xl italic leading-snug text-texto/90 sm:text-3xl" aria-label={b.texto}>
                {b.texto.split(" ").map((w, j) => (
                  <span key={j} aria-hidden style={{ animationDelay: `${0.4 + j * 0.12}s` }}>{w}&nbsp;</span>
                ))}
              </p>
              <footer className="mt-3 text-xs uppercase tracking-[0.3em] text-oro-suave">— {b.origen}</footer>
            </blockquote>
          );
        if (b.tipo === "saberes")
          return (
            <section key={k} className="escuela-revelar space-y-6">
              <Separador />
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Saberes de la tradición</p>
                <h2 className="font-display text-4xl">{b.titulo}</h2>
              </div>
              <CartasSaber items={b.items} />
            </section>
          );
        if (b.tipo === "tradiciones")
          return (
            <section key={k} className="escuela-revelar space-y-6">
              <Separador />
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Así se hace en el mundo</p>
                <h2 className="font-display text-4xl">{b.titulo}</h2>
              </div>
              <ConstelacionTradiciones items={b.items} />
            </section>
          );
        if (b.tipo === "rueda")
          return (
            <section key={k} className="escuela-revelar space-y-6">
              <Separador />
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Interactivo</p>
                <h2 className="font-display text-4xl">{b.titulo}</h2>
                <p className="mx-auto mt-2 max-w-md text-texto-suave">{b.texto}</p>
              </div>
              <RuedaIntenciones items={ruedaDeIntenciones()} inicial={perfil?.intencionVela ?? null} />
            </section>
          );
        if (b.tipo === "texto") {
          const capital = k === primerTexto;
          return (
            <section key={k} className="escuela-revelar space-y-5">
              <Separador />
              {b.titulo && <h2 className="text-center font-display text-4xl">{b.titulo}</h2>}
              <EscucharTexto curso={curso.slug} leccion={leccion.numero} bloque={k} />
              {b.parrafos.map((p, j) => (
                <p key={j} className={`text-lg leading-relaxed text-texto/90 ${capital && j === 0 ? "escuela-capital" : ""}`}>{p}</p>
              ))}
            </section>
          );
        }
        if (b.tipo === "ritual")
          return (
            <section key={k} className="escuela-revelar space-y-6">
              <Separador />
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Tu ritual de hoy</p>
                <h2 className="font-display text-4xl">{b.titulo}</h2>
              </div>
              {/* Lo personal: la Luna de hoy y, el día de las velas, su vela */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="tarjeta flex items-center gap-4 p-4">
                  <span className="text-4xl" aria-hidden>{luna.emoji}</span>
                  <span>
                    <span className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-violeta-suave"><Moon className="h-3 w-3" aria-hidden />Tu Luna hoy</span>
                    <span className="font-display block text-xl">{luna.nombre}</span>
                    <span className="text-xs text-texto-suave">{luna.sentido}</span>
                  </span>
                </div>
                {vela && perfil?.intencionVela ? (
                  <div className="tarjeta flex items-center gap-4 border-oro/40 p-4">
                    <span className="h-12 w-4 shrink-0 rounded-sm" style={{ background: vela.tono, boxShadow: `0 -6px 18px ${vela.tono}` }} aria-hidden />
                    <span>
                      <span className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-violeta-suave"><Flame className="h-3 w-3" aria-hidden />Tu vela · {NOMBRE_INTENCION[perfil.intencionVela]}</span>
                      <span className="font-display block text-xl">{vela.color} <span className="text-base text-texto-suave">({vela.alterno})</span></span>
                      <span className="text-xs text-texto-suave">Un {vela.dia}, día de {vela.astro}, con {vela.fase.toLowerCase()}{vela.cuando ? `: el próximo es el ${vela.cuando}.` : "."}</span>
                    </span>
                  </div>
                ) : (
                  perfil?.intencionCierre && (
                    <div className="tarjeta p-4">
                      <span className="text-xs uppercase tracking-[0.2em] text-violeta-suave">Lo que quieres cerrar</span>
                      <span className="font-display mt-1 block text-lg italic leading-snug">«{perfil.intencionCierre}»</span>
                    </div>
                  )
                )}
              </div>
              <ModoRitual curso={curso.slug} leccion={leccion.numero} titulo={b.titulo} materiales={b.materiales} pasos={b.pasos} cuidado={b.cuidado} apertura={b.apertura} cierre={b.cierre} fondo={b.fondo} notasIniciales={previo?.notas ?? {}} nombre={perfil?.nombre ?? null} />
              <details className="tarjeta p-5">
                <summary className="cursor-pointer font-display text-xl">Ver el ritual por escrito</summary>
                <div className="mt-4 space-y-4">
                  <ul className="flex flex-wrap gap-2">
                    {b.materiales.map((m) => <li key={m} className="rounded-full border border-borde px-3 py-1 text-sm">{m}</li>)}
                  </ul>
                  <ol className="space-y-3">
                    {b.pasos.map((p, j) => (
                      <li key={j} className="flex gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-oro/50 font-display text-oro-suave">{j + 1}</span>
                        <span className="leading-relaxed">{textoPaso(p)}</span>
                      </li>
                    ))}
                  </ol>
                  {b.cuidado && <p className="flex gap-2 rounded-xl border border-oro/30 p-3 text-sm text-texto-suave"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />{b.cuidado}</p>}
                  {b.herramienta && <Link href={b.herramienta.href} className="inline-flex items-center gap-1 text-sm text-oro-suave underline">{b.herramienta.texto}<ExternalLink className="h-3 w-3" aria-hidden /></Link>}
                </div>
              </details>
            </section>
          );
        if (b.tipo === "profundizar")
          return (
            <section key={k} className="escuela-revelar">
              <details className="tarjeta group overflow-hidden border-oro/30">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <BookOpen className="h-7 w-7 shrink-0 text-oro" aria-hidden />
                  <span className="flex-1">
                    <span className="text-xs uppercase tracking-[0.3em] text-violeta-suave">Para profundizar · unos {Math.max(3, Math.round(b.parrafos.join(" ").split(/\s+/).length / 150))} minutos</span>
                    <span className="font-display block text-2xl leading-tight">{b.titulo}</span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-oro transition group-open:rotate-180" aria-hidden />
                </summary>
                <div className="space-y-4 border-t border-borde px-5 pb-6 pt-5 sm:px-8">
                  <EscucharTexto curso={curso.slug} leccion={leccion.numero} bloque={k} />
                  {b.parrafos.map((p, j) => (
                    <p key={j} className="leading-relaxed text-texto/90">{p}</p>
                  ))}
                </div>
              </details>
            </section>
          );
        if (b.tipo === "practica")
          return (
            <section key={k} className="escuela-revelar tarjeta relative space-y-4 overflow-hidden border-violeta/40 p-6 sm:p-8">
              <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-40" aria-hidden />
              <div className="relative text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Práctica entre lunas · hasta la próxima lección</p>
                <h2 className="font-display text-3xl">{b.titulo}</h2>
              </div>
              <p className="relative text-texto/90">{b.texto}</p>
              <ol className="relative list-inside list-decimal space-y-1.5 text-sm text-texto/85 marker:text-oro">
                {b.pasos.map((p) => <li key={p}>{p}</li>)}
              </ol>
              <p className="relative text-xs text-texto-suave">{sig ? "Al abrir la próxima lección, Sibila te preguntará cómo te fue." : "Llévala contigo: es tuya."}</p>
            </section>
          );
        if (b.tipo === "proyecto") {
          const iniciales = Object.fromEntries(b.campos.map((c) => [c.clave, notasHoy[NOTA_PROYECTO + c.clave] ?? ""]));
          return (
            <section key={k} className="escuela-revelar space-y-6">
              <Separador />
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Tu obra</p>
                <h2 className="font-display text-4xl">{b.titulo}</h2>
              </div>
              <p className="text-lg leading-relaxed text-texto/90">{b.texto}</p>
              <div className="tarjeta p-6">
                <ProyectoRitual curso={curso.slug} leccion={leccion.numero} campos={b.campos} iniciales={iniciales} revision={previo?.comentario ?? null} audio={previo?.comentarioAudio ?? null} />
              </div>
            </section>
          );
        }
        if (b.tipo === "entrega") {
          const hecha = lecturas.get(b.lectura);
          return (
            <section key={k} className="tarjeta relative overflow-hidden border-oro/40 p-6 text-center">
              <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-40" aria-hidden />
              <Sparkles className="relative mx-auto h-6 w-6 text-oro" aria-hidden />
              <h2 className="relative mt-2 font-display text-3xl">{b.titulo}</h2>
              {hecha ? (
                <div className="relative mt-4 space-y-3 text-start">
                  {hecha.foto && (
                    // eslint-disable-next-line @next/next/no-img-element -- foto privada con dirección firmada
                    <img src={hecha.foto} alt="" className="mx-auto max-h-64 rounded-xl border border-borde object-cover" />
                  )}
                  {hecha.resumen && <p className="font-display text-lg italic leading-relaxed">{hecha.resumen}</p>}
                  <p className="text-center"><Link href={`/lecturas/${hecha.id}`} className="boton boton-secundario">Ver la lectura completa</Link></p>
                </div>
              ) : (
                <>
                  <p className="relative mx-auto mt-1 max-w-md text-sm text-texto-suave">{b.texto}</p>
                  <Link href={b.href} className="boton boton-primario relative mt-4">{b.boton}</Link>
                  <p className="relative mt-2 text-xs text-texto-suave">Cuando la hagas, aparecerá aquí y en tu grimorio.</p>
                </>
              )}
            </section>
          );
        }
        return (
          <section key={k} className="escuela-revelar space-y-5">
            <Separador />
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Para ti</p>
              <h2 className="font-display text-4xl">{b.titulo ?? "Tus preguntas de hoy"}</h2>
            </div>
            <div className="tarjeta p-6">
              <TestLeccion curso={curso.slug} leccion={leccion.numero} preguntas={b.preguntas} previas={previo?.respuestas ?? {}} comentarioPrevio={previo?.comentario ?? null} audioPrevio={previo?.comentarioAudio ?? null} siguiente={siguiente} ultima={!sig} llave={leccion.llave} yaHecha={yaHecha} gradoNuevo={gradoNuevo} prueba={Boolean(leccion.final)} />
            </div>
          </section>
        );
      })}

      <nav className="flex items-center justify-between gap-3 border-t border-borde pt-6 text-sm">
        {ant ? (
          <Link href={`/escuela/${curso.slug}/${ant.numero}`} className="inline-flex items-center gap-1 text-texto-suave hover:text-texto"><ChevronLeft className="h-4 w-4" aria-hidden />Día {ant.numero}</Link>
        ) : <span />}
        <Link href={`/escuela/${curso.slug}`} className="text-oro-suave hover:text-texto">El camino</Link>
        {siguiente && sig ? (
          <Link href={siguiente} className="inline-flex items-center gap-1 text-texto-suave hover:text-texto">Día {sig.numero}<ChevronRight className="h-4 w-4" aria-hidden /></Link>
        ) : <span />}
      </nav>
    </article>
  );
}
