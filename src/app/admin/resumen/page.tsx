import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calcularResumen, filasResumen } from "@/lib/resumen/semanal";
import { fechaLargaEs, sumarDias } from "@/lib/redes/calendario";
import { BotonResumen } from "@/components/admin/BotonResumen";

export const metadata: Metadata = { title: "Estado del negocio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Estado del negocio: los últimos siete días frente a los siete anteriores. Solo administración. */
export default async function PaginaResumen() {
  await requerirAdmin();
  const r = await calcularResumen(getSupabaseAdmin());
  const bloques = filasResumen(r);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Estado del negocio</h1>
        <p className="mt-2 text-texto-suave">
          Del {fechaLargaEs(r.desde)} al {fechaLargaEs(sumarDias(r.hasta, -1))}, comparado con los siete días anteriores. Cada lunes a las 7:00 llega por correo.
        </p>
        <div className="mt-4">
          <BotonResumen />
        </div>
      </div>

      {r.alertas.length > 0 && (
        <ul className="tarjeta space-y-1 border-peligro/40 p-5 text-sm text-peligro">
          {r.alertas.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {bloques.map((b) => (
          <section key={b.titulo} className="tarjeta p-5">
            <h2 className="font-display text-2xl font-semibold">{b.titulo}</h2>
            <dl className="mt-3 divide-y divide-white/10 text-sm">
              {b.filas.map(([k, v, c]) => (
                <div key={k + v} className="flex items-baseline justify-between gap-3 py-2">
                  <dt className={k.startsWith("  ") ? "pl-4 text-texto-suave" : ""}>{k.trim()}</dt>
                  <dd className="text-right">
                    <span className="font-semibold text-oro-suave">{v}</span>
                    {c && <span className="ml-2 text-xs text-texto-suave">{c}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
