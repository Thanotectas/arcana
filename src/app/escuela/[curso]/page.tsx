import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenText, Check, Clapperboard, Flame, Lock, Moon, ScrollText, Sparkles, Wand2 } from "lucide-react";
import { getUsuarioOpcional } from "@/lib/dal";
import { getIdioma } from "@/lib/i18n/servidor";
import { INTENCIONES, FICHA_INTENCION, TONO_COLOR } from "@/lib/velas";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe, precioPara } from "@/lib/escuela/servidor";
import { lunaHoy, NOMBRE_INTENCION } from "@/lib/escuela/personal";
import { Altar } from "@/components/escuela/Altar";
import { BotonInscripcion } from "@/components/escuela/BotonInscripcion";
import { FormularioPerfil } from "@/components/escuela/FormularioPerfil";
import { ListaEspera } from "@/components/ListaEspera";
import { TEXTOS_LISTA_ESPERA, CURSOS as CURSOS_ESPERA, type Curso as CursoEspera } from "@/lib/lista-espera/textos";

export async function generateMetadata({ params }: { params: Promise<{ curso: string }> }): Promise<Metadata> {
  const c = cursoPorSlug((await params).curso);
  return c ? { title: `${c.titulo} · ${c.subtitulo}`, description: c.descripcion } : {};
}

const LO_QUE_VIVIRAS = [
  { Icono: Clapperboard, titulo: "Un video de Sibila cada día", texto: "La historia de cada tradición, contada con su voz." },
  { Icono: Wand2, titulo: "Rituales guiados paso a paso", texto: "Sibila te acompaña con su voz: respiras, enciendes, escribes." },
  { Icono: Sparkles, titulo: "Sibila lee tus rituales", texto: "Tu vaso, tu vela, tu taza y tus cartas. Lecturas incluidas." },
  { Icono: ScrollText, titulo: "Tu grimorio y tu carta", texto: "Todo lo que vives queda en tu libro, y al final Sibila te escribe." },
];

/** Presentación del curso: portada con video, el altar del avance, el camino lunar y, para empezar, el perfil. */
export default async function PaginaCurso({ params }: { params: Promise<{ curso: string }> }) {
  const curso = cursoPorSlug((await params).curso);
  if (!curso) notFound();
  const [usuario, idioma] = await Promise.all([getUsuarioOpcional(), getIdioma()]);
  const [avance, precio] = await Promise.all([avanceDe(curso, usuario), precioPara(curso, usuario)]);
  const fundador = precio < curso.costo;
  const dentro = avance.inscrito || avance.vistaPrevia;
  const hechas = avance.estados.filter((e) => e === "hecha").length;
  const enEspera = (CURSOS_ESPERA as readonly string[]).includes(curso.slug);
  const luna = lunaHoy();
  const pidePerfil = avance.inscrito && !avance.perfil;
  const siguiente = curso.lecciones.find((_, i) => avance.estados[i] === "abierta");
  const terminado = hechas === curso.lecciones.length;
  const opcionesVela = INTENCIONES.map((v) => ({ valor: v, nombre: NOMBRE_INTENCION[v], tono: TONO_COLOR[FICHA_INTENCION[v].color] }));

  return (
    <div className="mx-auto max-w-4xl space-y-14" lang="es">
      {/* Portada: video de velas de fondo, cielo y el título */}
      <section className="relative -mx-4 overflow-hidden border-borde sm:mx-0 sm:rounded-3xl sm:border">
        <video autoPlay muted loop playsInline preload="metadata" poster={curso.portada} className="absolute inset-0 h-full w-full object-cover opacity-55" aria-hidden>
          <source src="/escuela/rituales/fondo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-noche/40 via-noche/70 to-noche" aria-hidden />
        <div className="escuela-cielo absolute inset-0" aria-hidden />
        <div className="relative space-y-5 px-6 pb-10 pt-20 text-center sm:px-12 sm:pt-28">
          <p className="text-xs uppercase tracking-[0.4em] text-oro-suave">
            <Link href="/escuela" className="hover:text-texto">La Escuela de Sibila</Link>
          </p>
          <h1 className="font-display text-5xl font-semibold leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,.8)] sm:text-7xl">{curso.titulo}</h1>
          <p className="font-display text-2xl italic text-violeta-suave">{avance.perfil ? `${avance.perfil.nombre}, tu camino de siete noches` : curso.subtitulo}</p>
          <div className="pt-4">
            <Altar estados={avance.estados.map((e) => (dentro ? e : "cerrada"))} />
          </div>
          {dentro && (
            <p className="text-sm text-texto-suave">
              {terminado ? "Encendiste las siete velas ✦" : `${hechas} de ${curso.lecciones.length} velas encendidas`} · {luna.emoji} {luna.nombre} hoy
            </p>
          )}
          {dentro && siguiente && !pidePerfil && (
            <Link href={`/escuela/${curso.slug}/${siguiente.numero}`} className="boton boton-primario">
              {hechas === 0 ? "Comenzar el día 1" : `Continuar: día ${siguiente.numero}`}
            </Link>
          )}
          {dentro && terminado && (
            <Link href={`/escuela/${curso.slug}/grimorio`} className="boton boton-primario">Abrir mi grimorio</Link>
          )}
        </div>
      </section>

      {avance.vistaPrevia && !curso.abierto && (
        <p className="rounded-xl border border-violeta/40 p-3 text-center text-xs text-violeta-suave">Vista previa de administrador: el curso aún no está abierto. Puedes inscribirte gratis para recorrerlo.</p>
      )}

      {pidePerfil && <FormularioPerfil curso={curso.slug} opciones={opcionesVela} />}

      {/* Inscripción o lista de espera */}
      {!avance.inscrito && (
        <section className="space-y-8">
          <p className="mx-auto max-w-2xl text-center font-display text-2xl leading-snug">{curso.descripcion}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {LO_QUE_VIVIRAS.map(({ Icono, titulo, texto }) => (
              <div key={titulo} className="tarjeta flex gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-oro/10 text-oro"><Icono className="h-5 w-5" aria-hidden /></span>
                <span>
                  <span className="font-display block text-xl">{titulo}</span>
                  <span className="text-sm text-texto-suave">{texto}</span>
                </span>
              </div>
            ))}
          </div>
          {(curso.abierto || avance.vistaPrevia) && (
            <div className="tarjeta relative overflow-hidden border-oro/40 p-8 text-center">
              <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-50" aria-hidden />
              <p className="relative font-display text-4xl">
                {avance.vistaPrevia && !curso.abierto ? "Gratis (vista previa)" : fundador ? <><s className="me-3 text-2xl text-texto-suave">{curso.costo}</s>{precio} créditos</> : `${curso.costo} créditos`}
              </p>
              {fundador && !avance.vistaPrevia && <p className="relative mt-1 text-sm text-oro-suave">Precio de fundadores: te anotaste en la lista de espera ✨</p>}
              <p className="relative mt-2 text-sm text-texto-suave">Incluye {curso.creditosIncluidos} créditos para que Sibila lea tus rituales.</p>
              <div className="relative mt-5"><BotonInscripcion curso={curso.slug} conSesion={Boolean(usuario)} texto="Encender mi primera vela" /></div>
            </div>
          )}
          {!curso.abierto && !avance.vistaPrevia && enEspera && (
            <ListaEspera curso={curso.slug as CursoEspera} idioma={idioma} origen={`escuela/${curso.slug}`} textos={TEXTOS_LISTA_ESPERA[idioma]} correoInicial={usuario?.email ?? ""} />
          )}
        </section>
      )}

      {/* El camino lunar: un día por fase */}
      <section className="space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">El camino</p>
          <h2 className="font-display text-4xl">Siete noches, siete lunas</h2>
        </div>
        <ol className="relative mx-auto max-w-2xl space-y-4 before:absolute before:bottom-6 before:start-[35px] before:top-6 before:w-px before:bg-gradient-to-b before:from-oro/60 before:via-violeta/40 before:to-transparent">
          {curso.lecciones.map((l, i) => {
            const e = dentro ? avance.estados[i] : "cerrada";
            const abierta = e === "abierta" || e === "hecha";
            const contenido = (
              <>
                <span className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-2xl ${e === "hecha" ? "border-oro bg-oro/15 shadow-[0_0_24px_rgba(241,217,154,.35)]" : e === "abierta" ? "border-oro/60 bg-noche" : "border-borde bg-noche opacity-70"}`}>
                  {e === "hecha" ? <Flame className="escuela-llama h-6 w-6 text-oro" aria-hidden /> : l.luna}
                </span>
                <span className="flex-1">
                  <span className="text-xs uppercase tracking-[0.25em] text-violeta-suave">Día {l.numero} · {l.minutos} min</span>
                  <span className="font-display block text-2xl leading-tight">{l.titulo}</span>
                  <span className="block text-sm text-texto-suave">{e === "manana" ? "Se abre mañana: deja que el ritual de hoy repose." : l.resumen}</span>
                </span>
                {e === "hecha" ? <Check className="h-5 w-5 shrink-0 text-oro" aria-hidden /> : !abierta && <Lock className="h-4 w-4 shrink-0 text-texto-suave" aria-hidden />}
              </>
            );
            return (
              <li key={l.numero}>
                {abierta ? (
                  <Link href={`/escuela/${curso.slug}/${l.numero}`} className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-white/5">{contenido}</Link>
                ) : (
                  <div className="flex items-center gap-4 p-2">{contenido}</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {dentro && avance.perfil && (
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="tarjeta space-y-2 p-6">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violeta-suave"><Moon className="h-4 w-4" aria-hidden />Lo que quieres cerrar</p>
            <p className="font-display text-xl italic">{avance.perfil.intencionCierre ? `«${avance.perfil.intencionCierre}»` : "Aún no lo escribiste."}</p>
            {avance.perfil.intencionVela && <p className="text-sm text-texto-suave">Y para el año que viene: {NOMBRE_INTENCION[avance.perfil.intencionVela].toLowerCase()}.</p>}
          </div>
          <Link href={`/escuela/${curso.slug}/grimorio`} className="tarjeta group flex items-center gap-4 p-6 transition hover:border-oro/40">
            <BookOpenText className="h-10 w-10 shrink-0 text-oro" aria-hidden />
            <span>
              <span className="font-display block text-2xl">Tu grimorio</span>
              <span className="text-sm text-texto-suave">Todo lo que escribes, tus rituales y las lecturas de Sibila, en un libro tuyo.</span>
            </span>
          </Link>
        </section>
      )}

      {avance.carta && (
        <section className="tarjeta relative overflow-hidden border-oro/50 p-8">
          <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <p className="relative text-xs uppercase tracking-[0.3em] text-violeta-suave">Tu carta de cierre de ciclo</p>
          {avance.cartaAudio && <audio controls src={avance.cartaAudio} className="relative mt-3 w-full" />}
          {avance.carta.split(/\n{2,}/).map((x, k) => (
            <p key={k} className="font-display relative mt-4 text-xl leading-relaxed">{x}</p>
          ))}
        </section>
      )}
    </div>
  );
}
