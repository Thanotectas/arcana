import { registrarEventoCompra } from "@/lib/eventos-compra";

/** Eventos del embudo que ocurren en el navegador (la invitación al quedarse sin créditos se ve en el cliente). */
export async function POST(request: Request) {
  const cuerpo = (await request.json().catch(() => ({}))) as { evento?: string; via?: string };
  if (cuerpo.evento !== "vio_invitacion") return Response.json({ ok: false }, { status: 400 });
  await registrarEventoCompra("vio_invitacion", { via: typeof cuerpo.via === "string" ? cuerpo.via.slice(0, 40) : undefined });
  return Response.json({ ok: true });
}
