import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Opiniones de la app", robots: { index: false } };
export const dynamic = "force-dynamic";

const NOMBRE_PLATAFORMA: Record<string, string> = { android: "Google Play", pwa: "App instalada", web: "Web" };

async function marcarAtendida(formData: FormData) {
  "use server";
  await requerirAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await getSupabaseAdmin().from("app_opiniones").update({ atendida: formData.get("atendida") === "1" }).eq("id", id);
  revalidatePath("/admin/opiniones");
}

/**
 * Solo administración: lo que dicen quienes usan la app (botón «Tu opinión»). Sirve para decidir qué arreglar en
 * cada versión y para mostrarle a Google Play que se recogen comentarios y se actúa sobre ellos.
 */
export default async function PaginaOpiniones() {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("app_opiniones").select("*").order("creado_en", { ascending: false }).limit(300);
  const lista = data ?? [];
  const ids = [...new Set(lista.map((o) => o.usuario_id).filter((x): x is string => Boolean(x)))];
  const { data: perfiles } = ids.length ? await admin.from("perfiles").select("id, nombre").in("id", ids) : { data: [] };
  const nombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));
  const conNota = lista.filter((o) => o.calificacion);
  const promedio = conNota.length ? conNota.reduce((s, o) => s + (o.calificacion ?? 0), 0) / conNota.length : null;
  const pendientes = lista.filter((o) => !o.atendida);
  const fecha = (iso: string) => new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Opiniones de la app</h1>
        <p className="mt-2 text-texto-suave">
          Lo que escriben con el botón «Tu opinión» dentro de la app. Marca como atendida cada una que arregles: al subir una versión a Google Play, cuenta en la nota qué
          cambió gracias a estos comentarios.
        </p>
      </div>
      {error && <p className="tarjeta border-peligro/40 p-4 text-sm text-peligro">Falta aplicar la migración 0059_app_opiniones.sql.</p>}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="tarjeta p-4">
          <p className="text-sm text-texto-suave">Opiniones</p>
          <p className="font-display text-4xl text-oro-suave">{lista.length}</p>
        </div>
        <div className="tarjeta p-4">
          <p className="text-sm text-texto-suave">Por atender</p>
          <p className="font-display text-4xl text-oro-suave">{pendientes.length}</p>
        </div>
        <div className="tarjeta p-4">
          <p className="text-sm text-texto-suave">Calificación promedio</p>
          <p className="font-display text-4xl text-oro-suave">{promedio ? `${promedio.toFixed(1)} ★` : "—"}</p>
        </div>
      </section>
      <ul className="space-y-3">
        {lista.map((o) => (
          <li key={o.id} className={`tarjeta space-y-2 p-4 ${o.atendida ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-texto-suave">
              <span>
                {fecha(o.creado_en)} · {NOMBRE_PLATAFORMA[o.plataforma] ?? o.plataforma}
                {o.usuario_id ? ` · ${nombre.get(o.usuario_id) ?? "con cuenta"}` : " · sin cuenta"}
                {o.pagina ? ` · ${o.pagina}` : ""}
              </span>
              {o.calificacion && <span className="text-oro">{"★".repeat(o.calificacion)}</span>}
            </div>
            <p className="whitespace-pre-wrap">{o.texto}</p>
            <form action={marcarAtendida}>
              <input type="hidden" name="id" value={o.id} />
              <input type="hidden" name="atendida" value={o.atendida ? "0" : "1"} />
              <button type="submit" className="text-xs text-oro-suave underline">
                {o.atendida ? "Marcar como pendiente" : "✓ Marcar como atendida"}
              </button>
            </form>
          </li>
        ))}
        {!lista.length && !error && <li className="tarjeta p-4 text-sm text-texto-suave">Todavía no hay opiniones.</li>}
      </ul>
    </div>
  );
}
