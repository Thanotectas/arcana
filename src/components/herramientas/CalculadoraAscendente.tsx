"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { imagenSigno } from "@/lib/zodiaco";
import { plantilla } from "@/lib/i18n/formato";
import type { Idioma } from "@/lib/i18n/idiomas";
import { calcularAscendente, type ResultadoAscendente, type PuntoCalculado } from "@/lib/herramientas/ascendente-accion";
import type { IdSigno, TextosAscendente } from "@/lib/herramientas/ascendente-textos";

interface Lugar {
  nombre: string;
  region?: string;
  pais?: string;
  latitud: number;
  longitud: number;
  zonaHoraria: string;
}

interface RespuestaGeocodificacion {
  results?: { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone?: string }[];
}

type TextosCliente = Pick<TextosAscendente, "formulario" | "resultado" | "vedica" | "ascendentes" | "lunas">;

function etiquetaLugar(l: Lugar) {
  return [l.nombre, l.region, l.pais].filter(Boolean).join(", ");
}

function grados(g: number) {
  const d = Math.floor(g);
  const m = Math.floor((g - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
}

function gradosSegundos(g: number) {
  const d = Math.floor(g);
  const mTotal = (g - d) * 60;
  const m = Math.floor(mTotal);
  const s = Math.floor((mTotal - m) * 60);
  return `${d}°${String(m).padStart(2, "0")}′${String(s).padStart(2, "0")}″`;
}

/**
 * Calculadora pública de ascendente y Luna. El lugar se busca desde el navegador en la API abierta de Open-Meteo
 * (sin clave y con CORS), así no hace falta sesión; el cálculo lo hace el servidor con el motor de la carta astral.
 */
export function CalculadoraAscendente({
  textos,
  idioma,
  nombresSigno,
  rashis,
  nakshatras,
}: {
  textos: TextosCliente;
  idioma: Idioma;
  nombresSigno: Record<IdSigno, string>;
  rashis: Record<IdSigno, string>;
  nakshatras: string[];
}) {
  const f = textos.formulario;
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horaDesconocida, setHoraDesconocida] = useState(false);
  const [texto, setTexto] = useState("");
  const [opciones, setOpciones] = useState<Lugar[]>([]);
  const [seleccion, setSeleccion] = useState<Lugar | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [avisoLugar, setAvisoLugar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoAscendente | null>(null);
  const [calculando, iniciar] = useTransition();
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimaBusqueda = useRef(0);
  const bloqueResultado = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function buscar(valor: string) {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAvisoLugar(null);
    if (valor.trim().length < 2) {
      setOpciones([]);
      return;
    }
    temporizador.current = setTimeout(async () => {
      const marca = ++ultimaBusqueda.current;
      setBuscando(true);
      try {
        const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
        url.searchParams.set("name", valor.trim().slice(0, 64));
        url.searchParams.set("count", "6");
        url.searchParams.set("language", idioma);
        url.searchParams.set("format", "json");
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as RespuestaGeocodificacion;
        if (marca !== ultimaBusqueda.current) return; // llegó una búsqueda más nueva
        const lugares = (json.results ?? [])
          .filter((r) => r.timezone)
          .map((r) => ({ nombre: r.name, region: r.admin1, pais: r.country, latitud: r.latitude, longitud: r.longitude, zonaHoraria: r.timezone! }));
        setOpciones(lugares);
        setAbierto(true);
        setAvisoLugar(lugares.length ? null : f.sinResultados);
      } catch {
        if (marca === ultimaBusqueda.current) {
          setOpciones([]);
          setAvisoLugar(f.errorBusqueda);
        }
      } finally {
        if (marca === ultimaBusqueda.current) setBuscando(false);
      }
    }, 350);
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fecha || (!horaDesconocida && !hora)) {
      setError(f.errorDatos);
      return;
    }
    if (!seleccion) {
      setError(f.errorLugar);
      return;
    }
    iniciar(async () => {
      const r = await calcularAscendente({
        fecha,
        hora: horaDesconocida ? "12:00" : hora,
        horaDesconocida,
        latitud: seleccion.latitud,
        longitud: seleccion.longitud,
        zonaHoraria: seleccion.zonaHoraria,
      });
      if (!r.ok) {
        setError(r.error === "lugar" ? f.errorLugar : f.errorDatos);
        return;
      }
      setResultado(r);
      requestAnimationFrame(() => bloqueResultado.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  }

  if (resultado) {
    return (
      <div ref={bloqueResultado} className="space-y-6" aria-live="polite">
        <Resultado r={resultado} textos={textos} nombresSigno={nombresSigno} rashis={rashis} nakshatras={nakshatras} />
        <div className="text-center">
          <button type="button" className="boton boton-secundario" onClick={() => setResultado(null)}>
            {f.otraVez}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="asc-fecha">{f.fecha}</label>
          <input id="asc-fecha" type="date" className="campo" min="1900-01-01" max="2100-12-31" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div>
          <label className="etiqueta" htmlFor="asc-hora">{f.hora}</label>
          <input id="asc-hora" type="time" className="campo" value={hora} disabled={horaDesconocida} onChange={(e) => setHora(e.target.value)} required={!horaDesconocida} />
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm text-texto-suave">
        <input type="checkbox" className="mt-1" checked={horaDesconocida} onChange={(e) => setHoraDesconocida(e.target.checked)} />
        <span>
          {f.horaDesconocida}
          <span className="block text-xs">{f.horaNota}</span>
        </span>
      </label>
      <div className="relative">
        <label className="etiqueta" htmlFor="asc-lugar">{f.lugar}</label>
        <input
          id="asc-lugar"
          className="campo"
          value={texto}
          autoComplete="off"
          placeholder={f.lugarPlaceholder}
          onChange={(e) => {
            setTexto(e.target.value);
            setSeleccion(null);
            buscar(e.target.value);
          }}
          onFocus={() => opciones.length > 0 && setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          required
        />
        {abierto && opciones.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-borde bg-superficie-2 shadow-xl">
            {opciones.map((o, i) => (
              <li key={`${o.latitud}-${o.longitud}-${i}`}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-start text-sm hover:bg-violeta/20"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSeleccion(o);
                    setTexto(etiquetaLugar(o));
                    setAbierto(false);
                  }}
                >
                  {etiquetaLugar(o)}
                  <span className="block text-xs text-texto-suave" dir="ltr">{o.zonaHoraria}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 min-h-4 text-xs text-texto-suave">{buscando ? f.buscando : avisoLugar ?? (!seleccion && texto.length >= 2 ? f.eligeLugar : "")}</p>
      </div>
      {error && <p className="text-sm text-peligro" role="alert">{error}</p>}
      <div className="text-center">
        <button type="submit" className="boton boton-primario" disabled={calculando}>
          {calculando ? f.calculando : f.calcular}
        </button>
      </div>
    </form>
  );
}

function Resultado({
  r,
  textos,
  nombresSigno,
  rashis,
  nakshatras,
}: {
  r: ResultadoAscendente;
  textos: TextosCliente;
  nombresSigno: Record<IdSigno, string>;
  rashis: Record<IdSigno, string>;
  nakshatras: string[];
}) {
  const t = textos.resultado;
  const v = textos.vedica;
  const nombre = (p: PuntoCalculado) => nombresSigno[p.signo as IdSigno];
  const tarjetas: { clave: string; titulo: string; sub: string; punto: PuntoCalculado | null; encabezado?: string; texto: string; nota?: string }[] = [
    { clave: "sol", titulo: t.sol, sub: t.subSol, punto: r.sol, texto: t.textoSol },
    {
      clave: "ascendente",
      titulo: t.ascendente,
      sub: t.subAscendente,
      punto: r.ascendente,
      encabezado: r.ascendente ? plantilla(t.comoAscendente, { signo: nombre(r.ascendente) }) : undefined,
      texto: r.ascendente ? textos.ascendentes[r.ascendente.signo as IdSigno] : t.sinAscendente,
    },
    {
      clave: "luna",
      titulo: t.luna,
      sub: t.subLuna,
      punto: r.luna,
      encabezado: plantilla(t.comoLuna, { signo: nombre(r.luna) }),
      texto: textos.lunas[r.luna.signo as IdSigno],
      nota: r.lunaOtroSigno ? plantilla(t.lunaPuedeSer, { a: nombre(r.luna), b: nombresSigno[r.lunaOtroSigno as IdSigno] }) : undefined,
    },
  ];
  const rashi = r.vedica.rashi.signo as IdSigno;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {tarjetas.map((c, i) => (
          <article key={c.clave} className="tarjeta aparecer flex flex-col items-center p-5 text-center" style={{ animationDelay: `${i * 120}ms` }}>
            <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{c.titulo}</p>
            <p className="text-xs text-texto-suave">{c.sub}</p>
            {c.punto ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
                <img src={imagenSigno(c.punto.signo)} alt="" width={72} height={72} className="moneda-signo mt-3" />
                <p className="font-display mt-2 text-3xl">{nombre(c.punto)}</p>
                <p className="text-xs text-texto-suave" dir="ltr">{grados(c.punto.grado)}</p>
              </>
            ) : (
              <p className="font-display mt-3 text-3xl text-texto-suave">?</p>
            )}
            {c.encabezado && <p className="mt-3 text-sm font-semibold text-oro-suave">{c.encabezado}</p>}
            <p className="mt-1 text-sm leading-relaxed">{c.texto}</p>
            {c.nota && <p className="mt-2 text-xs italic text-texto-suave">{c.nota}</p>}
          </article>
        ))}
      </div>

      <section className="tarjeta aparecer border-violeta/40 p-5 sm:p-6" style={{ animationDelay: "400ms" }}>
        <h3 className="font-display text-2xl">{v.titulo}</h3>
        <p className="mt-1 text-sm text-texto-suave">{v.intro}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
            <img src={imagenSigno(rashi)} alt="" width={56} height={56} className="moneda-signo" />
            <div>
              <p className="text-xs uppercase tracking-widest text-violeta-suave">{v.rashi}</p>
              <p className="font-display text-2xl">{rashis[rashi]}</p>
              <p className="text-xs text-texto-suave" dir="ltr">{grados(r.vedica.rashi.grado)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{v.nakshatra}</p>
            <p className="font-display text-2xl">{nakshatras[r.vedica.nakshatra]}</p>
            <p className="text-xs text-texto-suave">{plantilla(v.pada, { n: r.vedica.pada })}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed">{textos.lunas[rashi]}</p>
        {r.vedica.rashiOtro && <p className="mt-2 text-xs italic text-texto-suave">{plantilla(v.rashiPuedeSer, { a: rashis[r.vedica.rashiOtro as IdSigno] })}</p>}
        {r.vedica.nakshatraOtro !== null && <p className="mt-1 text-xs italic text-texto-suave">{plantilla(v.nakshatraPuedeSer, { a: nakshatras[r.vedica.nakshatraOtro] })}</p>}
        <p className="mt-3 text-xs text-texto-suave">{plantilla(v.ayanamsa, { valor: `\u2066${gradosSegundos(r.vedica.ayanamsa)}\u2069` })}</p>
      </section>
    </div>
  );
}
