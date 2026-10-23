"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

export interface VideoCarrusel {
  id: string;
  titulo: string;
  href: string;
}

interface Textos {
  activarSonido: string;
  silenciar: string;
  anterior: string;
  siguiente: string;
  probar: string;
}

/**
 * Fila de videos verticales (los reels de Sibila) que se desliza con el dedo
 * o con las flechas. Cada video arranca solo y sin sonido cuando está a la
 * vista y se pausa al salir; solo carga la portada hasta entonces. Un toque en
 * el altavoz activa el sonido de ese video y silencia los demás. Con
 * «reducir movimiento» no arranca solo: se reproduce al tocarlo.
 */
export function CarruselVideos({ videos, textos }: { videos: VideoCarrusel[]; textos: Textos }) {
  const fila = useRef<HTMLDivElement>(null);
  const [conSonido, setConSonido] = useState<string | null>(null);

  useEffect(() => {
    const contenedor = fila.current;
    if (!contenedor) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quieto) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && e.intersectionRatio >= 0.6) v.play().catch(() => null);
          else v.pause();
        }
      },
      { threshold: [0, 0.6] },
    );
    contenedor.querySelectorAll("video").forEach((v) => observador.observe(v));
    return () => observador.disconnect();
  }, []);

  const mover = (sentido: 1 | -1) => {
    const c = fila.current;
    if (c) c.scrollBy({ left: sentido * Math.max(240, c.clientWidth * 0.8), behavior: "smooth" });
  };

  const alternarSonido = (id: string) => {
    const nuevo = conSonido === id ? null : id;
    setConSonido(nuevo);
    fila.current?.querySelectorAll("video").forEach((v) => {
      v.muted = v.dataset.id !== nuevo;
      if (v.dataset.id === nuevo) v.play().catch(() => null);
    });
  };

  return (
    <div className="relative">
      <div ref={fila} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {videos.map((v) => (
          <figure key={v.id} className="tarjeta relative w-[min(70vw,15rem)] shrink-0 snap-center overflow-hidden p-0 sm:w-60">
            <div className="relative aspect-[9/16] bg-black">
              <video
                data-id={v.id}
                src={`/videos/portada/${v.id}.mp4`}
                poster={`/videos/portada/${v.id}.jpg`}
                muted
                loop
                playsInline
                preload="none"
                className="h-full w-full object-cover"
                onClick={(e) => {
                  const el = e.currentTarget;
                  if (el.paused) el.play().catch(() => null);
                  else el.pause();
                }}
              />
              <button
                type="button"
                onClick={() => alternarSonido(v.id)}
                className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/55 p-2 text-white backdrop-blur transition hover:border-oro"
                aria-label={conSonido === v.id ? textos.silenciar : textos.activarSonido}
                title={conSonido === v.id ? textos.silenciar : textos.activarSonido}
              >
                {conSonido === v.id ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            <figcaption className="flex items-center justify-between gap-2 p-4">
              <span className="font-display text-lg leading-tight text-texto">{v.titulo}</span>
              <Link href={v.href} className="shrink-0 text-sm text-violeta-suave transition hover:text-oro-suave">
                {textos.probar} →
              </Link>
            </figcaption>
          </figure>
        ))}
      </div>
      <button type="button" onClick={() => mover(-1)} aria-label={textos.anterior} className="absolute -left-3 top-[40%] hidden rounded-full border border-borde bg-noche/80 p-2 text-texto backdrop-blur transition hover:border-oro sm:block">
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button type="button" onClick={() => mover(1)} aria-label={textos.siguiente} className="absolute -right-3 top-[40%] hidden rounded-full border border-borde bg-noche/80 p-2 text-texto backdrop-blur transition hover:border-oro sm:block">
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
