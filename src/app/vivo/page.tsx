import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { escenarioActivo } from "@/lib/en-vivo";
import { FormularioVivo } from "@/components/FormularioVivo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sibila en vivo",
  description: "Envía la foto de tu taza de chocolate o de tu mano y Sibila la lee en el directo de Arcana en YouTube.",
};

/** Página del QR del directo: subir la foto de la taza o de la mano para «Sibila en vivo». */
export default async function PaginaVivo() {
  const activo = await escenarioActivo(getSupabaseAdmin()).catch(() => false);
  return (
    <div className="mx-auto max-w-md space-y-6 py-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Sibila en vivo</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-oro-suave">Tu lectura en el directo</h1>
        <p className="mt-2 text-texto-suave">Envía la foto de tu taza de chocolate o de tu mano y Sibila la lee en voz alta en el directo de YouTube.</p>
      </div>
      {activo ? (
        <div className="tarjeta p-5">
          <FormularioVivo />
        </div>
      ) : (
        <div className="tarjeta space-y-3 p-5 text-center">
          <p>En este momento no hay directo.</p>
          <p className="text-sm text-texto-suave">
            Los anunciamos en{" "}
            <a href="https://www.instagram.com/miarcana.oficial" className="text-oro-suave underline" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>{" "}
            y en{" "}
            <a href="https://www.youtube.com/@miarcana" className="text-oro-suave underline" target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            . Mientras tanto, puedes hacer tu{" "}
            <Link href="/chocolate" className="text-oro-suave underline">
              lectura del chocolate
            </Link>{" "}
            o de{" "}
            <Link href="/quiromancia" className="text-oro-suave underline">
              tu mano
            </Link>{" "}
            cuando quieras.
          </p>
        </div>
      )}
      <p className="text-center text-xs text-texto-suave">Lecturas de entretenimiento y reflexión personal.</p>
    </div>
  );
}
