import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatoCOP } from "@/lib/creditos";
import { ResolverRetiro } from "@/components/admin/ResolverRetiro";

export const metadata: Metadata = { title: "Embajadores", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const METODO: Record<string, string> = { nequi: "Nequi", daviplata: "Daviplata", banco: "Banco", paypal: "PayPal" };

function fecha(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" }).format(new Date(iso));
}

/** Programa de Embajadores: retiros por pagar y quién trae más ventas. Solo administración. */
export default async function PaginaAdminEmbajadores() {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const [{ data: retiros }, { data: embajadores }, { data: comisiones }] = await Promise.all([
    admin.from("retiros_embajador").select("*").eq("tipo", "dinero").order("creado_en", { ascending: false }).limit(50),
    admin.from("embajadores").select("usuario_id, desde, estado"),
    admin.from("comisiones").select("embajador_id, invitado_id, comision_cop, estado"),
  ]);
  const correos = new Map<string, string>();
  const ids = new Set([...(embajadores ?? []).map((e) => e.usuario_id), ...(retiros ?? []).map((r) => r.embajador_id)]);
  await Promise.all(
    [...ids].map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      correos.set(id, data.user?.email ?? id);
    }),
  );
  const ranking = (embajadores ?? [])
    .map((e) => {
      const propias = (comisiones ?? []).filter((c) => c.embajador_id === e.usuario_id && c.estado === "vigente");
      return { ...e, ventas: propias.length, compradores: new Set(propias.map((c) => c.invitado_id)).size, total: propias.reduce((s, c) => s + c.comision_cop, 0) };
    })
    .sort((a, b) => b.total - a.total);
  const pendientes = (retiros ?? []).filter((r) => r.estado === "solicitado");
  const resueltos = (retiros ?? []).filter((r) => r.estado !== "solicitado");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Embajadores</h1>
        <p className="mt-2 text-texto-suave">Comisión del 20 % sobre los pagos de sus invitados durante su primer año, disponible a los 7 días. Los retiros en dinero se pagan a mano y se marcan aquí; cada embajador recibe un correo.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Retiros por pagar <span className="text-base text-texto-suave">({pendientes.length})</span></h2>
        {pendientes.length === 0 && <p className="text-sm text-texto-suave">No hay solicitudes pendientes.</p>}
        {pendientes.map((r) => (
          <article key={r.id} className="tarjeta space-y-3 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-display text-2xl text-oro-suave">{formatoCOP(r.monto_cop)}</span>
              <span className="text-xs text-texto-suave">{fecha(r.creado_en)} · {correos.get(r.embajador_id)}</span>
            </div>
            <p className="text-sm">{METODO[r.metodo_pago ?? ""] ?? r.metodo_pago}: <b>{r.datos_pago}</b> · titular: <b>{r.titular}</b></p>
            <ResolverRetiro id={r.id} />
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Embajadores <span className="text-base text-texto-suave">({ranking.length})</span></h2>
        {ranking.length === 0 ? (
          <p className="text-sm text-texto-suave">Aún nadie se ha unido.</p>
        ) : (
          <div className="tarjeta overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-texto-suave">
                <tr><th className="py-2">Correo</th><th>Desde</th><th className="text-right">Compradores</th><th className="text-right">Ventas</th><th className="text-right">Comisiones</th></tr>
              </thead>
              <tbody>
                {ranking.map((e) => (
                  <tr key={e.usuario_id} className="border-t border-white/10">
                    <td className="break-all py-2">{correos.get(e.usuario_id)}{e.estado === "suspendido" && <span className="ml-2 text-xs text-peligro">suspendido</span>}</td>
                    <td>{fecha(e.desde)}</td>
                    <td className="text-right">{e.compradores}</td>
                    <td className="text-right">{e.ventas}</td>
                    <td className="text-right">{formatoCOP(e.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {resueltos.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold">Retiros resueltos</h2>
          <ul className="divide-y divide-white/10 text-sm">
            {resueltos.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 py-2">
                <span>{correos.get(r.embajador_id)} · {fecha(r.creado_en)}</span>
                <span>{formatoCOP(r.monto_cop)} <span className={r.estado === "pagado" ? "text-exito" : "text-peligro"}>{r.estado}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
