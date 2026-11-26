"use client";

import { useEffect, useRef } from "react";
import { sonarCampanitas, sonarCuenco } from "@/lib/escuela/sonido";

/**
 * La ceremonia de la llave: suena el cuenco, una lluvia de chispas doradas sube desde el centro, la llave se dibuja
 * con un trazo de oro y aparece su símbolo. Luego, lo que ahora sabe y su grado.
 */
export function CeremoniaLlave({ llave, gradoNuevo }: { llave: { nombre: string; simbolo: string; saber: string }; gradoNuevo: string | null }) {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    sonarCuenco(174.6, 0.4);
    const t1 = setTimeout(() => sonarCampanitas(0.1), 1400);
    const c = lienzo.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => clearTimeout(t1);
    const g = c.getContext("2d");
    if (!g) return () => clearTimeout(t1);
    const w = (c.width = c.offsetWidth * 2);
    const h = (c.height = c.offsetHeight * 2);
    const chispas = Array.from({ length: 140 }, () => {
      const a = Math.random() * Math.PI * 2;
      const v = 2 + Math.random() * 7;
      return { x: w / 2, y: h * 0.38, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, r: 1 + Math.random() * 3, vida: 0, max: 70 + Math.random() * 60, oro: Math.random() > 0.25 };
    });
    let cuadro = 0;
    const dibujar = () => {
      g.clearRect(0, 0, w, h);
      let vivas = 0;
      for (const p of chispas) {
        p.vida++;
        if (p.vida > p.max) continue;
        vivas++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.985;
        const a = 1 - p.vida / p.max;
        g.fillStyle = p.oro ? `rgba(241,217,154,${a})` : `rgba(183,165,255,${a})`;
        g.beginPath();
        g.arc(p.x, p.y, p.r * (0.4 + a), 0, Math.PI * 2);
        g.fill();
      }
      if (vivas) cuadro = requestAnimationFrame(dibujar);
    };
    dibujar();
    return () => {
      clearTimeout(t1);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <div className="tarjeta relative overflow-hidden border-oro/60 px-6 pb-8 pt-6 text-center">
      <div className="escuela-cielo pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_35%,rgba(241,217,154,.28),transparent_70%)]" aria-hidden />
      <canvas ref={lienzo} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(241,217,154,.35)" strokeDasharray="3 7" className="escuela-girar" />
          {/* La llave, dibujada con un trazo de oro */}
          <g fill="none" stroke="#f1d99a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="escuela-llave-trazo" style={{ filter: "drop-shadow(0 0 6px rgba(241,217,154,.8))" }}>
            <circle cx="80" cy="46" r="17" />
            <circle cx="80" cy="46" r="7" />
            <path d="M80 63 V126 M80 104 H95 M80 116 H91 M80 126 H97" />
          </g>
        </svg>
        <span className="escuela-encender absolute inset-x-0 top-[30px] text-2xl" style={{ animationDelay: "1.6s" }} aria-hidden>{llave.simbolo}</span>
      </div>
      <p className="relative mt-2 text-xs uppercase tracking-[0.35em] text-oro-suave">Recibiste</p>
      <p className="escuela-brillo relative font-display text-4xl">{llave.nombre}</p>
      <p className="relative mx-auto mt-2 max-w-sm text-sm text-texto-suave">Ahora sabes: {llave.saber.charAt(0).toLowerCase() + llave.saber.slice(1)}</p>
      {gradoNuevo && (
        <p className="relative mt-4 font-display text-2xl italic text-violeta-suave">
          Tu grado en el camino: <span className="not-italic text-oro-suave">{gradoNuevo}</span>
        </p>
      )}
    </div>
  );
}
