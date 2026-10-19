"use client";

/**
 * Retrato realista de Sibila para el escenario: tres imágenes de la misma
 * cara (boca cerrada, hablando, ojos cerrados) apiladas. La de «hablando» se
 * mezcla según el volumen de la voz y la de ojos cerrados aparece en los
 * parpadeos (CSS), así que el retrato habla y parpadea sin video.
 */
export function RetratoSibila({ tamano = 330, nivel = 0, version = "" }: { tamano?: number; nivel?: number; version?: string }) {
  const habla = Math.min(1, Math.max(0, nivel * 1.8));
  const v = version ? `?v=${version}` : "";
  return (
    <div className="relative overflow-hidden rounded-full" style={{ width: tamano, height: tamano }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/marca/sibila/base.jpg${v}`} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/marca/sibila/habla.jpg${v}`} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: habla, transition: "opacity 70ms linear" }} draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/marca/sibila/ojos.jpg${v}`} alt="" className="absolute inset-0 h-full w-full object-cover vivo-parpadeo-retrato" draggable={false} />
    </div>
  );
}
