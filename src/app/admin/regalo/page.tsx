import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { urlBaja } from "@/lib/correo";
import { REGALO_VASO, correoRegaloVaso, destinosRegalo, enviadosHoy } from "@/lib/correos/regalo";
import { BotonEnviar } from "@/components/BotonEnviar";
import { accionEnviarRegalo, accionPruebaRegalo } from "./acciones";

export const metadata: Metadata = { title: "Regalo del vaso", robots: { index: false } };
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Solo administración: correo «tu vaso tiene algo que decirte» con una lectura del vaso de regalo. */
export default async function PaginaRegaloAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const usuario = await requerirAdmin();
  const [q, destinos, hoy] = await Promise.all([searchParams, destinosRegalo().catch(() => null), enviadosHoy()]);
  const vista = correoRegaloVaso({ nombre: "Mariana", idioma: "es", vence: Math.floor(new Date("2026-11-12T14:00:00Z").getTime() / 1000), url: "#", urlBaja: urlBaja(usuario.id) });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Regalo del vaso</h1>
      </div>
      <p className="text-texto-suave">
        A quien se quedó en 0 créditos, Sibila le regala una lectura del vaso ({REGALO_VASO.creditos} créditos). El enlace vence a las {REGALO_VASO.horas} horas y se
        abre una sola vez, con un botón. Lo reciben solo quienes aceptan correos, con la cuenta de más de 3 días, sin correo nuestro en los últimos 6 días y
        que nunca lo recibieron.
      </p>

      {q.prueba && <p className="tarjeta p-4" role="status">Prueba enviada a {q.prueba}. Ábrela en tu correo y toca «Abrir mi regalo» para ver todo el camino.</p>}
      {q.enviados !== undefined && (
        <p className="tarjeta p-4" role="status">
          Enviados: {q.enviados}. Fallidos: {q.fallidos ?? 0}.{q.sin_cupo ? " Ya se usó el cupo de correos de hoy: sigue mañana." : ""}
        </p>
      )}
      {q.error && <p className="text-peligro">{q.error === "sin_resend" ? "Falta RESEND_API_KEY en Vercel." : `Error: ${q.error}`}</p>}

      <div className="tarjeta grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-sm text-texto-suave">Por recibirlo</p>
          <p className="font-display text-4xl text-oro-suave">{destinos ? destinos.length : "—"}</p>
        </div>
        <div>
          <p className="text-sm text-texto-suave">Correos enviados hoy</p>
          <p className="font-display text-4xl text-oro-suave">{hoy}</p>
        </div>
        <div>
          <p className="text-sm text-texto-suave">Cupo libre hoy</p>
          <p className="font-display text-4xl text-oro-suave">{Math.max(0, 90 - hoy)}</p>
        </div>
      </div>
      {destinos === null && <p className="text-peligro">No se pudo armar la lista. ¿Ya se aplicó la migración 0048?</p>}

      <div className="tarjeta space-y-4 p-5">
        <h2 className="font-display text-2xl font-semibold">1 · Prueba</h2>
        <p className="text-sm text-texto-suave">Te llega a {usuario.email}, con un regalo real para tu propia cuenta (no cuenta para el envío).</p>
        <form action={accionPruebaRegalo}>
          <BotonEnviar className="boton boton-secundario" cargando="Enviando…">Enviarme la prueba</BotonEnviar>
        </form>
      </div>

      <div className="tarjeta space-y-4 p-5">
        <h2 className="font-display text-2xl font-semibold">2 · Enviar</h2>
        <p className="text-sm text-texto-suave">
          Se envía por tandas para no pasar el cupo diario de Resend (el correo diario de las 9 a. m. usa hasta 80). Lo mejor: una tanda en la tarde, cada día,
          hasta que «Por recibirlo» llegue a 0.
        </p>
        <form action={accionEnviarRegalo} className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-texto-suave">
            Cantidad{" "}
            <input name="cantidad" type="number" min={1} max={90} defaultValue={20} className="campo ml-2 w-24" />
          </label>
          <BotonEnviar className="boton boton-primario" cargando="Enviando…">Enviar la tanda</BotonEnviar>
        </form>
      </div>

      <div className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Así se ve</h2>
        <p className="text-sm text-texto-suave">Asunto: «{vista.asunto}»</p>
        <iframe title="Vista del correo" srcDoc={vista.html} className="h-[900px] w-full rounded-xl border border-borde bg-[#0b0716]" />
      </div>
    </div>
  );
}
