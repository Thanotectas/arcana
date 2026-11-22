"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useJ } from "@/lib/juego/useJuego";
import { LOCALE_INTL, type Idioma } from "@/lib/i18n/idiomas";

interface Liga {
  codigo: string;
  nombre: string;
  miembros: number;
  creador: boolean;
}
interface Fila {
  puesto: number;
  apodo: string;
  puntos: number;
  dias: number;
  yo: boolean;
}
interface Detalle {
  codigo: string;
  nombre: string;
  miembros: number;
  soyMiembro: boolean;
  desde: string;
  hasta: string;
  tabla: Fila[];
  sesion: boolean;
}

const ERRORES: Record<string, string> = {
  nombre: "Ponle un nombre de 3 a 40 letras.",
  limite: "Ya estás en 10 ligas: sal de alguna para entrar a otra.",
  no_existe: "No encontré una liga con ese código. Revisa las 6 letras.",
  llena: "Esa liga ya está llena (200 personas).",
  guardar: "No pude guardarlo. Intenta de nuevo en un momento.",
  formato: "Usa de 3 a 20 letras o números para tu apodo.",
  vetado: "Ese apodo no se puede usar. Prueba con otro.",
  ocupado: "Alguien ya tiene ese apodo. Prueba con otro.",
};
const MEDALLA = ["🥇", "🥈", "🥉"];

async function postLiga(cuerpo: Record<string, string>) {
  const r = await fetch("/api/juego/ligas", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
  return (await r.json().catch(() => ({ ok: false, error: "guardar" }))) as { ok: boolean; codigo?: string; error?: string };
}

/** Para entrar a una liga hace falta apodo (es lo único que ven las demás personas). */
function PedirApodo({ alListo }: { alListo: () => void }) {
  const { t } = useJ();
  const [apodo, setApodo] = useState("");
  const [error, setError] = useState("");
  async function guardar() {
    const r = await fetch("/api/juego/apodo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ apodo }) });
    const d = (await r.json().catch(() => ({ ok: false }))) as { ok: boolean; error?: string };
    if (d.ok) alListo();
    else setError(t(ERRORES[d.error ?? ""] ?? ERRORES.guardar));
  }
  return (
    <div className="space-y-2 rounded-xl border border-oro/40 bg-oro/5 p-3">
      <p className="text-sm">{t("Primero elige tu apodo: es lo único que verán en la liga (nunca tu nombre ni tu correo).")}</p>
      <div className="flex gap-2">
        <input value={apodo} onChange={(e) => setApodo(e.target.value)} maxLength={20} placeholder={t("Tu apodo")} aria-label={t("Apodo")} className="campo min-w-0 flex-1 text-sm" />
        <button type="button" onClick={() => void guardar()} disabled={apodo.trim().length < 3} className="boton boton-primario shrink-0 px-4 py-2">
          {t("Guardar")}
        </button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

/** /juego/ligas: mis ligas, crear una y unirse con un código. */
export function MisLigas() {
  const { t } = useJ();
  const router = useRouter();
  const [ligas, setLigas] = useState<Liga[] | null>(null);
  const [sinSesion, setSinSesion] = useState(false);
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [pideApodo, setPideApodo] = useState<null | (() => void)>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch("/api/juego/ligas", { cache: "no-store" })
      .then(async (r) => {
        if (!vivo) return;
        if (r.status === 401) return setSinSesion(true);
        const d = (await r.json()) as { ligas: Liga[] };
        if (vivo) setLigas(d.ligas);
      })
      .catch(() => vivo && setLigas([]));
    return () => {
      vivo = false;
    };
  }, []);

  async function hacer(cuerpo: Record<string, string>) {
    setOcupado(true);
    setError("");
    const r = await postLiga(cuerpo);
    setOcupado(false);
    if (r.ok && r.codigo) return router.push(`/juego/liga/${r.codigo}`);
    if (r.error === "sin_apodo") return setPideApodo(() => () => void hacer(cuerpo));
    setError(t(ERRORES[r.error ?? ""] ?? ERRORES.guardar));
  }

  if (sinSesion) {
    return (
      <div className="tarjeta space-y-3 p-5 text-center">
        <p>{t("Las ligas son para jugar con tu cuenta: así tus puntos cuentan aunque cambies de celular.")}</p>
        <Link href="/entrar?volver=/juego/ligas" className="boton boton-primario inline-flex">
          {t("Entrar o crear mi cuenta gratis")}
        </Link>
      </div>
    );
  }
  if (!ligas) return <div className="tarjeta h-40 animate-pulse" />;

  return (
    <div className="space-y-5">
      {pideApodo && (
        <PedirApodo
          alListo={() => {
            const seguir = pideApodo;
            setPideApodo(null);
            seguir();
          }}
        />
      )}

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl">{t("Tus ligas")}</h2>
        {ligas.length === 0 ? (
          <p className="text-sm text-texto-suave">{t("Todavía no estás en ninguna. Crea una e invita a tu gente, o únete con el código que te pasaron.")}</p>
        ) : (
          <ul className="space-y-2">
            {ligas.map((l) => (
              <li key={l.codigo}>
                <Link href={`/juego/liga/${l.codigo}`} className="flex items-center justify-between rounded-xl border border-borde bg-superficie-2 px-3 py-2.5 transition hover:border-oro/60">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{l.nombre}</span>
                    <span className="text-xs text-texto-suave">
                      {l.miembros} {l.miembros === 1 ? t("persona") : t("personas")} · {t("código")} {l.codigo}
                      {l.creador ? ` · ${t("la creaste tú")}` : ""}
                    </span>
                  </span>
                  <span className="text-oro-suave">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="tarjeta space-y-2 p-5">
          <h2 className="font-display text-xl">{t("👥 Crear una liga")}</h2>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={40} placeholder={t("Ej.: Las brujas de la oficina")} aria-label={t("Nombre de la liga")} className="campo w-full text-sm" />
          <button type="button" disabled={ocupado || nombre.trim().length < 3} onClick={() => void hacer({ accion: "crear", nombre })} className="boton boton-primario w-full">
            {t("Crear y obtener el enlace")}
          </button>
        </div>
        <div className="tarjeta space-y-2 p-5">
          <h2 className="font-display text-xl">{t("🔑 Unirme con un código")}</h2>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="ABC123"
            aria-label={t("Código de la liga")}
            className="campo w-full text-center font-mono text-lg tracking-[0.3em] uppercase"
          />
          <button type="button" disabled={ocupado || codigo.replace(/[^A-Z0-9]/g, "").length !== 6} onClick={() => void hacer({ accion: "unirse", codigo })} className="boton boton-secundario w-full">
            {t("Unirme")}
          </button>
        </div>
      </section>
      {error && <p className="text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}

function fechaCorta(f: string, idioma: Idioma = "es") {
  return new Intl.DateTimeFormat(LOCALE_INTL[idioma], { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${f}T12:00:00Z`));
}

/** /juego/liga/CODIGO: la tabla de la semana de la liga, unirse e invitar. */
export function LigaDetalle({ codigo }: { codigo: string }) {
  const { t, idioma } = useJ();
  const router = useRouter();
  const [d, setD] = useState<Detalle | null | "no">(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [pideApodo, setPideApodo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/juego/ligas/${codigo}`, { cache: "no-store" })
      .then(async (r) => {
        if (!vivo) return;
        if (r.status === 404) return setD("no");
        setD((await r.json()) as Detalle);
      })
      .catch(() => vivo && setD("no"));
    return () => {
      vivo = false;
    };
  }, [codigo, version]);

  async function unirme() {
    setError("");
    const r = await postLiga({ accion: "unirse", codigo });
    if (r.ok) return setVersion((v) => v + 1);
    if (r.error === "sin_apodo") return setPideApodo(true);
    setError(t(ERRORES[r.error ?? ""] ?? ERRORES.guardar));
  }

  if (d === null) return <div className="tarjeta h-60 animate-pulse" />;
  if (d === "no") {
    return (
      <div className="tarjeta space-y-3 p-5 text-center">
        <p>{t("No encontré esa liga. Puede que el código esté mal escrito o que la hayan cerrado.")}</p>
        <Link href="/juego/ligas" className="boton boton-primario inline-flex">
          {t("Ver mis ligas")}
        </Link>
      </div>
    );
  }
  const enlace = typeof window === "undefined" ? "" : `${window.location.origin}/juego/liga/${d.codigo}`;
  const invitacion = t("🔮 Únete a mi liga «{nombre}» en El Camino del Loco, el juego diario de tarot de Arcana. Cada día adivinamos la carta escondida y competimos en la tabla de la semana: {enlace}", { nombre: d.nombre, enlace });

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ text: invitacion });
        return;
      } catch {
        /* se copia */
      }
    }
    try {
      await navigator.clipboard.writeText(invitacion);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="tarjeta space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm text-texto-suave">
            {d.miembros} {d.miembros === 1 ? t("persona") : t("personas")} · {t("código")} <strong className="font-mono text-texto">{d.codigo}</strong>
          </p>
          <p className="shrink-0 text-xs text-texto-suave">
            {fechaCorta(d.desde, idioma)} – {fechaCorta(d.hasta, idioma)}
          </p>
        </div>
        <ol className="space-y-1">
          {d.tabla.map((f) => (
            <li key={f.puesto} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${f.yo ? "bg-oro/15 ring-1 ring-oro/50" : f.puesto <= 3 && f.puntos > 0 ? "bg-noche/40" : ""}`}>
              <span className="w-7 shrink-0 text-center tabular-nums">{f.puntos > 0 ? (MEDALLA[f.puesto - 1] ?? f.puesto) : "·"}</span>
              <span className="min-w-0 flex-1 truncate">
                {f.apodo}
                {f.yo && <span className="text-texto-suave"> {t("(tú)")}</span>}
              </span>
              <span className="shrink-0 text-xs text-texto-suave">{f.dias} d</span>
              <span className="w-12 shrink-0 text-right font-semibold tabular-nums">{f.puntos}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-texto-suave">{t("Mismos puntos que el ranking general. La tabla se reinicia cada lunes.")}</p>
      </section>

      {pideApodo && (
        <PedirApodo
          alListo={() => {
            setPideApodo(false);
            void unirme();
          }}
        />
      )}

      {!d.sesion ? (
        <div className="tarjeta space-y-3 p-5 text-center">
          <p>{t("Te invitaron a esta liga. Entra con tu cuenta (es gratis) para unirte y sumar tus puntos.")}</p>
          <Link href={`/entrar?volver=/juego/liga/${d.codigo}`} className="boton boton-primario inline-flex">
            {t("Entrar y unirme")}
          </Link>
        </div>
      ) : !d.soyMiembro ? (
        <div className="text-center">
          <button type="button" onClick={() => void unirme()} className="boton boton-primario">
            {t("Unirme a «{nombre}»", { nombre: d.nombre })}
          </button>
        </div>
      ) : (
        <div className="tarjeta space-y-3 p-5 text-center">
          <p className="font-semibold">{t("Invita a tu gente")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`https://wa.me/?text=${encodeURIComponent(invitacion)}`} target="_blank" rel="noopener noreferrer" className="boton boton-whatsapp">
              {t("Invitar por WhatsApp")}
            </a>
            <button type="button" onClick={() => void compartir()} className="boton boton-secundario">
              {copiado ? t("¡Copiado!") : t("Compartir enlace")}
            </button>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!confirm(t("¿Salir de «{nombre}»?", { nombre: d.nombre }))) return;
              await postLiga({ accion: "salir", codigo: d.codigo });
              router.push("/juego/ligas");
            }}
            className="text-xs text-texto-suave underline"
          >
            {t("Salir de la liga")}
          </button>
        </div>
      )}
      {error && <p className="text-center text-sm text-red-300">{error}</p>}

      <p className="text-center">
        <Link href="/juego" className="boton boton-primario inline-flex">
          {t("Jugar la carta de hoy")}
        </Link>
      </p>
    </div>
  );
}
