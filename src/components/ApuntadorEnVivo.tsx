"use client";

import { useEffect, useState } from "react";

type Evento =
  | { t: "lectura"; lectura: { autor: string; tipo: string; pregunta: string; cartas: { nombre: string; posicion?: string }[] | null; texto: string } }
  | { t: "frase"; texto: string }
  | { t: "pausa"; on: boolean }
  | { t: "cierre"; estado: string };

/** Lo que se ve en pantalla, para presentarlo en voz alta («Vamos con la carta astral de Marta…»). */
const NOMBRE_TIPO: Record<string, string> = {
  tarot: "🃏 Tarot",
  carta: "🪐 Carta astral (en pantalla se dibuja su carta)",
  sinastria: "💞 Sinastría (en pantalla, las dos cartas)",
  horoscopo: "✨ Horóscopo (en pantalla, el cielo de hoy)",
  numerologia: "🔢 Numerología",
  aura: "🌈 Aura",
  pendulo: "🔮 Péndulo",
  iching: "☯️ I Ching",
  runas: "ᚱ Runas",
  lenormand: "🃏 Lenormand",
  baraja: "🃏 Baraja española",
  chino: "🐉 Horóscopo chino",
  huevo: "🥚 Limpia con huevo",
  chocolate: "☕ Taza de chocolate",
  mano: "✋ Lectura de mano",
};

/**
 * Apuntador: sigue lo que publica el escenario principal (el mismo canal del espejo) y lo muestra grande para que
 * el presentador lo lea en voz alta. En TikTok así todo el audio del directo es su voz, en vivo.
 */
export function Apuntador({ clave }: { clave: string }) {
  const [evento, setEvento] = useState<Extract<Evento, { t: "lectura" | "frase" }> | null>(null);
  const [pausa, setPausa] = useState(false);
  const [error, setError] = useState("");
  const [tamano, setTamano] = useState(34);

  useEffect(() => {
    let activo = true;
    let visto = -1;
    (async () => {
      while (activo) {
        try {
          const r = await fetch(`/api/en-vivo/espejo?desde=${visto}&clave=${encodeURIComponent(clave)}`, { cache: "no-store" });
          const d = (await r.json()) as { seq: number; evento?: Evento | null; error?: string };
          if (d.error === "migracion") setError("Falta la migración 0051 (escenario espejo): sin ella el apuntador no recibe nada.");
          else setError("");
          if (d.seq > visto && d.evento) {
            visto = d.seq;
            if (d.evento.t === "pausa") setPausa(d.evento.on);
            else if (d.evento.t === "lectura" || d.evento.t === "frase") {
              setPausa(false);
              setEvento(d.evento);
            }
          } else if (d.seq > visto) visto = d.seq;
        } catch {
          setError("Sin conexión: reintentando…");
        }
        await new Promise((r) => setTimeout(r, 800));
      }
    })();
    return () => {
      activo = false;
    };
  }, [clave]);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#07040f] p-6 text-texto sm:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Apuntador · lee en voz alta lo que escribe Sibila</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setTamano((t) => Math.max(22, t - 4))} className="rounded-full border border-borde px-3 py-1">
              A−
            </button>
            <button type="button" onClick={() => setTamano((t) => Math.min(64, t + 4))} className="rounded-full border border-borde px-3 py-1">
              A+
            </button>
          </div>
        </div>
        {error && <p className="rounded-xl bg-red-900/70 p-3 text-red-50">{error}</p>}
        {pausa && <p className="rounded-xl border border-oro/50 bg-oro/10 p-3 text-center text-xl text-oro-suave">⏸ Pausa: habla tú con calma; Sibila espera.</p>}
        {!evento ? (
          <p className="text-2xl text-texto-suave">Esperando al escenario… (abre el escenario con &amp;voz=presentador en LIVE Studio)</p>
        ) : evento.t === "lectura" ? (
          <div key={evento.lectura.texto} className="aparecer space-y-4">
            <p className="text-2xl text-violeta-suave">
              {NOMBRE_TIPO[evento.lectura.tipo] ?? evento.lectura.tipo} para <strong className="text-oro-suave">{evento.lectura.autor}</strong>
            </p>
            {evento.lectura.pregunta && <p className="font-display text-3xl text-oro-suave">«{evento.lectura.pregunta}»</p>}
            {Boolean(evento.lectura.cartas?.length) && (
              <p className="text-xl text-texto-suave">
                {evento.lectura.cartas?.map((c) => `${c.posicion ? `${c.posicion}: ` : ""}${c.nombre}`).join(" · ")}
              </p>
            )}
            <p className="leading-relaxed" style={{ fontSize: tamano }}>
              {evento.lectura.texto}
            </p>
          </div>
        ) : (
          <div key={evento.texto} className="aparecer space-y-3">
            <p className="text-lg uppercase tracking-[0.2em] text-violeta-suave">Mientras llega la siguiente pregunta (dilo con tus palabras)</p>
            <p className="leading-relaxed" style={{ fontSize: tamano }}>
              {evento.texto}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
