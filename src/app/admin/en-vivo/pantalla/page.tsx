import type { Metadata } from "next";
import Link from "next/link";
import { requerirAdmin } from "@/lib/admin";
import { LectorPantalla } from "@/components/admin/LectorPantalla";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leer el chat de TikTok", robots: { index: false, follow: false } };

/** Claude mira el chat de TikTok LIVE Studio (pantalla compartida) y pone las consultas en la fila de Sibila. */
export default async function PaginaPantalla() {
  await requerirAdmin();
  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <Link href="/admin/en-vivo" className="text-sm text-oro-suave underline">
        ← Sibila en vivo
      </Link>
      <h1 className="font-display text-3xl">Leer el chat de TikTok</h1>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-texto-suave">
        <li>Abre esta página en el computador del directo, en Chrome o Edge, en una ventana aparte (puede quedar detrás de LIVE Studio, pero no la minimices).</li>
        <li>Toca «Compartir la pantalla» y elige la ventana de <strong>TikTok LIVE Studio</strong>.</li>
        <li>En la vista previa, arrastra el mouse sobre el <strong>Chat LIVE</strong> para marcar solo esa parte (queda guardado).</li>
        <li>Deja la pestaña abierta: cada 6 segundos Claude lee los comentarios nuevos y los que son consultas (signo, pregunta, carta astral con fecha…) entran solos a la fila.</li>
      </ol>
      <p className="text-sm text-texto-suave">
        Solo se lee la imagen del chat que tú compartes; nada se guarda fuera de la fila. Si alguien escribe su consulta en varios mensajes, se le suman.
      </p>
      <LectorPantalla />
    </main>
  );
}
