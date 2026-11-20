import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { MOTIVO_PROBADOR } from "@/lib/marca/play";

export const metadata: Metadata = { title: "App instalada", robots: { index: false } };
export const dynamic = "force-dynamic";

const hace = (dias: number) => new Date(Date.parse(`${fechaBogota()}T12:00:00Z`) - dias * 86_400_000).toISOString().slice(0, 10);
const n = (x: number) => new Intl.NumberFormat("es-CO").format(x);

/** Solo administración: cuántas personas instalaron Arcana y la abren desde el ícono. */
export default async function PaginaApp() {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const [{ data: eventos, error }, { data: cuentas }, { data: probadores }, { count: avisos }, { data: jugadores }] = await Promise.all([
    admin.from("app_eventos").select("fecha, evento, sistema, plataforma").gte("fecha", hace(90)).limit(50_000),
    admin.from("app_instalaciones").select("plataforma, creado_en"),
    admin.from("movimientos_creditos").select("usuario_id").eq("motivo", MOTIVO_PROBADOR),
    admin.from("suscripciones_push").select("id", { count: "exact", head: true }),
    admin.from("juego_partidas").select("usuario_id").gte("fecha", hace(7)),
  ]);
  const lista = eventos ?? [];
  const contar = (evento: string, desde?: string, filtro?: (e: (typeof lista)[number]) => boolean) =>
    lista.filter((e) => e.evento === evento && (!desde || e.fecha >= desde) && (!filtro || filtro(e))).length;
  const dias14 = Array.from({ length: 14 }, (_, i) => hace(i));
  const cuentas30 = (cuentas ?? []).filter((c) => c.creado_en >= `${hace(30)}T00:00:00`).length;

  const cifra = (titulo: string, valor: number, detalle: string) => (
    <div className="tarjeta p-4">
      <p className="text-sm text-texto-suave">{titulo}</p>
      <p className="font-display text-4xl text-oro-suave">{n(valor)}</p>
      <p className="text-xs text-texto-suave">{detalle}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">App instalada</h1>
        <p className="mt-2 text-texto-suave">
          Cuántas personas tienen Arcana en su pantalla de inicio. Se cuenta sin datos personales: cada dispositivo una sola vez. En iPhone el navegador no avisa la
          instalación, por eso cuenta más «la abrió instalada».
        </p>
      </div>
      {error && <p className="tarjeta border-peligro/40 p-4 text-sm text-peligro">Falta aplicar la migración 0055_app_eventos.sql: sin ella todavía no se cuentan las instalaciones.</p>}

      <section className="grid gap-3 sm:grid-cols-3">
        {cifra("La abrieron instalada", contar("abierta"), `${n(contar("abierta", hace(30)))} en 30 días · ${n(contar("abierta", hace(7)))} en 7`)}
        {cifra("Instalaciones avisadas", contar("instalada"), `${n(contar("instalada", hace(30)))} en 30 días · Android y computador`)}
        {cifra("Cuentas con la app", (cuentas ?? []).length, `${n(cuentas30)} en 30 días (recibieron el crédito de bienvenida)`)}
        {cifra("Desde Google Play", contar("abierta", undefined, (e) => e.plataforma === "android"), `${n((probadores ?? []).length)} probadores con créditos de prueba`)}
        {cifra("Con avisos activos", avisos ?? 0, "dispositivos que reciben la carta y la racha")}
        {cifra("Jugaron esta semana", new Set((jugadores ?? []).map((j) => j.usuario_id)).size, "cuentas en El Camino del Loco (7 días)")}
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl">Primeras aperturas por sistema (90 días)</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {(["android", "iphone", "computador"] as const).map((s) => (
            <div key={s} className="rounded-xl bg-superficie-2 p-3">
              <p className="text-2xl font-semibold">{n(contar("abierta", undefined, (e) => e.sistema === s))}</p>
              <p className="text-xs text-texto-suave">{s === "android" ? "Android" : s === "iphone" ? "iPhone" : "Computador"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tarjeta overflow-x-auto p-5">
        <h2 className="mb-3 font-display text-2xl">Últimos 14 días</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-texto-suave">
            <tr>
              <th className="py-1">Día</th>
              <th className="text-right">Instalada</th>
              <th className="text-right">Abierta instalada</th>
            </tr>
          </thead>
          <tbody>
            {dias14.map((d) => (
              <tr key={d} className="border-t border-white/10">
                <td className="py-1">{d}</td>
                <td className="text-right">{lista.filter((e) => e.fecha === d && e.evento === "instalada").length}</td>
                <td className="text-right">{lista.filter((e) => e.fecha === d && e.evento === "abierta").length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-texto-suave">Las descargas de la app de Android también se ven en Google Play Console → Estadísticas.</p>
      </section>
    </div>
  );
}

