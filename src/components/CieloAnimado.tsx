"use client";

import { useEffect, useRef } from "react";

const GLIFOS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "☉", "☽", "☿", "♀", "♂", "♃", "♄", "✦", "✧", "☆"];

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tam: number;
  glifo: string;
  vida: number; // 0..1
  duracion: number; // ms
  nacio: number;
  tono: string;
  rot: number;
  vrot: number;
}

/**
 * Cielo de fondo: símbolos astrológicos y estrellas que aparecen, flotan y se
 * desvanecen. Canvas a pantalla completa, muy tenue, sin bloquear clics.
 * Se apaga con prefers-reduced-motion y se pausa con la pestaña oculta.
 */
export function CieloAnimado() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return;

    let ancho = 0;
    let alto = 0;
    let dpr = 1;
    let particulas: Particula[] = [];
    let animacion = 0;
    let ultimo = performance.now();
    let activo = true;

    const ajustar = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = window.innerWidth;
      alto = window.innerHeight;
      lienzo.width = Math.round(ancho * dpr);
      lienzo.height = Math.round(alto * dpr);
      lienzo.style.width = `${ancho}px`;
      lienzo.style.height = `${alto}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const nueva = (ahora: number): Particula => {
      const esEstrella = Math.random() < 0.55;
      return {
        x: Math.random() * ancho,
        y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -0.04 - Math.random() * 0.08,
        tam: esEstrella ? 2 + Math.random() * 2 : 14 + Math.random() * 22,
        glifo: esEstrella ? "" : GLIFOS[Math.floor(Math.random() * GLIFOS.length)],
        vida: 0,
        duracion: 9000 + Math.random() * 11000,
        nacio: ahora,
        tono: Math.random() < 0.6 ? "241,217,154" : "183,165,255",
        rot: (Math.random() - 0.5) * 0.6,
        vrot: (Math.random() - 0.5) * 0.0004,
      };
    };

    const cantidad = () => Math.round(Math.min(46, Math.max(16, (ancho * alto) / 42000)));

    const dibujar = (ahora: number) => {
      if (!activo) return;
      const dt = Math.min(50, ahora - ultimo);
      ultimo = ahora;
      ctx.clearRect(0, 0, ancho, alto);

      const objetivo = cantidad();
      while (particulas.length < objetivo) particulas.push(nueva(ahora - Math.random() * 8000));

      particulas = particulas.filter((p) => ahora - p.nacio < p.duracion);
      for (const p of particulas) {
        const t = (ahora - p.nacio) / p.duracion;
        // Aparece, se mantiene y se desvanece (curva suave).
        const alfa = t < 0.2 ? t / 0.2 : t > 0.75 ? (1 - t) / 0.25 : 1;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        if (p.glifo) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.font = `${p.tam}px "Cormorant Garamond", Georgia, serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${p.tono},${(0.16 * alfa).toFixed(3)})`;
          ctx.shadowColor = `rgba(${p.tono},${(0.35 * alfa).toFixed(3)})`;
          ctx.shadowBlur = 12;
          ctx.fillText(p.glifo, 0, 0);
          ctx.restore();
        } else {
          const parpadeo = 0.6 + 0.4 * Math.sin(ahora / 900 + p.x);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.tam / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${(0.55 * alfa * parpadeo).toFixed(3)})`;
          ctx.fill();
        }
      }
      animacion = requestAnimationFrame(dibujar);
    };

    const visibilidad = () => {
      activo = document.visibilityState === "visible";
      if (activo) {
        ultimo = performance.now();
        animacion = requestAnimationFrame(dibujar);
      } else {
        cancelAnimationFrame(animacion);
      }
    };

    ajustar();
    window.addEventListener("resize", ajustar);
    document.addEventListener("visibilitychange", visibilidad);
    animacion = requestAnimationFrame(dibujar);
    return () => {
      cancelAnimationFrame(animacion);
      window.removeEventListener("resize", ajustar);
      document.removeEventListener("visibilitychange", visibilidad);
    };
  }, []);

  return <canvas ref={ref} className="cielo-animado" aria-hidden />;
}
