import type { Metadata } from "next";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaLarga } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.legal.terminos.titulo };
}

export default async function Terminos() {
  const [t, idioma] = await Promise.all([getT(), getIdioma()]);
  return (
    <article className="prosa mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-semibold text-oro-suave">{t.legal.terminos.titulo}</h1>
      <p>{t.legal.terminos.actualizado}: {fechaLarga("2026-09-30", idioma)}.</p>
      {t.legal.terminos.secciones.map((s) => (
        <section key={s.titulo}>
          <h2>{s.titulo}</h2>
          <p>{s.texto}</p>
        </section>
      ))}
    </article>
  );
}
