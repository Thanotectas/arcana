"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Video vertical del aviso del directo: arranca solo y sin sonido (salvo con
 * «reducir movimiento»), un toque lo pausa o lo reanuda y el altavoz activa
 * la voz de Sibila. Sin controles nativos, que taparían el rótulo de la fecha.
 */
export function VideoInvitacion({ id, textos }: { id: string; textos: { activarSonido: string; silenciar: string } }) {
  const video = useRef<HTMLVideoElement>(null);
  const [sonido, setSonido] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.play().catch(() => null);
  }, []);

  const alternarSonido = () => {
    const v = video.current;
    if (!v) return;
    v.muted = sonido;
    if (!sonido) {
      v.currentTime = 0;
      v.play().catch(() => null);
    }
    setSonido(!sonido);
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={video}
        src={`/videos/portada/${id}.mp4`}
        poster={`/videos/portada/${id}.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        onClick={(e) => {
          const v = e.currentTarget;
          if (v.paused) v.play().catch(() => null);
          else v.pause();
        }}
      />
      <button
        type="button"
        onClick={alternarSonido}
        className="absolute bottom-[13%] right-2 rounded-full border border-white/30 bg-black/55 p-2 text-white backdrop-blur transition hover:border-oro"
        aria-label={sonido ? textos.silenciar : textos.activarSonido}
        title={sonido ? textos.silenciar : textos.activarSonido}
      >
        {sonido ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
