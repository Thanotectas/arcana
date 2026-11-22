"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { accionCierre } from "@/lib/en-vivo-acciones";

/** Parte de la pantalla donde está el chat, en fracciones (0 a 1) del ancho y el alto. */
interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Consulta {
  id: string;
  tipo: string;
  autor: string;
  texto: string | null;
  estado?: string;
  lectura?: string | null;
  esperaFecha?: boolean;
}
const NOMBRE_TIPO: Record<string, string> = {
  tarot: "Tarot",
  carta: "Carta astral",
  sinastria: "Sinastría",
  horoscopo: "Horóscopo",
  numerologia: "Numerología",
  aura: "Aura",
  pendulo: "Péndulo",
  iching: "I Ching",
  runas: "Runas",
  lenormand: "Lenormand",
  baraja: "Baraja española",
  chino: "Horóscopo chino",
  huevo: "Huevo",
  chocolate: "Taza",
  mano: "Mano",
};
interface Registro {
  hora: string;
  texto: string;
  tipo: "nueva" | "info" | "error";
}

const CLAVE_REGION = "arcana_pantalla_region";
const CADA_MS = 6000;
const ANCHO_MAX = 900;

function leerRegion(): Region | null {
  try {
    const r = JSON.parse(localStorage.getItem(CLAVE_REGION) ?? "null") as Region | null;
    return r && r.w > 0.02 && r.h > 0.02 ? r : null;
  } catch {
    return null;
  }
}

function guardarRegion(r: Region | null) {
  try {
    if (r) localStorage.setItem(CLAVE_REGION, JSON.stringify(r));
    else localStorage.removeItem(CLAVE_REGION);
  } catch {
    /* nada */
  }
}

const hora = () => new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());

/**
 * Comparte la ventana de TikTok LIVE Studio (o el chat en el navegador): cada pocos segundos se recorta el chat, Claude
 * lee los comentarios y las consultas entran solas a la fila de Sibila.
 */
export function LectorPantalla({ children }: { children?: ReactNode }) {
  const video = useRef<HTMLVideoElement | null>(null);
  const flujo = useRef<MediaStream | null>(null);
  const vistos = useRef<string[]>([]);
  const firma = useRef("");
  const ocupado = useRef(false);
  const [activo, setActivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [arrastre, setArrastre] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [registro, setRegistro] = useState<Registro[]>([]);
  const [cuentas, setCuentas] = useState({ capturas: 0, comentarios: 0, enFila: 0 });
  const [fila, setFila] = useState<Consulta[]>([]);
  const [ultima, setUltima] = useState<Consulta | null>(null);
  const [letra, setLetra] = useState(22);
  const [estadoEscenario, setEstadoEscenario] = useState<{ cierre: string; escenario: boolean; motivo: string | null } | null>(null);
  const [reabriendo, setReabriendo] = useState(false);

  // La fila y la última lectura de Sibila, cada 3 segundos.
  useEffect(() => {
    let vivo = true;
    const traer = () =>
      fetch("/api/en-vivo/pantalla", { cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<{ fila: Consulta[]; ultima: Consulta | null; cierre: string; escenario: boolean; motivo: string | null }>) : null))
        .then((d) => {
          if (!vivo || !d) return;
          setFila(d.fila);
          setUltima(d.ultima);
          setEstadoEscenario({ cierre: d.cierre, escenario: d.escenario, motivo: d.motivo });
        })
        .catch(() => null);
    void traer();
    const id = setInterval(traer, 3000);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  const anotar = (texto: string, tipo: Registro["tipo"] = "info") => setRegistro((r) => [{ hora: hora(), texto, tipo }, ...r].slice(0, 80));

  async function empezar() {
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 2 }, audio: false });
      flujo.current = s;
      if (video.current) {
        video.current.srcObject = s;
        await video.current.play().catch(() => null);
      }
      s.getVideoTracks()[0]?.addEventListener("ended", () => parar());
      setRegion((r) => r ?? leerRegion());
      setActivo(true);
      setPausado(false);
      anotar("Pantalla compartida. Marca con el mouse el recuadro del chat (arrastrando sobre la vista previa).");
    } catch {
      anotar("No se compartió la pantalla.", "error");
    }
  }

  function parar() {
    flujo.current?.getTracks().forEach((t) => t.stop());
    flujo.current = null;
    if (video.current) video.current.srcObject = null;
    setActivo(false);
  }

  useEffect(() => () => flujo.current?.getTracks().forEach((t) => t.stop()), []);

  // Cada pocos segundos: recorta el chat, y si cambió algo, lo manda a leer.
  useEffect(() => {
    if (!activo || pausado) return;
    const id = setInterval(async () => {
      const v = video.current;
      if (!v || ocupado.current) return;
      // El cuadro se toma directo de la pantalla compartida (sirve aunque esta pestaña quede detrás); si el navegador no
      // puede, del video de la vista previa.
      let cuadro: CanvasImageSource = v;
      let ancho = v.videoWidth;
      let alto = v.videoHeight;
      const pista = flujo.current?.getVideoTracks()[0];
      const Captura = (window as unknown as { ImageCapture?: new (t: MediaStreamTrack) => { grabFrame(): Promise<ImageBitmap> } }).ImageCapture;
      if (pista && Captura) {
        try {
          const bmp = await new Captura(pista).grabFrame();
          cuadro = bmp;
          ancho = bmp.width;
          alto = bmp.height;
        } catch {
          /* se usa el video */
        }
      }
      if (!ancho || !alto) return;
      const r = region ?? { x: 0, y: 0, w: 1, h: 1 };
      const sx = r.x * ancho;
      const sy = r.y * alto;
      const sw = r.w * ancho;
      const sh = r.h * alto;
      const escala = Math.min(1, ANCHO_MAX / sw);
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(sw * escala);
      lienzo.height = Math.round(sh * escala);
      const ctx = lienzo.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(cuadro, sx, sy, sw, sh, 0, 0, lienzo.width, lienzo.height);
      if (cuadro instanceof ImageBitmap) cuadro.close();
      // Si el chat no se movió desde la última captura, no se gasta una lectura.
      const mini = document.createElement("canvas");
      mini.width = 24;
      mini.height = 48;
      mini.getContext("2d")?.drawImage(lienzo, 0, 0, 24, 48);
      const px = mini.getContext("2d")?.getImageData(0, 0, 24, 48).data;
      const nueva = px ? Array.from(px.filter((_, i) => i % 4 === 0), (n) => n >> 4).join("") : "";
      if (nueva === firma.current) return;
      firma.current = nueva;
      ocupado.current = true;
      try {
        const res = await fetch("/api/en-vivo/pantalla", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imagen: lienzo.toDataURL("image/jpeg", 0.8), vistos: vistos.current }),
        });
        const d = (await res.json()) as { leidos?: number; nuevos?: { autor: string; texto: string; clave: string }[]; nuevas?: number; sumadas?: number; error?: string };
        if (!res.ok || d.error) {
          anotar(`No se pudo leer: ${d.error ?? res.status}`, "error");
          return;
        }
        const nuevos = d.nuevos ?? [];
        vistos.current = [...vistos.current, ...nuevos.map((n) => n.clave)].slice(-600);
        setCuentas((c) => ({ capturas: c.capturas + 1, comentarios: c.comentarios + nuevos.length, enFila: c.enFila + (d.nuevas ?? 0) }));
        if (d.nuevas || d.sumadas) anotar(`${d.nuevas ? `${d.nuevas} a la fila` : ""}${d.nuevas && d.sumadas ? " · " : ""}${d.sumadas ? `${d.sumadas} sumada(s) a su consulta` : ""}: ${nuevos.map((n) => `${n.autor}: «${n.texto}»`).join(" · ")}`, "nueva");
        else if (nuevos.length) anotar(`Leí ${nuevos.length} comentario(s): ninguno entra nuevo a la fila (no eran consultas o ya estaban). ${nuevos.map((n) => `${n.autor}: «${n.texto}»`).join(" · ")}`);
      } catch {
        anotar("Sin conexión con el servidor; reintento en unos segundos.", "error");
      } finally {
        ocupado.current = false;
      }
    }, CADA_MS);
    return () => clearInterval(id);
  }, [activo, pausado, region]);

  // Selección del recuadro del chat sobre la vista previa.
  function punto(e: React.PointerEvent<HTMLDivElement>) {
    const caja = e.currentTarget.getBoundingClientRect();
    return { x: Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width)), y: Math.min(1, Math.max(0, (e.clientY - caja.top) / caja.height)) };
  }
  const marco = arrastre
    ? { x: Math.min(arrastre.x0, arrastre.x1), y: Math.min(arrastre.y0, arrastre.y1), w: Math.abs(arrastre.x1 - arrastre.x0), h: Math.abs(arrastre.y1 - arrastre.y0) }
    : region;

  async function reabrir() {
    setReabriendo(true);
    const fd = new FormData();
    fd.set("hora", "23:59");
    const r = await accionCierre({}, fd).catch(() => ({ error: "No se pudo." }));
    anotar(r.error ? `No se pudo reabrir: ${r.error}` : "Directo reabierto hasta las 11:59 p. m. Si el escenario sigue en «Se acabó el tiempo», dale Actualizar en LIVE Studio.", r.error ? "error" : "info");
    setReabriendo(false);
  }

  return (
    <div className="space-y-4">
      {estadoEscenario && (
        <section
          className={`space-y-2 rounded-xl border p-3 text-sm ${estadoEscenario.escenario && estadoEscenario.cierre === "abierto" && !estadoEscenario.motivo ? "border-emerald-500/50 bg-emerald-900/20" : "border-red-400/60 bg-red-900/30"}`}
        >
          <p>
            <strong>Escenario:</strong>{" "}
            {estadoEscenario.escenario ? "✅ conectado (LIVE Studio lo tiene abierto)" : "❌ no está abierto. En LIVE Studio agrega o actualiza la fuente del escenario (/en-vivo/escenario…)."}
          </p>
          <p>
            <strong>Directo:</strong>{" "}
            {estadoEscenario.cierre === "abierto"
              ? "✅ abierto: Sibila lee la fila."
              : estadoEscenario.cierre === "terminado"
                ? "❌ cerrado («Se acabó el tiempo por esta noche»): Sibila no lee."
                : "⚠️ llegó la hora de cierre: Sibila se está despidiendo."}
          </p>
          {estadoEscenario.cierre !== "abierto" && (
            <button type="button" onClick={() => void reabrir()} disabled={reabriendo} className="boton boton-primario text-sm">
              {reabriendo ? "Reabriendo…" : "🔓 Reabrir el directo (hasta las 11:59 p. m.)"}
            </button>
          )}
          {estadoEscenario.motivo && <p className="text-red-200">⚠️ {estadoEscenario.motivo}</p>}
        </section>
      )}
      <section className="space-y-3 rounded-xl border border-oro/40 bg-superficie-2/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl">Lo que está en pantalla</h2>
          <div className="flex gap-1">
            <button type="button" onClick={() => setLetra((n) => Math.max(14, n - 2))} className="boton boton-secundario px-3 py-1 text-sm">
              A−
            </button>
            <button type="button" onClick={() => setLetra((n) => Math.min(44, n + 2))} className="boton boton-secundario px-3 py-1 text-sm">
              A+
            </button>
          </div>
        </div>
        {ultima ? (
          <div className="space-y-2">
            <p className="text-violeta-suave">
              {NOMBRE_TIPO[ultima.tipo] ?? ultima.tipo} para <strong className="text-oro-suave">{ultima.autor}</strong>
              {ultima.texto && <span className="text-texto-suave"> · «{ultima.texto}»</span>}
            </p>
            {ultima.lectura && (
              <p className="leading-relaxed" style={{ fontSize: letra }}>
                {ultima.lectura}
              </p>
            )}
          </div>
        ) : (
          <p className="text-texto-suave">Todavía no hay lecturas esta noche.</p>
        )}
      </section>

      <section className="space-y-2 rounded-xl border border-borde bg-superficie-2/40 p-4">
        <h2 className="font-display text-xl">Fila de Sibila ({fila.length})</h2>
        {fila.length === 0 ? (
          <p className="text-sm text-texto-suave">Nadie en la fila. Invita a escribir su signo y su pregunta, o «carta astral» con su fecha.</p>
        ) : (
          <ol className="space-y-1">
            {fila.map((c, i) => (
              <li key={c.id} className={`rounded-lg px-2 py-1.5 ${c.estado === "leyendo" ? "bg-oro/15 ring-1 ring-oro/50" : i === 0 ? "bg-noche/50" : ""}`}>
                <span className="text-texto-suave">{c.estado === "leyendo" ? "⏳ Sibila la prepara · " : `${i + 1}. `}</span>
                <strong className="text-oro-suave">{c.autor}</strong> <span className="text-xs text-violeta-suave">{NOMBRE_TIPO[c.tipo] ?? c.tipo}</span>
                {c.texto && <span className="block text-sm">«{c.texto}»</span>}
                {c.esperaFecha && <span className="block text-xs text-red-300">Espera la fecha de nacimiento: pídesela o agrégala abajo (ej.: carta astral 18/03/1996).</span>}
              </li>
            ))}
          </ol>
        )}
      </section>

      {children}

      <div className="flex flex-wrap gap-2">
        {!activo ? (
          <button type="button" onClick={() => void empezar()} className="boton boton-primario">
            👀 Compartir la pantalla de LIVE Studio
          </button>
        ) : (
          <>
            <button type="button" onClick={() => setPausado((p) => !p)} className="boton boton-secundario">
              {pausado ? "▶ Seguir leyendo" : "⏸ Pausar"}
            </button>
            <button type="button" onClick={parar} className="boton boton-secundario">
              ⏹ Dejar de compartir
            </button>
          </>
        )}
        {activo && (
          <button
            type="button"
            onClick={() => {
              // En TikTok LIVE Studio el «Chat LIVE» es la columna de la derecha, de la mitad hacia abajo.
              const r = { x: 0.77, y: 0.38, w: 0.23, h: 0.6 };
              setRegion(r);
              guardarRegion(r);
              firma.current = "";
              anotar("Recuadro puesto en la columna derecha (Chat LIVE). Si no cae justo sobre el chat, arrástralo tú en la vista previa.");
            }}
            className="boton boton-secundario text-sm"
          >
            🎯 Marcar el Chat LIVE (columna derecha)
          </button>
        )}
        {region && (
          <button
            type="button"
            onClick={() => {
              setRegion(null);
              guardarRegion(null);
            }}
            className="boton boton-secundario text-sm"
          >
            Borrar recuadro (leer toda la pantalla)
          </button>
        )}
      </div>

      <p className="text-sm text-texto-suave">
        {activo
          ? pausado
            ? "En pausa: no se lee nada."
            : `Leyendo cada ${CADA_MS / 1000} s ${region ? "el recuadro marcado" : "toda la pantalla (mejor marca solo el chat)"}. Capturas leídas: ${cuentas.capturas} · comentarios nuevos: ${cuentas.comentarios} · a la fila: ${cuentas.enFila}.`
          : "Elige la ventana de TikTok LIVE Studio. Deja esta pestaña abierta durante el directo (puede quedar detrás)."}
      </p>

      <div
        className={`relative max-w-xl overflow-hidden rounded-xl border border-borde bg-black ${activo ? "cursor-crosshair" : ""}`}
        onPointerDown={(e) => {
          if (!activo) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = punto(e);
          setArrastre({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
        }}
        onPointerMove={(e) => {
          if (!arrastre) return;
          const p = punto(e);
          setArrastre((a) => (a ? { ...a, x1: p.x, y1: p.y } : a));
        }}
        onPointerUp={() => {
          if (!arrastre || !marco) return;
          setArrastre(null);
          if (marco.w > 0.03 && marco.h > 0.03) {
            setRegion(marco);
            guardarRegion(marco);
            firma.current = "";
            anotar("Recuadro del chat guardado.");
          }
        }}
      >
        <video ref={video} muted playsInline className="block w-full select-none" />
        {activo && !marco && <p className="pointer-events-none absolute inset-x-0 top-2 text-center text-sm font-semibold text-oro drop-shadow">Arrastra el mouse sobre el «Chat LIVE» de esta imagen</p>}
        {!activo && <p className="p-10 text-center text-texto-suave">Aquí se ve la pantalla compartida.</p>}
        {activo && marco && (
          <div
            className="pointer-events-none absolute border-2 border-oro bg-oro/10"
            style={{ left: `${marco.x * 100}%`, top: `${marco.y * 100}%`, width: `${marco.w * 100}%`, height: `${marco.h * 100}%` }}
          />
        )}
      </div>

      <div className="space-y-1 text-sm">
        {registro.map((r, i) => (
          <p key={i} className={r.tipo === "nueva" ? "text-oro-suave" : r.tipo === "error" ? "text-red-300" : "text-texto-suave"}>
            <span className="tabular-nums opacity-60">{r.hora}</span> {r.texto}
          </p>
        ))}
      </div>
    </div>
  );
}
