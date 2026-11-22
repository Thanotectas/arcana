import Link from "next/link";

/** Invitación suave, al final de una herramienta gratuita, a la lectura completa. */
export function CtaHerramienta({ titulo, texto, enlaces }: { titulo: string; texto: string; enlaces: { href: string; texto: string }[] }) {
  return (
    <section className="tarjeta border-oro/40 bg-oro/5 p-6 text-center sm:p-8">
      <h2 className="font-display text-2xl sm:text-3xl">{titulo}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-texto-suave">{texto}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {enlaces.map((e, i) => (
          <Link key={e.href} href={e.href} className={`boton ${i === 0 ? "boton-primario" : "boton-secundario"}`}>
            {e.texto}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Bloque «¿Cómo funciona?» con párrafos sencillos. */
export function ComoFunciona({ titulo, parrafos }: { titulo: string; parrafos: string[] }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl sm:text-3xl">{titulo}</h2>
      {parrafos.map((p, i) => (
        <p key={i} className="text-texto-suave">
          {p}
        </p>
      ))}
    </section>
  );
}
