import { faseLunar } from "@/lib/luna";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";

/** Disco lunar con la parte iluminada según la fase de hoy. */
export function LunaHoy({ t }: { t: Diccionario }) {
  const { fraccion, indice, iluminacion } = faseLunar();
  // Sombra: un círculo desplazado que tapa la parte no iluminada.
  const creciente = fraccion < 0.5;
  const desplazamiento = Math.cos(fraccion * 2 * Math.PI) * 40; // -40..40
  return (
    <div className="tarjeta flex items-center gap-4 px-5 py-3">
      <svg viewBox="0 0 100 100" className="h-12 w-12" aria-hidden>
        <defs>
          <clipPath id="disco">
            <circle cx="50" cy="50" r="40" />
          </clipPath>
        </defs>
        <circle cx="50" cy="50" r="40" fill="#f1d99a" />
        <g clipPath="url(#disco)">
          <ellipse cx={50 + (creciente ? -1 : 1) * Math.abs(desplazamiento) * 0.5} cy="50" rx={Math.abs(desplazamiento) + 40 * (1 - Math.abs(desplazamiento) / 40)} ry="40" fill="#0b0716" transform={creciente ? "translate(-30 0)" : "translate(30 0)"} opacity={0.96} />
        </g>
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(241,217,154,0.5)" />
      </svg>
      <div>
        <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.inicio.lunaHoy}</p>
        <p className="font-display text-xl text-oro-suave">{t.inicio.fasesLuna[indice]}</p>
        <p className="text-xs text-texto-suave">{plantilla(t.inicio.iluminacion, { pct: iluminacion })}</p>
      </div>
    </div>
  );
}
