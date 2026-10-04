import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { tokenBajaValido } from "@/lib/correo";
import { getT } from "@/lib/i18n/servidor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.correos.bajaPagina.titulo, robots: { index: false } };
}

/** Baja de los correos de Sibila desde el enlace firmado del correo (sin sesión). */
export default async function PaginaBaja({ searchParams }: { searchParams: Promise<{ u?: string; t?: string }> }) {
  const [{ u = "", t: token = "" }, t] = await Promise.all([searchParams, getT()]);
  let hecho = false;
  if (tokenBajaValido(u, token)) {
    const { error } = await getSupabaseAdmin().from("perfiles").update({ recibe_correos: false }).eq("id", u);
    hecho = !error;
  }
  return (
    <div className="mx-auto max-w-lg space-y-6 py-10 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Arcana</p>
      <h1 className="font-display text-4xl font-semibold">{hecho ? t.correos.bajaPagina.titulo : t.cuenta.correos.titulo}</h1>
      <p className="text-texto-suave">{hecho ? t.correos.bajaPagina.texto : t.correos.bajaPagina.invalido}</p>
      <Link href="/cuenta" className="boton boton-primario">{t.correos.bajaPagina.cuenta}</Link>
    </div>
  );
}
