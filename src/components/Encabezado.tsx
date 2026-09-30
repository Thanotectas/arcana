import Link from "next/link";
import { Coins } from "lucide-react";
import { Logotipo } from "./Logo";
import { getPerfil } from "@/lib/dal";
import { accionSalir } from "@/lib/auth/acciones";
import { getT } from "@/lib/i18n/servidor";
import { SelectorIdioma } from "./SelectorIdioma";

export async function Encabezado() {
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const NAV = [
    { href: "/tarot", etiqueta: t.nav.tarot },
    { href: "/carta-astral", etiqueta: t.nav.cartaAstral },
    { href: "/numerologia", etiqueta: t.nav.numerologia },
    { href: "/quiromancia", etiqueta: t.nav.quiromancia },
    { href: "/iching", etiqueta: t.nav.iching },
    { href: "/compatibilidad", etiqueta: t.nav.compatibilidad },
    { href: "/horoscopo", etiqueta: t.nav.horoscopo },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-noche/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={perfil ? "/inicio" : "/"} aria-label={t.comun.marca}>
          <Logotipo />
        </Link>

        <nav className="hidden items-center gap-4 whitespace-nowrap text-[13px] text-texto-suave lg:flex xl:gap-5 xl:text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="enlace-nav transition hover:text-texto">
              {n.etiqueta}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SelectorIdioma />
          {perfil ? (
            <>
              <Link
                href="/creditos"
                className="flex items-center gap-1.5 rounded-full border border-oro/40 bg-oro/10 px-3 py-1.5 text-sm font-medium text-oro-suave transition hover:bg-oro/20"
                title={perfil.ilimitado ? t.comun.usoIlimitado : t.comun.tusCreditos}
              >
                <Coins className="h-4 w-4" aria-hidden />
                {perfil.ilimitado ? "∞" : perfil.creditos}
              </Link>
              <Link href="/invitar" className="hidden text-sm text-exito hover:underline sm:block">
                {t.invitar.seccion}
              </Link>
              <Link href="/cuenta" className="hidden text-sm text-texto-suave hover:text-texto sm:block">
                {perfil.nombre ?? t.comun.miCuenta}
              </Link>
              <form action={accionSalir}>
                <button type="submit" className="boton boton-fantasma px-2 py-1 text-sm">
                  {t.comun.salir}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className="boton boton-fantasma px-3 py-1.5 text-sm">
                {t.comun.entrar}
              </Link>
              <Link href="/registro" className="boton boton-primario px-4 py-1.5 text-sm">
                {t.comun.crearCuenta}
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm text-texto-suave lg:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap">
            {n.etiqueta}
          </Link>
        ))}
      </nav>
    </header>
  );
}
