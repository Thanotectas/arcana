import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getUsuarioOpcional } from "@/lib/dal";
import { esAdmin } from "@/lib/admin";
import { CURSOS_ESCUELA } from "@/lib/escuela/cursos";

export const metadata: Metadata = {
  title: "La Escuela de Sibila: cursos de rituales y tradiciones",
  description: "Cursos cortos de lecciones diarias: video, la historia de cada tradición, el ritual paso a paso, preguntas y la lectura de Sibila.",
};

/** La Escuela de Sibila: los cursos (los que aún no abren se muestran como «muy pronto»). */
export default async function PaginaEscuela() {
  const usuario = await getUsuarioOpcional();
  const admin = esAdmin(usuario?.email);
  return (
    <div className="mx-auto max-w-4xl space-y-10" lang="es">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Aprende con Sibila</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">La Escuela de Sibila</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">
          Cursos cortos, una lección por día: un video, la historia de cada tradición, el ritual paso a paso, unas preguntas para ti y la lectura de Sibila.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {CURSOS_ESCUELA.map((c) => (
          <Link key={c.slug} href={`/escuela/${c.slug}`} className="tarjeta group flex flex-col p-5 transition hover:-translate-y-1 hover:border-oro/40">
            {/* eslint-disable-next-line @next/next/no-img-element -- portada estática */}
            <img src={c.portada} alt="" className="aspect-[4/5] w-full rounded-xl border border-borde object-cover" />
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-violeta-suave">{c.abierto ? `${c.lecciones.length} lecciones` : admin ? "Vista previa" : "Muy pronto"}</p>
            <h2 className="font-display mt-1 text-2xl">{c.titulo}</h2>
            <p className="text-sm text-oro-suave">{c.subtitulo}</p>
            <p className="mt-2 flex-1 text-sm text-texto-suave">{c.descripcion}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-oro-suave">
              Ver el curso <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
