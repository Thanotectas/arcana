import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { probadores } from "@/lib/correos/probadores";
import { BotonEnviar } from "@/components/BotonEnviar";
import { accionEnviarProbadores, accionInvitarProbadores, accionMarcarAgregados } from "./acciones";
import { candidatosProbador } from "@/lib/correos/invitacion-probador";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CREDITOS_PROBADOR, ENLACE_PRUEBA_PLAY } from "@/lib/marca/play";

export const metadata: Metadata = { title: "Correo a probadores", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Solo administración: agradecimiento a los probadores de Google Play por Resend. */
export default async function PaginaCorreoProbadores({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requerirAdmin();
  const [lista, q, candidatos, { data: invitaciones }] = await Promise.all([
    probadores(),
    searchParams,
    candidatosProbador(40),
    getSupabaseAdmin().from("probadores_invitaciones").select("usuario_id, invitado_en, acepto_en, gmail, agregado_en").order("invitado_en", { ascending: false }),
  ]);
  const respondieron = (invitaciones ?? []).filter((i) => i.acepto_en && !i.agregado_en);
  const agregados = (invitaciones ?? []).filter((i) => i.agregado_en);
  const sinRespuesta = (invitaciones ?? []).filter((i) => !i.acepto_en);
  const pendientes = lista.filter((p) => p.recibeCorreos && !p.yaEnviado);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Correo a probadores</h1>
      </div>
      <p className="text-texto-suave">
        Agradecimiento con los créditos de cada persona, enviado por Resend como Sibila de Arcana. Las respuestas llegan al buzón de
        respuesta configurado. Cada persona lo recibe una sola vez.
      </p>

      {q.enviados !== undefined && (
        <p className="tarjeta p-4" role="status">
          Enviados: {q.enviados}. Fallidos: {q.fallidos ?? 0}.
        </p>
      )}
      {q.error === "sin_resend" && <p className="text-peligro">Falta RESEND_API_KEY en Vercel.</p>}

      <div className="tarjeta overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="text-left text-texto-suave">
            <tr>
              <th className="py-2">Nombre</th>
              <th>Correo</th>
              <th className="text-right">Lecturas</th>
              <th className="text-right">Créditos</th>
              <th className="text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="py-2">{p.nombre}</td>
                <td className="break-all">{p.correo}</td>
                <td className="text-right">{p.lecturas}</td>
                <td className="text-right">{p.creditos}</td>
                <td className="text-right">{p.yaEnviado ? "Enviado" : p.recibeCorreos ? "Pendiente" : "Sin correos"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendientes.length > 0 ? (
        <form action={accionEnviarProbadores}>
          <BotonEnviar cargando="Enviando…">Enviar a {pendientes.length} probadores</BotonEnviar>
        </form>
      ) : (
        <p className="text-texto-suave">No hay correos pendientes.</p>
      )}

      <section className="space-y-4 border-t border-borde pt-6">
        <h2 className="font-display text-3xl font-semibold">Invitar nuevos probadores</h2>
        <p className="text-sm text-texto-suave">
          Correo de Sibila con la invitación a la prueba de Android y {CREDITOS_PROBADOR} créditos de regalo. La persona deja su Gmail en miarcana.com/probador; cuando lo
          agregues en Play Console y lo marques abajo, le llega el enlace para instalar. Los créditos se cargan solos la primera vez que abre la app de Google Play con su
          cuenta. Primero van quienes ya usan Android (activaron los avisos desde un Android), luego quienes más lecturas hacen y las cuentas recientes.
        </p>
        {q.invitados !== undefined && (
          <p className="tarjeta p-4" role="status">
            Invitaciones enviadas: {q.invitados}. Fallidas: {q.fallidos ?? 0}.
          </p>
        )}
        {candidatos.length ? (
          <form action={accionInvitarProbadores} className="space-y-3">
            <div className="tarjeta overflow-x-auto p-4">
              <table className="w-full text-sm">
                <thead className="text-left text-texto-suave">
                  <tr>
                    <th className="py-2"></th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th className="text-right">Lecturas</th>
                    <th className="text-center">Android</th>
                    <th className="text-right">País</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatos.map((c, i) => (
                    <tr key={c.id} className="border-t border-white/10">
                      <td className="py-2 pr-2">
                        <input type="checkbox" name="id" value={c.id} defaultChecked={i < 20} aria-label={`Invitar a ${c.correo}`} />
                      </td>
                      <td>{c.nombre || "—"}</td>
                      <td className="break-all">{c.correo}</td>
                      <td className="text-right">{c.lecturas}</td>
                      <td className="text-center">{c.android ? "✓" : ""}</td>
                      <td className="text-right">{c.pais ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <BotonEnviar cargando="Enviando…">Invitar a los seleccionados (máximo 20)</BotonEnviar>
          </form>
        ) : (
          <p className="text-texto-suave">No hay más cuentas para invitar.</p>
        )}
      </section>

      <section className="space-y-4 border-t border-borde pt-6">
        <h2 className="font-display text-3xl font-semibold">Respondieron ({respondieron.length})</h2>
        <p className="text-sm text-texto-suave">
          {sinRespuesta.length} invitados aún no responden · {agregados.length} ya están en Play Console.
          {!ENLACE_PRUEBA_PLAY && " Falta el enlace «Unirse desde la web» de la prueba en src/lib/marca/play.ts: sin él, al marcarlos no se les envía el correo con el enlace."}
        </p>
        {respondieron.length > 0 && (
          <form action={accionMarcarAgregados} className="space-y-3">
            <label className="block space-y-1 text-sm">
              <span className="text-texto-suave">Gmails para pegar en Play Console → Prueba cerrada → Verificadores (separados por comas)</span>
              <textarea readOnly rows={3} className="campo w-full font-mono text-xs" defaultValue={respondieron.map((r) => r.gmail).filter(Boolean).join(", ")} />
            </label>
            <ul className="tarjeta space-y-1 p-4 text-sm">
              {respondieron.map((r) => (
                <li key={r.usuario_id} className="flex items-center gap-2">
                  <input type="checkbox" name="agregado" value={r.usuario_id} defaultChecked aria-label={`Marcar ${r.gmail} como agregado`} />
                  <span className="break-all">{r.gmail}</span>
                </li>
              ))}
            </ul>
            <BotonEnviar cargando="Guardando…">Ya los agregué en Play Console: avisarles</BotonEnviar>
          </form>
        )}
      </section>
    </div>
  );
}
