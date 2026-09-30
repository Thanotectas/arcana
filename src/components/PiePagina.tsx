import Link from "next/link";

export function PiePagina() {
  return (
    <footer className="border-t border-borde py-8 text-sm text-texto-suave">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} Arcana. Las lecturas tienen fines de entretenimiento y reflexión personal; no
          sustituyen asesoría médica, legal, psicológica ni financiera.
        </p>
        <nav className="flex gap-4">
          <Link href="/terminos" className="hover:text-texto">
            Términos
          </Link>
          <Link href="/privacidad" className="hover:text-texto">
            Privacidad
          </Link>
          <Link href="/creditos" className="hover:text-texto">
            Precios
          </Link>
        </nav>
      </div>
    </footer>
  );
}
