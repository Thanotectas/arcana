"use client";

import { useEffect, useRef } from "react";

interface Chispa {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  max: number;
  r: number;
  oro: boolean;
}

/**
 * Polvo de estrellas: unas pocas estrellas que titilan sobre la página y una estela dorada que sigue al dedo o al
 * cursor. No intercepta toques (pointer-events: none) y se apaga si la persona prefiere menos movimiento.
 */
export function PolvoEstelar() {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = lienzo.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let ancho = 0;
    let alto = 0;
    const medir = () => {
      ancho = window.innerWidth;
      alto = window.innerHeight;
      c.width = ancho * dpr;
      c.height = alto * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    medir();
    const estrellas = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), fase: Math.random() * Math.PI * 2, r: 0.6 + Math.random() * 1.1 }));
    const chispas: Chispa[] = [];
    const soltar = (x: number, y: number, n: number, fuerza = 0.6) => {
      for (let i = 0; i < n && chispas.length < 160; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = Math.random() * fuerza;
        chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.25, vida: 0, max: 50 + Math.random() * 50, r: 0.8 + Math.random() * 1.8, oro: Math.random() > 0.3 });
      }
    };
    let ultimo = 0;
    const mover = (e: PointerEvent) => {
      const ahora = performance.now();
      if (ahora - ultimo < 24) return;
      ultimo = ahora;
      soltar(e.clientX, e.clientY, e.pointerType === "touch" ? 3 : 2);
    };
    const tocar = (e: PointerEvent) => soltar(e.clientX, e.clientY, 14, 1.6);
    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", tocar, { passive: true });
    window.addEventListener("resize", medir);

    let cuadro = 0;
    let t = 0;
    const dibujar = () => {
      cuadro = requestAnimationFrame(dibujar);
      if (document.hidden) return;
      t += 0.016;
      g.clearRect(0, 0, ancho, alto);
      for (const s of estrellas) {
        const a = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.fase));
        g.fillStyle = `rgba(241,217,154,${a})`;
        g.beginPath();
        g.arc(s.x * ancho, s.y * alto, s.r, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = chispas.length - 1; i >= 0; i--) {
        const p = chispas[i];
        p.vida++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.004;
        p.vx *= 0.985;
        const vida = 1 - p.vida / p.max;
        if (vida <= 0) {
          chispas.splice(i, 1);
          continue;
        }
        g.fillStyle = p.oro ? `rgba(241,217,154,${vida})` : `rgba(183,165,255,${vida * 0.9})`;
        g.shadowColor = p.oro ? "rgba(241,217,154,0.9)" : "rgba(183,165,255,0.9)";
        g.shadowBlur = 8;
        g.beginPath();
        g.arc(p.x, p.y, p.r * vida + 0.3, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;
      }
    };
    dibujar();
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", tocar);
      window.removeEventListener("resize", medir);
    };
  }, []);

  return <canvas ref={lienzo} className="no-imprimir pointer-events-none fixed inset-0 z-40 h-full w-full" aria-hidden />;
}
