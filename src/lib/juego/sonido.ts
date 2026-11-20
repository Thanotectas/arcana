"use client";

/**
 * Sonidos del juego, sintetizados con Web Audio (sin archivos): suaves, cortos y místicos.
 * Se pueden silenciar; la preferencia queda en el navegador.
 */
const CLAVE = "arcana_juego_sonido";
let contexto: AudioContext | null = null;

export function sonidoActivo() {
  try {
    return localStorage.getItem(CLAVE) !== "no";
  } catch {
    return true;
  }
}

export function guardarSonido(activo: boolean) {
  try {
    localStorage.setItem(CLAVE, activo ? "si" : "no");
  } catch {
    /* nada */
  }
}

function ctx() {
  if (!sonidoActivo()) return null;
  try {
    contexto ??= new AudioContext();
    if (contexto.state === "suspended") void contexto.resume();
    return contexto;
  } catch {
    return null;
  }
}

/** Una nota con ataque y caída suaves. */
function nota(c: AudioContext, frecuencia: number, inicio: number, duracion: number, volumen = 0.12, tipo: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  const t = c.currentTime + inicio;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volumen, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + duracion + 0.05);
}

/** Al tocar una carta del selector. */
export function sonidoTocar() {
  const c = ctx();
  if (c) nota(c, 880, 0, 0.12, 0.05, "triangle");
}

/** Al confirmar un intento. */
export function sonidoElegir() {
  const c = ctx();
  if (!c) return;
  nota(c, 523.25, 0, 0.18, 0.07, "triangle");
  nota(c, 783.99, 0.07, 0.22, 0.06, "triangle");
}

/** Fallo lejano: una nota grave y breve. */
export function sonidoFrio() {
  const c = ctx();
  if (c) nota(c, 196, 0, 0.35, 0.08, "sine");
}

/** Fallo cercano: dos notas que suben. */
export function sonidoCerca() {
  const c = ctx();
  if (!c) return;
  nota(c, 440, 0, 0.2, 0.07);
  nota(c, 659.25, 0.1, 0.3, 0.07);
}

/** Sibila suelta una pista nueva. */
export function sonidoPista() {
  const c = ctx();
  if (!c) return;
  [1318.5, 1567.98, 2093].forEach((f, i) => nota(c, f, i * 0.06, 0.4, 0.03));
}

/** ¡La encontró! Arpegio mayor y un brillo. */
export function sonidoGanar() {
  const c = ctx();
  if (!c) return;
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => nota(c, f, i * 0.09, 0.6, 0.08, "triangle"));
  [2093, 2637].forEach((f, i) => nota(c, f, 0.5 + i * 0.08, 0.5, 0.03));
}

/** Se le escondió: un acorde menor suave. */
export function sonidoPerder() {
  const c = ctx();
  if (!c) return;
  [220, 261.63, 329.63].forEach((f) => nota(c, f, 0, 0.9, 0.05));
}
