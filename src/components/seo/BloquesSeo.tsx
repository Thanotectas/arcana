import Link from "next/link";

/** Migas de pan visibles (y su JSON-LD) para las páginas públicas de contenido. */
export function Migas({ items }: { items: { nombre: string; href: string }[] }) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nombre, item: base + it.href })),
  };
  return (
    <nav aria-label="Migas de pan" className="text-xs text-texto-suave">
      {items.map((it, i) => (
        <span key={it.href}>
          {i > 0 && <span className="mx-1.5">›</span>}
          {i < items.length - 1 ? <Link href={it.href} className="hover:text-texto">{it.nombre}</Link> : <span>{it.nombre}</span>}
        </span>
      ))}
      <JsonLd datos={ld} />
    </nav>
  );
}

export function JsonLd({ datos }: { datos: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />;
}

/** Invitación a probar la lectura real en Arcana. */
export function CtaLectura({ titulo, texto, href = "/registro", boton }: { titulo: string; texto: string; href?: string; boton: string }) {
  return (
    <section className="tarjeta border-oro/40 bg-oro/5 p-6 text-center sm:p-8">
      <h2 className="font-display text-2xl sm:text-3xl">{titulo}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-texto-suave">{texto}</p>
      <Link href={href} className="boton boton-primario mt-4">{boton}</Link>
      <p className="mt-2 text-xs text-texto-suave">Sin tarjeta de crédito · Tu primera lectura es gratis</p>
    </section>
  );
}

/** Preguntas frecuentes visibles + su JSON-LD (FAQPage). */
export function Preguntas({ items }: { items: { p: string; r: string }[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.p, acceptedAnswer: { "@type": "Answer", text: it.r } })),
  };
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl">Preguntas frecuentes</h2>
      {items.map((it) => (
        <details key={it.p} className="tarjeta p-4">
          <summary className="cursor-pointer font-medium">{it.p}</summary>
          <p className="mt-2 text-sm text-texto-suave">{it.r}</p>
        </details>
      ))}
      <JsonLd datos={ld} />
    </section>
  );
}
