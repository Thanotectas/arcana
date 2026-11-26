import type { Metadata } from "next";
import Link from "next/link";
import { requerirAdmin } from "@/lib/admin";
import { LectorPantalla } from "@/components/admin/LectorPantalla";
import { CierreDirecto, InterruptorVivo, PreguntaManual } from "@/components/admin/ControlEnVivo";
import { vivoVigente } from "@/lib/en-vivo-ahora";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { horaCierre } from "@/lib/en-vivo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leer el chat de TikTok", robots: { index: false, follow: false } };

/** Claude mira el chat de TikTok LIVE Studio (pantalla compartida) y pone las consultas en la fila de Sibila. */
export default async function PaginaPantalla() {
  await requerirAdmin();
  const { data: estado } = await getSupabaseAdmin().from("en_vivo_estado").select("*").eq("id", 1).maybeSingle();
  const horaInput = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "America/Bogota" }).format(new Date(horaCierre(estado)));
  return (
    <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <Link href="/admin/en-vivo" className="text-sm text-oro-suave underline">
        ← Sibila en vivo
      </Link>
      <h1 className="font-display text-3xl">Leer el chat de TikTok</h1>
      <section className={`tarjeta space-y-2 p-5 ${vivoVigente(estado) ? "border-red-400/60" : ""}`}>
        <h2 className="font-display text-2xl font-semibold">Directo a cualquier hora</h2>
        <p className="text-sm text-texto-suave">Prende esto cuando empieces un LIVE fuera del horario: la web, la Sala y Sibila en redes anuncian que estás en vivo, y Sibila no se despide por el horario. Al apagarlo, se despide.</p>
        <InterruptorVivo prendido={vivoVigente(estado)} en={estado?.vivo_en === "youtube" ? "youtube" : "tiktok"} desde={vivoVigente(estado) ? (estado?.vivo_desde ?? null) : null} />
      </section>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-texto-suave">
        <li>Abre esta página en el computador del directo, en Chrome o Edge, en una ventana aparte (puede quedar detrás de LIVE Studio, pero no la minimices).</li>
        <li>Toca «Compartir la pantalla» y elige la ventana de <strong>TikTok LIVE Studio</strong>.</li>
        <li>En la vista previa, arrastra el mouse sobre el <strong>Chat LIVE</strong> para marcar solo esa parte (queda guardado).</li>
        <li>Deja la pestaña abierta: cada 6 segundos Claude lee los comentarios nuevos y los que son consultas (signo, pregunta, carta astral con fecha…) entran solos a la fila.</li>
      </ol>
      <p className="text-sm text-texto-suave">
        Solo se lee la imagen del chat que tú compartes; nada se guarda fuera de la fila. Si alguien escribe su consulta en varios mensajes, se le suman.
      </p>
      <LectorPantalla>
        <section className="space-y-2 rounded-xl border border-borde bg-superficie-2/40 p-4">
          <h2 className="font-display text-xl">Agregar a la fila</h2>
          <p className="text-sm text-texto-suave">Pasa primero. Para carta astral: «carta astral 18/03/1996 10:30 Cali» (la hora y la ciudad, si las sabe).</p>
          <PreguntaManual />
        </section>
        <details className="rounded-xl border border-borde bg-superficie-2/40 p-4">
          <summary className="cursor-pointer font-display text-lg">Hora de cierre (si el escenario dice «Se acabó el tiempo», ponla más tarde)</summary>
          <div className="mt-2">
            <CierreDirecto hora={horaInput} />
          </div>
        </details>
      </LectorPantalla>
    </main>
  );
}
