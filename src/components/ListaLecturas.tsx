"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import { fechaLarga } from "@/lib/i18n/formato";
import type { Idioma } from "@/lib/i18n/idiomas";
import type { TipoLectura } from "@/lib/creditos";

interface Item {
  id: string;
  tipo: TipoLectura;
  titulo: string;
  creado_en: string;
  estado: string;
}

const ICONO: Record<TipoLectura, string> = {
  tarot_carta: "✦",
  tarot_tres: "✦",
  tarot_celta: "✦",
  carta_astral: "☉",
  numerologia: "#",
  compatibilidad: "♡",
  quiromancia: "✋",
  iching: "☰",
  chino: "龙",
  cruce: "✦×✦",
};

/** Historial con búsqueda y filtro por tipo, sin recargar. */
export function ListaLecturas({ lecturas, idioma }: { lecturas: Item[]; idioma: Idioma }) {
  const { t } = useT();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<string>("todas");

  const tipos = useMemo(() => Array.from(new Set(lecturas.map((l) => l.tipo))), [lecturas]);
  const visibles = lecturas.filter((l) => {
    const coincideTipo = filtro === "todas" || l.tipo === filtro || (filtro === "tarot" && l.tipo.startsWith("tarot"));
    const q = busqueda.trim().toLowerCase();
    return coincideTipo && (!q || l.titulo.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-suave" aria-hidden />
          <input className="campo pl-9" placeholder={t.lecturas.lista.buscar} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {["todas", ...tipos].map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setFiltro(tipo)}
            className={`rounded-full border px-3 py-1 transition ${filtro === tipo ? "border-oro/60 bg-oro/10 text-oro-suave" : "border-borde text-texto-suave hover:text-texto"}`}
          >
            {tipo === "todas" ? t.lecturas.lista.filtroTodas : t.lecturas.nombres[tipo as TipoLectura]}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {visibles.map((l, i) => (
          <li key={l.id} className="aparecer" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
            <Link href={`/lecturas/${l.id}`} className="tarjeta flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-oro/40">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violeta/15 text-lg text-oro-suave" aria-hidden>
                {ICONO[l.tipo]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.lecturas.nombres[l.tipo]}</p>
                <p className="truncate font-medium">{l.titulo}</p>
              </div>
              <p className="shrink-0 text-xs text-texto-suave">{fechaLarga(l.creado_en, idioma)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
