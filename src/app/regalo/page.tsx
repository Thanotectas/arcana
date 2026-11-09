import type { Metadata } from "next";
import Link from "next/link";
import { getUsuario } from "@/lib/supabase/server";
import { REGALO_VASO, fechaLimite, regaloValido, regaloVencido, regaloYaAbierto } from "@/lib/correos/regalo";
import { BotonEnviar } from "@/components/BotonEnviar";
import { accionAbrirRegalo } from "./acciones";

export const metadata: Metadata = { title: "Tu regalo de Sibila", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Regalo del correo «tu vaso de hoy»: una lectura del vaso (3 créditos) que se abre con un botón. */
export default async function PaginaRegalo({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const u = q.u ?? "";
  const v = Number(q.v);
  const t = q.t ?? "";
  const valido = regaloValido(u, v, t);
  const usuario = valido ? await getUsuario() : null;
  const vencido = valido && regaloVencido(v);
  const abierto = valido && usuario?.id === u ? await regaloYaAbierto(u, v) : false;
  const volver = `/regalo?u=${encodeURIComponent(u)}&v=${v}&t=${encodeURIComponent(t)}`;
  const limite = valido ? fechaLimite(v, "es") : "";

  let cuerpo: React.ReactNode;
  if (!valido) {
    cuerpo = (
      <>
        <p className="text-texto-suave">Este enlace no es válido. Abre el botón directamente desde el correo de Sibila.</p>
        <Link href="/huevo" className="boton boton-primario flex w-full justify-center">Ir a la lectura del vaso</Link>
      </>
    );
  } else if (abierto) {
    cuerpo = (
      <>
        <p className="font-display text-3xl text-oro-suave">{q.listo ? "¡Tu regalo está abierto! ✨" : "Ya abriste este regalo ✨"}</p>
        <p className="text-texto">Tienes {REGALO_VASO.creditos} créditos más: alcanzan para una lectura completa de tu vaso, con tu foto marcada con líneas.</p>
        <Link href="/huevo" className="boton boton-primario flex w-full justify-center text-lg">Leer mi vaso ahora 🥚</Link>
        <p className="text-sm text-texto-suave">Tómale la foto de lado, a la altura del agua y con buena luz.</p>
      </>
    );
  } else if (vencido) {
    cuerpo = (
      <>
        <p className="font-display text-3xl text-oro-suave">Este regalo ya venció</p>
        <p className="text-texto-suave">Se podía abrir hasta el {limite}. Igual puedes leer tu vaso cuando quieras.</p>
        <Link href="/huevo" className="boton boton-primario flex w-full justify-center">Ir a la lectura del vaso</Link>
      </>
    );
  } else if (!usuario) {
    cuerpo = (
      <>
        <p className="text-texto">Entra a tu cuenta de Arcana para abrirlo. Es la del correo donde te llegó.</p>
        <Link href={`/entrar?volver=${encodeURIComponent(volver)}`} className="boton boton-primario flex w-full justify-center text-lg">Entrar y abrir mi regalo</Link>
      </>
    );
  } else if (usuario.id !== u) {
    cuerpo = (
      <>
        <p className="text-texto-suave">Este regalo es de otra cuenta. Entra con el correo donde lo recibiste.</p>
        <Link href={`/entrar?volver=${encodeURIComponent(volver)}`} className="boton boton-secundario flex w-full justify-center">Entrar con otra cuenta</Link>
      </>
    );
  } else {
    cuerpo = (
      <form action={accionAbrirRegalo} className="space-y-4">
        <input type="hidden" name="u" value={u} />
        <input type="hidden" name="v" value={v} />
        <input type="hidden" name="t" value={t} />
        {q.error && <p className="text-peligro">No pudimos abrirlo. Intenta de nuevo en un momento.</p>}
        <BotonEnviar className="boton boton-primario flex w-full justify-center text-lg" cargando="Abriendo…">
          Abrir mi regalo 🎁
        </BotonEnviar>
        <p className="text-sm text-texto-suave">Puedes abrirlo hasta el {limite}.</p>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Un regalo de Sibila</p>
      <div className="tarjeta space-y-5 border-2 border-dashed border-oro/60 p-6">
        <p className="text-5xl" aria-hidden>🎁</p>
        <h1 className="font-display text-4xl font-semibold text-oro-suave">1 lectura del vaso</h1>
        {cuerpo}
      </div>
      <p className="text-xs text-texto-suave">Lecturas de entretenimiento y reflexión personal.</p>
    </div>
  );
}
