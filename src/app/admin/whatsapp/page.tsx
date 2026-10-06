import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { estadoNumero, whatsappConfigurado, type EstadoNumero } from "@/lib/whatsapp/api";
import { RegistroWhatsapp } from "@/components/admin/RegistroWhatsapp";

export const metadata: Metadata = { title: "WhatsApp", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface Mensaje {
  id: number;
  telefono: string;
  nombre: string | null;
  rol: "persona" | "asistente";
  contenido: string;
  humano: boolean;
  creado_en: string;
}

function hora(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(iso));
}

/** Conversaciones recientes de la línea de WhatsApp atendida por Sibila. Solo administración. */
export default async function PaginaWhatsapp() {
  await requerirAdmin();
  let numero: EstadoNumero | null = null;
  let errorNumero: string | null = null;
  if (whatsappConfigurado()) {
    try {
      numero = await estadoNumero();
    } catch (e) {
      errorNumero = e instanceof Error ? e.message : String(e);
    }
  }
  const { data } = await getSupabaseAdmin().from("mensajes_whatsapp").select("id, telefono, nombre, rol, contenido, humano, creado_en").order("creado_en", { ascending: false }).limit(400);
  const mensajes = (data ?? []) as Mensaje[];
  const porTelefono = new Map<string, Mensaje[]>();
  for (const m of mensajes) porTelefono.set(m.telefono, [...(porTelefono.get(m.telefono) ?? []), m]);
  const conversaciones = [...porTelefono.entries()].map(([telefono, lista]) => ({ telefono, nombre: lista.find((m) => m.nombre)?.nombre ?? null, mensajes: lista.reverse(), pideHumano: lista.some((m) => m.humano) }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">WhatsApp</h1>
        <p className="mt-2 text-texto-suave">
          Sibila atiende la línea con lo que sabe de Arcana y avisa por correo cuando alguien pide hablar con una persona.{" "}
          {whatsappConfigurado() ? "La línea está conectada." : <span className="text-peligro">Falta configurar WA_PHONE_NUMBER_ID, WA_TOKEN y WA_VERIFY_TOKEN.</span>}
        </p>
      </div>

      {whatsappConfigurado() && (
        <section className="tarjeta space-y-4 p-5">
          <h2 className="font-display text-2xl font-semibold">Estado del número</h2>
          {errorNumero && <p className="text-sm text-peligro">{errorNumero}</p>}
          {numero && (
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <dt className="text-texto-suave">Número</dt><dd>{numero.display_phone_number ?? "—"}</dd>
              <dt className="text-texto-suave">Nombre verificado</dt><dd>{numero.verified_name ?? "—"} {numero.name_status ? <span className="text-texto-suave">({numero.name_status})</span> : null}</dd>
              <dt className="text-texto-suave">Verificación del código</dt><dd>{numero.code_verification_status ?? "—"}</dd>
              <dt className="text-texto-suave">Estado</dt><dd className={numero.status === "CONNECTED" ? "text-exito" : "text-oro-suave"}>{numero.status ?? "—"}</dd>
              <dt className="text-texto-suave">Plataforma</dt><dd>{numero.platform_type ?? "—"}</dd>
              <dt className="text-texto-suave">Calidad</dt><dd>{numero.quality_rating ?? "—"}</dd>
            </dl>
          )}
          {numero?.status !== "CONNECTED" && <RegistroWhatsapp />}
        </section>
      )}

      {conversaciones.length === 0 && <p className="text-sm text-texto-suave">Todavía no ha escrito nadie.</p>}

      {conversaciones.map((c) => (
        <details key={c.telefono} className="tarjeta p-5" open={c.pideHumano}>
          <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-xl font-semibold">{c.nombre ?? c.telefono}</span>
            <span className="text-xs text-texto-suave">
              {c.nombre && <span className="mr-3">+{c.telefono}</span>}
              {c.mensajes.length} mensajes · {hora(c.mensajes[c.mensajes.length - 1].creado_en)}
              {c.pideHumano && <span className="ml-3 uppercase tracking-[0.2em] text-peligro">pide persona</span>}
            </span>
          </summary>
          <div className="mt-4 space-y-2">
            {c.mensajes.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.rol === "persona" ? "bg-violeta/20" : "ml-auto border border-oro/30 bg-superficie"}`}>
                <p className="whitespace-pre-wrap">{m.contenido}</p>
                <p className="mt-1 text-[11px] text-texto-suave">{m.rol === "persona" ? c.nombre ?? "Persona" : "Sibila"} · {hora(m.creado_en)}</p>
              </div>
            ))}
            <p className="pt-2 text-xs">
              <a href={`https://wa.me/${c.telefono}`} className="text-oro-suave underline" target="_blank" rel="noreferrer">Abrir el chat en WhatsApp</a>
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
