import Link from "next/link";
import { Coins, ShieldCheck } from "lucide-react";
import { Logotipo } from "./Logo";
import { getPerfil, getUsuarioOpcional } from "@/lib/dal";
import { esAdmin } from "@/lib/admin";
import { accionSalir } from "@/lib/auth/acciones";
import { getT } from "@/lib/i18n/servidor";
import { SelectorIdioma } from "./SelectorIdioma";
import { comprasVisibles } from "@/lib/plataforma";
import { catalogoConTextos, type GrupoCatalogo } from "@/lib/catalogo";
import { MenuLecturas } from "./MenuLecturas";
import { MenuMovil } from "./MenuMovil";

export async function Encabezado() {
  const [perfil, t, compras, usuario] = await Promise.all([getPerfil(), getT(), comprasVisibles(), getUsuarioOpcional()]);
  // Acceso visible a /admin solo para las cuentas administradoras.
  const admin = Boolean(perfil) && esAdmin(usuario?.email);
  const items = catalogoConTextos(t, { conCuenta: Boolean(perfil) });
  const grupos = t.nav.grupos as Record<GrupoCatalogo, string>;
  const directos = [
    ...(perfil ? [{ href: "/hoy", etiqueta: t.nav.hoy }] : []),
    { href: "/horoscopo", etiqueta: t.nav.horoscopo },
    { href: "/explorar", etiqueta: t.nav.explorar },
  ];
  const enlacesCuenta = perfil
    ? [
        ...(admin ? [{ href: "/admin", etiqueta: "Administración" }] : []),
        ...(compras ? [{ href: "/creditos", etiqueta: t.nav.creditos }] : []),
        { href: "/invitar", etiqueta: t.invitar.seccion },
        { href: "/cuenta", etiqueta: t.comun.miCuenta },
      ]
    : [
        { href: "/entrar", etiqueta: t.comun.entrar },
        { href: "/registro", etiqueta: t.comun.crearCuenta },
      ];

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-noche/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={perfil ? "/inicio" : "/"} aria-label={t.comun.marca}>
            <Logotipo />
          </Link>
          <nav className="hidden items-center gap-5 whitespace-nowrap text-sm text-texto-suave lg:flex">
            <MenuLecturas etiqueta={t.nav.lecturas} grupos={grupos} items={items} />
            {directos.map((n) => (
              <Link key={n.href} href={n.href} className="enlace-nav transition hover:text-texto">
                {n.etiqueta}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SelectorIdioma />
          {perfil ? (
            <>
              {admin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full border border-exito/50 bg-exito/10 px-3 py-1.5 text-sm font-medium text-exito transition hover:bg-exito/20"
                  title="Administración"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">Admin</span>
                  <span className="sr-only sm:hidden">Administración</span>
                </Link>
              )}
              <Link
                href={compras ? "/creditos" : "/cuenta"}
                className="flex items-center gap-1.5 rounded-full border border-oro/40 bg-oro/10 px-3 py-1.5 text-sm font-medium text-oro-suave transition hover:bg-oro/20"
                title={perfil.ilimitado ? t.comun.usoIlimitado : t.comun.tusCreditos}
              >
                <Coins className="h-4 w-4" aria-hidden />
                {perfil.ilimitado ? "∞" : perfil.creditos}
              </Link>
              <Link href="/invitar" className="hidden text-sm text-exito hover:underline lg:block">
                {t.invitar.seccion}
              </Link>
              <Link href="/cuenta" className="hidden text-sm text-texto-suave hover:text-texto lg:block">
                {perfil.nombre ?? t.comun.miCuenta}
              </Link>
              <form action={accionSalir} className="hidden lg:block">
                <button type="submit" className="boton boton-fantasma px-2 py-1 text-sm">
                  {t.comun.salir}
                </button>
              </form>
            </>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/entrar" className="boton boton-fantasma px-3 py-1.5 text-sm">
                {t.comun.entrar}
              </Link>
              <Link href="/registro" className="boton boton-primario px-4 py-1.5 text-sm">
                {t.comun.crearCuenta}
              </Link>
            </div>
          )}
          <MenuMovil etiquetaAbrir={t.nav.menu} etiquetaCerrar={t.comun.cerrar} grupos={grupos} items={items} enlaces={[...directos, ...enlacesCuenta]} salir={perfil ? t.comun.salir : undefined} />
        </div>
      </div>
    </header>
  );
}
