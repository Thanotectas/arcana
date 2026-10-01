"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Image as Galeria, SwitchCamera, X } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";

const LADO_MAX = 1280;
const PROPORCION = 3 / 4; // ancho / alto del marco

type Modo = "inicio" | "camara" | "vista";

/**
 * Captura de la palma con la cámara dentro de la app y un contorno de mano
 * superpuesto para encuadrar. Si la cámara no está disponible o se niega el
 * permiso, se puede elegir una imagen de la galería. La foto se recorta al
 * marco, se reduce (máx. 1280 px, JPEG) y queda en un input oculto.
 */
export function CapturaPalma({ nombreCampo = "foto", variante = "mano" }: { nombreCampo?: string; /** Qué se encuadra: una palma o una taza vista desde arriba. */ variante?: "mano" | "taza" }) {
  const { t } = useT();
  const taza = variante === "taza";
  const textos = taza
    ? { alinea: t.chocolate.alineaTaza, guia: t.chocolate.guia, alt: t.chocolate.tuTaza }
    : { alinea: t.quiromancia.alineaPalma, guia: t.quiromancia.guia, alt: t.quiromancia.tuPalma };
  const Guia = taza ? GuiaTaza : GuiaMano;
  const [modo, setModo] = useState<Modo>("inicio");
  const [vista, setVista] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pocaLuz, setPocaLuz] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [camaraTrasera, setCamaraTrasera] = useState(true);
  const [hayCamara, setHayCamara] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const flujo = useRef<MediaStream | null>(null);
  const entradaGaleria = useRef<HTMLInputElement>(null);
  const entradaOculta = useRef<HTMLInputElement>(null);

  const detenerCamara = useCallback(() => {
    flujo.current?.getTracks().forEach((p) => p.stop());
    flujo.current = null;
  }, []);

  useEffect(() => detenerCamara, [detenerCamara]);

  async function abrirCamara(trasera = camaraTrasera) {
    setError(null);
    detenerCamara();
    if (!navigator.mediaDevices?.getUserMedia) {
      setHayCamara(false);
      setError(t.quiromancia.errores.camara);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: trasera ? { ideal: "environment" } : "user", width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      flujo.current = s;
      setModo("camara");
      // El <video> se monta al cambiar de modo; le asignamos el flujo después.
      requestAnimationFrame(() => {
        if (video.current) {
          video.current.srcObject = s;
          video.current.play().catch(() => {});
        }
      });
    } catch {
      setError(t.quiromancia.errores.camara);
      setHayCamara(false);
      setModo("inicio");
    }
  }

  function cambiarCamara() {
    const nueva = !camaraTrasera;
    setCamaraTrasera(nueva);
    abrirCamara(nueva);
  }

  async function capturar() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    setProcesando(true);
    try {
      // Recorte centrado a la proporción del marco.
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      let cw = vw;
      let ch = Math.round(vw / PROPORCION);
      if (ch > vh) {
        ch = vh;
        cw = Math.round(vh * PROPORCION);
      }
      const sx = Math.round((vw - cw) / 2);
      const sy = Math.round((vh - ch) / 2);
      const escala = Math.min(1, LADO_MAX / Math.max(cw, ch));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(cw * escala);
      lienzo.height = Math.round(ch * escala);
      const ctx = lienzo.getContext("2d");
      if (!ctx) throw new Error("sin canvas");
      if (!camaraTrasera) {
        // La cámara frontal se muestra en espejo; la foto se guarda sin espejo.
        ctx.translate(lienzo.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(v, sx, sy, cw, ch, 0, 0, lienzo.width, lienzo.height);
      setPocaLuz(luminanciaMedia(ctx, lienzo.width, lienzo.height) < 70);
      const blob = await new Promise<Blob | null>((res) => lienzo.toBlob(res, "image/jpeg", 0.88));
      if (!blob) throw new Error("sin blob");
      fijarArchivo(new File([blob], "palma.jpg", { type: "image/jpeg" }));
      detenerCamara();
      setModo("vista");
    } catch {
      setError(t.quiromancia.errores.formato);
    } finally {
      setProcesando(false);
    }
  }

  async function alElegirGaleria(archivo: File | undefined) {
    setError(null);
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError(t.quiromancia.errores.formato);
      return;
    }
    setProcesando(true);
    try {
      const { archivo: reducido, oscura } = await reducirImagen(archivo);
      setPocaLuz(oscura);
      fijarArchivo(reducido);
      detenerCamara();
      setModo("vista");
    } catch {
      setError(t.quiromancia.errores.formato);
    } finally {
      setProcesando(false);
    }
  }

  function fijarArchivo(archivo: File) {
    const dt = new DataTransfer();
    dt.items.add(archivo);
    if (entradaOculta.current) entradaOculta.current.files = dt.files;
    setVista((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return URL.createObjectURL(archivo);
    });
  }

  function repetir() {
    setVista(null);
    setPocaLuz(false);
    if (entradaOculta.current) entradaOculta.current.value = "";
    if (hayCamara) abrirCamara();
    else setModo("inicio");
  }

  return (
    <div className="space-y-3">
      <input ref={entradaGaleria} type="file" accept="image/*" className="sr-only" onChange={(e) => alElegirGaleria(e.target.files?.[0])} />
      <input ref={entradaOculta} type="file" name={nombreCampo} className="sr-only" tabIndex={-1} aria-hidden />

      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-borde bg-noche/60" style={{ aspectRatio: "3 / 4" }}>
        {modo === "camara" && (
          <>
            <video
              ref={video}
              playsInline
              muted
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
              style={{ transform: camaraTrasera ? undefined : "scaleX(-1)" }}
            />
            <div className="absolute inset-0">
              <Guia enVivo />
            </div>
            <p className="absolute inset-x-0 top-3 text-center text-xs font-medium text-white drop-shadow">{textos.alinea}</p>
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-4">
              <button type="button" onClick={cambiarCamara} className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur" aria-label={t.quiromancia.cambiarCamara}>
                <SwitchCamera className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={capturar}
                disabled={procesando}
                className="boton-captura"
                aria-label={t.quiromancia.capturar}
              />
              <button
                type="button"
                onClick={() => {
                  detenerCamara();
                  setModo("inicio");
                }}
                className="rounded-full bg-black/50 p-2.5 text-white backdrop-blur"
                aria-label={t.comun.cerrar}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </>
        )}

        {modo === "vista" && vista && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={vista} alt={textos.alt} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 opacity-40">
              <Guia enVivo />
            </div>
          </>
        )}

        {modo === "inicio" && <Guia />}

        {procesando && (
          <div className="absolute inset-0 flex items-center justify-center bg-noche/60">
            <div className="orbe-carga" aria-hidden />
          </div>
        )}
      </div>

      {pocaLuz && modo === "vista" && (
        <p className="text-center text-xs text-oro" role="status">{t.quiromancia.pocaLuz}</p>
      )}
      <p className="text-center text-xs text-texto-suave">{textos.guia}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {modo === "vista" ? (
          <button type="button" className="boton boton-secundario" onClick={repetir}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            {t.quiromancia.cambiarFoto}
          </button>
        ) : modo === "inicio" ? (
          <>
            {hayCamara && (
              <button type="button" className="boton boton-primario" onClick={() => abrirCamara()}>
                <Camera className="h-4 w-4" aria-hidden />
                {t.quiromancia.abrirCamara}
              </button>
            )}
            <button type="button" className="boton boton-secundario" onClick={() => entradaGaleria.current?.click()}>
              <Galeria className="h-4 w-4" aria-hidden />
              {t.quiromancia.elegirGaleria}
            </button>
          </>
        ) : (
          <button type="button" className="boton boton-fantasma text-sm" onClick={() => entradaGaleria.current?.click()}>
            <Galeria className="h-4 w-4" aria-hidden />
            {t.quiromancia.elegirGaleria}
          </button>
        )}
      </div>
      {error && <p className="text-center text-sm text-peligro" role="alert">{error}</p>}
    </div>
  );
}

/**
 * Contorno de una palma abierta para encuadrar. En vivo, el exterior se
 * oscurece y el borde brilla para que la mano se coloque dentro.
 */
function GuiaMano({ enVivo = false }: { enVivo?: boolean }) {
  const mano =
    "M150 385c-42 0-70-26-78-62l-30-96c-4-13 4-24 15-26 10-2 19 5 23 16l18 52V120c0-12 9-20 19-20s18 8 18 20v100V85c0-12 9-21 19-21s19 9 19 21v135V95c0-12 9-21 19-21s18 9 18 21v125V125c0-12 8-20 18-20s18 8 18 20v130c0 70-40 130-96 130z";
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="brillo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(217,180,90,0.35)" />
          <stop offset="1" stopColor="rgba(139,108,246,0.25)" />
        </linearGradient>
        <mask id="fuera">
          <rect width="300" height="400" fill="white" />
          <path d={mano} fill="black" />
        </mask>
      </defs>
      {enVivo ? (
        <rect width="300" height="400" fill="rgba(11,7,22,0.55)" mask="url(#fuera)" />
      ) : (
        <path d={mano} fill="url(#brillo)" />
      )}
      <path d={mano} fill="none" stroke={enVivo ? "rgba(241,217,154,0.95)" : "rgba(241,217,154,0.8)"} strokeWidth={enVivo ? 3 : 2} strokeDasharray="6 6" className={enVivo ? "marco-vivo" : undefined} />
      {!enVivo && (
        <>
          <path d="M120 235c-6 40-8 80 20 130" fill="none" stroke="rgba(255,138,91,0.6)" strokeWidth="2" />
          <path d="M118 232c30-6 60-4 95 20" fill="none" stroke="rgba(143,199,255,0.6)" strokeWidth="2" />
          <path d="M110 205c35-22 70-24 110-8" fill="none" stroke="rgba(255,123,156,0.6)" strokeWidth="2" />
          <path d="M160 370c0-50 5-100 2-150" fill="none" stroke="rgba(217,180,90,0.6)" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

/** Contorno de una taza vista desde arriba (borde, interior y asa a la derecha). */
function GuiaTaza({ enVivo = false }: { enVivo?: boolean }) {
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="brilloTaza" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(217,180,90,0.08)" />
          <stop offset="1" stopColor="rgba(139,108,246,0.25)" />
        </radialGradient>
        <mask id="fueraTaza">
          <rect width="300" height="400" fill="white" />
          <circle cx="140" cy="200" r="118" fill="black" />
        </mask>
      </defs>
      {enVivo ? <rect width="300" height="400" fill="rgba(11,7,22,0.55)" mask="url(#fueraTaza)" /> : <circle cx="140" cy="200" r="118" fill="url(#brilloTaza)" />}
      <circle cx="140" cy="200" r="118" fill="none" stroke={enVivo ? "rgba(241,217,154,0.95)" : "rgba(241,217,154,0.8)"} strokeWidth={enVivo ? 3 : 2} strokeDasharray="6 6" className={enVivo ? "marco-vivo" : undefined} />
      <circle cx="140" cy="200" r="70" fill="none" stroke="rgba(241,217,154,0.35)" strokeWidth="1.5" strokeDasharray="3 5" />
      <path d="M258 165c28 0 36 20 36 35s-8 35-36 35" fill="none" stroke={enVivo ? "rgba(241,217,154,0.95)" : "rgba(241,217,154,0.8)"} strokeWidth={enVivo ? 3 : 2} strokeDasharray="6 6" />
    </svg>
  );
}

function luminanciaMedia(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const paso = 8;
  const datos = ctx.getImageData(0, 0, w, h).data;
  let suma = 0;
  let n = 0;
  for (let y = 0; y < h; y += paso) {
    for (let x = 0; x < w; x += paso) {
      const i = (y * w + x) * 4;
      suma += 0.2126 * datos[i] + 0.7152 * datos[i + 1] + 0.0722 * datos[i + 2];
      n++;
    }
  }
  return n ? suma / n : 255;
}

async function reducirImagen(archivo: File): Promise<{ archivo: File; oscura: boolean }> {
  const bitmap = await createImageBitmap(archivo).catch(async () => {
    const img = new Image();
    img.src = URL.createObjectURL(archivo);
    await img.decode();
    return img;
  });
  const ancho = "width" in bitmap ? bitmap.width : (bitmap as HTMLImageElement).naturalWidth;
  const alto = "height" in bitmap ? bitmap.height : (bitmap as HTMLImageElement).naturalHeight;
  const escala = Math.min(1, LADO_MAX / Math.max(ancho, alto));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(ancho * escala);
  lienzo.height = Math.round(alto * escala);
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("sin canvas");
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, lienzo.width, lienzo.height);
  const oscura = luminanciaMedia(ctx, lienzo.width, lienzo.height) < 70;
  const blob = await new Promise<Blob | null>((res) => lienzo.toBlob(res, "image/jpeg", 0.86));
  if (!blob) throw new Error("sin blob");
  return { archivo: new File([blob], "palma.jpg", { type: "image/jpeg" }), oscura };
}
