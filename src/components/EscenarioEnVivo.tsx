"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Marca } from "./Logo";
import { CieloEnVivo } from "./CieloEnVivo";
import { RostroSibila } from "./RostroSibila";
import { RetratoSibila } from "./RetratoSibila";
import { GraficoEnVivo } from "./GraficoEnVivo";
import type { GraficoVivo } from "@/lib/en-vivo-graficos";

interface Carta {
  id: string;
  nombre: string;
  posicion: string;
  /** Runas, Lenormand y baraja española traen su imagen; sin ella es una carta Rider. */
  imagen?: string;
}

type TipoLectura =
  | "tarot" | "aura" | "numerologia" | "horoscopo" | "chocolate" | "mano" | "carta" | "sinastria" | "huevo"
  | "pendulo" | "iching" | "runas" | "lenormand" | "baraja" | "chino";

interface Lectura {
  clase: "lectura";
  id: number;
  tipo: TipoLectura;
  origen?: string;
  autor: string;
  signo: string | null;
  pregunta: string;
  cartas: Carta[] | null;
  imagen: string | null;
  color: string | null;
  numero: number | null;
  etiquetaNumero: string | null;
  simbolo: string | null;
  grafico?: GraficoVivo | null;
  /** Péndulo: SÍ, NO, AÚN NO SE DEFINE o NO ES EL MOMENTO. */
  respuesta?: string | null;
  /** I Ching: las seis líneas de abajo hacia arriba (1 = yang). */
  lineas?: number[] | null;
  texto: string;
  audio: string | null;
}

type Respuesta = Lectura | { clase: "espera" } | { clase: "fin" } | { clase: "pausa" } | { clase: "ok" } | { clase: "puente" | "despedida"; texto: string; audio: string | null };

const NOMBRE_TIPO: Record<TipoLectura, string> = {
  tarot: "Tarot",
  aura: "Lectura de aura",
  numerologia: "Numerología",
  horoscopo: "Horóscopo",
  chocolate: "Lectura del chocolate",
  mano: "Lectura de la mano",
  huevo: "Limpia con huevo",
  carta: "Carta astral",
  sinastria: "Sinastría",
  pendulo: "Péndulo",
  iching: "I Ching",
  runas: "Runas",
  lenormand: "Lenormand",
  baraja: "Baraja española",
  chino: "Horóscopo chino",
};

/** Lo que se puede pedir en el chat: el recuadro de arriba lo va mostrando por turnos mientras no hay lectura. */
// La carta astral y la sinastría salen la mitad del tiempo: son lo que el directo impulsa.
const INSTRUCCIONES = [
  { titulo: "Tu carta astral, dibujada en vivo", ejemplo: "carta astral 14/03/1985 10:30 Medellín" },
  { titulo: "Sinastría · sus dos cielos juntos", ejemplo: "sinastría 14/03/1985 y 22/08/1990" },
  { titulo: "Tarot · tres cartas para ti", ejemplo: "Leo, ¿me sale el trabajo?" },
  { titulo: "Carta astral · sin la hora también", ejemplo: "carta astral 03/07/1992 Bogotá" },
  { titulo: "Sinastría · ¿son compatibles?", ejemplo: "sinastría 25/11/1989 y 09/02/1994" },
  { titulo: "Horóscopo · tu cielo de hoy", ejemplo: "horóscopo Piscis" },
  { titulo: "Aura · el color de tu energía", ejemplo: "aura: ando muy cansada" },
  { titulo: "Numerología · lo que trae tu año", ejemplo: "mi año 14/03/1985" },
  { titulo: "Péndulo · sí o no", ejemplo: "péndulo: ¿me escribe esta semana?" },
  { titulo: "I Ching · el libro de los cambios", ejemplo: "I Ching: ¿cambio de trabajo?" },
  { titulo: "Runas · tres piedras para ti", ejemplo: "runas: ¿qué viene en el amor?" },
  { titulo: "Horóscopo chino · tu animal", ejemplo: "horóscopo chino 1990" },
];
/** Frases de espera de Sibila (FRASES_PUENTE en src/lib/en-vivo.ts). */
const FRASES_PUENTE = 14;
/** Frases de después de la despedida (frasesCierre en src/lib/en-vivo.ts). */
const FRASES_CIERRE = 5;
/** Cuántas vueltas sin preguntas antes de que Sibila haga un segmento «para todos». */
const VUELTAS_ANTES_DE_RELLENO = 3;

const COLOR_AURA: Record<string, string> = {
  violeta: "#8b6cf6",
  dorado: "#f1d99a",
  azul: "#4f8cf7",
  verde: "#43c59e",
  rosa: "#f28dc4",
  rojo: "#ef5b5b",
  naranja: "#f59e42",
  blanco: "#f4f1ff",
  índigo: "#5b4bd1",
  turquesa: "#38d6d0",
};

const ANCHO = 1920;
const ALTO = 1080;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

function frasesDe(texto: string) {
  return texto.match(/[^.!?¿¡]+[.!?]+|[^.!?]+$/g)?.map((f) => f.trim()).filter(Boolean) ?? [texto];
}

/**
 * El péndulo del directo: se balancea mientras duda (AÚN NO SE DEFINE), se
 * calma y gira en el sentido del reloj (SÍ) o al revés (NO), o se queda
 * quieto (NO ES EL MOMENTO). La respuesta aparece en grande.
 */
function Pendulo({ respuesta }: { respuesta: string }) {
  const duda = respuesta.startsWith("AÚN");
  const giro = respuesta === "SÍ" ? "vivo-orbita" : respuesta === "NO" ? "vivo-orbita-inversa" : null;
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[330px] w-[340px] justify-center">
        <div className="absolute left-1/2 top-0 h-3 w-24 -translate-x-1/2 rounded-full bg-oro/60" />
        <div className={`flex h-[300px] w-[90px] flex-col items-center ${duda ? "vivo-pendulo" : "vivo-pendulo-calma"}`}>
          <div className="h-[232px] w-[3px] bg-gradient-to-b from-oro/30 to-oro-suave" />
          <div className="h-[54px] w-[54px] rotate-45 rounded-md border-2 border-oro-suave shadow-[0_0_40px_rgba(241,217,154,0.6)]" style={{ background: "linear-gradient(135deg, #f4f1ff, #8b6cf6 60%, #2a1a5e)" }} />
        </div>
        {giro && (
          <div className="aparecer absolute left-1/2 top-[196px] h-[124px] w-[124px] -translate-x-1/2" style={{ animationDelay: "2.6s" }}>
            <div className="h-full w-full rounded-full border-2 border-dashed border-oro/50" />
            <div className={`absolute inset-0 ${giro}`}>
              <span className="absolute left-1/2 top-[-9px] h-4 w-4 -translate-x-1/2 rounded-full bg-oro-suave shadow-[0_0_18px_rgba(241,217,154,0.9)]" />
            </div>
          </div>
        )}
      </div>
      <p className={`aparecer mt-8 text-center font-display text-oro-suave ${respuesta.length > 4 ? "text-[64px]" : "text-[130px]"} leading-none`} style={{ animationDelay: "3s" }}>
        {respuesta}
      </p>
    </div>
  );
}

/**
 * Escenario de «Sibila en vivo» (1920×1080) para transmitir con OBS: pide al
 * servidor la siguiente lectura mientras suena la actual, voltea las tres
 * cartas, reproduce la voz de Sibila con subtítulos y hace latir su símbolo con
 * el volumen. Sin preguntas, Sibila dice frases de invitación de vez en cuando.
 * A la hora de cierre se despide y queda la pantalla final (gracias y
 * suscríbete); si en el panel se corre la hora, vuelve a leer sola.
 */
export function EscenarioEnVivo({ clave, qr, retrato, video = null, vertical = false }: { clave: string; qr: string; retrato: string | null; video?: string | null; vertical?: boolean }) {
  // Vertical (1080×1920) para TikTok: Sibila arriba, la lectura en el medio y abajo, donde TikTok pone
  // los comentarios, solo lo secundario. Misma lógica (voz, fila, oráculos, relleno, cierre).
  const W = vertical ? 1080 : ANCHO;
  const H = vertical ? 1920 : ALTO;
  const [escala, setEscala] = useState(1);
  const [lectura, setLectura] = useState<Lectura | null>(null);
  const [volteadas, setVolteadas] = useState(0);
  const [subtitulo, setSubtitulo] = useState("");
  const [nivel, setNivel] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [sinVoz, setSinVoz] = useState(false);
  const [pausa, setPausa] = useState(false);
  const [cierre, setCierre] = useState<"abierto" | "despidiendo" | "fin">("abierto");
  const [instruccion, setInstruccion] = useState(0);
  const contexto = useRef<AudioContext | null>(null);
  const desbloquear = useRef<(() => void) | null>(null);

  useEffect(() => {
    const id = setInterval(() => setInstruccion((n) => (n + 1) % INSTRUCCIONES.length), 7000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ajustar = () => setEscala(Math.min(window.innerWidth / W, window.innerHeight / H));
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, [W, H]);

  const pedir = useCallback(
    async (modo: "lectura" | "puente" | "relleno" | "cierre" | "estado", i = 0): Promise<Respuesta | null> => {
      try {
        const res = await fetch(`/api/en-vivo/siguiente?modo=${modo}&i=${i}&clave=${encodeURIComponent(clave)}`, { cache: "no-store" });
        if (res.status === 401) {
          setAviso("Clave del escenario inválida: copia otra vez la dirección desde /admin/en-vivo.");
          return null;
        }
        return res.ok ? ((await res.json()) as Respuesta) : null;
      } catch {
        return null;
      }
    },
    [clave],
  );

  /** Reproduce la voz (o simula su duración si no hay) con subtítulos y el latido del símbolo. */
  const hablar = useCallback(async (texto: string, audio: string | null) => {
    const frases = frasesDe(texto);
    const total = frases.reduce((s, f) => s + f.length, 0) || 1;
    const fraseEn = (progreso: number) => {
      let acumulado = 0;
      for (const f of frases) {
        acumulado += f.length;
        if (acumulado / total >= progreso) return f;
      }
      return frases[frases.length - 1];
    };
    setSubtitulo(frases[0]);
    if (!audio) {
      const duracion = Math.max(4000, (texto.split(/\s+/).length / 2.6) * 1000);
      const inicio = Date.now();
      while (Date.now() - inicio < duracion) {
        setSubtitulo(fraseEn((Date.now() - inicio) / duracion));
        setNivel(0.3 + Math.random() * 0.4);
        await esperar(150);
      }
      setNivel(0);
      return;
    }
    const elemento = new Audio(`data:audio/mpeg;base64,${audio}`);
    let analizador: AnalyserNode | null = null;
    try {
      contexto.current ??= new AudioContext();
      const fuente = contexto.current.createMediaElementSource(elemento);
      analizador = contexto.current.createAnalyser();
      analizador.fftSize = 256;
      fuente.connect(analizador);
      analizador.connect(contexto.current.destination);
      if (contexto.current.state === "suspended") await contexto.current.resume().catch(() => null);
      if (contexto.current.state === "suspended") {
        // El navegador exige un clic antes de sonar (en OBS no pasa).
        setBloqueado(true);
        await new Promise<void>((r) => (desbloquear.current = r));
        setBloqueado(false);
        await contexto.current.resume().catch(() => null);
      }
    } catch {
      analizador = null;
    }
    const datos = new Uint8Array(128);
    let marco = 0;
    const latir = () => {
      if (analizador) {
        analizador.getByteFrequencyData(datos);
        setNivel(Math.min(1, datos.reduce((s, v) => s + v, 0) / datos.length / 90));
      }
      if (elemento.duration) setSubtitulo(fraseEn(elemento.currentTime / elemento.duration));
      marco = requestAnimationFrame(latir);
    };
    await new Promise<void>((listo) => {
      elemento.onended = () => listo();
      elemento.onerror = () => listo();
      elemento.play().then(
        () => {
          marco = requestAnimationFrame(latir);
        },
        async () => {
          // El navegador bloqueó el sonido: se espera un clic (en OBS no pasa).
          setBloqueado(true);
          await new Promise<void>((r) => (desbloquear.current = r));
          setBloqueado(false);
          await contexto.current?.resume();
          elemento.play().then(() => (marco = requestAnimationFrame(latir)), () => listo());
        },
      );
    });
    cancelAnimationFrame(marco);
    setNivel(0);
  }, []);

  useEffect(() => {
    let activo = true;
    const puentes = new Map<number, { texto: string; audio: string | null }>();
    (async () => {
      let siguiente: Promise<Respuesta | null> | null = null;
      let quietos = 0;
      let puente = 0;
      let despedida = false;
      let vueltaCierre = 0;
      const cierres = new Map<number, { texto: string; audio: string | null }>();
      // Después de la despedida Sibila sigue invitando (carta del día, grupo, redes) mientras la transmisión siga al aire.
      const decirCierre = async () => {
        const i = vueltaCierre++ % FRASES_CIERRE;
        let frase = cierres.get(i) ?? null;
        if (!frase) {
          const r2 = await pedir("cierre", i);
          if (r2?.clase === "puente") frase = { texto: r2.texto, audio: r2.audio };
        }
        if (!frase || !activo) return;
        cierres.set(i, frase);
        setSinVoz(!frase.audio);
        await hablar(frase.texto, frase.audio);
        setSubtitulo("");
      };
      // Una frase de espera de Sibila (la voz se guarda: solo se pide la primera vez).
      const decirPuente = async () => {
        const i = puente++ % FRASES_PUENTE;
        let frase = puentes.get(i) ?? null;
        if (!frase) {
          const r2 = await pedir("puente", i);
          if (r2?.clase === "puente") frase = { texto: r2.texto, audio: r2.audio };
        }
        if (!frase || !activo) return;
        puentes.set(i, frase);
        setSinVoz(!frase.audio);
        setLectura(null);
        await hablar(frase.texto, frase.audio);
        setSubtitulo("");
      };
      const PENDIENTE = Symbol("pendiente");
      while (activo) {
        // Tras unas vueltas sin preguntas se pide un segmento «para todos» (el servidor lo hace solo si nadie espera).
        const peticion = siguiente ?? pedir(quietos >= VUELTAS_ANTES_DE_RELLENO ? "relleno" : "lectura");
        siguiente = null;
        // Mientras Sibila prepara una lectura (Claude y la voz tardan unos segundos), no se queda callada.
        const pronto = await Promise.race([peticion, esperar(3500).then(() => PENDIENTE)]);
        let r: Respuesta | null;
        if (typeof pronto === "symbol") {
          if (!despedida) await decirPuente();
          r = await peticion;
        } else r = pronto;
        if (!activo) break;
        // La despedida suena una sola vez aunque el servidor la repita (sin la migración 0039 no queda marcada).
        if (r?.clase === "despedida" || (r?.clase === "fin" && despedida)) {
          if (!despedida && r.clase === "despedida") {
            despedida = true;
            setSinVoz(!r.audio);
            setLectura(null);
            setCierre("despidiendo");
            await hablar(r.texto, r.audio);
            setSubtitulo("");
          }
          setCierre("fin");
          await esperar(4000);
          await decirCierre();
          await esperar(6000);
          continue;
        }
        if (r?.clase === "fin") {
          setCierre("fin");
          await decirCierre();
          await esperar(6000);
          continue;
        }
        if (despedida && r) {
          // Se corrió la hora de cierre en el panel: Sibila sigue leyendo.
          despedida = false;
          setCierre("abierto");
        }
        if (r?.clase === "pausa") {
          // Habla el presentador: silencio, sin frases de espera.
          setPausa(true);
          await esperar(1500);
          continue;
        }
        setPausa(false);
        if (r?.clase === "lectura") {
          quietos = 0;
          setSinVoz(!r.audio);
          setLectura(r);
          setVolteadas(0);
          setSubtitulo("");
          for (let n = 1; n <= (r.cartas ? 3 : 1); n++) {
            await esperar(900);
            setVolteadas(n);
          }
          await esperar(600);
          siguiente = pedir("lectura");
          await hablar(r.texto, r.audio);
          await esperar(2500);
          // Si el presentador pidió pausa durante la lectura, la siguiente (ya pedida) espera a que termine.
          while (activo) {
            const e = await pedir("estado");
            if (e?.clase !== "pausa") break;
            setPausa(true);
            await esperar(1500);
          }
          setPausa(false);
          continue;
        }
        quietos++;
        // Sin preguntas: Sibila sigue hablando, con una pausa corta entre frase y frase.
        await decirPuente();
        await esperar(quietos > 24 ? 6000 : 3000);
      }
    })();
    return () => {
      activo = false;
    };
  }, [pedir, hablar]);

  const tipo = lectura?.tipo ?? "tarot";
  // Sobre la pintura, todo lo que se lee va en el tercio derecho (la zona oscura).
  const escena = retrato !== null;
  // Zona de la lectura: el tercio derecho en horizontal; todo el ancho en vertical.
  const derecha = vertical ? "left-10 right-10" : escena ? "left-[1190px] right-[56px]" : "left-[700px] right-16";
  // Tamaños: en vertical se usan los de la escena (más compactos).
  const compacto = escena || vertical;
  const cartas = lectura?.cartas ?? [
    { id: "", nombre: "", posicion: "Lo que te rodea" },
    { id: "", nombre: "", posicion: "Lo que se mueve" },
    { id: "", nombre: "", posicion: "Tu consejo" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#07040f]"
      onClick={() => {
        contexto.current?.resume().catch(() => null);
        desbloquear.current?.();
        desbloquear.current = null;
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden text-texto"
        style={{
          width: W,
          height: H,
          transform: `translate(-50%, -50%) scale(${escala})`,
          background: "linear-gradient(180deg, #160d33 0%, #0b0716 75%)",
        }}
      >
        {vertical ? (
          <>
            {/* Estrellas de fondo y Sibila en una ventana arriba (la pintura, recortada a su rostro y su pecho) */}
            <CieloEnVivo ancho={W} alto={H} centro={{ x: 540, y: 400 }} nivel={nivel} modo="cielo" />
            <div className="absolute left-0 right-0 top-[110px] h-[520px] overflow-hidden border-y-2 border-oro/40" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
              {escena ? (
                <div className="absolute" style={{ left: -150, top: -40, width: 1885, height: 1060 }}>
                  <RetratoSibila nivel={nivel} version={retrato ?? ""} video={video} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center" style={{ background: "radial-gradient(circle, rgba(139,108,246,0.45), rgba(11,7,22,0.9) 70%)" }}>
                  <div className="vivo-flotar">
                    <RostroSibila tamano={420} nivel={nivel} />
                  </div>
                </div>
              )}
            </div>
            {/* La mesa en vivo: recuadro (16:9) donde LIVE Studio pone, encima, la cámara de las manos, la vela y la baraja.
                TikTok castiga como «pregrabado» un LIVE sin nada en tiempo real; así se ve que hay alguien, sin mostrar la cara. */}
            <div className="absolute right-6 top-[392px] h-[230px] w-[392px] rounded-2xl border-2 border-oro/70 bg-black/80 p-[6px]" style={{ boxShadow: "0 0 30px rgba(241,217,154,0.25)" }}>
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#0b0716] text-center text-lg text-violeta-suave">Aquí va la cámara de la mesa</div>
              <div className="absolute -top-4 left-4 flex items-center gap-2 rounded-full border border-oro/60 bg-[#160d33] px-3 py-0.5 text-sm uppercase tracking-[0.2em] text-oro-suave">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Mi mesa · en vivo
              </div>
            </div>
          </>
        ) : (
          <>
            {escena && <RetratoSibila nivel={nivel} version={retrato ?? ""} video={video} />}
            <CieloEnVivo ancho={ANCHO} alto={ALTO} centro={escena ? { x: 144, y: 745 } : { x: 64 + 280, y: 180 + 165 }} nivel={nivel} modo={escena ? "escena" : "cielo"} />
          </>
        )}
        {/* Encabezado */}
        {vertical ? (
          <div className="absolute left-8 right-8 top-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Marca tamano={52} />
              <div>
                <p className="font-display text-4xl leading-none text-oro-suave">Arcana</p>
                <p className="text-base uppercase tracking-[0.3em] text-violeta-suave">Sibila en vivo</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/15 px-5 py-2 text-xl font-semibold text-red-200">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" /> EN VIVO
            </div>
          </div>
        ) : (
        <div className="absolute left-16 right-16 top-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Marca tamano={64} />
            <div>
              <p className="font-display text-5xl text-oro-suave">Arcana</p>
              <p className="text-xl uppercase tracking-[0.35em] text-violeta-suave">Sibila en vivo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-oro/50 bg-black/45 px-6 py-3 text-2xl text-oro-suave">
              <Bell className="h-6 w-6 vivo-campana" aria-hidden /> Suscríbete y activa la campanita
            </div>
            <div className="flex items-center gap-3 rounded-full border border-red-400/50 bg-red-500/15 px-6 py-3 text-2xl font-semibold text-red-200">
              <span className="h-4 w-4 animate-pulse rounded-full bg-red-500" /> EN VIVO
            </div>
          </div>
        </div>
        )}

        {/* QR para subir la foto de la taza o de la mano (al cerrar ya no aplica) */}
        {cierre === "abierto" && !vertical && (
        <div className={`absolute flex items-center gap-5 rounded-3xl border border-oro/30 bg-black/45 p-4 ${escena ? "left-[1190px] right-[56px] top-[770px]" : "bottom-[245px] left-16 w-[560px] p-5"}`}>
          <div className={`shrink-0 overflow-hidden rounded-xl ${escena ? "h-[120px] w-[120px]" : "h-[150px] w-[150px]"}`} dangerouslySetInnerHTML={{ __html: qr }} />
          <p className={`leading-snug text-texto ${escena ? "text-xl" : "text-2xl"}`}>
            ¿Tu <span className="text-oro-suave">limpia con huevo</span>, tu taza o tu mano? Sube la foto en <span className="text-oro-suave">miarcana.com/vivo</span>
          </p>
        </div>
        )}

        {/* Sibila (el rostro vectorial; sobre la pintura no hace falta) */}
        {!escena && !vertical && (
        <div className="absolute left-16 top-[180px] flex w-[560px] flex-col items-center">
          <div className="relative flex h-[330px] w-[330px] items-center justify-center">
            {/* Anillos que giran en sentidos opuestos */}
            <div className="absolute inset-[-28px] rounded-full border border-dashed border-oro/30 vivo-girar" />
            <div className="absolute inset-[-10px] rounded-full border border-violeta/40 vivo-girar-inverso" />
            <div
              className="flex h-full w-full items-center justify-center rounded-full border-2 border-oro/60 vivo-respirar"
              style={{
                transform: `scale(${1 + nivel * 0.05})`,
                transition: "transform 80ms linear",
                background: "radial-gradient(circle, rgba(139,108,246,0.55), rgba(26,15,58,0.9) 70%)",
                boxShadow: `0 0 ${60 + nivel * 140}px rgba(241,217,154,${0.25 + nivel * 0.45}), inset 0 0 80px rgba(0,0,0,0.6)`,
              }}
            >
              <div className="vivo-flotar">
                <RostroSibila tamano={318} nivel={nivel} />
              </div>
            </div>
          </div>
          <p className="mt-5 font-display text-5xl text-oro-suave">Sibila</p>
          <p className="mt-1 text-xl text-texto-suave">Lecturas en vivo · Arcana</p>
        </div>
        )}

        {/* Pregunta */}
        <div key={lectura?.id ?? "espera"} className={`absolute ${derecha} rounded-3xl border border-oro/30 bg-black/55 aparecer ${vertical ? "top-[650px] px-7 py-4" : escena ? "top-[120px] px-8 py-5" : "top-[180px] px-10 py-6"}`}>
          {cierre !== "abierto" ? (
            <>
              <p className="text-2xl text-violeta-suave">Se acabó el tiempo por esta noche</p>
              <p className={`mt-2 font-display leading-tight text-oro-suave ${compacto ? "text-[36px]" : "text-[44px]"}`}>Gracias por acompañarnos ✦</p>
            </>
          ) : lectura ? (
            <>
              <p className="text-2xl text-violeta-suave">
                {NOMBRE_TIPO[lectura.tipo]} · {lectura.autor}
                {lectura.origen === "facebook" ? " · Facebook" : ""}
                {lectura.signo ? ` · ${lectura.signo}` : ""}
              </p>
              <p className={`mt-2 line-clamp-2 font-display leading-tight text-oro-suave ${compacto ? "text-[36px]" : "text-[44px]"}`}>{lectura.pregunta ? `«${lectura.pregunta}»` : `Lectura para ${lectura.autor}`}</p>
            </>
          ) : (
            <div key={instruccion} className="aparecer">
              <p className="text-2xl text-violeta-suave">{vertical ? "Escribe en los comentarios" : "Escribe en el chat"} · {INSTRUCCIONES[instruccion].titulo}</p>
              <p className={`mt-2 font-display leading-tight text-oro-suave ${compacto ? "text-[36px]" : "text-[44px]"}`}>«{INSTRUCCIONES[instruccion].ejemplo}»</p>
            </div>
          )}
        </div>

        {/* Lo que se lee: cartas, foto, aura, número o signo (al cerrar, la invitación a suscribirse) */}
        {cierre !== "abierto" ? (
          <div className={`absolute ${derecha} flex flex-col items-center justify-center gap-6 text-center aparecer ${vertical ? "top-[800px] h-[420px]" : escena ? "top-[300px] h-[440px]" : "top-[400px] h-[460px]"}`}>
            <Bell className={`text-oro-suave vivo-campana ${compacto ? "h-24 w-24" : "h-32 w-32"}`} aria-hidden />
            <p className={`font-display leading-tight text-oro-suave ${compacto ? "text-[44px]" : "text-[56px]"}`}>Suscríbete y activa la campanita</p>
            <p className={`text-texto ${compacto ? "text-[26px]" : "text-[32px]"}`}>para enterarte del próximo directo de Sibila</p>
            <p className={`text-violeta-suave ${compacto ? "text-[24px]" : "text-[28px]"}`}>Tu carta del día es gratis en <span className="text-oro-suave">miarcana.com</span></p>
          </div>
        ) : !lectura || (Boolean(lectura.cartas?.length) && !lectura.grafico) ? (
        <div className={`absolute ${derecha} flex justify-center ${vertical ? "top-[800px] gap-6" : escena ? "top-[330px] gap-6" : "top-[400px] gap-12"}`}>
          {cartas.map((c, i) => {
            const visible = Boolean(lectura && c.id && volteadas > i);
            return (
              <div key={i} className={`flex flex-col items-center ${compacto ? "w-[210px]" : "w-[250px]"}`}>
                <p className={`mb-3 uppercase tracking-[0.2em] text-violeta-suave ${compacto ? "text-base" : "text-xl"}`}>{c.posicion}</p>
                <div className={`relative vivo-carta ${compacto ? "h-[330px] w-[190px]" : "h-[400px] w-[230px]"}`} style={{ perspective: 1200, animationDelay: `${i * 0.7}s` }}>
                  <div className="absolute inset-0 transition-transform duration-700" style={{ transformStyle: "preserve-3d", transform: visible ? "rotateY(180deg)" : "none" }}>
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-oro/70" style={{ backfaceVisibility: "hidden", background: "repeating-linear-gradient(45deg, #2a1a5e 0 14px, #21134d 14px 28px)" }}>
                      <span className="text-8xl text-oro-suave">✦</span>
                    </div>
                    {c.id && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imagen ?? `/cartas/rider/${c.id}.webp`}
                        alt={c.nombre}
                        className={`absolute inset-0 h-full w-full rounded-2xl border-4 border-oro/80 ${c.imagen?.startsWith("/runas/") ? "bg-[#120b26] object-contain p-4" : "object-cover"}`}
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      />
                    )}
                  </div>
                  {visible && <div key={`${lectura?.id}-${i}`} className="pointer-events-none absolute inset-[-30px] rounded-3xl vivo-destello" />}
                </div>
                <p className={`mt-3 h-9 font-display text-oro-suave ${compacto ? "text-2xl" : "text-3xl"}`}>{visible ? c.nombre : ""}</p>
              </div>
            );
          })}
        </div>
        ) : lectura.grafico ? (
          // Carta astral, sinastría o cielo del horóscopo: se dibuja a tamaño completo.
          <div className={`absolute ${derecha} flex justify-center ${vertical ? "top-[790px]" : escena ? "top-[262px]" : "top-[380px]"}`} style={{ opacity: volteadas > 0 ? 1 : 0, transition: "opacity 700ms" }}>
            <GraficoEnVivo key={lectura.id} grafico={lectura.grafico} tamano={vertical ? 470 : escena ? 440 : 520} />
          </div>
        ) : (
          <div className={`absolute ${derecha} flex items-center justify-center ${vertical ? "top-[790px] h-[460px]" : escena ? "top-[320px] h-[460px]" : "top-[400px] h-[460px]"}`} style={{ opacity: volteadas > 0 ? 1 : 0, transition: "opacity 700ms", transform: compacto ? "scale(0.82)" : undefined }}>
            {(tipo === "chocolate" || tipo === "mano" || tipo === "huevo") && lectura.imagen && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lectura.imagen} alt="" className="h-[440px] max-w-[720px] rounded-3xl border-4 border-oro/70 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.6)]" />
            )}
            {tipo === "aura" && (
              <div className="flex flex-col items-center">
                <div
                  className="flex h-[380px] w-[380px] items-center justify-center rounded-full"
                  style={{ background: `radial-gradient(circle, ${COLOR_AURA[lectura.color ?? "violeta"] ?? "#8b6cf6"} 0%, rgba(11,7,22,0) 70%)`, boxShadow: `0 0 ${80 + nivel * 120}px ${COLOR_AURA[lectura.color ?? "violeta"] ?? "#8b6cf6"}` }}
                >
                  <span className="font-display text-6xl text-white drop-shadow-lg">{lectura.autor.split(" ")[0]}</span>
                </div>
                <p className="mt-6 font-display text-5xl capitalize text-oro-suave">Aura {lectura.color ?? ""}</p>
              </div>
            )}
            {tipo === "numerologia" && lectura.numero != null && (
              <div className="flex flex-col items-center">
                <div className="flex h-[340px] w-[340px] items-center justify-center rounded-full border-4 border-oro/70 bg-black/30">
                  <span className="font-display text-[200px] leading-none text-oro-suave">{lectura.numero}</span>
                </div>
                <p className="mt-6 text-3xl uppercase tracking-[0.25em] text-violeta-suave">{lectura.etiquetaNumero}</p>
              </div>
            )}
            {tipo === "pendulo" && <Pendulo respuesta={lectura.respuesta ?? ""} />}
            {tipo === "iching" && lectura.lineas && (
              <div className="flex flex-col items-center">
                {/* Las seis líneas aparecen de abajo hacia arriba, como se lanzan las monedas */}
                <div className="flex flex-col-reverse gap-5">
                  {lectura.lineas.map((l, i) => (
                    <div key={i} className="aparecer flex w-[320px] justify-between" style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
                      {l ? (
                        <span className="h-8 w-full rounded-md bg-oro-suave shadow-[0_0_24px_rgba(241,217,154,0.45)]" />
                      ) : (
                        <>
                          <span className="h-8 w-[43%] rounded-md bg-oro-suave shadow-[0_0_24px_rgba(241,217,154,0.45)]" />
                          <span className="h-8 w-[43%] rounded-md bg-oro-suave shadow-[0_0_24px_rgba(241,217,154,0.45)]" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <p className="aparecer mt-10 text-center font-display text-5xl text-oro-suave" style={{ animationDelay: "3.6s" }}>
                  {lectura.numero} · {lectura.etiquetaNumero}
                </p>
              </div>
            )}
            {tipo === "chino" && (
              <div className="flex flex-col items-center">
                {lectura.imagen && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lectura.imagen} alt="" className="h-[340px] w-[340px] rounded-full border-4 border-oro/70 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.6)]" />
                )}
                <p className="mt-6 font-display text-6xl text-oro-suave">
                  {lectura.simbolo} {lectura.etiquetaNumero}
                </p>
              </div>
            )}
            {tipo === "horoscopo" && (
              <div className="flex flex-col items-center">
                <span className="font-display text-[260px] leading-none text-oro-suave">{`${lectura.simbolo ?? "✦"}\uFE0E`}</span>
                <p className="mt-4 font-display text-6xl text-oro-suave">{lectura.signo}</p>
              </div>
            )}
          </div>
        )}

        {/* Subtítulos */}
        {!(cierre === "fin" && !subtitulo) && (
        <div className={`absolute flex min-h-[110px] items-center justify-center rounded-3xl px-12 py-4 ${vertical ? "left-8 right-8 top-[1275px] bg-black/60" : escena ? "bottom-[80px] left-16 right-[770px] bg-black/60" : "bottom-[80px] left-16 right-16 bg-black/45"}`}>
          <p key={subtitulo} className={`text-center leading-snug text-texto aparecer ${compacto ? "text-[34px]" : "text-[38px]"}`}>{subtitulo}</p>
        </div>
        )}

        {/* Pie (en vertical, dos líneas cortas: abajo TikTok pone los comentarios) */}
        {vertical ? (
          <div className="absolute bottom-10 left-8 right-8 space-y-2 text-center text-2xl text-violeta-suave">
            {cierre !== "abierto" ? (
              <p>✦ Gracias por acompañarnos ✦ Tu carta del día es gratis en <span className="text-oro-suave">miarcana.com</span></p>
            ) : (
              <>
                <p>Escribe en los comentarios tu <span className="text-oro-suave">signo y tu pregunta</span></p>
                <p><span className="text-oro-suave">carta astral</span> + fecha · <span className="text-oro-suave">sinastría</span> + dos fechas · <span className="text-oro-suave">péndulo</span></p>
              </>
            )}
          </div>
        ) : (
        <div className={`absolute bottom-5 left-0 right-0 text-center text-2xl text-violeta-suave ${escena ? "bg-black/40 py-2" : ""}`}>
          {cierre !== "abierto" ? (
            <>✦ Gracias por acompañarnos ✦ Suscríbete y activa la campanita ✦ Únete al grupo: <span className="text-oro-suave">miarcana.com/grupo</span> ✦ Tu carta del día es gratis en <span className="text-oro-suave">miarcana.com</span> ✦</>
          ) : (
            <>✦ Tu signo y tu pregunta ✦ <span className="text-oro-suave">carta astral</span> + fecha, hora y ciudad ✦ <span className="text-oro-suave">sinastría</span> + dos fechas ✦ ¿Huevo, taza o mano? <span className="text-oro-suave">miarcana.com/vivo</span> ✦ Grupo: <span className="text-oro-suave">miarcana.com/grupo</span> ✦</>
          )}
        </div>
        )}

        {aviso && <div className="absolute inset-x-0 top-1/2 mx-auto w-fit rounded-2xl bg-red-900/90 px-8 py-5 text-3xl">{aviso}</div>}
        {sinVoz && <div className="absolute left-16 top-[130px] rounded-full bg-red-900/80 px-5 py-2 text-lg text-red-100">Esta lectura llegó sin voz (ElevenLabs): revisa «Probar la voz» en /admin/redes</div>}
        {pausa && (
          <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full border border-oro/50 bg-black/70 px-6 py-2 text-2xl text-oro-suave ${vertical ? "top-[1200px]" : "bottom-[200px]"}`}>
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" /> Un momento: te hablan desde la mesa
          </div>
        )}
        {bloqueado && <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-5xl text-oro-suave">Toca la pantalla para activar el sonido</div>}
      </div>
    </div>
  );
}
