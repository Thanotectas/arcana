import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUsuarioOpcional } from "@/lib/dal";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe, lecturasDelCurso, NOTA_PRACTICA, NOTA_PROYECTO } from "@/lib/escuela/servidor";
import { LibroDelCurso } from "@/components/escuela/LibroDelCurso";
import { gradoDe, NOMBRE_INTENCION } from "@/lib/escuela/personal";
import { Llavero } from "@/components/escuela/Llavero";
import { textoPaso } from "@/lib/escuela/tipos";
import { Altar } from "@/components/escuela/Altar";
import { AccionesGrimorio } from "@/components/escuela/AccionesGrimorio";

export const metadata: Metadata = { title: "Tu grimorio", robots: { index: false } };

const fecha = (iso: string | null, zona: string) => (iso ? new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: zona }).format(new Date(iso)) : "");

/**
 * El grimorio: el libro de la persona con todo lo que vivió en el curso (lo que escribió en sus rituales, sus
 * respuestas, los comentarios de Sibila, sus lecturas y la carta final). Se descarga en PDF con la impresión del
 * navegador, que usa los estilos de impresión de abajo.
 */
export default async function PaginaGrimorio({ params }: { params: Promise<{ curso: string }> }) {
  const curso = cursoPorSlug((await params).curso);
  if (!curso) notFound();
  const usuario = await getUsuarioOpcional();
  const avance = await avanceDe(curso, usuario);
  if (!usuario || !(avance.inscrito || avance.vistaPrevia)) redirect(`/escuela/${curso.slug}`);
  const perfil = avance.perfil;
  const zona = perfil?.zona ?? "America/Bogota";
  const tipos = curso.lecciones.flatMap((l) => l.bloques.flatMap((b) => (b.tipo === "entrega" ? [b.lectura] : [])));
  const lecturas = await lecturasDelCurso(usuario.id, avance.inscritoEn, tipos);
  const terminado = avance.estados.every((e) => e === "hecha");
  const miGrado = gradoDe(curso, avance.estados, perfil?.trato);
  const conLlave = curso.lecciones.map((l, i) => ({ l, e: avance.estados[i] })).filter(({ l }) => !l.final);

  return (
    <article className="grimorio mx-auto max-w-2xl space-y-12" lang="es">
      <style>{`
        @media print {
          @page { margin: 18mm 16mm; }
          body:has(.grimorio) { background: #fbf7ee !important; }
          body:has(.grimorio) header, body:has(.grimorio) footer, body:has(.grimorio) nav, body:has(.grimorio) .no-imprimir, body:has(.grimorio) [role="dialog"] { display: none !important; }
          .grimorio, .grimorio * { color: #2a1f3d !important; text-shadow: none !important; box-shadow: none !important; }
          .grimorio .tarjeta { background: transparent !important; border-color: #d9c9a6 !important; }
          .grimorio .escuela-cielo { display: none !important; }
          .grimorio .dia { break-inside: avoid-page; }
          .grimorio audio { display: none !important; }
        }
      `}</style>

      {/* Portada del libro */}
      <header className="relative overflow-hidden rounded-3xl border border-oro/40 px-6 py-14 text-center">
        <div className="escuela-cielo absolute inset-0" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_30%,rgba(241,217,154,.15),transparent_70%)]" aria-hidden />
        <div className="relative space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-oro-suave">Grimorio</p>
          <h1 className="font-display text-5xl font-semibold leading-tight sm:text-6xl">{perfil?.nombre ? `El libro de ${perfil.nombre}` : "Tu libro"}</h1>
          <p className="font-display text-2xl italic text-violeta-suave">{curso.titulo}</p>
          <p className="text-sm uppercase tracking-[0.3em] text-oro-suave">{miGrado.conCirculo}</p>
          <p className="text-sm text-texto-suave">{fecha(avance.inscritoEn, zona)}{terminado ? " · camino completo ✦" : ""}</p>
          <div className="pt-4"><Altar estados={conLlave.map(({ e }) => e)} tamano="chico" /></div>
          <Llavero llaves={conLlave.map(({ l }) => l.llave)} ganadas={conLlave.map(({ e }) => e === "hecha")} compacto />
        </div>
      </header>

      <AccionesGrimorio curso={curso.slug} conSello={terminado || avance.vistaPrevia} />

      {perfil?.intencionCierre && (
        <section className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Lo que viniste a cerrar</p>
          <p className="font-display text-3xl italic leading-snug">«{perfil.intencionCierre}»</p>
          {perfil.intencionVela && <p className="text-sm text-texto-suave">Y lo que quieres encender: {NOMBRE_INTENCION[perfil.intencionVela].toLowerCase()}.</p>}
        </section>
      )}

      {curso.lecciones.map((l, i) => {
        const p = avance.progreso.get(l.numero);
        const ritual = l.bloques.find((b) => b.tipo === "ritual");
        const preguntas = l.bloques.flatMap((b) => (b.tipo === "test" ? b.preguntas : []));
        const entrega = l.bloques.find((b) => b.tipo === "entrega");
        const lectura = entrega?.tipo === "entrega" ? lecturas.get(entrega.lectura) : undefined;
        const notas = Object.entries(p?.notas ?? {}).filter(([k, v]) => k !== "revisiones" && v.trim());
        const practica = l.bloques.find((b) => b.tipo === "practica");
        const proyecto = l.bloques.find((b) => b.tipo === "proyecto");
        const abiertas = preguntas.map((q, j) => (q.tipo === "abierta" ? { p: q.p, r: String(p?.respuestas?.[String(j)] ?? "").trim() } : null)).filter((x): x is { p: string; r: string } => Boolean(x?.r));
        const vacio = !notas.length && !abiertas.length && !p?.comentario && !lectura;
        return (
          <section key={l.numero} className="dia space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-4xl" aria-hidden>{l.final ? "✦" : l.luna}</span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">{l.final ? "La noche del Círculo" : `Día ${l.numero}`}</p>
                <h2 className="font-display text-3xl leading-tight">{l.titulo}</h2>
              </div>
            </div>
            {vacio ? (
              <p className="text-sm italic text-texto-suave">{avance.estados[i] === "hecha" ? "Este día no dejaste nada escrito." : "Estas páginas se escriben cuando vivas este día."}</p>
            ) : (
              <div className="space-y-4 border-s border-oro/30 ps-5">
                {notas.map(([paso, texto]) => {
                  const campo = proyecto?.tipo === "proyecto" && paso.startsWith(NOTA_PROYECTO) ? proyecto.campos.find((c) => NOTA_PROYECTO + c.clave === paso) : undefined;
                  const enunciado =
                    paso === NOTA_PRACTICA && practica?.tipo === "practica"
                      ? `Práctica entre lunas · ${practica.titulo}`
                      : campo
                        ? `Tu propio ritual · ${campo.etiqueta}`
                        : ritual?.tipo === "ritual" && ritual.pasos[Number(paso)] !== undefined
                          ? textoPaso(ritual.pasos[Number(paso)])
                          : "En tu ritual";
                  return (
                    <div key={paso}>
                      <p className="text-xs uppercase tracking-[0.2em] text-oro-suave">{enunciado}</p>
                      <p className="mt-1 whitespace-pre-line font-display text-xl leading-relaxed">{texto}</p>
                    </div>
                  );
                })}
                {abiertas.map((a) => (
                  <div key={a.p}>
                    <p className="text-xs uppercase tracking-[0.2em] text-oro-suave">{a.p}</p>
                    <p className="mt-1 whitespace-pre-line font-display text-xl leading-relaxed">{a.r}</p>
                  </div>
                ))}
                {p?.comentario && (
                  <div className="tarjeta border-oro/30 bg-oro/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-violeta-suave">Sibila te respondió</p>
                    {p.comentario.split(/\n{2,}/).map((x, k) => <p key={k} className="mt-2 leading-relaxed">{x}</p>)}
                    {p.comentarioAudio && <audio controls src={p.comentarioAudio} className="mt-3 w-full" />}
                  </div>
                )}
                {lectura && (
                  <div className="tarjeta flex gap-4 p-4">
                    {lectura.foto && (
                      // eslint-disable-next-line @next/next/no-img-element -- foto privada con dirección firmada
                      <img src={lectura.foto} alt="" className="h-28 w-24 shrink-0 rounded-lg border border-borde object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.2em] text-violeta-suave">{lectura.titulo}</p>
                      {lectura.resumen && <p className="mt-1 font-display text-lg italic leading-snug">{lectura.resumen}</p>}
                      <Link href={`/lecturas/${lectura.id}`} className="no-imprimir mt-1 inline-block text-sm text-oro-suave underline">Leer completa</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}

      {avance.carta && (
        <section className="dia tarjeta relative overflow-hidden border-oro/50 p-8">
          <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-40" aria-hidden />
          <p className="relative text-xs uppercase tracking-[0.3em] text-violeta-suave">Tu carta de cierre de ciclo</p>
          {avance.cartaAudio && <audio controls src={avance.cartaAudio} className="relative mt-3 w-full" />}
          {avance.carta.split(/\n{2,}/).map((x, k) => <p key={k} className="relative mt-4 font-display text-xl leading-relaxed">{x}</p>)}
        </section>
      )}

      {/* El apéndice del grimorio: el libro de consulta, para tenerlo también impreso */}
      {curso.libro && (
        <section className="dia space-y-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Apéndice</p>
            <h2 className="font-display text-4xl">Libro de consulta</h2>
          </div>
          <LibroDelCurso libro={curso.libro} />
        </section>
      )}

      <p className="no-imprimir text-center text-sm"><Link href={`/escuela/${curso.slug}`} className="text-oro-suave hover:text-texto">Volver al camino</Link></p>
    </article>
  );
}
