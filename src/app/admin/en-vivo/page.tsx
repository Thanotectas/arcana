import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sitio } from "@/lib/correo";
import { claveEscenario, despedidaReciente, escenarioActivo, horaCierre, maximoDiario } from "@/lib/en-vivo";
import { vozConfigurada } from "@/lib/redes/voz";
import { youtubeConectado } from "@/lib/redes/youtube";
import { metaConfigurado } from "@/lib/redes/meta";
import { AlternarCodigo, CierreDirecto, CrearCodigo, DireccionEscenario, PreguntaManual, VaciarCola } from "@/components/admin/ControlEnVivo";
import { listarCodigos, venceSugerido } from "@/lib/pagos/codigos";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sibila en vivo", robots: { index: false, follow: false } };

const NOMBRE_TIPO: Record<string, string> = { tarot: "Tarot", aura: "Aura", numerologia: "Numerología", horoscopo: "Horóscopo", chocolate: "Chocolate", mano: "Mano", carta: "Carta astral", sinastria: "Sinastría" };
const ORIGEN: Record<string, string> = { chat: "YouTube", facebook: "Facebook", manual: "A mano", pagina: "Foto (/vivo)" };

/** Control de «Sibila en vivo»: dirección del escenario para OBS, estado, fila de consultas y lecturas. */
export default async function PaginaAdminEnVivo() {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const hoy = `${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date())}T05:00:00.000Z`;
  const [{ data: estado }, { data: fila }, { data: leidas }, { count: leidasHoy }, conectado, transmitiendo] = await Promise.all([
    admin.from("en_vivo_estado").select("*").eq("id", 1).maybeSingle(),
    admin.from("en_vivo_preguntas").select("id, origen, tipo, autor, texto, estado, creado_en").in("estado", ["pendiente", "leyendo"]).order("creado_en").limit(30),
    admin.from("en_vivo_preguntas").select("id, origen, tipo, autor, texto, estado, lectura, detalle, leida_en").in("estado", ["leida", "omitida"]).order("leida_en", { ascending: false }).limit(15),
    admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).eq("estado", "leida").gte("leida_en", hoy),
    youtubeConectado(admin),
    escenarioActivo(admin),
  ]);
  const codigos = await listarCodigos(admin);
  const proximoDomingo = venceSugerido();
  const fechaHora = (iso: string | null) => (iso ? new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(iso)) : "no vence");
  const url = `${sitio()}/en-vivo/escenario?clave=${claveEscenario()}`;
  const hora = (iso: string | null) => (iso ? new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(iso)) : "");
  const cierre = new Date(horaCierre(estado));
  const horaInput = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "America/Bogota" }).format(cierre);
  const despedida = despedidaReciente(estado);
  const punto = (ok: boolean) => <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-exito" : "bg-peligro"}`} />;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Sibila en vivo</h1>
        <p className="mt-2 text-texto-suave">
          Directos de YouTube donde Sibila lee en voz alta: tarot, aura, numerología y horóscopo a quien escribe en el chat, y la taza de chocolate o la mano de quien sube la foto en{" "}
          <a href="/vivo" className="text-oro-suave underline">miarcana.com/vivo</a> (el QR sale en pantalla).
        </p>
      </div>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Estado</h2>
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-center gap-2">{punto(conectado)} YouTube {conectado ? "conectado" : "sin conectar (conéctalo en /admin/redes)"}</li>
          <li className="flex items-center gap-2">{punto(vozConfigurada())} Voz de Sibila {vozConfigurada() ? "activa" : "sin configurar (sin voz, solo subtítulos)"}</li>
          <li className="flex items-center gap-2">{punto(transmitiendo)} Escenario {transmitiendo ? `transmitiendo (último pedido ${hora(estado?.latido_en ?? null)})` : "apagado"}</li>
          <li className="flex items-center gap-2">{punto(Boolean(estado?.live_chat_id))} Directo de YouTube {estado?.live_chat_id ? "encontrado: leyendo el chat" : "no encontrado todavía (se busca solo cuando el escenario está prendido)"}</li>
          <li className="flex items-center gap-2">
            {punto(Boolean(estado?.fb_live_id))} Directo de Facebook{" "}
            {!metaConfigurado()
              ? "sin token de la página (META_PAGE_TOKEN)"
              : estado?.fb_live_id
                ? "encontrado: leyendo los comentarios"
                : `no encontrado todavía${estado?.fb_detalle ? ` (${estado.fb_detalle})` : " (se busca solo cuando el escenario está prendido)"}`}
          </li>
          <li className="text-texto-suave">Lecturas hoy: {leidasHoy ?? 0} de {maximoDiario()} (tope diario por gasto de voz)</li>
        </ul>
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Escenario para OBS</h2>
        <p className="text-sm text-texto-suave">Esta dirección es secreta: quien la tenga puede mover la fila. Pégala en OBS como fuente de navegador.</p>
        <DireccionEscenario url={url} />
        <ol className="list-decimal space-y-1 pl-5 text-sm text-texto-suave">
          <li>OBS → Fuentes → <strong>+</strong> → <strong>Navegador</strong>. URL: la de arriba. Ancho 1920, alto 1080. Marca «Controlar el audio a través de OBS».</li>
          <li>En YouTube Studio → <strong>Crear → Emitir en directo</strong> → copia la <strong>clave de transmisión</strong>.</li>
          <li>OBS → Ajustes → Emisión → Servicio YouTube → pega la clave. Luego <strong>Iniciar transmisión</strong>.</li>
          <li>Al minuto, el estado de arriba debe decir «Directo encontrado». Sibila empieza a leer el chat.</li>
        </ol>
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Cierre</h2>
        <p className="text-sm text-texto-suave">
          {despedida
            ? `Sibila ya se despidió (${hora(despedida)}): el escenario muestra la pantalla final. Ya puedes «Finalizar transmisión» en OBS. Si quieres seguir, pon una hora más tarde.`
            : `Sibila se despide ${fechaHora(cierre.toISOString())}: termina la lectura en curso, dice cuántas consultas leyó, invita a suscribirse y queda la pantalla final. Después finaliza la transmisión en OBS.`}
        </p>
        <CierreDirecto hora={horaInput} />
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Código de oferta</h2>
        <p className="text-sm text-texto-suave">
          Créditos extra en cualquier compra, sin cambiar el precio. La gente entra por <strong>miarcana.com/c/CÓDIGO</strong> o lo escribe en /creditos. Sibila dice el código vigente en sus frases del directo.
        </p>
        {codigos.length > 0 && (
          <ul className="divide-y divide-borde text-sm">
            {codigos.map((c) => (
              <li key={c.codigo} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                <span className={`font-mono font-semibold ${c.activo ? "text-oro-suave" : "text-texto-suave line-through"}`}>{c.codigo}</span>
                <span>+{c.creditos_extra} créditos</span>
                <span className="text-texto-suave">{c.usos} uso{c.usos === 1 ? "" : "s"}{c.cupo != null ? ` de ${c.cupo}` : ""}</span>
                <span className="text-texto-suave">vence: {fechaHora(c.vence_en)}</span>
                {c.nota && <span className="text-xs text-texto-suave">· {c.nota}</span>}
                <AlternarCodigo codigo={c.codigo} activo={c.activo} />
              </li>
            ))}
          </ul>
        )}
        <CrearCodigo venceSugerido={proximoDomingo} />
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Agregar una consulta</h2>
        <p className="text-sm text-texto-suave">Pasa primero en la fila. Sirve para probar el escenario sin directo o para leerle a alguien que te escribió por otro lado.</p>
        <PreguntaManual />
      </section>

      <section className="tarjeta space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold">En la fila ({fila?.length ?? 0})</h2>
          <VaciarCola />
        </div>
        {fila?.length ? (
          <ul className="divide-y divide-borde text-sm">
            {fila.map((p) => (
              <li key={p.id} className="flex flex-wrap gap-x-3 py-2">
                <span className="w-16 text-texto-suave">{hora(p.creado_en)}</span>
                <span className="w-28">{NOMBRE_TIPO[p.tipo]}</span>
                <span className="w-28 text-texto-suave">{ORIGEN[p.origen]}</span>
                <span className="font-semibold">{p.autor}</span>
                {p.estado === "leyendo" && <span className="text-oro-suave">leyendo…</span>}
                {p.texto && <span className="basis-full text-texto-suave">«{p.texto}»</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-texto-suave">Nada en la fila.</p>
        )}
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Últimas lecturas</h2>
        {leidas?.length ? (
          <ul className="space-y-3 text-sm">
            {leidas.map((p) => (
              <li key={p.id} className="rounded-xl border border-borde p-3">
                <p>
                  <span className="text-texto-suave">{hora(p.leida_en)}</span> · {NOMBRE_TIPO[p.tipo]} · <strong>{p.autor}</strong>{" "}
                  <span className={p.estado === "leida" ? "text-exito" : "text-peligro"}>{p.estado === "leida" ? "leída" : "omitida"}</span>
                </p>
                {p.texto && <p className="text-texto-suave">«{p.texto}»</p>}
                {p.lectura && <p className="mt-1">{p.lectura}</p>}
                {p.estado === "omitida" && p.detalle && <p className="mt-1 text-xs text-texto-suave">{p.detalle}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-texto-suave">Todavía no hay lecturas.</p>
        )}
      </section>
    </div>
  );
}
