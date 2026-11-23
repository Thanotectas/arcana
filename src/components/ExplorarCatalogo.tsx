"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { IconoCatalogo } from "@/components/IconoCatalogo";
import type { IconoCatalogo as ClaveIcono } from "@/lib/catalogo";
import type { Idioma } from "@/lib/i18n/idiomas";
import { A_MANO, ETIQUETAS, NECESIDADES, ORIGENES, PRACTICAS, PRACTICAS_POR_A_MANO, TEXTOS_FILTROS, type AMano, type Necesidad } from "@/lib/catalogo-filtros";
import { EVENTO_ABRIR_SIBILA } from "@/lib/eventos";
import { accionSugerirPractica, type EstadoSugerencia } from "@/lib/sugerencias-acciones";

export interface ItemExplorar {
  clave: ClaveIcono;
  href: string;
  nombre: string;
  descripcion: string;
  costoTexto: string;
  gratis: boolean;
  destacado: boolean;
  /** Producto propio de otra cultura (kundli para quien está en español): la guía no lo recomienda primero. */
  deOtroMercado: boolean;
}

type Vista = "necesidad" | "practica" | "origen" | "gratis" | "todo";
const VISTAS: Vista[] = ["necesidad", "practica", "origen", "gratis", "todo"];


/** Sin tildes ni mayúsculas, para buscar «limpia» y encontrar «Limpia con huevo». */
const plano = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * La biblioteca de Arcana con varias formas de buscar: por lo que la persona quiere saber, por tipo de práctica, por
 * tradición o país, lo gratis, todo, o escribiendo. Arriba, una guía de dos preguntas para quien no sabe por dónde
 * empezar; abajo, «¿tu práctica no está?».
 */
export function ExplorarCatalogo({ items, idioma, abrir }: { items: ItemExplorar[]; idioma: Idioma; abrir: string }) {
  const t = TEXTOS_FILTROS[idioma];
  const [vista, setVista] = useState<Vista>("necesidad");
  const [grupo, setGrupo] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const grupos = useMemo((): { id: string; nombre: string; items: ItemExplorar[] }[] => {
    const de = <K extends string>(ids: readonly K[], nombres: Record<K, string>, tiene: (i: ItemExplorar, id: K) => boolean) =>
      ids.map((id) => ({ id, nombre: nombres[id], items: items.filter((i) => tiene(i, id)) })).filter((g) => g.items.length);
    if (vista === "necesidad") return de(NECESIDADES, t.necesidades, (i, id) => Boolean(ETIQUETAS[i.clave]?.necesidades.includes(id)));
    if (vista === "practica") return de(PRACTICAS, t.practicas, (i, id) => ETIQUETAS[i.clave]?.practica === id);
    if (vista === "origen") return de(ORIGENES, t.origenes, (i, id) => Boolean(ETIQUETAS[i.clave]?.origenes.includes(id)));
    if (vista === "gratis") return [{ id: "gratis", nombre: t.gratis, items: items.filter((i) => i.gratis) }];
    return [{ id: "todo", nombre: t.vistas.todo, items }];
  }, [vista, items, t]);

  const q = plano(busca.trim());
  const encontrados = q ? items.filter((i) => plano(`${i.nombre} ${i.descripcion} ${i.clave}`).includes(q)) : null;
  const visibles = grupo ? grupos.filter((g) => g.id === grupo) : grupos;

  return (
    <div className="space-y-8">
      <Guia items={items} idioma={idioma} />

      <div className="space-y-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-texto-suave" aria-hidden />
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t.buscar} className="campo w-full ps-12 text-base" aria-label={t.buscar} />
        </label>
        {!q && (
          <>
            <div className="flex flex-wrap gap-2" role="tablist">
              {VISTAS.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={vista === v}
                  onClick={() => {
                    setVista(v);
                    setGrupo(null);
                  }}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${vista === v ? "border-oro bg-oro/15 text-oro-suave" : "border-borde text-texto-suave hover:border-oro/50"}`}
                >
                  {t.vistas[v]}
                </button>
              ))}
            </div>
            {grupos.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {grupos.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGrupo(grupo === g.id ? null : g.id)}
                    className={`rounded-full px-3 py-1 text-xs transition ${grupo === g.id ? "bg-violeta/40 text-texto" : "bg-white/5 text-texto-suave hover:bg-white/10"}`}
                  >
                    {g.nombre} · {g.items.length}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {encontrados ? (
        encontrados.length ? (
          <Rejilla items={encontrados} abrir={abrir} />
        ) : (
          <p className="tarjeta p-5 text-texto-suave">{t.sinResultados}</p>
        )
      ) : (
        visibles.map((g) => (
          <section key={g.id}>
            <h2 className="font-display text-3xl">{g.nombre}</h2>
            <Rejilla items={g.items} abrir={abrir} />
          </section>
        ))
      )}

      <Sugerir idioma={idioma} />
    </div>
  );
}

function Rejilla({ items, abrir }: { items: ItemExplorar[]; abrir: string }) {
  // Lo destacado del idioma va primero.
  const orden = [...items].sort((a, b) => Number(b.destacado) - Number(a.destacado));
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orden.map((i) => (
        <Link key={i.href} href={i.href} className="tarjeta tarjeta-modulo group flex flex-col p-5 transition hover:-translate-y-1 hover:border-oro/40">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-oro/10 p-2 text-oro"><IconoCatalogo clave={i.clave} className="h-5 w-5" /></span>
            <span className="text-xs text-texto-suave">{i.costoTexto}</span>
          </div>
          <h3 className="font-display mt-3 text-2xl">{i.nombre}</h3>
          <p className="mt-1 flex-1 text-sm text-texto-suave">{i.descripcion}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-oro-suave">
            {abrir} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Guía de dos preguntas para quien llega sin saber nada: qué quiere saber y qué tiene a mano. */
function Guia({ items, idioma }: { items: ItemExplorar[]; idioma: Idioma }) {
  const t = TEXTOS_FILTROS[idioma];
  const [necesidad, setNecesidad] = useState<Necesidad | null>(null);
  const [aMano, setAMano] = useState<AMano | null>(null);

  const recomendados = useMemo(() => {
    if (!necesidad || !aMano) return [];
    const sirve = PRACTICAS_POR_A_MANO[aMano];
    return items
      .map((i) => {
        const e = ETIQUETAS[i.clave];
        if (!e) return { i, puntos: -1 };
        let puntos = e.necesidades.includes(necesidad) ? 4 : 0;
        if (sirve.includes(e.practica)) puntos += 2;
        if (aMano === "nada" && i.gratis) puntos += 2;
        if (i.destacado) puntos += 1;
        if (i.deOtroMercado) puntos -= 3;
        return { i, puntos };
      })
      .filter((x) => x.puntos >= 4)
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 3)
      .map((x) => x.i);
  }, [items, necesidad, aMano]);

  const sibila = () => window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_SIBILA, { detail: { texto: t.guia.sibilaPregunta } }));
  const opcion = (activa: boolean) => `rounded-full border px-4 py-2 text-sm transition ${activa ? "border-oro bg-oro/15 text-oro-suave" : "border-borde hover:border-oro/50"}`;

  return (
    <section className="tarjeta space-y-4 border-oro/30 bg-oro/5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-6 w-6 shrink-0 text-oro" aria-hidden />
        <div>
          <h2 className="font-display text-3xl">{t.guia.titulo}</h2>
          <p className="text-texto-suave">{t.guia.texto}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="font-semibold">1. {t.guia.p1}</p>
        <div className="flex flex-wrap gap-2">
          {NECESIDADES.map((n) => (
            <button key={n} type="button" className={opcion(necesidad === n)} onClick={() => setNecesidad(n)}>
              {t.necesidades[n]}
            </button>
          ))}
        </div>
      </div>
      {necesidad && (
        <div className="space-y-2">
          <p className="font-semibold">2. {t.guia.p2}</p>
          <div className="flex flex-wrap gap-2">
            {A_MANO.map((a) => (
              <button key={a} type="button" className={opcion(aMano === a)} onClick={() => setAMano(a)}>
                {t.guia.aMano[a]}
              </button>
            ))}
          </div>
        </div>
      )}
      {recomendados.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-oro-suave">{t.guia.resultado}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {recomendados.map((i) => (
              <Link key={i.href} href={i.href} className="tarjeta flex items-center gap-3 p-4 transition hover:border-oro/60">
                <span className="rounded-full bg-oro/10 p-2 text-oro"><IconoCatalogo clave={i.clave} className="h-5 w-5" /></span>
                <span>
                  <span className="font-display block text-xl">{i.nombre}</span>
                  <span className="text-xs text-texto-suave">{i.costoTexto}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm">
        {(necesidad || aMano) && (
          <button
            type="button"
            className="text-texto-suave underline hover:text-texto"
            onClick={() => {
              setNecesidad(null);
              setAMano(null);
            }}
          >
            {t.guia.otraVez}
          </button>
        )}
        <button type="button" className="text-oro-suave underline hover:text-texto" onClick={sibila}>
          💬 {t.guia.sibila}
        </button>
      </div>
    </section>
  );
}

/** «¿Tu práctica no está?»: la gente nos dice qué agregar a la biblioteca. */
function Sugerir({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS_FILTROS[idioma].sugerir;
  const [estado, enviar, enviando] = useActionState<EstadoSugerencia, FormData>(accionSugerirPractica, {});
  return (
    <section className="tarjeta space-y-3 p-5 sm:p-6">
      <h2 className="font-display text-3xl">{t.titulo}</h2>
      <p className="text-texto-suave">{t.texto}</p>
      {estado.codigo === "ok" ? (
        <p role="status" className="text-oro-suave">{t.ok}</p>
      ) : (
        <form action={enviar} className="space-y-3">
          <input type="hidden" name="idioma" value={idioma} />
          <label className="block space-y-1 text-sm">
            <span className="text-texto-suave">{t.campo}</span>
            <textarea name="texto" required minLength={3} maxLength={1000} rows={3} className="campo w-full" />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-texto-suave">{t.correo}</span>
            <input name="correo" type="email" maxLength={200} className="campo w-full" autoComplete="email" />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="boton boton-primario" disabled={enviando}>{enviando ? t.enviando : t.enviar}</button>
            {estado.codigo === "error" && <p role="status" className="text-peligro">{t.error}</p>}
          </div>
        </form>
      )}
    </section>
  );
}
