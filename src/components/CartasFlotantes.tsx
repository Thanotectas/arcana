/** Cartas decorativas que flotan detrás del titular de la portada. */
export function CartasFlotantes() {
  const cartas = [
    { x: "6%", y: "12%", rot: "-14deg", dur: "9s", estilo: "rider", delay: "0s" },
    { x: "84%", y: "8%", rot: "12deg", dur: "11s", estilo: "marsella", delay: "1.2s" },
    { x: "12%", y: "68%", rot: "8deg", dur: "10s", estilo: "angeles", delay: "0.6s" },
    { x: "80%", y: "64%", rot: "-9deg", dur: "12s", estilo: "rider", delay: "2s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      {cartas.map((c, i) => (
        <div
          key={i}
          className={`dorso-carta estilo-${c.estilo} carta-flotante absolute w-20 opacity-40`}
          style={{ left: c.x, top: c.y, "--rot": c.rot, animationDuration: c.dur, animationDelay: c.delay } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
