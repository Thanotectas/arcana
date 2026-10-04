import { TONO_AURA, type ColorAura } from "@/lib/aura";

/**
 * El aura dibujada: una silueta sencilla rodeada de dos halos difusos (color
 * principal y secundario) que respiran lentamente. Sin JavaScript: solo CSS.
 */
export function Aura({ principal, secundario, tamano = 240 }: { principal: ColorAura; secundario: ColorAura; tamano?: number }) {
  const a = TONO_AURA[principal];
  const b = TONO_AURA[secundario];
  return (
    <div className="relative mx-auto shrink-0" style={{ width: tamano, height: tamano }} aria-hidden>
      <div className="aura-respira absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 50% 50%, ${a}f2 0%, ${a}80 38%, ${a}00 70%)` }} />
      <div className="aura-respira-lenta absolute rounded-full" style={{ inset: "8%", background: `radial-gradient(circle at 62% 38%, ${b}e6 0%, ${b}66 40%, ${b}00 70%)` }} />
      <div className="aura-respira-lenta absolute rounded-full" style={{ inset: "14%", background: `radial-gradient(circle at 38% 64%, ${b}b3 0%, ${b}40 42%, ${b}00 70%)`, animationDelay: "-3s" }} />
      <div className="absolute rounded-full" style={{ inset: "30%", background: "radial-gradient(circle, rgba(255,246,216,0.95) 0%, rgba(241,217,154,0.45) 40%, rgba(241,217,154,0) 72%)" }} />
      {/* Silueta */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="40" r="9" fill="#0b0716" fillOpacity="0.85" />
        <path d="M30 86 C30 64 38 54 50 54 C62 54 70 64 70 86 Z" fill="#0b0716" fillOpacity="0.85" />
      </svg>
    </div>
  );
}
