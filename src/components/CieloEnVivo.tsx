"use client";

import { useEffect, useRef } from "react";

const SIGNOS = "♈♉♊♋♌♍♎♏♐♑♒♓";

interface Estrella {
  x: number;
  y: number;
  r: number;
  capa: number;
  fase: number;
  velocidad: number;
}

interface Fugaz {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
}

interface Polvo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vida: number;
  max: number;
}

/**
 * Cielo animado del escenario de «Sibila en vivo» (lienzo 1920×1080): tres
 * capas de estrellas que titilan y derivan con paralaje, una nebulosa violeta
 * y dorada que respira, estrellas fugaces de vez en cuando, el anillo del
 * zodiaco girando muy despacio detrás de Sibila, y polvo dorado que sube desde
 * su símbolo y se aviva con su voz (`nivel`, de 0 a 1). Corre a 30 cuadros
 * por segundo para no cargar OBS.
 */
export function CieloEnVivo({ ancho, alto, centro, nivel }: { ancho: number; alto: number; centro: { x: number; y: number }; nivel: number }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const nivelRef = useRef(nivel);
  useEffect(() => {
    nivelRef.current = nivel;
  }, [nivel]);

  useEffect(() => {
    const c = lienzo.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let s = 20261025;
    const az = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const estrellas: Estrella[] = Array.from({ length: 420 }, () => {
      const capa = az() < 0.6 ? 0 : az() < 0.7 ? 1 : 2;
      return { x: az() * ancho, y: az() * alto, r: [0.9, 1.5, 2.4][capa] * (0.7 + az() * 0.6), capa, fase: az() * Math.PI * 2, velocidad: 0.6 + az() * 1.4 };
    });
    const fugaces: Fugaz[] = [];
    const polvo: Polvo[] = [];
    let marco = 0;
    let ultimo = 0;
    let t0: number | null = null;
    let proximaFugaz = 4000 + Math.random() * 6000;

    const dibujar = (ahora: number) => {
      marco = requestAnimationFrame(dibujar);
      if (ahora - ultimo < 1000 / 30) return;
      const dt = Math.min(0.1, (ahora - ultimo) / 1000 || 0.033);
      ultimo = ahora;
      t0 ??= ahora;
      const t = (ahora - t0) / 1000;
      const nivelVoz = nivelRef.current;

      // Fondo y nebulosa que respira.
      ctx.clearRect(0, 0, ancho, alto);
      const resp = 0.5 + 0.5 * Math.sin(t * 0.35);
      const neb1 = ctx.createRadialGradient(centro.x + Math.sin(t * 0.11) * 60, centro.y + Math.cos(t * 0.09) * 40, 0, centro.x, centro.y, 620 + resp * 90);
      neb1.addColorStop(0, `rgba(139,108,246,${0.34 + resp * 0.1 + nivelVoz * 0.15})`);
      neb1.addColorStop(1, "rgba(11,7,22,0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, ancho, alto);
      const neb2 = ctx.createRadialGradient(ancho * 0.72 + Math.cos(t * 0.07) * 120, alto * 0.5 + Math.sin(t * 0.13) * 80, 0, ancho * 0.72, alto * 0.5, 700);
      neb2.addColorStop(0, `rgba(217,180,90,${0.08 + resp * 0.05})`);
      neb2.addColorStop(1, "rgba(11,7,22,0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, ancho, alto);

      // Anillo del zodiaco, muy lento, detrás de Sibila.
      ctx.save();
      ctx.translate(centro.x, centro.y);
      ctx.rotate(t * 0.025);
      ctx.strokeStyle = "rgba(241,217,154,0.14)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 250, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 215, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "26px \"Noto Sans Symbols 2\", \"Segoe UI Symbol\", serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const brillo = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.8 + i));
        ctx.fillStyle = `rgba(241,217,154,${brillo})`;
        ctx.save();
        ctx.translate(Math.cos(a) * 232, Math.sin(a) * 232);
        ctx.rotate(a + Math.PI / 2);
        // U+FE0E pide el glifo de texto, no el emoji de color.
        ctx.fillText(`${SIGNOS[i]}\uFE0E`, 0, 0);
        ctx.restore();
      }
      ctx.restore();

      // Estrellas: deriva con paralaje y titileo.
      for (const e of estrellas) {
        const deriva = [4, 9, 16][e.capa];
        const x = (e.x + t * deriva) % (ancho + 20) - 10;
        const y = e.y + Math.sin(t * 0.2 + e.fase) * (2 + e.capa * 2);
        const tw = 0.55 + 0.45 * Math.sin(t * e.velocidad + e.fase);
        ctx.beginPath();
        ctx.arc(x, y, e.r * (0.8 + tw * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,246,216,${(0.25 + tw * 0.6) * (e.capa === 2 ? 1 : 0.75)})`;
        ctx.fill();
        if (e.capa === 2 && tw > 0.9) {
          ctx.strokeStyle = "rgba(255,246,216,0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - e.r * 3, y);
          ctx.lineTo(x + e.r * 3, y);
          ctx.moveTo(x, y - e.r * 3);
          ctx.lineTo(x, y + e.r * 3);
          ctx.stroke();
        }
      }

      // Estrellas fugaces.
      proximaFugaz -= dt * 1000;
      if (proximaFugaz <= 0) {
        proximaFugaz = 5000 + Math.random() * 9000;
        const desdeIzq = Math.random() < 0.5;
        fugaces.push({ x: desdeIzq ? Math.random() * ancho * 0.5 : ancho * 0.5 + Math.random() * ancho * 0.5, y: Math.random() * alto * 0.35, vx: (desdeIzq ? 1 : -1) * (700 + Math.random() * 400), vy: 260 + Math.random() * 160, vida: 1 });
      }
      for (let i = fugaces.length - 1; i >= 0; i--) {
        const f = fugaces[i];
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vida -= dt * 0.9;
        if (f.vida <= 0) {
          fugaces.splice(i, 1);
          continue;
        }
        const largo = 0.16;
        const g = ctx.createLinearGradient(f.x, f.y, f.x - f.vx * largo, f.y - f.vy * largo);
        g.addColorStop(0, `rgba(255,246,216,${0.9 * f.vida})`);
        g.addColorStop(1, "rgba(255,246,216,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - f.vx * largo, f.y - f.vy * largo);
        ctx.stroke();
      }

      // Polvo dorado que sube desde Sibila; más cuando habla.
      const nacen = 1 + Math.round(nivelVoz * 6);
      for (let i = 0; i < nacen && polvo.length < 260; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = 150 + Math.random() * 30;
        polvo.push({ x: centro.x + Math.cos(a) * d, y: centro.y + Math.sin(a) * d, vx: (Math.random() - 0.5) * 30, vy: -25 - Math.random() * 45 - nivelVoz * 60, r: 1 + Math.random() * 2.2, vida: 0, max: 2.5 + Math.random() * 2.5 });
      }
      for (let i = polvo.length - 1; i >= 0; i--) {
        const p = polvo[i];
        p.vida += dt;
        if (p.vida >= p.max) {
          polvo.splice(i, 1);
          continue;
        }
        p.x += (p.vx + Math.sin(t * 2 + p.y * 0.02) * 12) * dt;
        p.y += p.vy * dt;
        const a = Math.sin((p.vida / p.max) * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241,217,154,${0.75 * a})`;
        ctx.fill();
      }
    };
    marco = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(marco);
  }, [ancho, alto, centro.x, centro.y]);

  return <canvas ref={lienzo} width={ancho} height={alto} className="pointer-events-none absolute inset-0" aria-hidden />;
}
