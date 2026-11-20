import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioOpcional } from "@/lib/dal";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BotonEnviar } from "@/components/BotonEnviar";
import { CREDITOS_PROBADOR, ENLACE_PRUEBA_PLAY } from "@/lib/marca/play";
import { accionSerProbador } from "./acciones";

export const metadata: Metadata = { title: "Prueba la app de Arcana en Android", robots: { index: false } };
export const dynamic = "force-dynamic";

const ERRORES: Record<string, string> = {
  gmail: "Escribe un correo de Gmail (termina en @gmail.com): es el que usas en Google Play.",
  android: "La prueba es para celulares Android. Marca la casilla si tienes uno.",
  guardar: "No se pudo guardar. Intenta de nuevo en un momento.",
};

/** Invitación a la prueba cerrada de Google Play: la persona deja su Gmail y, cuando está en la lista, instala la app. */
export default async function PaginaProbador({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const usuario = await getUsuarioOpcional();
  if (!usuario) redirect("/entrar?volver=/probador");
  const [q, { data: fila }] = await Promise.all([
    searchParams,
    getSupabaseAdmin().from("probadores_invitaciones").select("gmail, acepto_en, agregado_en").eq("usuario_id", usuario.id).maybeSingle(),
  ]);
  const correo = usuario.email ?? "";
  const sugerido = fila?.gmail ?? (/@gmail\.com$/i.test(correo) ? correo : "");
  const agregado = Boolean(fila?.agregado_en);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-3 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono estático */}
        <img src="/marca/icono-512.png" alt="" className="mx-auto h-20 w-20 rounded-3xl" />
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Prueba cerrada · Android</p>
        <h1 className="font-display text-4xl font-semibold">Prueba Arcana antes que nadie</h1>
        <p className="text-texto-suave">
          Arcana está por salir en Google Play y antes Google pide que un grupo la pruebe durante dos semanas. Te regalo{" "}
          <strong className="text-oro">{CREDITOS_PROBADOR} créditos</strong> para tus lecturas.
        </p>
      </header>

      {agregado ? (
        <div className="tarjeta space-y-4 p-6">
          <p className="font-semibold">🎉 Ya estás en la prueba. Desde tu Android, con {fila?.gmail}:</p>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Abre el enlace de la prueba y toca «Convertirse en verificador».</li>
            <li>Toca «Descargar en Google Play» e instala Arcana.</li>
            <li>Abre la app y entra con tu cuenta de Arcana: tus {CREDITOS_PROBADOR} créditos se cargan solos.</li>
          </ol>
          {ENLACE_PRUEBA_PLAY ? (
            <a href={ENLACE_PRUEBA_PLAY} className="boton boton-primario flex justify-center">
              Unirme e instalar Arcana
            </a>
          ) : (
            <p className="text-sm text-texto-suave">El enlace te llega por correo en unas horas.</p>
          )}
        </div>
      ) : fila?.acepto_en || q.listo ? (
        <div className="tarjeta space-y-3 p-6 text-center">
          <p className="text-4xl">🔮</p>
          <p className="font-display text-2xl">¡Gracias! Ya tengo tu Gmail</p>
          <p className="text-sm text-texto-suave">
            En las próximas horas te agrego a la prueba y te llega un correo con el enlace para instalar Arcana desde Google Play. Al abrirla con tu cuenta se cargan
            tus {CREDITOS_PROBADOR} créditos.
          </p>
          <Link href="/juego" className="boton boton-secundario inline-flex">
            Mientras tanto, juega la carta escondida
          </Link>
        </div>
      ) : (
        <form action={accionSerProbador} className="tarjeta space-y-4 p-6">
          {q.error && ERRORES[q.error] && <p className="rounded-lg border border-peligro/50 p-3 text-sm text-peligro">{ERRORES[q.error]}</p>}
          <label className="block space-y-1 text-sm">
            <span className="text-texto-suave">Tu Gmail de Google Play</span>
            <input name="gmail" type="email" required defaultValue={sugerido} placeholder="tunombre@gmail.com" className="campo w-full" />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="android" defaultChecked className="mt-1" />
            <span>Tengo un celular Android y la voy a abrir un par de veces por semana durante dos semanas.</span>
          </label>
          <BotonEnviar className="boton boton-primario w-full justify-center" cargando="Guardando…">
            Quiero ser probador
          </BotonEnviar>
          <p className="text-xs text-texto-suave">¿Tienes iPhone? La prueba es solo para Android, pero puedes instalar Arcana en tu iPhone desde <Link href="/app" className="underline">miarcana.com/app</Link>.</p>
        </form>
      )}
    </div>
  );
}
