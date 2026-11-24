import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Comunidad", robots: { index: false } };
export const dynamic = "force-dynamic";

async function cambiarEstado(formData: FormData) {
  "use server";
  await requerirAdmin();
  const id = Number(formData.get("id"));
  const estado = String(formData.get("estado"));
  if (!Number.isInteger(id) || !["publicado", "oculto"].includes(estado)) return;
  await getSupabaseAdmin().from("comunidad_mensajes").update({ estado: estado as "publicado" | "oculto", motivo: estado === "oculto" ? "equipo" : null }).eq("id", id);
  revalidatePath("/admin/comunidad");
}

/**
 * Solo administración: moderación de la Comunidad (miarcana.com/comunidad). Arriba lo que espera revisión o fue
 * reportado; abajo los últimos mensajes, para ocultar o volver a publicar.
 */
export default async function PaginaAdminComunidad() {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const [{ data: mensajes }, { data: reportes }] = await Promise.all([
    admin.from("comunidad_mensajes").select("*").order("id", { ascending: false }).limit(200),
    admin.from("comunidad_reportes").select("mensaje_id"),
  ]);
  const lista = mensajes ?? [];
  const reportados = new Map<number, number>();
  for (const r of reportes ?? []) reportados.set(r.mensaje_id, (reportados.get(r.mensaje_id) ?? 0) + 1);
  const pendientes = lista.filter((m) => m.estado === "revision" || (reportados.get(m.id) ?? 0) > 0);
  const personas = new Set(lista.filter((m) => m.usuario_id).map((m) => m.usuario_id)).size;
  const fecha = (iso: string) => new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));

  const Fila = ({ m }: { m: (typeof lista)[number] }) => (
    <li className="space-y-1 border-b border-borde py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-texto-suave">
        <span>{fecha(m.creado_en)}</span>
        <strong className="text-texto">{m.es_sibila ? "🔮 Sibila" : m.autor}</strong>
        <span>{m.idioma}</span>
        {m.respuesta_a && <span>↳ respuesta</span>}
        <span className={m.estado === "publicado" ? "text-exito" : m.estado === "revision" ? "text-advertencia" : "text-peligro"}>{m.estado}{m.motivo ? ` (${m.motivo})` : ""}</span>
        {(reportados.get(m.id) ?? 0) > 0 && <span className="text-peligro">⚑ {reportados.get(m.id)}</span>}
        <form action={cambiarEstado} className="ms-auto">
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="estado" value={m.estado === "publicado" ? "oculto" : "publicado"} />
          <button className="boton boton-fantasma px-2 py-0.5 text-xs">{m.estado === "publicado" ? "Ocultar" : "Publicar"}</button>
        </form>
      </div>
      <p className="whitespace-pre-line text-sm" dir="auto">{m.texto}</p>
    </li>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold text-oro-suave">Comunidad</h1>
        <p className="text-sm text-texto-suave">{lista.length} mensajes recientes · {personas} personas · <a href="/comunidad" className="underline">ver la comunidad</a></p>
      </div>
      <section className="tarjeta p-5">
        <h2 className="mb-2 font-display text-2xl">Por revisar ({pendientes.length})</h2>
        {pendientes.length ? <ul>{pendientes.map((m) => <Fila key={m.id} m={m} />)}</ul> : <p className="text-sm text-texto-suave">Nada pendiente.</p>}
      </section>
      <section className="tarjeta p-5">
        <h2 className="mb-2 font-display text-2xl">Últimos mensajes</h2>
        <ul>{lista.map((m) => <Fila key={m.id} m={m} />)}</ul>
      </section>
    </div>
  );
}
