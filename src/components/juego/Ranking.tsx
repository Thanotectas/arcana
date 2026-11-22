"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MAX_INTENTOS, PUNTOS_MAESTRO } from "@/lib/juego/carta-escondida";
import { useJ } from "@/lib/juego/useJuego";
import { LOCALE_INTL, type Idioma } from "@/lib/i18n/idiomas";

interface Fila {
  puesto: number;
  apodo: string;
  puntos: number;
  dias: number;
  yo: boolean;
}
interface Datos {
  desde: string;
  hasta: string;
  top: Fila[];
  yo: Fila | null;
  apodo: string | null;
  campeon: { apodo: string; puntos: number } | null;
  sesion: boolean;
}

const MEDALLA = ["🥇", "🥈", "🥉"];
const ERRORES: Record<string, string> = {
  formato: "Usa de 3 a 20 letras o números (puedes usar espacios, punto o guion).",
  vetado: "Ese apodo no se puede usar. Prueba con otro.",
  ocupado: "Alguien ya tiene ese apodo. Prueba con otro.",
  guardar: "No pude guardarlo. Intenta de nuevo en un momento.",
};

function fechaCorta(f: string, idioma: Idioma = "es") {
  return new Intl.DateTimeFormat(LOCALE_INTL[idioma], { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${f}T12:00:00Z`));
}

/** La tabla de la semana: los 10 primeros, tu puesto y, si no tienes apodo, el formulario para elegirlo. */
export function RankingSemanal() {
  const { t, idioma } = useJ();
  const [datos, setDatos] = useState<Datos | null>(null);
  const [version, setVersion] = useState(0);
  const [editando, setEditando] = useState(false);
  const [apodo, setApodo] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch("/api/juego/ranking", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Datos>) : null))
      .then((d) => vivo && d && setDatos(d))
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, [version]);

  async function guardar() {
    setGuardando(true);
    setError("");
    try {
      const r = await fetch("/api/juego/apodo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ apodo }) });
      const d = (await r.json()) as { ok: boolean; error?: string };
      if (d.ok) {
        setEditando(false);
        setVersion((v) => v + 1);
      } else setError(t(ERRORES[d.error ?? ""] ?? ERRORES.guardar));
    } catch {
      setError(t(ERRORES.guardar));
    } finally {
      setGuardando(false);
    }
  }

  if (!datos) return null;
  const yoFuera = datos.yo && (!datos.yo.apodo || !datos.top.some((f) => f.yo));
  const pedirApodo = datos.sesion && (!datos.apodo || editando);

  return (
    <div className="space-y-3 rounded-xl border border-oro/30 bg-superficie-2/60 p-4 text-start text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-xl">{t("🏆 Ranking de la semana")}</p>
        <p className="shrink-0 text-xs text-texto-suave">
          {fechaCorta(datos.desde, idioma)} – {fechaCorta(datos.hasta, idioma)}
        </p>
      </div>
      <p className="rounded-lg bg-oro/10 px-2 py-1.5 text-xs">
        {t("🎁 Cada lunes el podio gana créditos para sus lecturas:")} <strong>🥇 3 · 🥈 2 · 🥉 1</strong>
      </p>
      {datos.campeon && (
        <p className="text-xs text-texto-suave">
          {t("👑 La semana pasada ganó")} <strong className="text-oro-suave">{datos.campeon.apodo}</strong> {t("con {n} puntos.", { n: datos.campeon.puntos })}
        </p>
      )}

      {datos.top.length === 0 ? (
        <p className="rounded-lg bg-noche/40 p-3 text-center text-texto-suave">{t("Todavía nadie aparece esta semana. ¡El primer puesto está libre!")}</p>
      ) : (
        <ol className="space-y-1">
          {datos.top.map((f) => (
            <li key={f.puesto} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${f.yo ? "bg-oro/15 ring-1 ring-oro/50" : f.puesto <= 3 ? "bg-noche/40" : ""}`}>
              <span className="w-7 shrink-0 text-center tabular-nums">{MEDALLA[f.puesto - 1] ?? f.puesto}</span>
              <span className="min-w-0 flex-1 truncate">
                {f.apodo}
                {f.yo && <span className="text-texto-suave"> {t("(tú)")}</span>}
              </span>
              <span className="shrink-0 text-xs text-texto-suave">{f.dias} d</span>
              <span className="w-12 shrink-0 text-end font-semibold tabular-nums">{f.puntos}</span>
            </li>
          ))}
        </ol>
      )}

      {yoFuera && datos.yo && (
        <p className="rounded-lg bg-noche/40 px-2 py-1.5">
          {datos.yo.apodo ? (
            t("Vas en el puesto {p} con {n} puntos.", { p: datos.yo.puesto, n: datos.yo.puntos })
          ) : (
            t("Con tus {n} puntos irías en el puesto {p}. Elige un apodo para aparecer.", { p: datos.yo.puesto, n: datos.yo.puntos })
          )}
        </p>
      )}

      {pedirApodo ? (
        <div className="space-y-2 border-t border-borde pt-3">
          <p className="text-xs text-texto-suave">{t("En el ranking solo se ve el apodo que elijas: nunca tu nombre ni tu correo.")}</p>
          <div className="flex gap-2">
            <input
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apodo.trim() && void guardar()}
              maxLength={20}
              placeholder={t("Tu apodo, ej.: Luna Errante")}
              aria-label={t("Apodo para el ranking")}
              className="campo min-w-0 flex-1 text-sm"
            />
            <button type="button" onClick={() => void guardar()} disabled={guardando || apodo.trim().length < 3} className="boton boton-primario shrink-0 px-4 py-2">
              {guardando ? "…" : t("Guardar")}
            </button>
          </div>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      ) : datos.sesion ? (
        <p className="text-xs text-texto-suave">
          {t("Apareces como")} <strong className="text-texto">{datos.apodo}</strong> ·{" "}
          <button
            type="button"
            onClick={() => {
              setApodo(datos.apodo ?? "");
              setEditando(true);
            }}
            className="underline"
          >
            {t("cambiar")}
          </button>
        </p>
      ) : (
        <p className="text-xs text-texto-suave">
          <Link href="/entrar?volver=/juego" className="text-oro-suave underline">
            {t("Entra con tu cuenta")}
          </Link>{" "}
          {t("para sumar puntos y aparecer en el ranking.")}
        </p>
      )}

      <Link href="/juego/ligas" className="flex items-center justify-between rounded-lg border border-violeta-suave/40 bg-violeta/10 px-3 py-2 text-sm transition hover:border-violeta-suave">
        <span>{t("👥 Crea una liga con tu gente y compitan entre ustedes")}</span>
        <span className="inline-block text-oro-suave rtl:-scale-x-100">→</span>
      </Link>

      <details className="text-xs text-texto-suave">
        <summary className="cursor-pointer">{t("¿Cómo se suman los puntos?")}</summary>
        <p className="mt-1">
          {t(
            "Encontrarla en 1 intento da 7 puntos, en 2 da 6… y en {n} da 2. Jugar sin encontrarla da 1. El comodín de Sibila resta 1 y el reto maestro suma {p}. Si hay empate, gana quien jugó más días. La tabla se reinicia cada lunes (hora de Colombia).",
            { n: MAX_INTENTOS, p: PUNTOS_MAESTRO },
          )}
        </p>
      </details>
    </div>
  );
}
