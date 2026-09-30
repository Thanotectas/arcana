import Link from "next/link";
import { Sparkles, Coins } from "lucide-react";
import { getPerfil } from "@/lib/dal";
import { accionSalir } from "@/lib/auth/acciones";

const NAV = [
  { href: "/tarot", etiqueta: "Tarot" },
  { href: "/carta-astral", etiqueta: "Carta astral" },
  { href: "/numerologia", etiqueta: "Numerología" },
  { href: "/compatibilidad", etiqueta: "Compatibilidad" },
  { href: "/horoscopo", etiqueta: "Horóscopo" },
];

export async function Encabezado() {
  const perfil = await getPerfil();

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-noche/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={perfil ? "/inicio" : "/"} className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-oro" aria-hidden />
          <span className="font-display text-2xl font-semibold tracking-wide text-oro-suave">Arcana</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-texto-suave md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition hover:text-texto">
              {n.etiqueta}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {perfil ? (
            <>
              <Link
                href="/creditos"
                className="flex items-center gap-1.5 rounded-full border border-oro/40 bg-oro/10 px-3 py-1.5 text-sm font-medium text-oro-suave"
                title={perfil.ilimitado ? "Uso ilimitado" : "Tus créditos"}
              >
                <Coins className="h-4 w-4" aria-hidden />
                {perfil.ilimitado ? "∞" : perfil.creditos}
              </Link>
              <Link href="/cuenta" className="hidden text-sm text-texto-suave hover:text-texto sm:block">
                {perfil.nombre ?? "Mi cuenta"}
              </Link>
              <form action={accionSalir}>
                <button type="submit" className="boton boton-fantasma px-2 py-1 text-sm">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className="boton boton-fantasma px-3 py-1.5 text-sm">
                Entrar
              </Link>
              <Link href="/registro" className="boton boton-primario px-4 py-1.5 text-sm">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm text-texto-suave md:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap">
            {n.etiqueta}
          </Link>
        ))}
      </nav>
    </header>
  );
}
