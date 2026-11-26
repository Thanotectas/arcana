/** Sonidos del navegador para la escuela, sin archivos: un cuenco y un tintineo de campanitas. */
let ctx: AudioContext | null = null;

function contexto() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  ctx ??= new Ctx();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Un cuenco tibetano: fundamental con armónicos que se apagan despacio. */
export function sonarCuenco(tono = 220, volumen = 0.35) {
  const c = contexto();
  if (!c) return;
  const t = c.currentTime;
  [1, 2.71, 5.2].forEach((m, i) => {
    const o = c.createOscillator();
    o.frequency.value = tono * m;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volumen * [1, 0.36, 0.14][i], t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + [5, 3, 1.6][i]);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 5.2);
  });
}

/** Campanitas: unas notas agudas que suben, para un acierto o una revelación. */
export function sonarCampanitas(volumen = 0.12) {
  const c = contexto();
  if (!c) return;
  const t = c.currentTime;
  [1318.5, 1568, 1975.5].forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = c.createGain();
    const t0 = t + i * 0.09;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(volumen, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + 1.3);
  });
}
