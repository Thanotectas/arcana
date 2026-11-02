"use client";

import { useEffect, useState } from "react";

/**
 * Sibila en el directo, sobre la pintura de public/marca/sibila/.
 *
 * Con video (quieta.mp4 y hablando.mp4, misma toma de 1920×1080): el video
 * quieto corre siempre (respira, parpadea, las velas se mueven) y el de
 * «hablando» aparece encima mientras suena su voz y se apaga en las pausas.
 *
 * Sin video, las tres imágenes de la misma pintura (boca cerrada, hablando,
 * ojos cerrados): la boca se abre con el volumen de la voz, parpadea a ratos
 * irregulares (a veces dos veces seguidas), la toma respira muy despacio y la
 * luz de las velas y de la bola de cristal titila.
 */
export function RetratoSibila({ nivel = 0, version = "", video = null }: { nivel?: number; version?: string; video?: string | null }) {
  const v = version ? `?v=${version}` : "";
  const [ojosCerrados, setOjosCerrados] = useState(false);
  // Con voz, el video de «hablando» aparece enseguida; en las pausas se va con medio segundo de espera,
  // así no parpadea entre sílabas (si vuelve a sonar antes, se queda).
  const suena = nivel > 0.04;

  // Parpadeos a intervalos irregulares, como una persona (solo con imágenes: el video ya parpadea).
  useEffect(() => {
    if (video) return;
    let vivo = true;
    let espera: ReturnType<typeof setTimeout>;
    const siguiente = () => {
      espera = setTimeout(() => parpadear(Math.random() < 0.18 ? 2 : 1), 2200 + Math.random() * 4300);
    };
    const parpadear = (veces: number) => {
      if (!vivo) return;
      setOjosCerrados(true);
      espera = setTimeout(() => {
        setOjosCerrados(false);
        if (veces > 1) espera = setTimeout(() => parpadear(veces - 1), 180);
        else siguiente();
      }, 120 + Math.random() * 60);
    };
    siguiente();
    return () => {
      vivo = false;
      clearTimeout(espera);
    };
  }, [video]);

  if (video) {
    const w = `?v=${video}`;
    return (
      <div className="absolute inset-0">
        <video src={`/marca/sibila/quieta.mp4${w}`} poster={`/marca/sibila/base.jpg${v}`} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
        <video
          src={`/marca/sibila/hablando.mp4${w}`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: suena ? 1 : 0, transition: suena ? "opacity 200ms ease" : "opacity 300ms ease 450ms" }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <LuzDeVelas />
      </div>
    );
  }

  const boca = Math.min(1, Math.max(0, nivel * 1.8));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 retrato-respira">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/marca/sibila/base.jpg${v}`} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/marca/sibila/habla.jpg${v}`} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: boca, transition: "opacity 90ms linear" }} draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/marca/sibila/ojos.jpg${v}`} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: ojosCerrados ? 1 : 0 }} draggable={false} />
      </div>
      <LuzDeVelas />
    </div>
  );
}

/** Resplandor cálido de las velas (izquierda) y de la bola de cristal, que titila sin repetirse a la vista. */
function LuzDeVelas() {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ mixBlendMode: "screen" }}>
      <div className="absolute inset-0 velas-titilan" style={{ background: "radial-gradient(ellipse 22% 30% at 9% 47%, rgba(255,170,80,0.30), rgba(255,140,60,0) 70%)" }} />
      <div className="absolute inset-0 velas-titilan-2" style={{ background: "radial-gradient(ellipse 30% 40% at 14% 40%, rgba(255,190,110,0.14), rgba(255,160,80,0) 70%)" }} />
      <div className="absolute inset-0 bola-late" style={{ background: "radial-gradient(circle at 7.2% 66%, rgba(190,170,255,0.36), rgba(150,120,255,0) 7%)" }} />
    </div>
  );
}
