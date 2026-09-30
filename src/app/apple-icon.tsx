import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function IconoApple() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0716", borderRadius: 40 }}>
        <svg viewBox="0 0 64 64" width="140" height="140">
          <circle cx="32" cy="32" r="27" fill="none" stroke="#e2bd63" strokeWidth="2.5" />
          <path d="M32 5a27 27 0 0 0 0 54 21 21 0 0 1 0-54z" fill="#e2bd63" opacity="0.18" />
          <path d="M32 13l3 14L46 32l-11 5-3 14-3-14L18 32l11-5z" fill="#e8c76f" />
          <path d="M32 22l1.3 8.7L42 32l-8.7 1.3L32 42l-1.3-8.7L22 32l8.7-1.3z" fill="#0b0716" opacity="0.55" />
        </svg>
      </div>
    ),
    size,
  );
}
