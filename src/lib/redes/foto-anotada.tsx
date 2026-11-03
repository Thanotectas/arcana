import "server-only";
import sharp from "sharp";
import { png } from "./reel";

/**
 * Foto de la limpia marcada por Sibila: óvalos dorados sobre los detalles que
 * leyó (con una etiqueta corta) y uno violeta sobre el detalle que dejó para la
 * lectura completa («¿Lo que viene?»). Va adjunta a su respuesta en los
 * comentarios de Facebook y en los mensajes directos, para que la persona vea
 * exactamente qué se leyó de su vaso.
 */
export interface MarcaFoto {
  /** Centro del detalle, en fracción del ancho y del alto de la foto (0 a 1). */
  x: number;
  y: number;
  /** Tamaño del óvalo, en fracción del ancho y del alto. */
  ancho: number;
  alto: number;
  etiqueta: string;
  /** El detalle que se deja para la lectura completa. */
  viene?: boolean;
}

const entre = (v: unknown, min: number, max: number, defecto: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : defecto);

/** Separa la línea «MARCAS: [...]» de la respuesta de Sibila y la valida (hasta 4 marcas). */
export function leerMarcas(respuesta: string): { texto: string; marcas: MarcaFoto[] } {
  const m = /^\s*MARCAS:\s*(\[[\s\S]*?\])\s*$/im.exec(respuesta);
  if (!m) return { texto: respuesta.trim(), marcas: [] };
  const texto = (respuesta.slice(0, m.index) + respuesta.slice(m.index + m[0].length)).trim();
  try {
    const crudas = JSON.parse(m[1]) as Record<string, unknown>[];
    const marcas = (Array.isArray(crudas) ? crudas : [])
      .filter((c) => c && typeof c === "object" && typeof c.etiqueta === "string" && c.etiqueta.trim())
      .slice(0, 4)
      .map((c) => ({
        x: entre(c.x, 0.04, 0.96, 0.5),
        y: entre(c.y, 0.04, 0.96, 0.5),
        ancho: entre(c.ancho, 0.08, 0.7, 0.25),
        alto: entre(c.alto, 0.06, 0.6, 0.18),
        etiqueta: String(c.etiqueta).trim().slice(0, 28),
        viene: c.viene === true,
      }));
    return { texto, marcas };
  } catch {
    return { texto, marcas: [] };
  }
}

const ORO = "#f1d99a";
const VIOLETA = "#c9b8ff";
const ANCHO = 1080;
const ALTO_MAX = 1350;
const PIE = 86;

/** Dibuja las marcas sobre la foto y devuelve un JPEG (1080 de ancho, con el pie de Arcana). */
export async function anotarFoto(foto: Buffer, marcas: MarcaFoto[]): Promise<Buffer> {
  const base = sharp(foto).rotate();
  const meta = await base.metadata();
  const w0 = meta.autoOrient?.width ?? meta.width ?? 1000;
  const h0 = meta.autoOrient?.height ?? meta.height ?? 1000;
  // La foto ocupa todo el ancho; si es muy alta, se ajusta al alto máximo y queda centrada.
  let pw = ANCHO;
  let ph = Math.round((h0 / w0) * ANCHO);
  if (ph > ALTO_MAX - PIE) {
    ph = ALTO_MAX - PIE;
    pw = Math.round((w0 / h0) * ph);
  }
  const px = Math.round((ANCHO - pw) / 2);
  const alto = ph + PIE;
  const jpeg = await base.resize(pw, ph, { fit: "fill" }).jpeg({ quality: 88 }).toBuffer();
  const uri = `data:image/jpeg;base64,${jpeg.toString("base64")}`;

  // Óvalos en píxeles y, para cada uno, un lugar para su etiqueta que no tape otro óvalo ni otra etiqueta.
  type Caja = { x: number; y: number; w: number; h: number };
  const choca = (a: Caja, b: Caja) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const ovalos = marcas.map((m) => {
    const ow = Math.max(70, m.ancho * pw);
    const oh = Math.max(56, m.alto * ph);
    return { m, ow, oh, cx: px + m.x * pw, cy: m.y * ph };
  });
  const ocupadas: Caja[] = ovalos.map((o) => ({ x: o.cx - o.ow / 2, y: o.cy - o.oh / 2, w: o.ow, h: o.oh }));
  const dibujos = ovalos.map((o, i) => {
    const texto = o.m.viene ? `✦ ${o.m.etiqueta}` : o.m.etiqueta;
    const ew = Math.min(520, 40 + texto.length * 19);
    const eh = 52;
    const dentro = (c: Caja) => c.x >= 12 && c.y >= 12 && c.x + c.w <= ANCHO - 12 && c.y + c.h <= ph - 12;
    const ajustar = (c: Caja): Caja => ({ ...c, x: Math.min(ANCHO - c.w - 16, Math.max(16, c.x)) });
    const candidatos: Caja[] = [
      ajustar({ x: o.cx - ew / 2, y: o.cy + o.oh / 2 + 12, w: ew, h: eh }),
      ajustar({ x: o.cx - ew / 2, y: o.cy - o.oh / 2 - eh - 12, w: ew, h: eh }),
      { x: o.cx + o.ow / 2 + 14, y: o.cy - eh / 2, w: ew, h: eh },
      { x: o.cx - o.ow / 2 - ew - 14, y: o.cy - eh / 2, w: ew, h: eh },
      // Sin espacio afuera (detalle pegado a un borde): dentro del óvalo, abajo o arriba.
      ajustar({ x: o.cx - ew / 2, y: o.cy + o.oh / 2 - eh - 14, w: ew, h: eh }),
      ajustar({ x: o.cx - ew / 2, y: o.cy - o.oh / 2 + 14, w: ew, h: eh }),
      ajustar({ x: o.cx - ew / 2, y: o.cy - eh / 2, w: ew, h: eh }),
    ];
    // Afuera no puede tapar otro óvalo; dentro de su propio óvalo sí (solo se evita tapar otras etiquetas).
    const otras = ocupadas.filter((_, j) => j !== i);
    const etiquetas = ocupadas.slice(ovalos.length);
    const libre =
      candidatos.slice(0, 4).find((c) => dentro(c) && !otras.some((b) => choca(c, b))) ??
      candidatos.slice(4).find((c) => dentro(c) && !etiquetas.some((b) => choca(c, b))) ??
      candidatos.find(dentro) ??
      candidatos[0];
    ocupadas.push(libre);
    return { ...o, texto, etiqueta: libre };
  });

  const dibujo = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0b0716" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
      <img src={uri} width={pw} height={ph} style={{ position: "absolute", left: px, top: 0 }} alt="" />
      {dibujos.map((d, i) => {
        const color = d.m.viene ? VIOLETA : ORO;
        return (
          <div key={i} style={{ display: "flex", position: "absolute", left: 0, top: 0, width: ANCHO, height: alto }}>
            <div
              style={{
                position: "absolute",
                left: d.cx - d.ow / 2,
                top: d.cy - d.oh / 2,
                width: d.ow,
                height: d.oh,
                borderRadius: 9999,
                border: `${d.m.viene ? 5 : 6}px solid ${color}`,
                boxShadow: `0 0 18px ${color}, inset 0 0 14px ${color}66`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: d.etiqueta.x,
                top: d.etiqueta.y,
                width: d.etiqueta.w,
                height: d.etiqueta.h,
                borderRadius: 26,
                background: "rgba(11,7,22,0.82)",
                border: `2px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 28,
                color,
              }}
            >
              {d.texto}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: ph, height: PIE, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #1a0f3a, #0b0716)", borderTop: `2px solid ${ORO}88` }}>
        <span style={{ fontFamily: "Cormorant", fontSize: 40, color: ORO }}>Leído por Sibila · Arcana</span>
      </div>
    </div>,
    alto,
    ANCHO,
  );
  return sharp(dibujo).jpeg({ quality: 86 }).toBuffer();
}
