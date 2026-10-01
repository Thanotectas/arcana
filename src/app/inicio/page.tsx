import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, Star, Hash, Heart, Coins, Hand, Flame, Users, Hexagon, Sunrise, CheckCircle2, Circle, Layers } from "lucide-react";
import { BONO_INVITADOR } from "@/lib/invitaciones";
import { getLecturas, getPerfil, cartaDiaDisponible, requerirUsuario, circuloActivo, getResumenInvitaciones } from "@/lib/dal";
import { datosNacimientoDePerfil } from "@/lib/diario";
import { cieloDeHoy } from "@/lib/astro/transitos";
import { signoPorId } from "@/lib/zodiaco";
import { comprasVisibles } from "@/lib/plataforma";
import { COSTOS } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaHora, plantilla } from "@/lib/i18n/formato";
import { LunaHoy } from "@/components/LunaHoy";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.comun.inicio };
}

/** Días consecutivos (hasta hoy) con al menos una lectura. */
function racha(fechas: string[]) {
  const dias = new Set(fechas.map((f) => f.slice(0, 10)));
  let n = 0;
  const d = new Date();
  for (;;) {
    const clave = d.toISOString().slice(0, 10);
    if (!dias.has(clave)) break;
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

export default async function PaginaInicio() {
  await requerirUsuario();
  const [perfil, lecturas, cartaDisponible, t, idioma, invitaciones] = await Promise.all([
    getPerfil(),
    getLecturas(200),
    cartaDiaDisponible(),
    getT(),
    getIdioma(),
    getResumenInvitaciones().catch(() => ({ invitados: 0, premiadas: 0, creditos_ganados: 0 })),
  ]);
  const compras = await comprasVisibles();
  const diasSeguidos = racha(lecturas.map((l) => l.creado_en));
  const datosNatales = datosNacimientoDePerfil(perfil);
  const cielo = datosNatales ? cieloDeHoy(datosNatales) : null;
  const notaHoy = cielo
    ? plantilla(circuloActivo(perfil) ? t.inicio.hoyTarjeta.notaMiembro : t.inicio.hoyTarjeta.nota, {
        signo: signoPorId(cielo.luna.signo)?.nombre ?? cielo.luna.signo,
        n: cielo.transitos.length,
      })
    : t.inicio.hoyTarjeta.notaSinDatos;

  // Primeros pasos (progreso dotado: la cuenta ya cuenta como el primero).
  const pasos = [
    { clave: "cuenta", texto: t.crecimiento.primerosPasos.cuenta, hecho: true, href: "/cuenta" },
    { clave: "nacimiento", texto: t.crecimiento.primerosPasos.nacimiento, hecho: Boolean(datosNatales), href: "/hoy" },
    { clave: "carta", texto: t.crecimiento.primerosPasos.carta, hecho: lecturas.some((l) => l.tipo === "tarot_carta"), href: "/tarot?tirada=tarot_carta" },
    { clave: "lectura", texto: t.crecimiento.primerosPasos.lectura, hecho: lecturas.some((l) => l.tipo !== "tarot_carta"), href: "/tarot" },
    { clave: "invitar", texto: t.crecimiento.primerosPasos.invitar, hecho: invitaciones.invitados > 0, href: "/invitar" },
  ];
  const hechos = pasos.filter((p) => p.hecho).length;

  const accesos = [
    { href: "/tarot?tirada=tarot_carta", icono: Sparkles, titulo: t.inicio.accesos.cartaDia.titulo, nota: cartaDisponible ? t.inicio.accesos.cartaDia.gratisHoy : t.inicio.accesos.cartaDia.usada, costo: 0 },
    { href: "/tarot", icono: Sparkles, ...t.inicio.accesos.tarot, costo: COSTOS.tarot_tres },
    { href: "/carta-astral", icono: Star, ...t.inicio.accesos.astral, costo: COSTOS.carta_astral },
    { href: "/quiromancia", icono: Hand, ...t.inicio.accesos.quiromancia, costo: COSTOS.quiromancia },
    { href: "/numerologia", icono: Hash, ...t.inicio.accesos.numerologia, costo: COSTOS.numerologia },
    { href: "/iching", icono: Hexagon, ...t.inicio.accesos.iching, costo: COSTOS.iching },
    { href: "/calendario-chino", icono: Flame, ...t.inicio.accesos.chino, costo: COSTOS.chino },
    { href: "/compatibilidad", icono: Heart, ...t.inicio.accesos.compatibilidad, costo: COSTOS.compatibilidad },
    { href: "/cruce", icono: Layers, ...t.inicio.accesos.cruce, costo: COSTOS.cruce },
  ];

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.inicio.bienvenida}</p>
          <h1 className="font-display text-4xl font-semibold">{plantilla(t.inicio.hola, { nombre: perfil?.nombre ?? t.inicio.viajero })}</h1>
          {diasSeguidos > 1 && (
            <p className="mt-1 flex items-center gap-1 text-sm text-oro-suave">
              <Flame className="h-4 w-4" aria-hidden /> {plantilla(t.inicio.racha, { n: diasSeguidos })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <LunaHoy t={t} />
          <Link href={compras ? "/creditos" : "/cuenta"} className="tarjeta tarjeta-modulo flex items-center gap-3 px-5 py-3">
            <Coins className="h-6 w-6 text-oro" aria-hidden />
            <div>
              <p className="text-2xl font-semibold text-oro-suave">{perfil?.ilimitado ? "∞" : (perfil?.creditos ?? 0)}</p>
              <p className="text-xs text-texto-suave">{perfil?.ilimitado ? t.comun.usoIlimitado : compras ? t.inicio.comprarMas : t.comun.creditos}</p>
            </div>
          </Link>
        </div>
      </section>

      {compras && !perfil?.ilimitado && (perfil?.creditos ?? 0) <= 1 && (
        <div className="tarjeta aparecer flex flex-wrap items-center justify-between gap-3 border-oro/40 bg-oro/5 p-4">
          <p className="text-sm">{(perfil?.creditos ?? 0) === 0 ? t.persuasion.saldoCero : t.persuasion.saldoUno}</p>
          <Link href="/creditos" className="boton boton-primario px-4 py-1.5 text-sm">{t.persuasion.recargar}</Link>
        </div>
      )}
      {hechos < pasos.length && (
        <section className="tarjeta aparecer p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold">{t.crecimiento.primerosPasos.titulo}</h2>
            <span className="text-xs text-texto-suave">{plantilla(t.crecimiento.primerosPasos.progreso, { hechos, total: pasos.length })}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-superficie-2">
            <div className="h-full rounded-full bg-oro transition-all" style={{ width: `${(hechos / pasos.length) * 100}%` }} />
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {pasos.map((p) => (
              <li key={p.clave}>
                <Link href={p.href} className={`flex items-center gap-2 text-sm ${p.hecho ? "text-texto-suave line-through decoration-exito/60" : "hover:text-oro-suave"}`}>
                  {p.hecho ? <CheckCircle2 className="h-4 w-4 shrink-0 text-exito" aria-hidden /> : <Circle className="h-4 w-4 shrink-0 text-violeta-suave" aria-hidden />}
                  {p.texto}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/hoy" className="tarjeta tarjeta-modulo aparecer flex items-center gap-4 border-oro/40 bg-oro/5 p-5">
        <Sunrise className="h-8 w-8 shrink-0 text-oro" aria-hidden />
        <div>
          <h2 className="font-display text-2xl font-semibold">{t.inicio.hoyTarjeta.titulo}</h2>
          <p className="text-sm text-texto-suave">{notaHoy}</p>
        </div>
      </Link>

      {cartaDisponible && (
        <div className="tarjeta aparecer flex flex-wrap items-center justify-between gap-3 border-violeta/40 p-4">
          <p className="text-sm">{t.persuasion.cartaDiaPendiente}</p>
          <Link href="/tarot?tirada=tarot_carta" className="boton boton-secundario px-4 py-1.5 text-sm">{t.persuasion.sacarCarta}</Link>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accesos.map((a, i) => (
          <Link key={a.href + a.titulo} href={a.href} className="tarjeta tarjeta-modulo aparecer group p-5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <a.icono className="h-6 w-6 text-oro transition group-hover:scale-110" aria-hidden />
              <span className="rounded-full bg-violeta/15 px-2 py-0.5 text-xs text-violeta-suave">
                {a.costo === 0 ? t.comun.gratis : `${a.costo} ${a.costo > 1 ? t.comun.creditos : t.comun.credito}`}
              </span>
            </div>
            <h2 className="font-display mt-3 text-2xl font-semibold">{a.titulo}</h2>
            <p className="text-sm text-texto-suave">{a.nota}</p>
          </Link>
        ))}
      </section>

      <Link href="/invitar" className="tarjeta tarjeta-modulo flex items-center gap-4 border-exito/30 p-5">
        <Users className="h-8 w-8 text-exito" aria-hidden />
        <div>
          <h2 className="font-display text-2xl font-semibold">{t.invitar.tarjetaTitulo}</h2>
          <p className="text-sm text-texto-suave">{plantilla(t.invitar.tarjetaNota, { bono: BONO_INVITADOR })}</p>
        </div>
      </Link>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold">{t.inicio.ultimas}</h2>
          <Link href="/lecturas" className="text-sm text-violeta-suave hover:underline">{t.comun.verTodas}</Link>
        </div>
        {lecturas.length === 0 ? (
          <p className="tarjeta p-6 text-texto-suave">{t.inicio.vacio}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {lecturas.slice(0, 6).map((l) => (
              <li key={l.id}>
                <Link href={`/lecturas/${l.id}`} className="tarjeta tarjeta-modulo block p-4">
                  <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.lecturas.nombres[l.tipo]}</p>
                  <p className="mt-1 font-medium">{l.titulo}</p>
                  <p className="text-xs text-texto-suave">{fechaHora(l.creado_en, idioma)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
