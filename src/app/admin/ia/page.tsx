import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Gasto de IA", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface Fila {
  funcion: string;
  modelo: string;
  costo_usd: number;
  entrada: number;
  salida: number;
  cache_lectura: number;
  creado_en: string;
}

const usd = (n: number) => `US$ ${n < 1 ? n.toFixed(3) : n.toFixed(2)}`;
const NOMBRE_MODELO = (m: string) => (/opus/.test(m) ? "Opus" : /haiku/.test(m) ? "Haiku" : /sonnet/.test(m) ? "Sonnet" : m);

/** Lee las llamadas en páginas de 1000 (Supabase limita cada consulta). */
async function llamadasDesde(desde: string): Promise<Fila[]> {
  const admin = getSupabaseAdmin();
  const filas: Fila[] = [];
  for (let pagina = 0; pagina < 50; pagina++) {
    const { data } = await admin
      .from("ia_uso")
      .select("funcion, modelo, costo_usd, entrada, salida, cache_lectura, creado_en")
      .gte("creado_en", desde)
      .order("id", { ascending: true })
      .range(pagina * 1000, pagina * 1000 + 999);
    filas.push(...((data ?? []) as Fila[]));
    if (!data || data.length < 1000) break;
  }
  return filas;
}

function agrupar(filas: Fila[]) {
  const mapa = new Map<string, { funcion: string; modelos: Set<string>; llamadas: number; costo: number; cache: number; entrada: number }>();
  for (const f of filas) {
    const g = mapa.get(f.funcion) ?? { funcion: f.funcion, modelos: new Set(), llamadas: 0, costo: 0, cache: 0, entrada: 0 };
    g.modelos.add(NOMBRE_MODELO(f.modelo));
    g.llamadas++;
    g.costo += Number(f.costo_usd);
    g.cache += f.cache_lectura;
    g.entrada += f.entrada + f.cache_lectura;
    mapa.set(f.funcion, g);
  }
  return [...mapa.values()].sort((a, b) => b.costo - a.costo);
}

/** Las llamadas de los últimos 30 días, y las de los últimos 7 días y 24 horas. */
async function datos() {
  const ahora = Date.now();
  const hace = (dias: number) => new Date(ahora - dias * 86_400_000).toISOString();
  const mes = await llamadasDesde(hace(30));
  return { ahora, mes, semana: mes.filter((f) => f.creado_en >= hace(7)), hoy: mes.filter((f) => f.creado_en >= hace(1)) };
}

/** Gasto de la API de Claude por función y por modelo (estimado con los precios por token). Solo administración. */
export default async function PaginaIa() {
  await requerirAdmin();
  const { ahora, mes, semana, hoy } = await datos();
  const total = (fs: Fila[]) => fs.reduce((s, f) => s + Number(f.costo_usd), 0);
  const porModelo = (fs: Fila[]) => {
    const m = new Map<string, number>();
    for (const f of fs) m.set(NOMBRE_MODELO(f.modelo), (m.get(NOMBRE_MODELO(f.modelo)) ?? 0) + Number(f.costo_usd));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const dias = Array.from({ length: 14 }, (_, k) => {
    const d = new Date(ahora - (13 - k) * 86_400_000).toISOString().slice(0, 10);
    return { d, c: total(mes.filter((f) => f.creado_en.slice(0, 10) === d)) };
  });
  const maxDia = Math.max(0.01, ...dias.map((x) => x.c));
  const grupos = agrupar(semana);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Gasto de IA</h1>
        <p className="mt-2 text-texto-suave">
          Costo estimado de cada llamada a Claude con los precios por token (se registra desde el 26 de noviembre de 2026). La factura real está en la consola de Anthropic; aquí se ve en qué se gasta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Últimas 24 horas", hoy],
          ["Últimos 7 días", semana],
          ["Últimos 30 días", mes],
        ].map(([t, fs]) => (
          <div key={t as string} className="tarjeta p-5">
            <p className="text-sm text-texto-suave">{t as string}</p>
            <p className="font-display text-4xl">{usd(total(fs as Fila[]))}</p>
            <p className="text-xs text-texto-suave">
              {(fs as Fila[]).length} llamadas · {porModelo(fs as Fila[]).map(([m, c]) => `${m} ${usd(c)}`).join(" · ") || "sin datos"}
            </p>
          </div>
        ))}
      </div>

      <section className="tarjeta p-5">
        <h2 className="mb-4 font-display text-2xl">Por día (14 días)</h2>
        <div className="flex h-40 items-end gap-1.5">
          {dias.map((x) => (
            <div key={x.d} className="flex flex-1 flex-col items-center gap-1" title={`${x.d}: ${usd(x.c)}`}>
              <div className="w-full rounded-t bg-violeta/70" style={{ height: `${(x.c / maxDia) * 100}%`, minHeight: x.c > 0 ? 2 : 0 }} />
              <span className="text-[10px] text-texto-suave">{x.d.slice(8)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="tarjeta overflow-x-auto p-5">
        <h2 className="mb-4 font-display text-2xl">Por función (últimos 7 días)</h2>
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-borde text-start text-xs uppercase tracking-[0.15em] text-violeta-suave">
              <th className="py-2 text-start">Función</th>
              <th className="py-2 text-start">Modelo</th>
              <th className="py-2 text-end">Llamadas</th>
              <th className="py-2 text-end">Costo</th>
              <th className="py-2 text-end">Por llamada</th>
              <th className="py-2 text-end">En caché</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.funcion} className="border-b border-borde/60">
                <td className="max-w-[18rem] py-2 pe-3">{g.funcion}</td>
                <td className="py-2">{[...g.modelos].join(", ")}</td>
                <td className="py-2 text-end">{g.llamadas}</td>
                <td className="py-2 text-end font-medium">{usd(g.costo)}</td>
                <td className="py-2 text-end text-texto-suave">{usd(g.costo / g.llamadas)}</td>
                <td className="py-2 text-end text-texto-suave">{g.entrada ? `${Math.round((g.cache / g.entrada) * 100)}%` : "—"}</td>
              </tr>
            ))}
            {!grupos.length && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-texto-suave">Todavía no hay llamadas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-texto-suave">«En caché»: parte de la entrada que se cobró a precio de caché (una décima parte). Si es bajo en una función que se repite mucho, ahí hay ahorro posible.</p>
      </section>
    </div>
  );
}
