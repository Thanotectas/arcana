"use client";

import { useRef, useState } from "react";
import { LOGROS, logrosObtenidos, type DatosLogros } from "@/lib/juego/logros";

/** Botón para escuchar el mensaje de la carta en la voz de Sibila. */
export function VozSibila({ carta }: { carta: string }) {
  const [estado, setEstado] = useState<"listo" | "cargando" | "sonando" | "error">("listo");
  const [pedido, setPedido] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  function alternar() {
    const a = audio.current;
    if (!a) return;
    if (estado === "sonando") {
      a.pause();
      setEstado("listo");
      return;
    }
    setPedido(true);
    setEstado("cargando");
    a.play().catch(() => setEstado("error"));
  }

  return (
    <>
      <audio
        ref={audio}
        src={`/api/juego/voz?carta=${encodeURIComponent(carta)}`}
        preload={pedido ? "auto" : "none"}
        onPlaying={() => setEstado("sonando")}
        onEnded={() => setEstado("listo")}
        onError={() => pedido && setEstado("error")}
      />
      <button type="button" onClick={alternar} disabled={estado === "error"} className="boton boton-secundario inline-flex items-center gap-2">
        {estado === "sonando" ? (
          <span className="flex h-4 items-end gap-0.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="onda-voz w-1 rounded-full bg-oro" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </span>
        ) : (
          <span aria-hidden>{estado === "cargando" ? "⏳" : "🔊"}</span>
        )}
        {estado === "sonando" ? "Sibila te está hablando…" : estado === "cargando" ? "Sibila toma aire…" : estado === "error" ? "La voz no está disponible ahora" : "Escúchalo en la voz de Sibila"}
      </button>
    </>
  );
}

const VISTOS = "arcana-logros-vistos";
const medalla = (id: string) => `/juego/logros/${id}.webp`;

/** Logros conseguidos y por conseguir; los recién ganados se destacan una vez. */
export function Logros({ datos }: { datos: DatosLogros }) {
  const obtenidos = logrosObtenidos(datos);
  const [nuevos] = useState<Set<string>>(() => {
    try {
      const vistos = new Set<string>(JSON.parse(localStorage.getItem(VISTOS) ?? "[]") as string[]);
      const recien = new Set([...obtenidos].filter((id) => !vistos.has(id)));
      localStorage.setItem(VISTOS, JSON.stringify([...obtenidos]));
      return recien;
    } catch {
      return new Set();
    }
  });
  const recien = LOGROS.filter((l) => nuevos.has(l.id));
  return (
    <div className="space-y-3 text-left">
      {recien.length > 0 && (
        <div className="logro-nuevo rounded-xl border border-oro/60 bg-oro/10 p-3 text-center text-sm">
          <div className="mb-2 flex justify-center gap-2">
            {recien.slice(0, 4).map((l) => (
              // eslint-disable-next-line @next/next/no-img-element -- medalla estática
              <img key={l.id} src={medalla(l.id)} alt="" className="h-20 w-20 drop-shadow-[0_0_14px_rgba(241,217,154,0.7)]" />
            ))}
          </div>
          {recien.length === 1 ? "¡Nuevo logro!" : `¡${recien.length} logros nuevos!`}{" "}
          {recien.map((l, i) => (
            <span key={l.id}>
              {i > 0 && " · "}
              <strong>
                {l.nombre}
              </strong>
              {recien.length === 1 && ` · ${l.descripcion}`}
            </span>
          ))}
        </div>
      )}
      <p className="text-center text-sm text-texto-suave">
        Logros: <strong className="text-texto">{obtenidos.size}</strong> de {LOGROS.length}
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {LOGROS.map((l) => {
          const tiene = obtenidos.has(l.id);
          return (
            <div
              key={l.id}
              title={`${l.nombre}: ${l.descripcion}`}
              className={`flex flex-col items-center text-center ${nuevos.has(l.id) ? "logro-nuevo" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- medalla estática */}
              <img
                src={medalla(l.id)}
                alt={tiene ? l.nombre : `${l.nombre} (por conseguir)`}
                loading="lazy"
                className={`aspect-square w-full ${tiene ? "drop-shadow-[0_0_10px_rgba(241,217,154,0.55)]" : "opacity-35 grayscale"}`}
              />
              <span className={`mt-1 line-clamp-2 text-[10px] leading-tight ${tiene ? "text-texto" : "text-texto-suave"}`}>{l.nombre}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TUTORIAL = "arcana-juego-tutorial";
const PASOS = [
  { icono: "🔮", titulo: "Sibila escondió una carta", texto: "Cada día esconde una de las 78 cartas del tarot. Es la misma para todos." },
  { icono: "🃏", titulo: "Elige grupo y carta", texto: "Morado = coincide. ⬆️ la escondida tiene un número mayor, ⬇️ menor. Las que ya no pueden ser se apagan." },
  { icono: "✨", titulo: "Escucha sus pistas", texto: "Con cada fallo, Sibila te da una pista y te dice si estás frío ❄️ o caliente 🔥. Tienes 6 intentos." },
];

/** Tres pasos animados la primera vez que alguien juega. */
export function Tutorial() {
  const [paso, setPaso] = useState<number | null>(() => {
    try {
      return localStorage.getItem(TUTORIAL) ? null : 0;
    } catch {
      return null;
    }
  });
  if (paso === null) return null;
  const cerrar = () => {
    try {
      localStorage.setItem(TUTORIAL, "1");
    } catch {
      /* nada */
    }
    setPaso(null);
  };
  const p = PASOS[paso];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-noche/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Cómo se juega">
      <div key={paso} className="tarjeta burbuja-entra w-full max-w-sm space-y-4 p-6 text-center">
        <p className="text-5xl">{p.icono}</p>
        <p className="font-display text-2xl">{p.titulo}</p>
        <p className="text-sm text-texto-suave">{p.texto}</p>
        <div className="flex justify-center gap-1.5" aria-hidden>
          {PASOS.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i === paso ? "bg-oro" : "bg-superficie-2"}`} />
          ))}
        </div>
        <div className="flex justify-between gap-3">
          <button type="button" onClick={cerrar} className="text-sm text-texto-suave underline">
            Saltar
          </button>
          <button type="button" onClick={() => (paso < PASOS.length - 1 ? setPaso(paso + 1) : cerrar())} className="boton boton-primario px-5 py-2">
            {paso < PASOS.length - 1 ? "Siguiente" : "¡A jugar!"}
          </button>
        </div>
      </div>
    </div>
  );
}
