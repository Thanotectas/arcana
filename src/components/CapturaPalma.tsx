"use client";

import { useRef, useState } from "react";
import { Camera, RefreshCw } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";

const LADO_MAX = 1280;

/**
 * Captura o carga la foto de la palma, la reduce en el navegador (máximo
 * 1280 px, JPEG) y la deja en un input oculto como archivo. Muestra una guía
 * en forma de mano para encuadrar.
 */
export function CapturaPalma({ nombreCampo = "foto" }: { nombreCampo?: string }) {
  const { t } = useT();
  const [vista, setVista] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const entradaVisible = useRef<HTMLInputElement>(null);
  const entradaOculta = useRef<HTMLInputElement>(null);

  async function alElegir(archivo: File | undefined) {
    setError(null);
    if (!archivo) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(archivo.type) && !archivo.type.startsWith("image/")) {
      setError(t.quiromancia.errores.formato);
      return;
    }
    setProcesando(true);
    try {
      const reducido = await reducirImagen(archivo);
      const dt = new DataTransfer();
      dt.items.add(reducido);
      if (entradaOculta.current) entradaOculta.current.files = dt.files;
      setVista(URL.createObjectURL(reducido));
    } catch {
      setError(t.quiromancia.errores.formato);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={entradaVisible}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => alElegir(e.target.files?.[0])}
      />
      <input ref={entradaOculta} type="file" name={nombreCampo} className="sr-only" tabIndex={-1} aria-hidden />

      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-borde bg-noche/60">
        {vista ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vista} alt={t.quiromancia.tuPalma} className="h-full w-full object-cover" />
        ) : (
          <GuiaMano />
        )}
        {procesando && (
          <div className="absolute inset-0 flex items-center justify-center bg-noche/60">
            <div className="orbe-carga" aria-hidden />
          </div>
        )}
      </div>

      <p className="text-center text-xs text-texto-suave">{t.quiromancia.guia}</p>

      <div className="flex justify-center">
        <button type="button" className="boton boton-secundario" onClick={() => entradaVisible.current?.click()}>
          {vista ? <RefreshCw className="h-4 w-4" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
          {vista ? t.quiromancia.cambiarFoto : t.quiromancia.tomarFoto}
        </button>
      </div>
      {error && <p className="text-center text-sm text-peligro" role="alert">{error}</p>}
    </div>
  );
}

/** Silueta de una palma abierta para encuadrar la foto. */
function GuiaMano() {
  return (
    <svg viewBox="0 0 300 400" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="brillo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(217,180,90,0.35)" />
          <stop offset="1" stopColor="rgba(139,108,246,0.25)" />
        </linearGradient>
      </defs>
      <path
        d="M150 385c-42 0-70-26-78-62l-30-96c-4-13 4-24 15-26 10-2 19 5 23 16l18 52V120c0-12 9-20 19-20s18 8 18 20v100V85c0-12 9-21 19-21s19 9 19 21v135V95c0-12 9-21 19-21s18 9 18 21v125V125c0-12 8-20 18-20s18 8 18 20v130c0 70-40 130-96 130z"
        fill="url(#brillo)"
        stroke="rgba(241,217,154,0.8)"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <path d="M120 235c-6 40-8 80 20 130" fill="none" stroke="rgba(255,138,91,0.6)" strokeWidth="2" />
      <path d="M118 232c30-6 60-4 95 20" fill="none" stroke="rgba(143,199,255,0.6)" strokeWidth="2" />
      <path d="M110 205c35-22 70-24 110-8" fill="none" stroke="rgba(255,123,156,0.6)" strokeWidth="2" />
      <path d="M160 370c0-50 5-100 2-150" fill="none" stroke="rgba(217,180,90,0.6)" strokeWidth="2" />
    </svg>
  );
}

async function reducirImagen(archivo: File): Promise<File> {
  const bitmap = await createImageBitmap(archivo).catch(async () => {
    // Algunos navegadores no decodifican HEIC con createImageBitmap.
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
  const blob = await new Promise<Blob | null>((res) => lienzo.toBlob(res, "image/jpeg", 0.86));
  if (!blob) throw new Error("sin blob");
  return new File([blob], "palma.jpg", { type: "image/jpeg" });
}
