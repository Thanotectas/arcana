import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sparkles, Sun, Moon, ArrowUp, Lock, Calendar } from "lucide-react";
import { requerirUsuario, getPerfil, circuloActivo, lugarDePerfil, horaDePerfil, type Perfil } from "@/lib/dal";
import { getMensajeDeHoy, datosNacimientoDePerfil, fechaLocalHoy } from "@/lib/diario";
import { cieloDeHoy, type CieloDeHoy } from "@/lib/astro/transitos";
import { NOMBRES_CUERPO, SIMBOLOS_CUERPO, NOMBRES_ASPECTO } from "@/lib/astro/textos";
import { signoPorId } from "@/lib/zodiaco";
import { PAQUETE_CIRCULO, formatoCOP, precioCirculoPorDia } from "@/lib/creditos";
import { accionGuardarNacimiento } from "@/lib/auth/acciones";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaLarga, plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import { FormularioNacimiento } from "@/components/FormularioNacimiento";
import { Markdown } from "@/components/Markdown";
import { Aviso } from "@/components/Aviso";
import { AvisoDiario } from "@/components/AvisoDiario";
import { comprasVisibles } from "@/lib/plataforma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.hoy.titulo };
}

export default async function PaginaHoy() {
  await requerirUsuario();
  const [perfil, t, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  if (!perfil) return null;
  const datos = datosNacimientoDePerfil(perfil);
  const fecha = fechaLocalHoy(perfil.zona_horaria);
  const miembro = circuloActivo(perfil);
  const compras = await comprasVisibles();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.hoy.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.hoy.titulo}</h1>
        <p className="mt-2 flex items-center gap-2 text-texto-suave">
          <Calendar className="h-4 w-4" aria-hidden /> {fechaLarga(`${fecha}T12:00:00`, idioma)}
        </p>
      </div>

      {!datos ? (
        <section className="tarjeta aparecer space-y-4 p-6">
          <h2 className="font-display text-2xl font-semibold">{t.hoy.sinDatos}</h2>
          <p className="text-sm text-texto-suave">{t.hoy.sinDatosNota}</p>
          <FormularioNacimiento accion={accionGuardarNacimiento} fecha={perfil.fecha_nacimiento ?? ""} hora={horaDePerfil(perfil)} lugar={lugarDePerfil(perfil)} />
        </section>
      ) : (
        <>
          <CieloResumen cielo={cieloDeHoy(datos)} t={t} />
          <AvisoDiario clavePublica={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />
          {miembro ? (
            <Suspense fallback={<Escribiendo texto={t.hoy.escribiendo} />}>
              <MensajeDiario perfil={perfil} idioma={idioma} t={t} />
            </Suspense>
          ) : compras ? (
            <Invitacion t={t} />
          ) : null}
          {compras && miembro && perfil.circulo_hasta && !perfil.ilimitado && (
            <p className="text-center text-xs text-texto-suave">
              {plantilla(t.circulo.activoHasta, { fecha: fechaLarga(perfil.circulo_hasta, idioma) })} ·{" "}
              <Link href="/creditos#circulo" className="underline">{t.circulo.extender}</Link>
            </p>
          )}
          <p className="text-center text-xs text-texto-suave">
            <Link href="/cuenta#nacimiento" className="underline">{t.hoy.editarDatos}</Link>
          </p>
        </>
      )}
    </div>
  );
}

function CieloResumen({ cielo, t }: { cielo: CieloDeHoy; t: Diccionario }) {
  const lunaHoy = signoPorId(cielo.luna.signo);
  const sol = signoPorId(cielo.natal.sol);
  const luna = signoPorId(cielo.natal.luna);
  const asc = cielo.natal.ascendente ? signoPorId(cielo.natal.ascendente) : null;
  return (
    <section className="tarjeta aparecer space-y-4 p-6">
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-violeta/15 px-3 py-1 text-violeta-suave">
          ☽ {plantilla(t.hoy.lunaEn, { signo: `${lunaHoy?.simbolo ?? ""} ${lunaHoy?.nombre ?? cielo.luna.signo}` })} · {t.inicio.fasesLuna[cielo.luna.fase]}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-oro/10 px-3 py-1 text-oro-suave"><Sun className="h-3.5 w-3.5" aria-hidden /> {sol?.nombre}</span>
        <span className="flex items-center gap-1 rounded-full bg-oro/10 px-3 py-1 text-oro-suave"><Moon className="h-3.5 w-3.5" aria-hidden /> {luna?.nombre}</span>
        {asc && <span className="flex items-center gap-1 rounded-full bg-oro/10 px-3 py-1 text-oro-suave"><ArrowUp className="h-3.5 w-3.5" aria-hidden /> {asc.nombre}</span>}
      </div>
      <div>
        <h2 className="text-xs uppercase tracking-widest text-violeta-suave">{t.hoy.transitos}</h2>
        {cielo.transitos.length === 0 ? (
          <p className="mt-2 text-sm text-texto-suave">{t.hoy.sinTransitos}</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {cielo.transitos.slice(0, 4).map((tr, i) => (
              <li key={i} className="flex items-center gap-2 aparecer" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="w-6 text-center font-display text-lg text-oro">{SIMBOLOS_CUERPO[tr.transitante]}</span>
                <span>
                  {NOMBRES_CUERPO[tr.transitante]} {NOMBRES_ASPECTO[tr.tipo].toLowerCase()}{" "}
                  {tr.natal === "ascendente" ? t.astral.ascendente : tr.natal === "medio_cielo" ? t.astral.medioCielo : NOMBRES_CUERPO[tr.natal]}
                </span>
                <span className="ml-auto text-xs text-texto-suave">{tr.aplicativo ? t.hoy.aplicativo : t.hoy.separativo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

async function MensajeDiario({ perfil, idioma, t }: { perfil: Perfil; idioma: Idioma; t: Diccionario }) {
  const contenido = await getMensajeDeHoy(perfil, idioma)
    .then((m) => m?.contenido ?? null)
    .catch((e: unknown) => {
      console.error("[hoy] no se pudo escribir el mensaje", e instanceof Error ? e.message : e);
      return null;
    });
  if (!contenido) return <Aviso>{t.hoy.fallo}</Aviso>;
  return (
    <article className="tarjeta aparecer border-oro/30 p-6 sm:p-8">
      <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-oro">
        <Sparkles className="h-4 w-4" aria-hidden /> {t.circulo.nombre}
      </p>
      <Markdown texto={contenido} />
    </article>
  );
}

function Escribiendo({ texto }: { texto: string }) {
  return (
    <div className="tarjeta space-y-3 border-oro/30 p-6 sm:p-8" aria-busy>
      <p className="flex items-center gap-2 text-sm text-oro-suave"><Sparkles className="h-4 w-4 animate-pulse" aria-hidden /> {texto}</p>
      <div className="h-6 w-2/3 animate-pulse rounded bg-borde" />
      <div className="h-4 w-full animate-pulse rounded bg-borde" />
      <div className="h-4 w-11/12 animate-pulse rounded bg-borde" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-borde" />
    </div>
  );
}

function Invitacion({ t }: { t: Diccionario }) {
  return (
    <section className="tarjeta aparecer relative overflow-hidden border-oro/40 p-6 sm:p-8">
      <div className="pointer-events-none select-none space-y-2 blur-sm" aria-hidden>
        <div className="h-6 w-2/3 rounded bg-oro/20" />
        <div className="h-4 w-full rounded bg-texto/10" />
        <div className="h-4 w-11/12 rounded bg-texto/10" />
        <div className="h-4 w-3/4 rounded bg-texto/10" />
      </div>
      <div className="mt-6 space-y-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-oro"><Lock className="h-4 w-4" aria-hidden /> {t.circulo.nombre}</p>
        <h2 className="font-display text-2xl font-semibold">{t.hoy.teaserTitulo}</h2>
        <p className="text-sm text-texto-suave">{t.hoy.teaserTexto}</p>
        <ul className="space-y-1 text-sm">
          {t.circulo.beneficios.map((b) => (
            <li key={b} className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />{b}</li>
          ))}
        </ul>
        <Link href="/creditos#circulo" className="boton boton-primario mt-2 inline-flex">
          {plantilla(t.circulo.cta, { precio: formatoCOP(PAQUETE_CIRCULO.precioCOP) })}
        </Link>
        <p className="text-xs text-texto-suave">{plantilla(t.crecimiento.porDia, { precio: formatoCOP(precioCirculoPorDia()) })}</p>
      </div>
    </section>
  );
}
