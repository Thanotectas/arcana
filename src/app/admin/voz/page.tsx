import type { Metadata } from "next";
import Link from "next/link";
import { requerirAdmin } from "@/lib/admin";
import { creditosVoz } from "@/lib/redes/voz";
import { GeneradorVoz } from "./GeneradorVoz";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export const metadata: Metadata = { title: "Voz de Sibila", robots: { index: false, follow: false } };

/** Voz de Sibila para los videos, en los idiomas que se elijan: traduce el guion y lo narra con ElevenLabs. */
export default async function PaginaVoz() {
  await requerirAdmin();
  const creditos = await creditosVoz();
  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin" className="text-sm text-oro-suave underline">← Administración</Link>
      <div>
        <h1 className="font-display text-4xl font-semibold">Voz de Sibila</h1>
        <p className="mt-2 text-texto-suave">
          Pega el guion del video en español (con sus «…» de pausa), elige los idiomas y Sibila lo dice en cada uno, con la misma voz de
          ElevenLabs. Primero puedes ver las traducciones (no gasta créditos de voz) y corregirlas antes de narrar.
        </p>
        {creditos && (
          <p className="mt-2 text-sm text-texto-suave">
            Créditos de ElevenLabs: <strong className="text-oro-suave">{creditos.quedan.toLocaleString("es-CO")}</strong> de {creditos.limite.toLocaleString("es-CO")}.
          </p>
        )}
      </div>
      <GeneradorVoz quedan={creditos?.quedan ?? null} />
    </main>
  );
}
