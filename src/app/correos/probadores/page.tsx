import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requerirUsuario } from "@/lib/dal";
import { esAdministrador, probadores } from "@/lib/correos/probadores";
import { BotonEnviar } from "@/components/BotonEnviar";
import { accionEnviarProbadores } from "./acciones";

export const metadata: Metadata = { title: "Correo a probadores", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Solo administración: agradecimiento a los probadores de Google Play por Resend. */
export default async function PaginaCorreoProbadores({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const usuario = await requerirUsuario();
  if (!esAdministrador(usuario.email)) notFound();
  const [lista, q] = await Promise.all([probadores(), searchParams]);
  const pendientes = lista.filter((p) => p.recibeCorreos && !p.yaEnviado);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-4xl font-semibold">Correo a probadores</h1>
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
    </div>
  );
}
