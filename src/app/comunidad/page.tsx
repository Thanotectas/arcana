import type { Metadata } from "next";
import Link from "next/link";
import { getUsuarioOpcional } from "@/lib/dal";
import { getIdioma } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { fechaLarga } from "@/lib/i18n/formato";
import { nombreCarta } from "@/lib/juego/cartas-idiomas";
import { cartaDelDia, esFecha, fechaBogota, mazoDelDia } from "@/lib/redes/carta-dia";
import { imagenCarta } from "@/components/CartaVisual";
import { TEXTOS_COMUNIDAD } from "@/lib/comunidad/textos";
import { asegurarApertura, listarMensajes } from "@/lib/comunidad/servidor";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { VistaComunidad } from "@/components/comunidad/VistaComunidad";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const t = TEXTOS_COMUNIDAD[idioma];
  return { title: t.titulo, description: t.descripcion, alternates: alternativas("/comunidad", idioma) };
}

/** Día anterior a una fecha AAAA-MM-DD. */
function diaAntes(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default async function PaginaComunidad({ searchParams }: { searchParams: Promise<{ fecha?: string }> }) {
  const [{ fecha: pedida }, idioma, usuario] = await Promise.all([searchParams, getIdioma(), getUsuarioOpcional()]);
  const t = TEXTOS_COMUNIDAD[idioma];
  const hoy = fechaBogota();
  const fecha = esFecha(pedida) && pedida < hoy && pedida >= "2026-11-24" ? pedida : hoy;
  const esHoy = fecha === hoy;
  const admin = getSupabaseAdmin();
  if (esHoy) await asegurarApertura(admin, fecha);
  const mensajes = await listarMensajes(admin, fecha, idioma, usuario?.id ?? null);
  const carta = cartaDelDia(fecha);
  const mazo = mazoDelDia(fecha);
  const anterior = diaAntes(fecha);
  // Las cartas sin nombre traducido (oráculo de los ángeles) solo muestran el nombre en español; en los demás idiomas
  // el nombre ya va traducido en el mensaje de Sibila.
  const nombre = nombreCarta(carta, idioma);
  const mostrarNombre = idioma === "es" || nombre !== carta.nombre;

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">{t.hiloDe} {fechaLarga(fecha, idioma)}</p>
        <h1 className="font-display text-4xl font-semibold text-oro-suave sm:text-5xl">{t.titulo}</h1>
        <p className="text-texto-suave">{t.intro}</p>
      </header>

      <div className="tarjeta flex items-center gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagenCarta(carta, mazo)} alt={mostrarNombre ? nombre : t.cartaDeHoy} className="h-28 w-auto rounded-lg border border-borde shadow-lg" />
        <div>
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.cartaDeHoy}</p>
          {mostrarNombre && <p className="font-display text-2xl text-texto">{nombre}</p>}
        </div>
      </div>

      <VistaComunidad fecha={fecha} esHoy={esHoy} conCuenta={Boolean(usuario)} inicial={mensajes} />

      <nav className="flex justify-between text-sm">
        {anterior >= "2026-11-24" ? <Link href={`/comunidad?fecha=${anterior}`} className="text-texto-suave hover:text-texto">{t.diaAnterior}</Link> : <span />}
        {!esHoy && <Link href="/comunidad" className="text-oro-suave hover:underline">{t.volverHoy}</Link>}
      </nav>
    </section>
  );
}
