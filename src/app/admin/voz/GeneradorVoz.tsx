"use client";

import { useState } from "react";
import { IDIOMAS, NOMBRES_IDIOMA, type Idioma } from "@/lib/i18n/idiomas";
import { accionVozSibila, type ResultadoVoz } from "./acciones";

type Fila = ResultadoVoz & { estado: "esperando" | "trabajando" | "listo" | "error" };

export function GeneradorVoz({ quedan }: { quedan: number | null }) {
  const [nombre, setNombre] = useState("");
  const [guion, setGuion] = useState("");
  const [idiomas, setIdiomas] = useState<Idioma[]>(["es"]);
  const [filas, setFilas] = useState<Record<string, Fila>>({});
  const [ocupado, setOcupado] = useState(false);

  const costo = guion.trim().length * idiomas.length;
  const alternar = (i: Idioma) => setIdiomas((v) => (v.includes(i) ? v.filter((x) => x !== i) : [...v, i]));

  async function correr(soloTexto: boolean) {
    setOcupado(true);
    // De a dos idiomas a la vez: más rápido sin saturar ElevenLabs.
    const cola = [...idiomas];
    const trabajar = async () => {
      for (let i = cola.shift(); i; i = cola.shift()) {
        const previo = filas[i]?.guion;
        setFilas((f) => ({ ...f, [i]: { ...f[i], idioma: i, estado: "trabajando", error: undefined } }));
        const r = await accionVozSibila({ guion, idioma: i, nombre: nombre || "video", soloTexto, guionTraducido: soloTexto ? undefined : previo });
        setFilas((f) => ({ ...f, [i]: { ...f[i], ...r, url: r.url ?? f[i]?.url, estado: r.error ? "error" : "listo" } }));
      }
    };
    await Promise.all([trabajar(), trabajar()]);
    setOcupado(false);
  }

  return (
    <div className="space-y-5">
      <label className="block space-y-1 text-sm">
        <span className="text-texto-suave">Nombre del video (para los archivos)</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="49 limpia con huevo" className="campo w-full" />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-texto-suave">Guion en español</span>
        <textarea value={guion} onChange={(e) => setGuion(e.target.value)} rows={10} className="campo w-full font-mono text-sm" placeholder={"Bienvenida al Arcano de Sibila. Hoy: …"} />
      </label>
      <div className="space-y-2">
        <p className="text-sm text-texto-suave">Idiomas</p>
        <div className="flex flex-wrap gap-2">
          {IDIOMAS.map((i) => (
            <button key={i} type="button" onClick={() => alternar(i)} className={`rounded-full border px-3 py-1 text-sm ${idiomas.includes(i) ? "border-oro bg-oro/15 text-oro-suave" : "border-borde text-texto-suave"}`}>
              {NOMBRES_IDIOMA[i]}
            </button>
          ))}
        </div>
        <p className="text-xs text-texto-suave">
          Gasta unos {costo.toLocaleString("es-CO")} créditos de voz{quedan !== null ? ` (quedan ${quedan.toLocaleString("es-CO")})` : ""}. Ver las traducciones no gasta voz.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={ocupado || guion.trim().length < 10 || !idiomas.length} onClick={() => correr(true)} className="boton boton-secundario">1. Ver traducciones</button>
        <button type="button" disabled={ocupado || guion.trim().length < 10 || !idiomas.length} onClick={() => correr(false)} className="boton boton-primario">2. Generar voces</button>
      </div>
      <div className="space-y-4">
        {idiomas.filter((i) => filas[i]).map((i) => {
          const f = filas[i];
          return (
            <section key={i} className="tarjeta space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">{NOMBRES_IDIOMA[i]}</h2>
                <span className="text-xs text-texto-suave">{f.estado === "trabajando" ? "Trabajando…" : f.estado === "error" ? "Error" : f.url ? "Voz lista" : "Traducción lista"}</span>
              </div>
              {f.error && <p className="text-sm text-peligro">{f.error}</p>}
              {f.guion !== undefined && (
                <textarea
                  value={f.guion}
                  onChange={(e) => setFilas((x) => ({ ...x, [i]: { ...x[i], guion: e.target.value } }))}
                  rows={6}
                  dir={i === "ar" ? "rtl" : "ltr"}
                  className="campo w-full text-sm"
                  aria-label={`Guion en ${NOMBRES_IDIOMA[i]} (puedes corregirlo antes de generar la voz)`}
                />
              )}
              {f.url && (
                <div className="flex flex-wrap items-center gap-3">
                  <audio controls src={f.url} className="w-full max-w-md" />
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-sm text-oro-suave underline">Descargar MP3</a>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
