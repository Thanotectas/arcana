"use client";

/**
 * Rostro ilustrado de Sibila para el escenario en vivo: una mujer de cabello
 * oscuro con velo violeta y diadema dorada con la estrella de Arcana en la
 * frente. Parpadea cada pocos segundos (CSS) y la boca se abre con el volumen
 * de su voz (`nivel`, de 0 a 1), así que habla de verdad en pantalla.
 */
export function RostroSibila({ tamano = 300, nivel = 0 }: { tamano?: number; nivel?: number }) {
  const boca = Math.min(1, nivel * 1.6);
  const abertura = 2 + boca * 16;
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 400 400" aria-hidden className="vivo-rostro">
      <defs>
        <radialGradient id="rs-fondo" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3b2a7a" />
          <stop offset="100%" stopColor="#140b2e" />
        </radialGradient>
        <linearGradient id="rs-piel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0cfae" />
          <stop offset="100%" stopColor="#d9a97f" />
        </linearGradient>
        <linearGradient id="rs-velo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6b4fd8" />
          <stop offset="100%" stopColor="#2a1a5e" />
        </linearGradient>
        <linearGradient id="rs-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f7e3a6" />
          <stop offset="100%" stopColor="#c99a3c" />
        </linearGradient>
        <linearGradient id="rs-labios" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8566f" />
          <stop offset="100%" stopColor="#8a3a52" />
        </linearGradient>
        <clipPath id="rs-circulo">
          <circle cx="200" cy="200" r="196" />
        </clipPath>
      </defs>

      <g clipPath="url(#rs-circulo)">
        <circle cx="200" cy="200" r="200" fill="url(#rs-fondo)" />
        {/* Estrellitas del fondo */}
        {[
          [60, 70, 2],
          [330, 90, 1.6],
          [90, 300, 1.4],
          [320, 320, 2],
          [40, 200, 1.2],
          [350, 210, 1.3],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff6d8" opacity="0.8" />
        ))}

        {/* Hombros y túnica */}
        <path d="M40 420 C60 320 120 290 200 290 C280 290 340 320 360 420 Z" fill="url(#rs-velo)" />
        <path d="M150 300 L200 345 L250 300 L250 420 L150 420 Z" fill="#1a0f3a" />
        <path d="M150 300 L200 345 L250 300" fill="none" stroke="url(#rs-oro)" strokeWidth="3" />

        {/* Cuello */}
        <path d="M170 258 L170 300 Q200 318 230 300 L230 258 Z" fill="#d9a97f" />

        {/* Velo: cae a los lados */}
        <path d="M118 150 C100 220 92 300 120 400 L70 400 C60 300 70 190 118 150 Z" fill="url(#rs-velo)" />
        <path d="M282 150 C300 220 308 300 280 400 L330 400 C340 300 330 190 282 150 Z" fill="url(#rs-velo)" />

        {/* Cabello detrás del rostro */}
        <path d="M118 165 C118 90 160 60 200 60 C240 60 282 90 282 165 C282 230 270 280 250 300 L150 300 C130 280 118 230 118 165 Z" fill="#1c1030" />

        {/* Rostro */}
        <path d="M133 170 C133 110 160 82 200 82 C240 82 267 110 267 170 C267 225 240 268 200 272 C160 268 133 225 133 170 Z" fill="url(#rs-piel)" />
        {/* Sombra lateral suave */}
        <path d="M133 170 C133 225 160 268 200 272 L200 255 C170 250 148 215 148 170 Z" fill="#c9915f" opacity="0.25" />

        {/* Cabello con raya al medio: dos ondas que caen a los lados */}
        <path d="M200 88 C170 86 146 104 134 150 C140 128 160 114 182 112 C192 112 198 118 200 126 Z" fill="#1c1030" />
        <path d="M200 88 C230 86 254 104 266 150 C260 128 240 114 218 112 C208 112 202 118 200 126 Z" fill="#1c1030" />
        <path d="M150 128 C160 116 172 112 184 113 C174 120 164 132 156 150 Z" fill="#2a1a4a" />
        <path d="M250 128 C240 116 228 112 216 113 C226 120 236 132 244 150 Z" fill="#2a1a4a" />

        {/* Diadema sobre el cabello y la estrella en la frente, colgando de una cadenita */}
        <path d="M140 118 C165 98 235 98 260 118" fill="none" stroke="url(#rs-oro)" strokeWidth="4" strokeLinecap="round" />
        <path d="M200 104 L200 128" stroke="url(#rs-oro)" strokeWidth="1.5" />
        <g transform="translate(200 140)">
          <path d="M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z" fill="url(#rs-oro)" className="vivo-estrella-frente" />
        </g>

        {/* Cejas */}
        <path d="M152 160 C165 150 185 150 194 158" fill="none" stroke="#2a1a3a" strokeWidth="4" strokeLinecap="round" />
        <path d="M206 158 C215 150 235 150 248 160" fill="none" stroke="#2a1a3a" strokeWidth="4" strokeLinecap="round" />

        {/* Ojos (el grupo parpadea) */}
        <g className="vivo-ojos" style={{ transformOrigin: "200px 180px" }}>
          <g>
            <path d="M154 180 C162 168 184 168 192 180 C184 190 162 190 154 180 Z" fill="#fffaf2" />
            <circle cx="173" cy="180" r="7.5" fill="#5b3fb8" />
            <circle cx="173" cy="180" r="3.5" fill="#120a24" />
            <circle cx="175.5" cy="177.5" r="1.6" fill="#fff" />
            <path d="M154 180 C162 168 184 168 192 180" fill="none" stroke="#2a1a3a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M156 178 L150 173 M160 173 L156 167" stroke="#2a1a3a" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g>
            <path d="M208 180 C216 168 238 168 246 180 C238 190 216 190 208 180 Z" fill="#fffaf2" />
            <circle cx="227" cy="180" r="7.5" fill="#5b3fb8" />
            <circle cx="227" cy="180" r="3.5" fill="#120a24" />
            <circle cx="229.5" cy="177.5" r="1.6" fill="#fff" />
            <path d="M208 180 C216 168 238 168 246 180" fill="none" stroke="#2a1a3a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M244 178 L250 173 M240 173 L244 167" stroke="#2a1a3a" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* Nariz */}
        <path d="M200 192 C196 206 194 212 198 216 C202 218 206 216 206 213" fill="none" stroke="#b9845a" strokeWidth="2.5" strokeLinecap="round" />

        {/* Boca: el labio inferior baja con la voz */}
        <g>
          <path d="M180 236 C188 232 196 231 200 233 C204 231 212 232 220 236 C212 240 188 240 180 236 Z" fill="url(#rs-labios)" />
          <path d={`M180 236 C188 ${240 + abertura * 0.4} 212 ${240 + abertura * 0.4} 220 236 C212 ${238 + abertura} 188 ${238 + abertura} 180 236 Z`} fill="#8a3a52" style={{ transition: "d 60ms linear" }} />
          {boca > 0.35 && <path d={`M186 237 C194 ${239 + abertura * 0.5} 206 ${239 + abertura * 0.5} 214 237 Z`} fill="#3a1424" opacity={Math.min(0.9, boca)} />}
        </g>

        {/* Mejillas */}
        <ellipse cx="158" cy="212" rx="12" ry="7" fill="#d9788a" opacity="0.22" />
        <ellipse cx="242" cy="212" rx="12" ry="7" fill="#d9788a" opacity="0.22" />

        {/* Aretes de luna */}
        <path d="M136 208 a8 8 0 1 0 8 12 a6 6 0 1 1 -8 -12 Z" fill="url(#rs-oro)" />
        <path d="M264 208 a8 8 0 1 1 -8 12 a6 6 0 1 0 8 -12 Z" fill="url(#rs-oro)" />
      </g>
      <circle cx="200" cy="200" r="196" fill="none" stroke="url(#rs-oro)" strokeWidth="5" />
    </svg>
  );
}
