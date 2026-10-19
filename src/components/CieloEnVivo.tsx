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
export function CieloEnVivo({ ancho, alto, centro, nivel, modo = "cielo" }: { ancho: number; alto: number; centro: { x: number; y: number }; nivel: number; modo?: "cielo" | "escena" }) {
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
    // Constelaciones que se dibujan solas, una a la vez, en la mitad derecha.
    const constelaciones = [
      [[0, 0], [60, -40], [130, -30], [190, 10], [250, -20], [300, 30], [280, 90]],
      [[0, 0], [50, 50], [120, 60], [170, 20], [230, 40], [210, 110], [150, 130]],
      [[0, 0], [70, 20], [110, 80], [60, 130], [0, 100], [-30, 40]],
      [[0, 0], [80, -10], [160, -5], [240, 20], [320, 10], [200, 70], [120, 60]],
    ].map((pts) => pts.map(([x, y]) => [x * 1.6, y * 1.6] as [number, number]));
    const planetas = [
      { r: 300, vel: 0.11, tam: 7, color: "#c9b6ff", fase: 0.3 },
      { r: 345, vel: -0.07, tam: 5, color: "#f1d99a", fase: 2.1 },
      { r: 400, vel: 0.045, tam: 9, color: "#9fd8ff", fase: 4.2, anillo: true },
    ];
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

      ctx.clearRect(0, 0, ancho, alto);
      const resp = 0.5 + 0.5 * Math.sin(t * 0.35);
      const escena = modo === "escena";
      if (escena) {
        // Sobre la pintura: las velas titilan (un resplandor cálido que varía) y la bola de cristal late con la voz.
        const velas = ctx.createRadialGradient(200, 470, 0, 200, 470, 260);
        velas.addColorStop(0, `rgba(255,190,90,${0.06 + Math.random() * 0.05 + resp * 0.02})`);
        velas.addColorStop(1, "rgba(255,190,90,0)");
        ctx.fillStyle = velas;
        ctx.fillRect(0, 150, 600, 700);
        const bola = ctx.createRadialGradient(centro.x, centro.y, 0, centro.x, centro.y, 120 + nivelVoz * 60);
        bola.addColorStop(0, `rgba(190,170,255,${0.12 + nivelVoz * 0.3})`);
        bola.addColorStop(1, "rgba(190,170,255,0)");
        ctx.fillStyle = bola;
        ctx.fillRect(centro.x - 200, centro.y - 200, 400, 400);
      }
      if (!escena) {
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

      }
      // Aurora: velos de color que ondulan en la parte alta.
      if (!escena)
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let x = 0; x <= ancho; x += 40) {
          const y = 90 + k * 55 + Math.sin(x * 0.004 + t * (0.35 + k * 0.1) + k) * 40 + Math.sin(x * 0.011 - t * 0.5) * 18;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(ancho, 0);
        ctx.closePath();
        const ga = ctx.createLinearGradient(0, 0, 0, 260);
        const tono = k === 1 ? "217,180,90" : "139,108,246";
        ga.addColorStop(0, `rgba(${tono},0)`);
        ga.addColorStop(0.6, `rgba(${tono},${0.07 + resp * 0.05})`);
        ga.addColorStop(1, `rgba(${tono},0)`);
        ctx.fillStyle = ga;
        ctx.fill();
      }

      // Luna creciente que cruza el cielo muy despacio (unos 6 minutos de lado a lado).
      if (!escena) {
      const lunaX = ((t * 5.5) % (ancho + 300)) - 150;
      const lunaY = 110 + Math.sin(t * 0.05) * 20;
      ctx.save();
      ctx.shadowColor = "rgba(255,246,216,0.6)";
      ctx.shadowBlur = 30;
      ctx.fillStyle = "rgba(255,246,216,0.85)";
      ctx.beginPath();
      ctx.arc(lunaX, lunaY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(lunaX + 12, lunaY - 6, 23, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      }

      // Constelación que se dibuja punto a punto y luego se desvanece (ciclo de 14 s). Sobre la pintura no cabe.
      if (!escena) {
      const ciclo = 14;
      const idx = Math.floor(t / ciclo) % constelaciones.length;
      const fase = (t % ciclo) / ciclo;
      const pts = constelaciones[idx];
      const ox = (escena ? ancho * 0.64 : ancho * 0.62) + (idx % 2) * (escena ? 100 : 220);
      const oy = (escena ? alto * 0.25 : alto * 0.12) + Math.floor(idx / 2) * (escena ? 30 : 60);
      const visibles = Math.min(pts.length, Math.floor(fase * 2.2 * pts.length));
      const alfa = fase < 0.75 ? 1 : 1 - (fase - 0.75) / 0.25;
      ctx.save();
      ctx.globalAlpha = alfa * 0.8;
      ctx.strokeStyle = "rgba(241,217,154,0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < visibles; i++) {
        const [x, y] = pts[i];
        if (i === 0) ctx.moveTo(ox + x, oy + y);
        else ctx.lineTo(ox + x, oy + y);
      }
      ctx.stroke();
      for (let i = 0; i < visibles; i++) {
        const [x, y] = pts[i];
        ctx.beginPath();
        ctx.arc(ox + x, oy + y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,246,216,0.95)";
        ctx.fill();
      }
      ctx.restore();
      }

      // Planetas orbitando a Sibila.
      for (const pl of escena ? [] : planetas) {
        const a = pl.fase + t * pl.vel;
        const px = centro.x + Math.cos(a) * pl.r;
        const py = centro.y + Math.sin(a) * pl.r * 0.55;
        const delante = Math.sin(a) > 0;
        ctx.save();
        ctx.globalAlpha = delante ? 0.95 : 0.45;
        ctx.strokeStyle = "rgba(241,217,154,0.08)";
        ctx.beginPath();
        ctx.ellipse(centro.x, centro.y, pl.r, pl.r * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowColor = pl.color;
        ctx.shadowBlur = 18;
        ctx.fillStyle = pl.color;
        ctx.beginPath();
        ctx.arc(px, py, pl.tam, 0, Math.PI * 2);
        ctx.fill();
        if (pl.anillo) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(241,217,154,0.7)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(px, py, pl.tam * 2.1, pl.tam * 0.7, -0.4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Anillo del zodiaco, muy lento, detrás de Sibila.
      if (!escena) {
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
      }

      // Estrellas: deriva con paralaje y titileo (sobre la pintura, solo en la parte oscura de la derecha y más tenues).
      for (const e of estrellas) {
        if (escena && (e.x < ancho * 0.6 || e.y > alto * 0.72)) continue;
        const deriva = [4, 9, 16][e.capa];
        const x = (e.x + t * deriva) % (ancho + 20) - 10;
        const y = e.y + Math.sin(t * 0.2 + e.fase) * (2 + e.capa * 2);
        const tw = 0.55 + 0.45 * Math.sin(t * e.velocidad + e.fase);
        ctx.beginPath();
        ctx.arc(x, y, e.r * (0.8 + tw * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,246,216,${(0.25 + tw * 0.6) * (e.capa === 2 ? 1 : 0.75) * (escena ? 0.6 : 1)})`;
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
        proximaFugaz = 2500 + Math.random() * 5000;
        const desdeIzq = Math.random() < 0.5;
        const cometa = Math.random() < 0.2;
        fugaces.push({ x: desdeIzq ? Math.random() * ancho * 0.5 : ancho * 0.5 + Math.random() * ancho * 0.5, y: Math.random() * alto * 0.35, vx: (desdeIzq ? 1 : -1) * (cometa ? 260 : 700 + Math.random() * 400), vy: cometa ? 90 : 260 + Math.random() * 160, vida: cometa ? 3 : 1 });
      }
      for (let i = fugaces.length - 1; i >= 0; i--) {
        const f = fugaces[i];
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vida -= dt * (f.vida > 1.2 ? 0.45 : 0.9);
        if (f.vida <= 0) {
          fugaces.splice(i, 1);
          continue;
        }
        const largo = f.vida > 1 ? 0.6 : 0.16;
        const g = ctx.createLinearGradient(f.x, f.y, f.x - f.vx * largo, f.y - f.vy * largo);
        g.addColorStop(0, `rgba(255,246,216,${0.9 * Math.min(1, f.vida)})`);
        g.addColorStop(1, "rgba(255,246,216,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = f.vida > 1 ? 3.5 : 2.2;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - f.vx * largo, f.y - f.vy * largo);
        ctx.stroke();
      }

      // Polvo dorado que sube desde Sibila (o desde la bola de cristal en la escena); más cuando habla.
      const nacen = (escena ? 1 : 2) + Math.round(nivelVoz * (escena ? 5 : 8));
      for (let i = 0; i < nacen && polvo.length < 420; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = escena ? 40 + Math.random() * 50 : 150 + Math.random() * 30;
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
  }, [ancho, alto, centro.x, centro.y, modo]);

  return <canvas ref={lienzo} width={ancho} height={alto} className="pointer-events-none absolute inset-0" aria-hidden />;
}
